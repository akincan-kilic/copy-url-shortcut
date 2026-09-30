import { COPY_COMMAND, MARKDOWN_COMMAND } from "./core.js";
import { readPreferences, savePreferences } from "./preferences.js";

let preferences = { confirmation: "text", theme: "auto" };
let writes = Promise.resolve();
let activeTabId;
const status = document.querySelector("#status");
const themeToggle = document.querySelector("#theme-toggle");
const themeMenu = document.querySelector("#theme-menu");

function showStatus(message, error = false) {
  status.textContent = message;
  status.hidden = !message;
  status.classList.toggle("error", error);
}

function renderPreferences() {
  document.documentElement.dataset.theme = preferences.theme;
  const label = preferences.theme[0].toUpperCase() + preferences.theme.slice(1);
  document.querySelector("#theme-label").textContent = label;
  document.querySelector("#theme-icon").setAttribute("href", `#${{ auto: "auto", light: "sun", dark: "moon" }[preferences.theme]}`);
  themeToggle.setAttribute("aria-label", `Appearance: ${label}`);
  document.querySelectorAll("button[data-theme]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.theme === preferences.theme));
  });
  document.querySelectorAll("[data-style]").forEach((button) => {
    const selected = button.dataset.style === preferences.confirmation;
    button.classList.toggle("selected", selected);
    button.setAttribute("aria-checked", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
}

async function updatePreferences(patch) {
  preferences = { ...preferences, ...patch };
  renderPreferences();
  const value = { ...preferences };
  const job = writes.then(() => savePreferences(value), () => savePreferences(value));
  writes = job.catch(() => {});
  try { await job; return true; }
  catch { showStatus("Couldn’t save your preference. Try again.", true); return false; }
}

async function preview() {
  try {
    const result = await chrome.runtime.sendMessage({ target: "worker", type: "preview", confirmation: preferences.confirmation });
    showStatus(result?.previewed ? "" : "This page can’t show a preview. Try on a website.");
  } catch { showStatus("Couldn’t show the preview. Try again.", true); }
}

async function selectStyle(style) {
  if (await updatePreferences({ confirmation: style })) await preview();
}

document.querySelectorAll("[data-style]").forEach((button) => {
  button.addEventListener("click", () => selectStyle(button.dataset.style));
  button.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const style = preferences.confirmation === "text" ? "check" : "text";
    selectStyle(style);
    document.querySelector(`[data-style="${style}"]`).focus();
  });
});
document.querySelector("#preview").addEventListener("click", preview);

themeToggle.addEventListener("click", () => {
  themeMenu.hidden = !themeMenu.hidden;
  themeToggle.setAttribute("aria-expanded", String(!themeMenu.hidden));
  if (!themeMenu.hidden) themeMenu.querySelector(`[data-theme="${preferences.theme}"]`).focus();
});
document.querySelectorAll("button[data-theme]").forEach((button) => {
  button.addEventListener("click", async () => {
    await updatePreferences({ theme: button.dataset.theme });
    themeMenu.hidden = true;
    themeToggle.setAttribute("aria-expanded", "false");
    themeToggle.focus();
  });
});
document.addEventListener("click", (event) => {
  if (event.target.closest(".appearance")) return;
  themeMenu.hidden = true;
  themeToggle.setAttribute("aria-expanded", "false");
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !themeMenu.hidden) {
    event.preventDefault();
    themeMenu.hidden = true;
    themeToggle.setAttribute("aria-expanded", "false");
    themeToggle.focus();
  }
});

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const buttons = document.querySelectorAll("[data-copy]");
    buttons.forEach((item) => { item.disabled = true; });
    try {
      await writes;
      const result = await chrome.runtime.sendMessage({ target: "worker", type: "copy", format: button.dataset.copy });
      if (result?.copied) window.close();
      else showStatus("Couldn’t copy. Try again.", true);
    } catch { showStatus("Couldn’t copy. Try again.", true); }
    finally { buttons.forEach((item) => { item.disabled = false; }); }
  });
});

document.querySelector("#edit-shortcuts").addEventListener("click", async () => {
  try { await chrome.tabs.create({ url: "chrome://extensions/shortcuts" }); window.close(); }
  catch { showStatus("Open chrome://extensions/shortcuts to assign your keys."); }
});

async function refreshShortcuts() {
  const commands = await chrome.commands.getAll();
  for (const [name, selector] of [[COPY_COMMAND, "#url-shortcut"], [MARKDOWN_COMMAND, "#markdown-shortcut"]]) {
    const shortcut = commands.find((command) => command.name === name)?.shortcut || "";
    const node = document.querySelector(selector);
    node.textContent = shortcut || "Not set";
    node.className = shortcut ? "keycap" : "unassigned";
  }
}

async function initialize() {
  try {
    preferences = await readPreferences();
    renderPreferences();
    await refreshShortcuts();
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    activeTabId = tab?.id;
    const { copyError } = await chrome.storage.session.get("copyError");
    if (copyError && (copyError.tabId === activeTabId || copyError.tabId === null)) {
      showStatus("Couldn’t copy. Try again.", true);
    }
  } catch { showStatus("Couldn’t load your settings. Reopen the menu to try again.", true); }
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") refreshShortcuts().catch(() => {});
});
initialize();
