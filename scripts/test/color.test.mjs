import { test } from "node:test";
import assert from "node:assert/strict";
import { parseColor, contrast, hsl, gradientColors, toHex, isPurpleBlueGradient } from "../lib/color.mjs";

test("parses rgb, rgba and hex", () => {
  assert.deepEqual(parseColor("rgb(1, 2, 3)"), { r: 1, g: 2, b: 3, a: 1 });
  assert.deepEqual(parseColor("rgba(1, 2, 3, 0.5)"), { r: 1, g: 2, b: 3, a: 0.5 });
  assert.deepEqual(parseColor("#ff8000"), { r: 255, g: 128, b: 0, a: 1 });
  assert.deepEqual(parseColor("#fff"), { r: 255, g: 255, b: 255, a: 1 });
  assert.equal(parseColor("transparent"), null);
});
test("contrast", () => {
  assert.equal(Math.round(contrast(parseColor("#000"), parseColor("#fff"))), 21);
  assert.ok(Math.abs(contrast(parseColor("#777"), parseColor("#fff")) - 4.48) < 0.01);
});
test("hsl of red", () => assert.deepEqual(hsl({ r: 255, g: 0, b: 0 }), { h: 0, s: 1, l: 0.5 }));
test("toHex", () => assert.equal(toHex({ r: 99, g: 102, b: 241 }), "#6366f1"));
test("gradient stops", () => assert.equal(gradientColors("linear-gradient(90deg, rgb(1, 2, 3) 0%, #fff 100%)").length, 2));
test("purple-blue detection", () => {
  assert.ok(isPurpleBlueGradient("linear-gradient(135deg, rgb(139, 92, 246), rgb(59, 130, 246))"));
  assert.ok(!isPurpleBlueGradient("linear-gradient(rgb(59, 130, 246), rgb(14, 165, 233))"));
});
