import { COPY_COMMAND, shouldOpenOnboarding } from "./core.js";
import { copyActiveUrl } from "./copy.js";

chrome.runtime.onInstalled.addListener(async (details) => {
  const shortcut = await copyCommandShortcut();
  if (!shouldOpenOnboarding({ reason: details.reason, shortcut })) {
    return;
  }
  await chrome.tabs.create({
    url: chrome.runtime.getURL("onboarding.html"),
  });
});

chrome.commands.onCommand.addListener((command, tab) => {
  if (command !== COPY_COMMAND) {
    return;
  }
  copyActiveUrl(tab).catch((error) => {
    console.warn("Copy URL Shortcut: copy failed.", error);
  });
});

chrome.action.onClicked.addListener((tab) => {
  copyActiveUrl(tab).catch((error) => {
    console.warn("Copy URL Shortcut: copy failed.", error);
  });
});

async function copyCommandShortcut() {
  const commands = await chrome.commands.getAll();
  const command = commands.find((item) => item.name === COPY_COMMAND);
  return command?.shortcut ?? "";
}
