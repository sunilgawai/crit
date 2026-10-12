import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { SKILL_DIR } from "../lib/paths.mjs";
import { fixtureProject } from "./helpers.mjs";

test("gallery links every render, sheet, video and store asset with relative paths", () => {
  const cwd = fixtureProject();
  spawnSync(process.execPath, [join(SKILL_DIR, "scripts/render.mjs"), "design/screens"], { cwd });
  mkdirSync(join(cwd, "design/motion/out"), { recursive: true });
  writeFileSync(join(cwd, "design/motion/out/hero.mp4"), "");
  mkdirSync(join(cwd, "design/store/out/ios"), { recursive: true });
  writeFileSync(join(cwd, "design/store/out/ios/icon-1024.png"), "");
  const r = spawnSync(process.execPath, [join(SKILL_DIR, "scripts/gallery.mjs")], { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const html = readFileSync(join(cwd, "design/index.html"), "utf8");
  for (const p of ["renders/screens/ios/01-clean.png", "renders/screens/android/01-clean.png", "motion/out/hero.mp4", "store/out/ios/icon-1024.png"])
    assert.ok(html.includes(`"${p}"`), p);
  assert.ok(!html.includes(cwd), "paths must be relative");
});
