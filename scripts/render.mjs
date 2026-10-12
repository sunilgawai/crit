#!/usr/bin/env node
// Usage: node render.mjs <files|dirs…>  — screens → PNG at device resolution in design/renders/.
import { mkdirSync } from "node:fs";
import { dirname, relative } from "node:path";
import { expandInputs, fail, isMain, outPathFor, requireDesignDir } from "./lib/paths.mjs";
import { DEVICES, launch, openScreen } from "./lib/browser.mjs";

export async function renderFile(browser, file, design) {
  const { page, platform } = await openScreen(browser, file);
  const out = outPathFor(file, design);
  mkdirSync(dirname(out), { recursive: true });
  const { width, height } = DEVICES[platform];
  await page.screenshot({ path: out, clip: { x: 0, y: 0, width, height } });
  await page.close();
  return out;
}

if (isMain(import.meta.url)) {
  const design = requireDesignDir();
  const files = await expandInputs(process.argv.slice(2));
  if (!files.length) fail(`no .html files matched: ${process.argv.slice(2).join(" ") || "(no arguments)"}`);
  const browser = await launch();
  try {
    for (const f of files) console.log(relative(process.cwd(), await renderFile(browser, f, design)));
  } finally {
    await browser.close();
  }
}
