import { COPY_COMMAND, MARKDOWN_COMMAND, shouldOpenOnboarding } from "./core.js";
import { copyActiveUrl, previewConfirmation } from "./copy.js";

// Preferences and transient errors never need to be visible to page content scripts.
chrome.storage.local.setAccessLevel({ accessLevel: "TRUSTED_CONTEXTS" }).catch(() => {});

chrome.runtime.onInstalled.addListener(async (details) => {
  const commands = await chrome.commands.getAll();
  const shortcut = commands.find((item) => item.name === COPY_COMMAND)?.shortcut ?? "";
  if (shouldOpenOnboarding({ reason: details.reason, shortcut })) {
    await chrome.tabs.create({ url: chrome.runtime.getURL("onboarding.html") });
  }
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (![COPY_COMMAND, MARKDOWN_COMMAND].includes(command)) return;
  copyActiveUrl(tab, { format: command === MARKDOWN_COMMAND ? "markdown" : "url" }).catch(() => {
    console.warn("Copy URL Shortcut: copy failed.");
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.target !== "worker" || sender.id !== chrome.runtime.id ||
      !sender.url?.startsWith(chrome.runtime.getURL(""))) return;
  if (message.type === "copy" && ["url", "markdown"].includes(message.format)) {
    copyActiveUrl(undefined, { format: message.format })
      .then(({ copied }) => sendResponse({ copied }))
      .catch(() => sendResponse({ copied: false }));
    return true;
  }
  if (message.type === "preview" && ["text", "check"].includes(message.confirmation)) {
    previewConfirmation(undefined, message.confirmation)
      .then((previewed) => sendResponse({ previewed }))
      .catch(() => sendResponse({ previewed: false }));
    return true;
  }
});
