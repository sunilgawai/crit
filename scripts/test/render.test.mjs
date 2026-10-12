import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { PNG } from "pngjs";
import { SKILL_DIR } from "../lib/paths.mjs";
import { fixtureProject } from "./helpers.mjs";

const node = (cwd, ...a) => spawnSync(process.execPath, a, { cwd, encoding: "utf8" });
const read = (p) => PNG.sync.read(readFileSync(p));
const size = (p) => { const png = read(p); return [png.width, png.height]; };
const render = (cwd, ...a) => node(cwd, join(SKILL_DIR, "scripts/render.mjs"), ...a);

test("renders iOS at 1206x2622 and Android at 1082x2402 from a path with spaces", () => {
  const cwd = fixtureProject();
  const r = render(cwd, "design/screens");
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(size(join(cwd, "design/renders/screens/ios/01-clean.png")), [1206, 2622]);
  assert.deepEqual(size(join(cwd, "design/renders/screens/android/01-clean.png")), [1082, 2402]);
});

test("external <use> into illustrations.svg actually paints", () => {
  const cwd = fixtureProject();
  render(cwd, "design/screens/ios/01-clean.html");
  const png = read(join(cwd, "design/renders/screens/ios/01-clean.png"));
  // centre of the 80px sun (right 24, bottom 120) in CSS px, rendered at 3×
  const [x, y] = [402 - 24 - 40, 874 - 120 - 40];
  const i = (y * 3 * png.width + x * 3) * 4;
  assert.deepEqual([...png.data.slice(i, i + 3)], [0xe8, 0x50, 0x1a]);
});

test("no matching inputs exits 2", () => {
  const r = render(fixtureProject(), "design/directions-none");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /no \.html files/);
});

test("sheet lays four renders out in one row", () => {
  const cwd = fixtureProject();
  render(cwd, "design/screens");
  const ios = "design/renders/screens/ios/01-clean.png";
  const android = "design/renders/screens/android/01-clean.png";
  const r = node(cwd, join(SKILL_DIR, "scripts/sheet.mjs"), ios, android, ios, android, "--out", "design/renders/sheet.png", "--labels", "A,B,C,D");
  assert.equal(r.status, 0, r.stderr);
  const [w, h] = size(join(cwd, "design/renders/sheet.png"));
  assert.ok(w > h, `${w}x${h}`);
});
