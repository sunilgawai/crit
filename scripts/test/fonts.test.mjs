import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { installFonts } from "../lib/fonts.mjs";

test("installs a variable and a static family with working relative urls", () => {
  const dir = mkdtempSync(join(tmpdir(), "adp-fonts-"));
  const { families } = installFonts(["fraunces", "instrument-serif"], dir);
  assert.deepEqual(families, ["Fraunces Variable", "Instrument Serif"]);
  const css = readFileSync(join(dir, "fonts.css"), "utf8");
  const urls = [...css.matchAll(/url\(\.\/([^)]+)\)/g)].map((m) => m[1]);
  assert.ok(urls.length > 0);
  const files = readdirSync(dir);
  for (const u of urls) assert.ok(files.includes(u), `missing ${u}`);
  assert.ok(!/cyrillic|greek|vietnamese/.test(css));
  assert.match(css, /font-style: italic/);
});

test("installing twice does not duplicate blocks", () => {
  const dir = mkdtempSync(join(tmpdir(), "adp-fonts-"));
  installFonts(["fraunces"], dir);
  const once = readFileSync(join(dir, "fonts.css"), "utf8");
  installFonts(["fraunces"], dir);
  assert.equal(readFileSync(join(dir, "fonts.css"), "utf8"), once);
});

test("unknown family lists the shortlist", () => {
  assert.throws(() => installFonts(["comic-sans"], "/tmp"), /fraunces/);
});
