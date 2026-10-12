#!/usr/bin/env node
// Checks (and on first run installs) everything the skill needs.
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { SKILL_DIR } from "./lib/paths.mjs";

let ok = true;
const line = (pass, msg) => {
  console.log(`${pass ? "✓" : "✗"} ${msg}`);
  if (!pass) ok = false;
};

const major = Number(process.versions.node.split(".")[0]);
line(major >= 22, `Node ${process.versions.node} (need 22+)`);
if (major < 22) process.exit(1);

if (!existsSync(join(SKILL_DIR, "node_modules", "playwright"))) {
  console.log("… installing skill dependencies (first run)");
  const r = spawnSync("npm", ["install", "--no-audit", "--no-fund"], { cwd: SKILL_DIR, stdio: "inherit" });
  line(r.status === 0, "npm install");
  if (r.status !== 0) process.exit(1);
}

const { launch, systemFontFamily } = await import("./lib/browser.mjs");
let browser;
try {
  browser = await launch();
} catch {
  console.log("… installing Chromium for Playwright");
  spawnSync("npx", ["playwright", "install", "chromium"], { cwd: SKILL_DIR, stdio: "inherit" });
  try {
    browser = await launch();
  } catch (e) {
    line(false, `Chromium: ${e.message.split("\n")[0]}`);
    process.exit(1);
  }
}
line(true, "Chromium launches");

const family = await systemFontFamily(browser);
await browser.close();
if (/SF/.test(family)) line(true, `iOS text font: ${family} (SF Pro)`);
else console.log(`! iOS text font resolves to "${family}", not SF Pro — iOS renders will be approximate (needs a Mac)`);

const { default: ffmpeg } = await import("ffmpeg-static");
line(Boolean(ffmpeg) && existsSync(ffmpeg), "ffmpeg (ffmpeg-static)");

process.exit(ok ? 0 : 1);
