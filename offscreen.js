chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.target !== "offscreen" || message?.type !== "copy") {
    return;
  }

  writeClipboard(message.text)
    .then(() => {
      sendResponse({ ok: true });
    })
    .catch(() => {
      sendResponse({ ok: false });
    });

  return true;
});

async function writeClipboard(text) {
  if (typeof text !== "string" || text.length === 0) {
    throw new TypeError("Nothing to copy.");
  }

  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Offscreen documents are unfocused, so the Clipboard API is often blocked.
    // Source: https://developer.chrome.com/docs/extensions/reference/api/offscreen
  }

  const textEl = document.querySelector("#text");
  if (!textEl) {
    throw new Error("Offscreen clipboard field is missing.");
  }

  textEl.value = text;
  textEl.select();
  const copied = document.execCommand("copy");
  textEl.value = "";
  if (!copied) {
    throw new Error("Clipboard write failed.");
  }
}
