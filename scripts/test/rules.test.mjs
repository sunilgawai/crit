import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "../lib/rules.mjs";

const base = () => ({
  screen: "s.html", platform: "ios", bodyPlatform: "ios", kind: "main",
  viewport: { width: 402, height: 874 }, scrollWidth: 402, failedFonts: [],
  texts: [
    { text: "€49", fontSize: 64, fontWeight: 700, family: "Fraunces Variable", color: "rgb(28, 26, 23)", bg: "rgb(243, 238, 228)", align: "left", allowEmoji: false, inSvg: false },
    { text: "Eighteen months to the road bike.", fontSize: 17, fontWeight: 400, family: "system-ui", color: "rgb(74, 69, 62)", bg: "rgb(243, 238, 228)", align: "left", allowEmoji: false, inSvg: false },
  ],
  targets: [{ label: "Add money", width: 140, height: 52 }],
  colors: [{ css: "rgb(232, 80, 26)", role: "bg", area: 7000, interactive: true }],
  gradients: [], media: [], cardGroups: [],
  paywall: { price: [], terms: [], privacy: [], restore: [], close: [], trial: [], "after-trial": [] },
  priceTexts: [],
});
const ids = (s) => evaluate(s).map((f) => f.rule);

test("clean snapshot has no findings", () => assert.deepEqual(evaluate(base()), []));
test("findings carry screen, rule, level and detail", () => {
  const s = base(); s.scrollWidth = 420;
  const [f] = evaluate(s);
  assert.deepEqual(Object.keys(f).sort(), ["detail", "level", "rule", "screen"]);
  assert.equal(f.screen, "s.html");
});
test("platform mismatch", () => { const s = base(); s.bodyPlatform = "android"; assert.ok(ids(s).includes("platform-mismatch")); });
test("tailwind indigo is flagged", () => { const s = base(); s.colors.push({ css: "rgb(99, 102, 241)", role: "bg", area: 10, interactive: false }); assert.ok(ids(s).includes("tailwind-default-color")); });
test("purple-blue gradient", () => { const s = base(); s.gradients.push("linear-gradient(135deg, rgb(139, 92, 246), rgb(59, 130, 246))"); assert.ok(ids(s).includes("purple-blue-gradient")); });
test("warm gradient is fine", () => { const s = base(); s.gradients.push("linear-gradient(rgb(255, 120, 60), rgb(255, 200, 120))"); assert.ok(!ids(s).includes("purple-blue-gradient")); });
test("emoji icon, unless allowed", () => { const s = base(); s.texts.push({ ...s.texts[1], text: "🔥 Streak" }); assert.ok(ids(s).includes("emoji-icon")); s.texts.at(-1).allowEmoji = true; assert.ok(!ids(s).includes("emoji-icon")); });
test("© is not an emoji", () => { const s = base(); s.texts.push({ ...s.texts[1], text: "© Split 2026 ™" }); assert.ok(!ids(s).includes("emoji-icon")); });
test("Inter as display on iOS", () => { const s = base(); s.texts[0].family = "Inter"; assert.ok(ids(s).includes("generic-display-font")); });
test("Roboto display allowed on Android", () => { const s = base(); s.platform = s.bodyPlatform = "android"; s.texts[0].family = "Roboto Flex Variable"; assert.ok(!ids(s).includes("generic-display-font")); });
test("Roboto display flagged on iOS", () => { const s = base(); s.texts[0].family = "Roboto Flex Variable"; assert.ok(ids(s).includes("generic-display-font")); });
test("low contrast body text", () => { const s = base(); s.texts[1].color = "rgb(190, 185, 178)"; assert.ok(ids(s).includes("contrast")); });
test("large text needs only 3:1", () => { const s = base(); s.texts[0].color = "rgb(140, 132, 120)"; assert.ok(!ids(s).includes("contrast")); });
test("unknown background skips contrast", () => { const s = base(); s.texts[1].bg = null; s.texts[1].color = "rgb(250, 250, 250)"; assert.ok(!ids(s).includes("contrast")); });
test("small target on Android but fine on iOS", () => { const s = base(); s.targets[0].height = 46; assert.ok(!ids(s).includes("touch-target")); s.platform = s.bodyPlatform = "android"; assert.ok(ids(s).includes("touch-target")); });
test("no hero", () => { const s = base(); s.texts[0].fontSize = 34; assert.ok(ids(s).includes("no-hero")); s.media.push({ width: 402, height: 300 }); assert.ok(!ids(s).includes("no-hero")); });
test("banned phrase", () => { const s = base(); s.texts[1].text = "Unlock your potential with seamless budgeting"; assert.ok(ids(s).includes("banned-phrase")); });
test("placeholder", () => { const s = base(); s.texts[1].text = "John Doe paid you"; assert.ok(ids(s).includes("placeholder-content")); });
test("overflow", () => { const s = base(); s.scrollWidth = 420; assert.ok(ids(s).includes("overflow-x")); });
test("failed font", () => { const s = base(); s.failedFonts = ["Fraunces Variable"]; assert.ok(ids(s).includes("font-load-failed")); });
test("two signal hues", () => { const s = base(); s.colors.push({ css: "rgb(30, 144, 255)", role: "bg", area: 5000, interactive: true }); assert.ok(ids(s).includes("many-signals")); });
test("identical cards", () => { const s = base(); s.cardGroups.push({ count: 3, identical: true }); assert.ok(ids(s).includes("identical-cards")); });
test("all centred", () => { const s = base(); s.texts.push({ ...s.texts[1], text: "More." }); for (const t of s.texts) t.align = "center"; assert.ok(ids(s).includes("all-centered")); s.kind = "onboarding"; assert.ok(!ids(s).includes("all-centered")); });
test("exclamations", () => { const s = base(); s.texts[1].text = "Great! You did it!"; assert.ok(ids(s).includes("exclamations")); });
test("title case headline", () => { const s = base(); s.texts[0] = { ...s.texts[0], text: "Track Your Shared Expenses", fontSize: 28 }; assert.ok(ids(s).includes("title-case")); });
test("long sentence", () => { const s = base(); s.texts[1].text = "This is a sentence that goes on and on and on because nobody edited it and it keeps adding words until it is long."; assert.ok(ids(s).includes("long-sentence")); });
test("warnings and errors are levelled", () => {
  const s = base(); s.cardGroups.push({ count: 3, identical: true }); s.scrollWidth = 999;
  const byRule = Object.fromEntries(evaluate(s).map((f) => [f.rule, f.level]));
  assert.equal(byRule["identical-cards"], "warning");
  assert.equal(byRule["overflow-x"], "error");
});

