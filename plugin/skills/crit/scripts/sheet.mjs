#!/usr/bin/env node
// Usage: node sheet.mjs <png…> --out <file.png> [--bg <css background>] [--labels a,b,c]
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { PNG } from "pngjs";
import { fail } from "./lib/paths.mjs";
import { launch, platformFromPath } from "./lib/browser.mjs";
import { sheetHtml } from "./lib/sheet.mjs";

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const v = args[i + 1];
  args.splice(i, 2);
  return v;
};
const out = opt("--out");
const bg = opt("--bg");
const labels = (opt("--labels") ?? "").split(",").filter(Boolean);
if (!out || !args.length) fail("usage: sheet.mjs <png…> --out <file.png> [--bg <css>] [--labels a,b,c]");

const images = args.map((p) => {
  let buf;
  try {
    buf = readFileSync(p);
  } catch {
    fail(`not found: ${p}`);
  }
  const { width, height } = PNG.sync.read(buf);
  return { dataUri: `data:image/png;base64,${buf.toString("base64")}`, width, height, platform: platformFromPath(resolve(p)) };
});

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 2 });
await page.setContent(sheetHtml({ images, bg, labels }), { waitUntil: "load" });
const box = await page.evaluate(() => ({ width: document.body.scrollWidth, height: document.body.scrollHeight }));
await page.setViewportSize(box);
mkdirSync(dirname(resolve(out)), { recursive: true });
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(out);
