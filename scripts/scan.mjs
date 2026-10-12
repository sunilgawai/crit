#!/usr/bin/env node
// Usage: node scan.mjs <files|dirs…> [--json]
// Deterministic checks for AI-design tells, copy, platform and paywall rules. Exit 1 on any error.
import { relative } from "node:path";
import { expandInputs, fail } from "./lib/paths.mjs";
import { launch, openScreen } from "./lib/browser.mjs";
import { collect } from "./lib/snapshot.mjs";
import { evaluate } from "./lib/rules.mjs";

export async function scanFile(browser, file) {
  const { page, platform } = await openScreen(browser, file);
  try {
    const snap = await page.evaluate(collect);
    return evaluate({ ...snap, screen: relative(process.cwd(), file), platform });
  } finally {
    await page.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const files = await expandInputs(args.filter((a) => a !== "--json"));
  if (!files.length) fail(`no .html files matched: ${args.join(" ") || "(no arguments)"}`);
  const browser = await launch();
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
