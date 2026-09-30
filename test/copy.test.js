import assert from "node:assert/strict";
import { test } from "node:test";
import { copyActiveUrl, previewConfirmation } from "../copy.js";

function browserMock({ injected, offscreen = true, creationFails = false }) {
  const calls = { writes: [], injections: [], badges: [], titles: [], creates: 0, closes: 0 };
  const local = { preferences: { confirmation: "check", theme: "auto" } };
  const session = {};
  globalThis.chrome = {
    tabs: { query: async () => [{ id: 7, url: "chrome://extensions/", title: "Extensions" }] },
    storage: {
      local: { get: async () => local },
      session: { get: async () => session, set: async (value) => Object.assign(session, value), remove: async (key) => delete session[key] },
    },
    scripting: { executeScript: async ({ args }) => {
      calls.injections.push(args);
      if (!injected) throw new Error("Restricted page");
      if (args[2].preview) return [{ result: { previewed: true } }];
      if (args[1]) return [{ result: { toasted: true } }];
      return [{ result: injected }];
    } },
    runtime: { getURL: (p) => "chrome-extension://test/" + p, getContexts: async () => [], sendMessage: async (message) => {
      calls.writes.push(message.text); return { ok: offscreen };
    } },
    offscreen: { Reason: { CLIPBOARD: "CLIPBOARD" }, createDocument: async () => {
      calls.creates++; if (creationFails) throw new Error("Clipboard unavailable");
    }, closeDocument: async () => { calls.closes++; } },
    action: { setBadgeText: async ({ text }) => calls.badges.push(text), setBadgeBackgroundColor: async () => {}, setBadgeTextColor: async () => {}, setTitle: async ({ title }) => calls.titles.push(title) },
  };
  return { calls, session };
}

test("normal URL copies use the page URL verbatim, with the chosen confirmation", async () => {
  const url = "https://example.com/?utm_source=x#section";
  const { calls } = browserMock({ injected: { url, text: url, copied: true, toasted: true } });
  const result = await copyActiveUrl({ id: 7, url: "https://example.com/" });
  assert.equal(result.url, url);
  assert.equal(result.confirmation, "toast");
  assert.equal(calls.injections[0][2].confirmation, "check");
  assert.equal(calls.injections[0][2].format, "url");
  assert.deepEqual(calls.writes, []);
});

test("restricted pages copy a Markdown link from the tab title through offscreen", async () => {
  const { calls } = browserMock({});
  const result = await copyActiveUrl(undefined, { format: "markdown" });
  assert.deepEqual(calls.writes, ["[Extensions](<chrome://extensions/>)"]);
  assert.equal(result.copied, true);
  assert.equal(result.confirmation, "badge");
  assert.equal(calls.closes, 1);
  // Clear the success timer so the test has no lingering badge task.
  browserMock({ injected: { url: "https://example.com/", copied: true, toasted: true } });
  await copyActiveUrl({ id: 7 });
});

test("offscreen fallback uses the live page title and URL, not stale tab metadata", async () => {
  const text = "[Updated title](<https://example.com/new#section>)";
  const { calls } = browserMock({ injected: { url: "https://example.com/new#section", text, copied: false, toasted: false } });
  const result = await copyActiveUrl({ id: 7, url: "https://example.com/old", title: "Old title" }, { format: "markdown" });
  assert.deepEqual(calls.writes, [text]);
  assert.equal(result.copied, true);
  assert.equal(result.confirmation, "toast");
});

test("clipboard failures show readable feedback, persist no URL, and clear after success", async () => {
  const { calls, session } = browserMock({ injected: { url: "https://example.com/", copied: false }, offscreen: false });
  const result = await copyActiveUrl({ id: 7 });
  assert.equal(result.copied, false);
  assert.deepEqual(session.copyError, { tabId: 7 });
  assert.equal(calls.injections.at(-1)[2].error, true);
  assert.match(calls.titles.at(-1), /Couldn’t copy/);
  assert.ok(!calls.badges.includes("✓"));
  const successful = browserMock({ injected: { url: "https://example.com/", copied: true, toasted: true } });
  successful.session.copyError = { tabId: 7 };
  await copyActiveUrl({ id: 7 });
  assert.equal(successful.session.copyError, undefined);
});

test("offscreen creation failure gives feedback and permits a later retry", async () => {
  const { calls } = browserMock({ creationFails: true });
  assert.equal((await copyActiveUrl()).copied, false);
  assert.equal(calls.closes, 1);
  const retry = browserMock({ injected: { url: "https://example.com/", text: "https://example.com/", copied: false } });
  assert.equal((await copyActiveUrl({ id: 7 })).copied, true);
  assert.equal(retry.calls.creates, 1);
});

test("confirmation previews never write to the clipboard", async () => {
  const { calls } = browserMock({ injected: {} });
  assert.equal(await previewConfirmation({ id: 7 }, "check"), true);
  assert.equal(calls.injections[0][1], true);
  assert.equal(calls.injections[0][2].preview, true);
  assert.deepEqual(calls.writes, []);
});

test("preference or error-storage failure does not prevent the core URL copy", async () => {
  const { calls } = browserMock({ injected: { url: "https://example.com/", copied: true, toasted: true } });
  chrome.storage.local.get = async () => { throw new Error("Preferences unavailable"); };
  chrome.storage.session.get = async () => { throw new Error("Session storage unavailable"); };
  assert.equal((await copyActiveUrl({ id: 7 })).copied, true);
  assert.equal(calls.injections[0][2].confirmation, "text");
});
