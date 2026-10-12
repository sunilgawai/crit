/** Copy checks: phrases a person would not say, placeholders, and shape problems. */
export const BANNED = [
  /\bunlock (your|the)\b/i, /\bseamless(ly)?\b/i, /\beffortless(ly)?\b/i, /\belevate\b/i, /\bsupercharge/i,
  /\bempower/i, /\byour journey\b/i, /\btake control\b/i, /\ball-in-one\b/i, /\brevolutioni[sz]e/i,
  /\bgame[- ]changer/i, /\bdive (in|into)\b/i, /\bin today's fast-paced\b/i, /\bnext-level\b/i, /\bunleash/i,
  /\bharness the power\b/i, /\bat your fingertips\b/i, /\blook no further\b/i, /\bwhether you're\b/i,
  /\bdesigned to help you\b/i, /\bwe've got you covered\b/i, /\bsay goodbye to\b/i, /\bhassle-free\b/i,
];

export const PLACEHOLDER = /lorem ipsum|dolor sit amet|john doe|jane (doe|smith)|\bacme\b|example@|your name here/i;

export function isTitleCase(s) {
  const words = s.replace(/[^\p{L}\s'-]/gu, " ").split(/\s+/).filter(Boolean);
  const long = words.filter((w) => w.length > 3);
  return words.length >= 3 && long.length >= 2 && long.every((w) => /^\p{Lu}/u.test(w));
}

/** texts: { text, fontSize }[] → findings without `screen` (the caller adds it). */
export function copyFindings(texts) {
  const out = [];
  const add = (rule, level, detail) => out.push({ rule, level, detail });
  for (const { text, fontSize } of texts) {
    for (const re of BANNED) {
      const m = text.match(re);
      if (m) add("banned-phrase", "error", `"${m[0]}" in "${text}"`);
    }
    if (PLACEHOLDER.test(text)) add("placeholder-content", "error", `"${text}"`);
    if (fontSize >= 22 && isTitleCase(text)) add("title-case", "warning", `"${text}" — use sentence case`);
    for (const sentence of text.split(/[.!?]+/)) {
      const n = sentence.split(/\s+/).filter(Boolean).length;
      if (n > 20) add("long-sentence", "warning", `${n} words: "${sentence.trim().slice(0, 60)}…"`);
    }
  }
  const bangs = texts.reduce((n, t) => n + (t.text.match(/!/g)?.length ?? 0), 0);
  if (bangs > 1) add("exclamations", "warning", `${bangs} exclamation marks on one screen`);
  return out;
}
