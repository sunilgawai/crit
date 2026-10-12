import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { designDir, expandInputs, outPathFor } from "../lib/paths.mjs";

test("designDir throws a helpful error when design/ is missing", () => {
  const dir = mkdtempSync(join(tmpdir(), "adp-"));
  assert.throws(() => designDir(dir), /run init\.mjs first/);
});

test("expandInputs expands directories to sorted html files and keeps files", async () => {
  const dir = mkdtempSync(join(tmpdir(), "adp with space-"));
  mkdirSync(join(dir, "ios"));
  writeFileSync(join(dir, "ios", "02-b.html"), "");
  writeFileSync(join(dir, "ios", "01-a.html"), "");
  writeFileSync(join(dir, "ios", "notes.md"), "");
  const out = await expandInputs([dir]);
  assert.deepEqual(out.map((f) => f.slice(dir.length)), ["/ios/01-a.html", "/ios/02-b.html"]);
});

test("outPathFor mirrors the design tree under renders/", () => {
  assert.equal(
    outPathFor("/p/design/screens/ios/01-home.html", "/p/design"),
    "/p/design/renders/screens/ios/01-home.png",
  );
});
