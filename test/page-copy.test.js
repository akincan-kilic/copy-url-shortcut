import assert from "node:assert/strict";
import { test } from "node:test";
import { runPageCopy } from "../page-copy.js";

test("page copy function serializes without module helpers", () => {
  const source = Function.prototype.toString.call(runPageCopy);
  assert.match(source, /attachShadow/);
  assert.match(source, /Link copied/);
  assert.match(source, /navigator\.clipboard\.writeText/);
  assert.match(source, /function presentToast/);
  assert.match(source, /function toastCss/);
});
