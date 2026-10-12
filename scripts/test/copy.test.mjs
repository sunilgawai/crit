import { test } from "node:test";
import assert from "node:assert/strict";
import { copyFindings, isTitleCase } from "../lib/copy.mjs";

const rules = (text, fontSize = 17) => copyFindings([{ text, fontSize }]).map((f) => f.rule);

test("title case", () => {
  assert.ok(isTitleCase("Track Your Shared Expenses"));
  assert.ok(!isTitleCase("Bills, split before anyone asks."));
  assert.ok(!isTitleCase("Saveup"));
});
test("banned phrases", () => {
  for (const t of ["Seamless payments", "Unlock your savings", "Elevate your evenings", "Supercharge your focus", "In today's fast-paced world"])
    assert.ok(rules(t).includes("banned-phrase"), t);
});
test("human copy is clean", () => {
  assert.deepEqual(rules("Every seed in the packet."), []);
  assert.deepEqual(rules("Arriving by 3pm"), []);
});
test("placeholder content", () => assert.ok(rules("Lorem ipsum dolor").includes("placeholder-content")));
test("supporting lines over 14 words are long (copy.md)", () => {
  assert.ok(rules("One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen.").includes("long-sentence"));
  assert.ok(!rules("One two three four five six seven eight nine ten eleven twelve thirteen fourteen.").includes("long-sentence"));
});