const paywall = () => {
  const s = base(); s.kind = "paywall";
  for (const k of ["price", "terms", "privacy", "restore", "close"]) s.paywall[k] = [{ visible: true, fontSize: k === "price" ? 28 : 13 }];
  s.priceTexts = [{ fontSize: 28, paywallRole: "price" }, { fontSize: 15, paywallRole: null }];
  return s;
};
test("complete paywall passes", () => assert.deepEqual(ids(paywall()).filter((r) => r.startsWith("paywall")), []));
test("paywall rules only apply to paywalls", () => { const s = base(); assert.ok(!ids(s).some((r) => r.startsWith("paywall"))); });
test("paywall without restore", () => { const s = paywall(); s.paywall.restore = []; assert.ok(ids(s).includes("paywall-missing")); });
test("invisible close button", () => { const s = paywall(); s.paywall.close = [{ visible: false, fontSize: 0 }]; assert.ok(ids(s).includes("paywall-missing")); });
test("per-week breakdown bigger than billed price", () => { const s = paywall(); s.priceTexts.push({ fontSize: 40, paywallRole: null }); assert.ok(ids(s).includes("paywall-price-not-prominent")); });
test("trial without after-trial price", () => { const s = paywall(); s.paywall.trial = [{ visible: true, fontSize: 15 }]; assert.ok(ids(s).includes("paywall-trial-terms")); s.paywall["after-trial"] = [{ visible: true, fontSize: 15 }]; assert.ok(!ids(s).includes("paywall-trial-terms")); });
test("repeated identical findings collapse with a count", () => {
  const s = base();
  s.texts.push({ ...s.texts[1], text: "🔥 Streak" }, { ...s.texts[1], text: "🔥 Streak" });
  const emoji = evaluate(s).filter((f) => f.rule === "emoji-icon");
  assert.equal(emoji.length, 1);
  assert.match(emoji[0].detail, /\(×2\)$/);
});
