import { test } from "node:test";
import assert from "node:assert/strict";
import { platformFromPath, DEVICES, launch, systemFontFamily } from "../lib/browser.mjs";

test("platformFromPath", () => {
  assert.equal(platformFromPath("/x/design/screens/android/01.html"), "android");
  assert.equal(platformFromPath("/x/design/screens/ios/01.html"), "ios");
  assert.equal(platformFromPath("/x/android-app/design/directions/a/main.html"), "ios");
});

test("iOS device size", () => assert.deepEqual(DEVICES.ios, { width: 402, height: 874, scale: 3 }));

test("system-ui resolves to SF Pro on this Mac", { skip: process.platform !== "darwin" }, async () => {
  const browser = await launch();
  try {
    assert.match(await systemFontFamily(browser), /SF/);
  } finally {
    await browser.close();
  }
});
