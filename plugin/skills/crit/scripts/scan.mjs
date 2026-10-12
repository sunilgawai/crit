#!/usr/bin/env node
// Usage: node scan.mjs <files|dirs…> [--json] [--copy]
// --copy prints every screen's visible text instead (for the Phase 6 copy pass).
// Deterministic checks for AI-design tells, copy, platform and paywall rules. Exit 1 on any error.
import { relative } from "node:path";
import { expandInputs, fail, isMain } from "./lib/paths.mjs";
import { launch, openScreen } from "./lib/browser.mjs";
import { collect } from "./lib/snapshot.mjs";
import { evaluate } from "./lib/rules.mjs";

export async function copyOf(browser, file) {
  const { page } = await openScreen(browser, file);
  try {
    const snap = await page.evaluate(collect);
    return snap.texts.map((t) => `${String(Math.round(t.fontSize)).padStart(3)}px  ${t.text}`);
  } finally {
    await page.close();
  }
}

export async function scanFile(browser, file) {
  const { page, platform } = await openScreen(browser, file);
  try {
    const snap = await page.evaluate(collect);
    return evaluate({ ...snap, screen: relative(process.cwd(), file), platform });
  } finally {
    await page.close();
  }
}

if (isMain(import.meta.url)) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const copy = args.includes("--copy");
  const files = await expandInputs(args.filter((a) => !a.startsWith("--")));
  if (!files.length) fail(`no .html files matched: ${args.join(" ") || "(no arguments)"}`);
  const browser = await launch();
  if (copy) {
    try {
      for (const f of files) console.log(`\n${relative(process.cwd(), f)}\n${(await copyOf(browser, f)).join("\n")}`);
    } finally {
      await browser.close();
    }
    process.exit(0);
  }
  const findings = [];
  try {
    for (const f of files) findings.push(...(await scanFile(browser, f)));
  } finally {
    await browser.close();
  }
  const errors = findings.filter((f) => f.level === "error").length;
  if (json) console.log(JSON.stringify(findings, null, 2));
  else {
    const pad = Math.max(0, ...findings.map((f) => f.rule.length));
    for (const file of files.map((f) => relative(process.cwd(), f))) {
      const mine = findings.filter((f) => f.screen === file);
      console.log(`${file}${mine.length ? "" : "  ✓ clean"}`);
      for (const f of mine) console.log(`  ${f.level === "error" ? "✗" : "!"} ${f.rule.padEnd(pad)}  ${f.detail}`);
    }
    console.log(`${files.length} screens · ${errors} errors · ${findings.length - errors} warnings`);
  }
  process.exit(errors ? 1 : 0);
}
