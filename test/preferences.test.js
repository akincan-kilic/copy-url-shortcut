import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizePreferences } from "../preferences.js";

test("invalid or obsolete settings fall back safely without retaining extra data", () => {
  assert.deepEqual(normalizePreferences(null), { confirmation: "text", theme: "auto" });
  assert.deepEqual(normalizePreferences({ confirmation: "old", theme: "obsolete", lastUrl: "https://example.com" }), { confirmation: "text", theme: "auto" });
  assert.deepEqual(normalizePreferences({ confirmation: "check", theme: "dark", extra: "discard" }), { confirmation: "check", theme: "dark" });
});
