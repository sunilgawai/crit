import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { SKILL_DIR } from "../lib/paths.mjs";
import { fixtureProject } from "./helpers.mjs";

const scan = (cwd, ...files) => {
  const r = spawnSync(process.execPath, [join(SKILL_DIR, "scripts/scan.mjs"), ...files, "--json"], { cwd, encoding: "utf8" });
  return { status: r.status, findings: JSON.parse(r.stdout || "[]"), stderr: r.stderr };
};

test("clean screen passes", () => {
  const r = scan(fixtureProject(), "design/screens/ios/01-clean.html");
  assert.equal(r.status, 0, JSON.stringify(r.findings) + r.stderr);
  assert.deepEqual(r.findings.filter((f) => f.level === "error"), []);
});

test("sloppy screen produces the expected errors", () => {
  const r = scan(fixtureProject(), "design/screens/ios/02-sloppy.html");
  assert.equal(r.status, 1);
  const rules = new Set(r.findings.map((f) => f.rule));
  for (const id of ["tailwind-default-color", "purple-blue-gradient", "emoji-icon", "banned-phrase", "generic-display-font", "touch-target", "placeholder-content", "identical-cards", "title-case"])
    assert.ok(rules.has(id), `expected ${id}; got ${[...rules]}`);
});

test("paywall fixture passes paywall rules", () => {
  const r = scan(fixtureProject(), "design/screens/ios/03-paywall.html");
  assert.equal(r.stderr, "");
  assert.ok(r.status === 0 || r.status === 1, `status ${r.status}`);
  assert.deepEqual(r.findings.filter((f) => f.rule.startsWith("paywall")), []);
});

test("missing font file is an error", () => {
  const r = scan(fixtureProject(), "design/screens/ios/04-badfont.html");
  assert.ok(r.findings.some((f) => f.rule === "font-load-failed"), JSON.stringify(r.findings));
});

test("status bar and home indicator are not scanned as content", () => {
  const r = scan(fixtureProject(), "design/screens/ios/01-clean.html");
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!r.findings.some((f) => /9:41/.test(f.detail)));
});

test("human report and exit code without --json", () => {
  const r = spawnSync(process.execPath, [join(SKILL_DIR, "scripts/scan.mjs"), "design/screens/ios"], { cwd: fixtureProject(), encoding: "utf8" });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /✗ tailwind-default-color/);
  assert.match(r.stdout, /4 screens · \d+ errors · \d+ warnings/);
});

test("an illustration bleeding off the edge is not overflow, but text is", () => {
  const cwd = fixtureProject();
  const f = join(cwd, "design/screens/ios/05-bleed.html");
  writeFileSync(f, `<!doctype html><html><head><link rel="stylesheet" href="../../device.css"></head>
    <body data-platform="ios" data-screen-kind="main" style="background:#F3EEE4;color:#1C1A17">
    <svg style="position:absolute;right:-80px;top:200px" width="240" height="240"><circle cx="120" cy="120" r="120" fill="#E8501A"/></svg>
    <h1 style="font:700 80px Georgia;margin:120px 0 0 20px">€49</h1></body></html>`);
  assert.ok(!scan(cwd, f).findings.some((x) => x.rule === "overflow-x"));
  writeFileSync(f, `<!doctype html><html><head><link rel="stylesheet" href="../../device.css"></head>
    <body data-platform="ios" data-screen-kind="main" style="background:#F3EEE4;color:#1C1A17">
    <p style="white-space:nowrap;margin:120px 20px;font-size:17px">This sentence is far too long to fit on one line of a phone screen.</p></body></html>`);
  assert.ok(scan(cwd, f).findings.some((x) => x.rule === "overflow-x"));
});

test("translucent backgrounds are composited before checking contrast", () => {
  const cwd = fixtureProject();
  const f = join(cwd, "design/screens/ios/06-tint.html");
  writeFileSync(f, `<!doctype html><html><head><link rel="stylesheet" href="../../device.css"></head>
    <body data-platform="ios" data-screen-kind="main" style="background:#F3EEE4;color:#201D19">
    <div style="margin:120px 20px;padding:12px;border-radius:17px;background:rgba(32,29,25,.06);font:600 15px system-ui">Suggest</div></body></html>`);
  const r = scan(cwd, f);
  assert.ok(!r.findings.some((x) => x.rule === "contrast"), JSON.stringify(r.findings));
});

test("a tab bar in <nav> is not identical cards; a segmented control is not a small target", () => {
  const cwd = fixtureProject();
  const f = join(cwd, "design/screens/ios/07-tabs.html");
  const tab = (t) => `<a style="display:block;width:80px;height:49px;border-radius:12px;background:#E6DFD2;color:#1C1A17">${t}</a>`;
  writeFileSync(f, `<!doctype html><html><head><link rel="stylesheet" href="../../device.css"></head>
    <body data-platform="ios" data-screen-kind="main" style="background:#F3EEE4;color:#1C1A17;font:15px system-ui">
    <div role="tablist" style="display:flex;margin:120px 20px 0"><button role="tab" style="height:32px;width:170px">Type it</button><button role="tab" style="height:32px;width:170px">Snap it</button></div>
    <nav style="position:absolute;bottom:34px;left:0;right:0;display:flex;justify-content:space-around">${tab("Today")}${tab("Book")}${tab("Shelf")}${tab("You")}</nav></body></html>`);
  const rules = scan(cwd, f).findings.map((x) => x.rule);
  assert.ok(!rules.includes("identical-cards"), rules.join());
  assert.ok(!rules.includes("touch-target"), rules.join());
});

test("--copy lists each screen's visible text (no device chrome) for the copy pass", () => {
  const r = spawnSync(process.execPath, [join(SKILL_DIR, "scripts/scan.mjs"), "design/screens/ios/01-clean.html", "--copy"], { cwd: fixtureProject(), encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /01-clean\.html/);
  assert.match(r.stdout, /Eighteen months to the road bike/);
  assert.match(r.stdout, /Add money/);
  assert.doesNotMatch(r.stdout, /9:41/);
});
