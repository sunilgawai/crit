#!/usr/bin/env node
// Usage: node capture.mjs <scene.html> [--out file.mp4]
// Deterministic frame-by-frame capture of a motion scene (see references/motion.md) to MP4.
import { mkdirSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fail } from "./lib/paths.mjs";
import { launch } from "./lib/browser.mjs";
import { encoder, seek } from "./lib/capture.mjs";

const args = process.argv.slice(2);
const o = args.indexOf("--out");
const outArg = o === -1 ? null : args.splice(o, 2)[1];
const scene = args[0];
if (!scene) fail("usage: capture.mjs <scene.html> [--out file.mp4]");
const file = resolve(scene);
const out = resolve(outArg ?? join(dirname(file), "out", basename(file).replace(/\.html$/, ".mp4")));

const browser = await launch();
try {
  const probePage = await browser.newPage();
  await probePage.goto(pathToFileURL(file).href, { waitUntil: "load" });
  const S = await probePage.waitForFunction(() => window.SCENE, null, { timeout: 3000 }).then((h) => h.jsonValue()).catch(() => null);
  await probePage.close();
  if (!S) fail(`${scene} does not define window.SCENE = { duration, fps, width, height, scale }`);
  const { duration, fps = 30, width, height, scale = 2 } = S;
  if (!(duration > 0 && width > 0 && height > 0)) fail(`window.SCENE needs positive duration, width and height`);
  if (width % 2 || height % 2) fail(`SCENE width and height must be even for H.264 (got ${width}×${height})`);

  const page = await browser.newPage({ viewport: { width: Math.round(width / scale), height: Math.round(height / scale) }, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  await Promise.all(page.frames().map((f) => f.evaluate(() => document.fonts.ready).catch(() => {})));

  mkdirSync(dirname(out), { recursive: true });
  const enc = encoder(out, fps);
  const frames = Math.round((duration / 1000) * fps);
  for (let i = 0; i < frames; i++) {
    await seek(page, (i * 1000) / fps);
    await enc.write(await page.screenshot({ type: "png", animations: "allow" }));
    if (i % fps === 0) process.stderr.write(`\r${Math.round((i / frames) * 100)}%`);
  }
  await enc.end();
  process.stderr.write("\r");
  console.log(relative(process.cwd(), out));
} finally {
  await browser.close();
}
