import {
  OFFSCREEN_PATH,
  confirmationFor,
  resolveActiveUrl,
  shouldCreateOffscreen,
} from "./core.js";
import { runPageCopy } from "./page-copy.js";

let offscreenCreate = null;
let offscreenQueue = Promise.resolve();
let badgeTimer = 0;

export async function copyActiveUrl(tabHint) {
  const tab = await resolveTab(tabHint);
  const tabId = tab?.id;
  const tabUrl = typeof tab?.url === "string" ? tab.url : "";

  let pageHref = "";
  let copied = false;
  let injectionSucceeded = false;

  if (typeof tabId === "number") {
    const injected = await injectPageCopy(tabId, tabUrl, false);
    if (injected) {
      injectionSucceeded = true;
      pageHref = injected.url;
      copied = injected.copied;
    }
  }

  const url = resolveActiveUrl({ pageHref, tabUrl });

  if (!copied) {
    if (!url) {
      await flashBadge("!");
      return { copied: false, url: null, confirmation: "error-badge" };
    }
    copied = await copyWithOffscreen(url);
    if (copied && injectionSucceeded && typeof tabId === "number") {
      const toasted = await injectPageCopy(tabId, url, true);
      injectionSucceeded = Boolean(toasted?.toasted);
    }
  }

  const confirmation = confirmationFor({ copied, injectionSucceeded });
  if (confirmation === "badge") {
    await flashBadge("✓");
  } else if (confirmation === "error-badge") {
    await flashBadge("!");
  }

  return { copied, url, confirmation };
}

async function resolveTab(tabHint) {
  if (tabHint && typeof tabHint.id === "number") {
    return tabHint;
  }
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });
  return tabs[0] ?? null;
}

async function injectPageCopy(tabId, urlHint, toastOnly) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      world: "ISOLATED",
      func: runPageCopy,
      args: [urlHint, toastOnly],
    });
    const result = results?.[0]?.result;
    if (!result || typeof result !== "object") {
      return {
        url: "",
        copied: false,
        toasted: false,
      };
    }
    return {
      url: typeof result.url === "string" ? result.url : "",
      copied: Boolean(result.copied),
      toasted: Boolean(result.toasted),
    };
  } catch {
    return null;
  }
}

function copyWithOffscreen(text) {
  const job = offscreenQueue.then(
    () => copyWithOffscreenExclusive(text),
    () => copyWithOffscreenExclusive(text),
  );
  offscreenQueue = job.then(
    () => undefined,
    () => undefined,
  );
  return job;
}

async function copyWithOffscreenExclusive(text) {
  await ensureOffscreenDocument();
  try {
    const result = await chrome.runtime.sendMessage({
      type: "copy",
      target: "offscreen",
      text,
    });
    return Boolean(result?.ok);
  } catch (error) {
    console.warn("Copy URL Shortcut: clipboard write failed.", error);
    return false;
  } finally {
    try {
      await chrome.offscreen.closeDocument();
    } catch {
      // Already closed.
    }
    offscreenCreate = null;
  }
}

async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_PATH);
  const existing = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [offscreenUrl],
  });

  if (!shouldCreateOffscreen(existing.length)) {
    return;
  }

  if (offscreenCreate) {
    await offscreenCreate;
    return;
  }

  offscreenCreate = chrome.offscreen.createDocument({
    url: OFFSCREEN_PATH,
    reasons: [chrome.offscreen.Reason.CLIPBOARD],
    justification: "Write the active tab URL to the clipboard on pages that cannot be scripted.",
  });
  await offscreenCreate;
}

async function flashBadge(text) {
  await chrome.action.setBadgeBackgroundColor({ color: "#3A3A3C" });
  if (chrome.action.setBadgeTextColor) {
    await chrome.action.setBadgeTextColor({ color: "#FFFFFF" });
  }
  await chrome.action.setBadgeText({ text });
  if (badgeTimer) {
    clearTimeout(badgeTimer);
  }
  badgeTimer = setTimeout(() => {
    chrome.action.setBadgeText({ text: "" });
    badgeTimer = 0;
  }, 1000);
}
