import { OFFSCREEN_PATH, confirmationFor, markdownLink, resolveActiveUrl, shouldCreateOffscreen } from "./core.js";
import { DEFAULT_PREFERENCES, readPreferences } from "./preferences.js";
import { runPageCopy } from "./page-copy.js";

let offscreenCreate = null;
let offscreenQueue = Promise.resolve();
const badgeTimers = new Map();

export async function copyActiveUrl(tabHint, { format = "url" } = {}) {
  const tab = await resolveTab(tabHint);
  const tabId = tab?.id;
  const tabUrl = typeof tab?.url === "string" ? tab.url : "";
  const preferences = await readPreferences().catch(() => DEFAULT_PREFERENCES);
  const options = { format, confirmation: preferences.confirmation, titleHint: tab?.title || "" };
  const injected = typeof tabId === "number" ? await injectPageCopy(tabId, tabUrl, false, options) : null;
  const url = resolveActiveUrl({ pageHref: injected?.url, tabUrl });
  let copied = Boolean(injected?.copied);
  let toasted = Boolean(injected?.toasted);

  if (!copied && url) {
    const text = injected?.text || (format === "markdown" ? markdownLink(url, tab?.title || "") : url);
    copied = await copyWithOffscreen(text);
    if (copied && injected && typeof tabId === "number") {
      const result = await injectPageCopy(tabId, url, true, options);
      toasted = Boolean(result?.toasted);
    }
  }

  if (!copied) {
    if (injected && typeof tabId === "number") {
      await injectPageCopy(tabId, url || "", true, { ...options, error: true });
    }
    await chrome.storage.session.set({ copyError: { tabId: tabId ?? null } }).catch(() => {});
    await flashBadge("!", tabId, "Couldn’t copy — open Copy URL to try again.");
    return { copied: false, url, confirmation: "error-badge" };
  }

  const confirmation = confirmationFor({ copied, injectionSucceeded: toasted });
  const { copyError } = await chrome.storage.session.get("copyError").catch(() => ({}));
  if (copyError?.tabId === tabId || copyError?.tabId === null) await chrome.storage.session.remove("copyError").catch(() => {});
  await chrome.action.setTitle({ ...tabTarget(tabId), title: "Copy URL settings" });
  if (confirmation === "badge") await flashBadge("✓", tabId);
  else await clearBadge(tabId);
  return { copied: true, url, confirmation };
}

export async function previewConfirmation(tabHint, confirmation) {
  const tab = await resolveTab(tabHint);
  if (typeof tab?.id !== "number") return false;
  const result = await injectPageCopy(tab.id, "", true, { confirmation, preview: true });
  return Boolean(result?.previewed);
}

async function resolveTab(tabHint) {
  if (tabHint && typeof tabHint.id === "number") return tabHint;
  const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  return tabs[0] ?? null;
}

async function injectPageCopy(tabId, urlHint, toastOnly, options) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId }, world: "ISOLATED", func: runPageCopy, args: [urlHint, toastOnly, options],
    });
    const result = results?.[0]?.result;
    return result && typeof result === "object" ? result : null;
  } catch {
    return null;
  }
}

function copyWithOffscreen(text) {
  const job = offscreenQueue.then(() => copyWithOffscreenExclusive(text), () => copyWithOffscreenExclusive(text));
  offscreenQueue = job.then(() => undefined, () => undefined);
  return job;
}

async function copyWithOffscreenExclusive(text) {
  try {
    await ensureOffscreenDocument();
    const result = await chrome.runtime.sendMessage({ type: "copy", target: "offscreen", text });
    return Boolean(result?.ok);
  } catch {
    return false;
  } finally {
    try { await chrome.offscreen.closeDocument(); } catch { /* Already closed or creation failed. */ }
    offscreenCreate = null;
  }
}

async function ensureOffscreenDocument() {
  const existing = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"], documentUrls: [chrome.runtime.getURL(OFFSCREEN_PATH)],
  });
  if (!shouldCreateOffscreen(existing.length)) return;
  if (!offscreenCreate) {
    offscreenCreate = chrome.offscreen.createDocument({
      url: OFFSCREEN_PATH, reasons: [chrome.offscreen.Reason.CLIPBOARD],
      justification: "Write the current tab URL or Markdown link to the clipboard when page clipboard access is unavailable.",
    });
  }
  await offscreenCreate;
}

function tabTarget(tabId) {
  return typeof tabId === "number" ? { tabId } : {};
}

async function clearBadge(tabId) {
  clearTimeout(badgeTimers.get(tabId));
  badgeTimers.delete(tabId);
  await chrome.action.setBadgeText({ ...tabTarget(tabId), text: "" });
}

async function flashBadge(text, tabId, title) {
  await clearBadge(tabId);
  const target = tabTarget(tabId);
  await chrome.action.setBadgeBackgroundColor({ ...target, color: "#3A3A3C" });
  if (chrome.action.setBadgeTextColor) await chrome.action.setBadgeTextColor({ ...target, color: "#FFFFFF" });
  if (title) await chrome.action.setTitle({ ...target, title });
  await chrome.action.setBadgeText({ ...target, text });
  badgeTimers.set(tabId, setTimeout(() => {
    chrome.action.setBadgeText({ ...target, text: "" }).catch(() => {});
    badgeTimers.delete(tabId);
  }, text === "!" ? 2800 : 1000));
}
