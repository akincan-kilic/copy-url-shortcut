import assert from "node:assert/strict";
import { test } from "node:test";
import {
  confirmationFor,
  resolveActiveUrl,
  shouldCreateOffscreen,
  shouldOpenOnboarding,
} from "../core.js";

test("prefers the page href over the tab URL", () => {
  assert.equal(
    resolveActiveUrl({
      pageHref: "https://www.youtube.com/watch?v=abc&list=xyz",
      tabUrl: "https://www.youtube.com/",
    }),
    "https://www.youtube.com/watch?v=abc&list=xyz",
  );
});

test("uses the tab URL when the page href is unavailable", () => {
  assert.equal(
    resolveActiveUrl({
      pageHref: "",
      tabUrl: "chrome://extensions/",
    }),
    "chrome://extensions/",
  );
});

test("copies query parameters, fragments, and tracking parameters verbatim", () => {
  const url =
    "https://example.com/foo?utm_source=x&fbclid=abc#section";
  assert.equal(
    resolveActiveUrl({ pageHref: url, tabUrl: "https://example.com/foo" }),
    url,
  );
});

test("returns null when no URL is available", () => {
  assert.equal(resolveActiveUrl({ pageHref: "", tabUrl: "" }), null);
});

test("confirms with a toast when the page could be injected", () => {
  assert.equal(
    confirmationFor({ copied: true, injectionSucceeded: true }),
    "toast",
  );
});

test("confirms with a badge on restricted pages", () => {
  assert.equal(
    confirmationFor({ copied: true, injectionSucceeded: false }),
    "badge",
  );
});

test("uses an error badge when copying fails", () => {
  assert.equal(
    confirmationFor({ copied: false, injectionSucceeded: false }),
    "error-badge",
  );
});

test("opens onboarding on install when the command is unbound", () => {
  assert.equal(shouldOpenOnboarding({ reason: "install", shortcut: "" }), true);
});

test("does not open onboarding when the command is already bound", () => {
  assert.equal(
    shouldOpenOnboarding({ reason: "install", shortcut: "⌘⇧C" }),
    false,
  );
});

test("does not open onboarding on update", () => {
  assert.equal(shouldOpenOnboarding({ reason: "update", shortcut: "" }), false);
});

test("creates an offscreen document only when none exists", () => {
  assert.equal(shouldCreateOffscreen(0), true);
  assert.equal(shouldCreateOffscreen(1), false);
});
