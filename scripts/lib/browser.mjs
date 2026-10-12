import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { sep } from "node:path";

export const DEVICES = {
  ios: { width: 402, height: 874, scale: 3 },
  android: { width: 412, height: 915, scale: 2.625 },
};

/** "android" iff the path *inside* the nearest design/ folder has an android segment
 *  (folders above design/, e.g. a monorepo's apps/android, don't count). */
export function platformFromPath(file) {
  const parts = file.split(sep);
  const d = parts.lastIndexOf("design");
  const inner = d === -1 ? parts.slice(-2, -1) : parts.slice(d + 1, -1);
  return inner.includes("android") ? "android" : "ios";
}

export function launch() {
  // file:// pages may reference sibling files (external <use href>, fetch); Chromium blocks that by default.
  return chromium.launch({ args: ["--allow-file-access-from-files"] });
}

export async function openScreen(browser, file) {
  const platform = platformFromPath(file);
  const d = DEVICES[platform];
  const page = await browser.newPage({ viewport: { width: d.width, height: d.height }, deviceScaleFactor: d.scale });
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  return { page, platform };
}

/** The platform font Chromium actually uses for `system-ui` (".SF NS" on macOS). */
export async function systemFontFamily(browser) {
  const page = await browser.newPage();
  try {
    await page.setContent(`<p style="font-family:system-ui">Hi</p>`);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument");
    const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: "p" });
    const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
    return fonts[0]?.familyName ?? "";
  } finally {
    await page.close();
  }
}
