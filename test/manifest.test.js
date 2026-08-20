import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";

const manifest = JSON.parse(
  await readFile(new URL("../manifest.json", import.meta.url), "utf8"),
);

test("is a Manifest V3 extension", () => {
  assert.equal(manifest.manifest_version, 3);
});

test("declares no persistent content scripts", () => {
  assert.equal(manifest.content_scripts, undefined);
});

test("declares no host permissions", () => {
  assert.deepEqual(manifest.host_permissions ?? [], []);
});

test("requests only the least-privilege permission set", () => {
  assert.deepEqual(manifest.permissions, [
    "activeTab",
    "scripting",
    "clipboardWrite",
    "offscreen",
  ]);
});

test("does not request tabs or storage", () => {
  assert.ok(!manifest.permissions.includes("tabs"));
  assert.ok(!manifest.permissions.includes("storage"));
});

test("declares a native copy-url command", () => {
  assert.equal(manifest.commands["copy-url"].suggested_key.mac, "Command+Shift+C");
  assert.equal(manifest.commands["copy-url"].suggested_key.default, "Ctrl+Shift+C");
});

test("has a toolbar action and no popup", () => {
  assert.ok(manifest.action);
  assert.equal(manifest.action.default_popup, undefined);
});

test("points the homepage at the public repository", () => {
  assert.equal(
    manifest.homepage_url,
    "https://github.com/akincan-kilic/copy-url-shortcut",
  );
});

test("ships PNG icons for the toolbar and the store", async () => {
  const sizes = ["16", "32", "48", "128"];
  assert.deepEqual(Object.keys(manifest.icons), sizes);
  assert.deepEqual(Object.keys(manifest.action.default_icon), sizes);
  for (const size of sizes) {
    const relative = manifest.icons[size];
    assert.equal(relative, `icons/icon${size}.png`);
    assert.equal(manifest.action.default_icon[size], relative);
    await access(new URL(`../${relative}`, import.meta.url));
  }
});
