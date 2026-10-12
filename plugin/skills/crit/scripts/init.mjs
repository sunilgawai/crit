#!/usr/bin/env node
// Creates design/ in the current directory. Never overwrites existing files.
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { SKILL_DIR } from "./lib/paths.mjs";

const design = join(process.cwd(), "design");
const dirs = ["screens/ios", "screens/android", "directions", "renders", "critique", "motion", "store", "fonts"];
for (const d of dirs) mkdirSync(join(design, d), { recursive: true });

const files = [
  ["device.css", "device.css"],
  ["device.js", "device.js"],
  ["tokens.css", "tokens.css"],
  ["components.css", "components.css"],
  ["illustrations.svg", "illustrations.svg"],
  ["store.json", "store/store.json"],
];
for (const [from, to] of files) {
  const dest = join(design, to);
  if (existsSync(dest)) console.log(`  kept    design/${to}`);
  else {
    copyFileSync(join(SKILL_DIR, "templates", from), dest);
    console.log(`  created design/${to}`);
  }
}
console.log(`design/ ready: ${dirs.join(", ")}`);
