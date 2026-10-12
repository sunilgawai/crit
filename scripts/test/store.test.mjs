import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { PNG } from "pngjs";
import { SKILL_DIR } from "../lib/paths.mjs";
import { fixtureProject } from "./helpers.mjs";

// PNG IHDR colour type sits at byte 25: 2 = RGB (no alpha), 6 = RGBA.
const meta = (p) => { const buf = readFileSync(p); const png = PNG.sync.read(buf); return { w: png.width, h: png.height, colorType: buf[25] }; };
const store = (cwd) => spawnSync(process.execPath, [join(SKILL_DIR, "scripts/store.mjs")], { cwd, encoding: "utf8" });

test("store assets at required sizes; iOS icon has no alpha", { timeout: 60_000 }, () => {
  const cwd = fixtureProject();
  spawnSync(process.execPath, [join(SKILL_DIR, "scripts/render.mjs"), "design/screens"], { cwd });
  const r = store(cwd);
  assert.equal(r.status, 0, r.stderr);
  const out = (p) => join(cwd, "design/store/out", p);
  const wh = (p) => { const m = meta(out(p)); return [m.w, m.h]; };
  assert.deepEqual(wh("ios/screenshot-1.png"), [1320, 2868]);
  assert.deepEqual(wh("android/screenshot-1.png"), [1080, 1920]);
  const icon = meta(out("ios/icon-1024.png"));
  assert.deepEqual([icon.w, icon.h, icon.colorType], [1024, 1024, 2]);
  assert.deepEqual(wh("android/icon-512.png"), [512, 512]);
  assert.deepEqual(wh("android/adaptive-foreground.png"), [432, 432]);
  assert.deepEqual(wh("android/adaptive-background.png"), [432, 432]);
  assert.deepEqual(wh("android/feature-graphic.png"), [1024, 500]);
  assert.equal(meta(out("android/feature-graphic.png")).colorType, 2, "Play feature graphic must be 24-bit PNG without alpha");
});

test("a missing referenced file exits 2 and names it", () => {
  const cwd = fixtureProject();
  const r = store(cwd); // renders were never made
  assert.equal(r.status, 2);
  assert.match(r.stderr, /renders\/screens\/ios\/01-clean\.png/);
});

test("optional entries can be left out", { timeout: 60_000 }, () => {
  const cwd = fixtureProject();
  writeFileSync(join(cwd, "design/store/store.json"), JSON.stringify({ background: "#fff", ink: "#111", ios: [], android: [], icon: "store/icon.svg" }));
  const r = store(cwd);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(cwd, "design/store/out/ios/icon-1024.png")));
  assert.ok(!existsSync(join(cwd, "design/store/out/android/feature-graphic.png")));
});

test("Play icon keeps an alpha channel (32-bit PNG)", { timeout: 60_000 }, () => {
  const cwd = fixtureProject();
  writeFileSync(join(cwd, "design/store/store.json"), JSON.stringify({ background: "#fff", ink: "#111", ios: [], android: [], icon: "store/icon.svg" }));
  assert.equal(store(cwd).status, 0);
  assert.equal(meta(join(cwd, "design/store/out/android/icon-512.png")).colorType, 6);
});

test("headline weight comes from store.json and is never synthesised", async () => {
  const { shotHtml } = await import("../lib/store.mjs");
  const html = shotHtml({ image: "x.png", headline: "Hi", bg: "#fff", ink: "#111", platform: "ios", weight: 400 });
  assert.match(html, /font-weight:400/);
  assert.match(html, /font-synthesis:none/);
});
