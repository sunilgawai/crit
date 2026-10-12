import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { readdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { SKILL_DIR } from "../lib/paths.mjs";
import { probe } from "../lib/capture.mjs";
import { fixtureProject } from "./helpers.mjs";

const capture = (cwd, ...a) => spawnSync(process.execPath, [join(SKILL_DIR, "scripts/capture.mjs"), ...a], { cwd, encoding: "utf8" });

test("captures an infinite-animation scene to an mp4 of the declared length and size", { timeout: 60_000 }, () => {
  const cwd = fixtureProject();
  const r = capture(cwd, "design/motion/pulse.html");
  assert.equal(r.status, 0, r.stderr);
  const p = probe(join(cwd, "design/motion/out/pulse.mp4"));
  assert.deepEqual([p.width, p.height], [320, 240]);
  assert.ok(Math.abs(p.seconds - 1) < 0.1, String(p.seconds));
});

test("odd dimensions are rejected before capturing", () => {
  const cwd = fixtureProject();
  const f = join(cwd, "design/motion/odd.html");
  writeFileSync(f, `<script>window.SCENE = { duration: 500, fps: 10, width: 321, height: 240, scale: 1 };</script>`);
  const r = capture(cwd, f);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /even/);
});

test("a page without SCENE fails clearly", () => {
  const cwd = fixtureProject();
  const f = join(cwd, "design/motion/none.html");
  writeFileSync(f, `<p>no scene</p>`);
  const r = capture(cwd, f);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /window\.SCENE/);
});

test("--stills writes evenly spaced frames for review", { timeout: 60_000 }, () => {
  const cwd = fixtureProject();
  const r = capture(cwd, "design/motion/pulse.html", "--stills", "3");
  assert.equal(r.status, 0, r.stderr);
  const dir = join(cwd, "design/motion/out/pulse-stills");
  assert.deepEqual(readdirSync(dir).sort(), ["1.png", "2.png", "3.png"]);
});
