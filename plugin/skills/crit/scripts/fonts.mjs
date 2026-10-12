#!/usr/bin/env node
// Usage: node fonts.mjs <slug…>   — copies shortlisted fonts into design/fonts and updates fonts.css.
import { join } from "node:path";
import { fail, requireDesignDir } from "./lib/paths.mjs";
import { installFonts, SHORTLIST } from "./lib/fonts.mjs";

const design = requireDesignDir();
const slugs = process.argv.slice(2);
if (!slugs.length) fail(`usage: fonts.mjs <slug…>\nshortlist: ${Object.keys(SHORTLIST).join(", ")}`);
try {
  const { families } = installFonts(slugs, join(design, "fonts"));
  for (const [i, f] of families.entries()) console.log(`${slugs[i]} → font-family: '${f}'`);
  console.log("Screens load them with <link rel=\"stylesheet\" href=\"../../fonts/fonts.css\">");
} catch (e) {
  fail(e.message);
}
