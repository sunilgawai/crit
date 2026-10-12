/** Pure scanner rules: Snapshot (collected in the page by snapshot.mjs) → findings. */
import { contrast, hsl, isPurpleBlueGradient, parseColor, toHex, TAILWIND_SLOP } from "./color.mjs";
import { copyFindings } from "./copy.mjs";

const EMOJI = /\p{Extended_Pictographic}/u;
const firstFamily = (f) => f.split(",")[0].trim().replace(/^["']|["']$/g, "").toLowerCase();

export function evaluate(s) {
  const out = [];
  const add = (rule, level, detail) => out.push({ screen: s.screen, rule, level, detail });
  const area = s.viewport.width * s.viewport.height;

  // Integrity
  if (s.bodyPlatform !== s.platform)
    add("platform-mismatch", "error", `file is under ${s.platform}/ but <body data-platform="${s.bodyPlatform}">`);
  for (const f of s.failedFonts) add("font-load-failed", "error", `font "${f}" failed to load — check fonts.css path`);
  if (s.scrollWidth > s.viewport.width) add("overflow-x", "error", `content is ${s.scrollWidth}px wide in a ${s.viewport.width}px screen`);

  // Design tells
  for (const t of s.texts) {
    const fam = firstFamily(t.family);
    if (t.fontSize >= 28 && (/^(inter|arial|helvetica)/.test(fam) || (s.platform === "ios" && fam.startsWith("roboto"))))
      add("generic-display-font", "error", `"${t.text.slice(0, 40)}" is ${t.fontSize}px ${t.family}`);
  }
  const seen = new Set();
  for (const c of s.colors) {
    const p = parseColor(c.css);
    if (!p) continue;
    const hex = toHex(p);
    if (TAILWIND_SLOP.includes(hex) && !seen.has(hex)) {
      seen.add(hex);
      add("tailwind-default-color", "error", `${hex} (Tailwind default) used as ${c.role}`);
    }
  }
  for (const g of s.gradients) {
    for (const p of (g.match(/#[0-9a-f]{6}\b|rgba?\([^)]*\)/gi) ?? []).map(parseColor).filter(Boolean)) {
      const hex = toHex(p);
      if (TAILWIND_SLOP.includes(hex) && !seen.has(hex)) {
        seen.add(hex);
        add("tailwind-default-color", "error", `${hex} (Tailwind default) in a gradient`);
      }
    }
    if (isPurpleBlueGradient(g)) add("purple-blue-gradient", "error", g.slice(0, 90));
  }
  for (const t of s.texts) {
    if (!t.allowEmoji && EMOJI.test(t.text.replace(/[©®™]/g, "")))
      add("emoji-icon", "error", `"${t.text.slice(0, 40)}" — draw an icon or illustration instead (data-allow-emoji for user content)`);
  }
  for (const t of s.texts) {
    if (t.inSvg || !t.bg) continue;
    const fg = parseColor(t.color), bg = parseColor(t.bg);
    if (!fg || !bg) continue;
    const large = t.fontSize >= 24 || (t.fontSize >= 18.66 && t.fontWeight >= 700);
    const need = large ? 3 : 4.5;
    const ratio = contrast(fg, bg);
    if (ratio < need) add("contrast", "error", `"${t.text.slice(0, 40)}" ${ratio.toFixed(2)}:1, needs ${need}:1`);
  }
  const min = s.platform === "android" ? 48 : 44;
  for (const t of s.targets)
    if (t.width < min || t.height < min) add("touch-target", "error", `"${t.label}" is ${Math.round(t.width)}×${Math.round(t.height)}, needs ${min}×${min}`);

  // Personality warnings
  const buckets = new Set();
  for (const c of s.colors) {
    if (!(c.interactive || c.role === "text")) continue;
    const p = parseColor(c.css);
    if (!p) continue;
    const { h, s: sat, l } = hsl(p);
    if (sat >= 0.55 && l >= 0.3 && l <= 0.7) buckets.add(Math.round(h / 30) % 12);
  }
  if (buckets.size > 1) add("many-signals", "warning", `${buckets.size} different saturated hues on actions/text — keep one signal`);

  const weight = new Map();
  for (const t of s.texts) weight.set(t.fontSize, (weight.get(t.fontSize) ?? 0) + t.text.length);
  const body = [...weight].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 16;
  const maxText = Math.max(0, ...s.texts.map((t) => t.fontSize));
  const bigMedia = s.media.some((m) => m.width * m.height >= area * 0.25);
  if (maxText < body * 3 && !bigMedia)
    add("no-hero", "warning", `largest text ${maxText}px vs body ${body}px and no large illustration — give the screen one hero`);
  for (const g of s.cardGroups)
    if (g.count >= 3 && g.identical) add("identical-cards", "warning", `${g.count} identical sibling cards — lead with one, vary the rest`);
  if (s.kind !== "onboarding" && s.texts.length >= 3 && s.texts.every((t) => t.align === "center"))
    add("all-centered", "warning", "every text block is centred");

  out.push(...copyFindings(s.texts).map((f) => ({ screen: s.screen, ...f })));

  // Paywall
  if (s.kind === "paywall") {
    for (const k of ["price", "terms", "privacy", "restore", "close"])
      if (!s.paywall[k]?.some((e) => e.visible)) add("paywall-missing", "error", `no visible [data-paywall="${k}"]`);
    const billed = Math.max(0, ...s.priceTexts.filter((p) => p.paywallRole === "price").map((p) => p.fontSize));
    const louder = s.priceTexts.filter((p) => p.paywallRole !== "price" && p.paywallRole !== "after-trial" && p.fontSize > billed);
    if (louder.length)
      add("paywall-price-not-prominent", "error", `a ${Math.max(...louder.map((p) => p.fontSize))}px price outshines the ${billed}px billed price (App Store 3.1.2)`);
    if (s.paywall.trial?.some((e) => e.visible) && !s.paywall["after-trial"]?.some((e) => e.visible))
      add("paywall-trial-terms", "error", `trial shown without the price charged after it ([data-paywall="after-trial"])`);
  }
  return out;
}
