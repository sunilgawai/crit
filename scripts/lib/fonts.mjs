import { copyFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);

/** The font shortlist (slug → package). Anything outside it is a deliberate decision, not a default. */
export const SHORTLIST = {
  fraunces: "@fontsource-variable/fraunces",
  "instrument-serif": "@fontsource/instrument-serif",
  "dm-serif-display": "@fontsource/dm-serif-display",
  "young-serif": "@fontsource/young-serif",
  newsreader: "@fontsource-variable/newsreader",
  gloock: "@fontsource/gloock",
  "bricolage-grotesque": "@fontsource-variable/bricolage-grotesque",
  "familjen-grotesk": "@fontsource-variable/familjen-grotesk",
  unbounded: "@fontsource-variable/unbounded",
  syne: "@fontsource-variable/syne",
  "hanken-grotesk": "@fontsource-variable/hanken-grotesk",
  "baloo-2": "@fontsource-variable/baloo-2",
  "roboto-flex": "@fontsource-variable/roboto-flex",
  inter: "@fontsource-variable/inter",
};

function cssFilesFor(pkgDir, variable) {
  const all = readdirSync(pkgDir).filter((f) => f.endsWith(".css"));
  if (variable) {
    // Prefer the file with the most axes: full (all) > standard (wght, wdth, opsz…) > index (wght).
    const pick = (...names) => names.find((n) => all.includes(n)) ?? null;
    return [
      pick("full.css", "standard.css", "index.css"),
      pick("full-italic.css", "standard-italic.css", "wght-italic.css"),
    ].filter(Boolean);
  }
  return all.filter((f) => /^\d+(-italic)?\.css$/.test(f)).sort();
}

const BLOCK = /\/\*[^*]*\*\/\s*@font-face\s*{[^}]*}|@font-face\s*{[^}]*}/g;

/**
 * Copies latin + latin-ext woff2 files for each slug into fontsDir and appends
 * their @font-face rules to fontsDir/fonts.css (idempotent per slug).
 * Returns the CSS font-family names to use.
 */
export function installFonts(slugs, fontsDir) {
  for (const slug of slugs)
    if (!SHORTLIST[slug]) throw new Error(`unknown font "${slug}". Shortlist: ${Object.keys(SHORTLIST).join(", ")}`);

  const cssPath = join(fontsDir, "fonts.css");
  let css = existsSync(cssPath) ? readFileSync(cssPath, "utf8") : "";
  const families = [];

  for (const slug of slugs) {
    const pkg = SHORTLIST[slug];
    const pkgDir = dirname(require.resolve(`${pkg}/package.json`));
    const variable = pkg.startsWith("@fontsource-variable/");
    const blocks = cssFilesFor(pkgDir, variable)
      .flatMap((f) => readFileSync(join(pkgDir, f), "utf8").match(BLOCK) ?? [])
      .filter((b) => /-latin-(ext-)?[a-z0-9-]+\.woff2/.test(b) && !/cyrillic|greek|vietnamese/.test(b));
    const family = blocks[0]?.match(/font-family:\s*'([^']+)'/)?.[1];
    if (!family) throw new Error(`no latin faces found in ${pkg}`);
    families.push(family);

    if (css.includes(`/* adp:${slug} */`)) continue;
    const rewritten = blocks.map((b) => {
      for (const [, file] of b.matchAll(/url\(\.\/files\/([^)]+)\)/g)) copyFileSync(join(pkgDir, "files", file), join(fontsDir, file));
      return b.replace(/url\(\.\/files\//g, "url(./");
    });
    css += `/* adp:${slug} */\n${rewritten.join("\n")}\n/* /adp:${slug} */\n`;
  }
  writeFileSync(cssPath, css);
  return { families };
}
