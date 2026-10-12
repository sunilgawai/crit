#!/usr/bin/env node
// Usage: node store.mjs — builds App Store and Google Play assets from design/store/store.json.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { PNG } from "pngjs";
import { fail, requireDesignDir } from "./lib/paths.mjs";
import { launch } from "./lib/browser.mjs";
import { SHOT, iconHtml, shotHtml } from "./lib/store.mjs";
import { parseColor } from "./lib/color.mjs";

const design = requireDesignDir();
const cfgPath = join(design, "store", "store.json");
if (!existsSync(cfgPath)) fail("missing design/store/store.json — run init.mjs");
const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
const need = (p) => {
  const abs = join(design, p);
  if (!existsSync(abs)) fail(`store.json references design/${p}, which does not exist`);
  return abs;
};
for (const s of [...(cfg.ios ?? []), ...(cfg.android ?? [])]) need(s.image);
for (const k of ["icon", "featureGraphic"]) if (cfg[k] && !existsSync(join(design, cfg[k]))) console.log(`! skipping ${k}: design/${cfg[k]} not found`);

const out = join(design, "store", "out");
const tmp = join(design, "store", ".tmp.html");
const fontsCss = existsSync(join(design, "fonts", "fonts.css")) ? pathToFileURL(join(design, "fonts", "fonts.css")).href : null;
const written = [];
const toRgb = (buf, background = "#fff") => {
  const bg = parseColor(background) ?? { r: 255, g: 255, b: 255 };
  return PNG.sync.write(PNG.sync.read(buf), { colorType: 2, inputHasAlpha: true, bgColor: { red: bg.r, green: bg.g, blue: bg.b } });
};
const browser = await launch();

async function shoot(html, { width, height, scale = 1 }, file, { transparent = false } = {}) {
  writeFileSync(tmp, html);
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  mkdirSync(join(file, ".."), { recursive: true });
  const buf = await page.screenshot({ path: file, omitBackground: transparent });
  await page.close();
  written.push(file);
  return buf;
}

try {
  for (const platform of ["ios", "android"]) {
    for (const [i, s] of (cfg[platform] ?? []).entries()) {
      const html = shotHtml({
        image: pathToFileURL(need(s.image)).href, headline: s.headline ?? "", bg: cfg.background ?? "#fff",
        ink: cfg.ink ?? "#111", font: cfg.headlineFont, weight: cfg.headlineWeight ?? 400, fontsCss, platform,
      });
      await shoot(html, SHOT[platform], join(out, platform, `screenshot-${i + 1}.png`));
    }
  }

  if (cfg.icon && existsSync(join(design, cfg.icon))) {
    const svg = pathToFileURL(join(design, cfg.icon)).href;
    const file = join(out, "ios", "icon-1024.png");
    const buf = await shoot(iconHtml(svg), { width: 1024, height: 1024 }, file);
    // App Store rejects icons with an alpha channel, even a fully opaque one: re-encode as RGB.
    writeFileSync(file, toRgb(buf, cfg.background));
    const play = join(out, "android", "icon-512.png");
    // Play wants a 32-bit PNG; Chromium drops alpha when every pixel is opaque.
    writeFileSync(play, PNG.sync.write(PNG.sync.read(await shoot(iconHtml(svg), { width: 512, height: 512 }, play, { transparent: true })), { colorType: 6 }));
  }

  const fg = cfg.iconForeground && join(design, cfg.iconForeground);
  const bgLayer = cfg.iconBackground && join(design, cfg.iconBackground);
  if (fg && bgLayer && existsSync(fg) && existsSync(bgLayer)) {
    await shoot(iconHtml(pathToFileURL(fg).href), { width: 432, height: 432 }, join(out, "android", "adaptive-foreground.png"), { transparent: true });
    await shoot(iconHtml(pathToFileURL(bgLayer).href), { width: 432, height: 432 }, join(out, "android", "adaptive-background.png"));
  }

  if (cfg.featureGraphic && existsSync(join(design, cfg.featureGraphic))) {
    const page = await browser.newPage({ viewport: { width: 1024, height: 500 } });
    await page.goto(pathToFileURL(join(design, cfg.featureGraphic)).href, { waitUntil: "load" });
    await page.evaluate(() => document.fonts.ready);
    const file = join(out, "android", "feature-graphic.png");
    mkdirSync(join(file, ".."), { recursive: true });
    // Play requires the feature graphic as JPEG or 24-bit PNG (no alpha).
    writeFileSync(file, toRgb(await page.screenshot(), cfg.background));
    written.push(file);
  }
} finally {
  await browser.close();
  rmSync(tmp, { force: true });
}
for (const f of written) console.log(relative(process.cwd(), f));
