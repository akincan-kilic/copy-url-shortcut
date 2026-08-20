import { COPY_COMMAND } from "./core.js";

const SHORTCUTS_URL = "chrome://extensions/shortcuts";

const isMac =
  navigator.userAgentData?.platform === "macOS" ||
  /Mac|iPhone|iPad/.test(navigator.platform);

const keys = isMac ? "⌘⇧C" : "Ctrl+Shift+C";

for (const node of document.querySelectorAll("#keys, #keys-repeat")) {
  node.textContent = keys;
}

document.querySelector("#shortcuts-url").textContent = SHORTCUTS_URL;

document.querySelector("#open-shortcuts").addEventListener("click", async () => {
  try {
    await chrome.tabs.create({ url: SHORTCUTS_URL });
  } catch {
    document.querySelector(".hint").hidden = false;
  }
});

async function refreshAssignedState() {
  const commands = await chrome.commands.getAll();
  const command = commands.find((item) => item.name === COPY_COMMAND);
  const assigned = Boolean(command?.shortcut);
  document.querySelector("#setup").hidden = assigned;
  document.querySelector("#done").hidden = !assigned;
}

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    refreshAssignedState();
  }
});

refreshAssignedState();
