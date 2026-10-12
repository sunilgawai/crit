import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { SKILL_DIR } from "../lib/paths.mjs";

const run = (script, cwd, ...args) =>
  spawnSync(process.execPath, [join(SKILL_DIR, "scripts", script), ...args], { cwd, encoding: "utf8" });

test("init creates the design tree and does not overwrite", () => {
  const cwd = mkdtempSync(join(tmpdir(), "adp-"));
  assert.equal(run("init.mjs", cwd).status, 0);
  for (const p of ["screens/ios", "screens/android", "directions", "critique", "motion", "fonts", "device.css", "device.js", "tokens.css", "illustrations.svg", "store/store.json"])
    assert.ok(existsSync(join(cwd, "design", p)), p);
  writeFileSync(join(cwd, "design", "tokens.css"), "/* mine */");
  run("init.mjs", cwd);
  assert.equal(readFileSync(join(cwd, "design", "tokens.css"), "utf8"), "/* mine */");
});

test("scripts that need design/ fail clearly before init", () => {
  const cwd = mkdtempSync(join(tmpdir(), "adp-"));
  const r = run("fonts.mjs", cwd, "fraunces");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /run init\.mjs first/);
});
