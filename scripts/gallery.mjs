#!/usr/bin/env node
// Usage: node gallery.mjs — writes design/index.html: every sheet, render, video and store asset.
import { existsSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { requireDesignDir } from "./lib/paths.mjs";

const design = requireDesignDir();
const files = (dir, re) =>
  existsSync(join(design, dir))
    ? readdirSync(join(design, dir), { recursive: true, withFileTypes: true })
        .filter((e) => e.isFile() && re.test(e.name))
        .map((e) => relative(design, join(e.parentPath, e.name)).split(sep).join("/"))
        .sort()
    : [];

const renders = files("renders", /\.png$/);
const sections = [
  ["Sheets", renders.filter((p) => !p.startsWith("renders/screens/") && !p.startsWith("renders/directions/"))],
  ["iOS", renders.filter((p) => p.startsWith("renders/screens/ios/"))],
  ["Android", renders.filter((p) => p.startsWith("renders/screens/android/"))],
  ["Directions", renders.filter((p) => p.startsWith("renders/directions/"))],
  ["Motion", files("motion/out", /\.mp4$/)],
  ["Store", files("store/out", /\.png$/)],
].filter(([, list]) => list.length);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
const item = (p) =>
  p.endsWith(".mp4")
    ? `<figure><video src="${esc(p)}" controls loop muted playsinline></video><figcaption>${esc(p)}</figcaption></figure>`
    : `<figure><a href="${esc(p)}"><img src="${esc(p)}" loading="lazy"></a><figcaption>${esc(p)}</figcaption></figure>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Design</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{margin:0;padding:40px;background:#f4f4f2;color:#1c1c1a;font:15px/1.5 system-ui,BlinkMacSystemFont,sans-serif}
  h1{font-size:28px;margin:0 0 24px} h2{font-size:18px;margin:48px 0 16px}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:24px;align-items:start}
  .wide .grid{grid-template-columns:1fr}
  figure{margin:0} img,video{display:block;width:100%;border-radius:12px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12)}
  figcaption{margin-top:6px;font-size:12px;color:#6b6b66;word-break:break-all}
</style></head><body><h1>Design</h1>
${sections.map(([title, list]) => `<section class="${title === "Sheets" ? "wide" : ""}"><h2>${title}</h2><div class="grid">${list.map(item).join("")}</div></section>`).join("\n")}
</body></html>`;
writeFileSync(join(design, "index.html"), html);
console.log(`design/index.html — ${sections.map(([t, l]) => `${l.length} ${t.toLowerCase()}`).join(", ")}`);
