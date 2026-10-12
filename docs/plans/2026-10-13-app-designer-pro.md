# App Designer Pro Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Claude Code skill folder that designs studio-grade iPhone and Android apps as HTML, judges them with a strict scanner and critic, and exports renders, MP4 motion and store assets.

**Architecture:** `SKILL.md` orchestrates nine phases. Taste lives in `references/*.md` and `agents/critic.md` (prose the model reads). Mechanics live in small Node ESM CLIs in `scripts/`, each a thin wrapper over pure functions in `scripts/lib/` that are unit-tested with `node:test`. Chromium (via Playwright) renders, scans and captures; `ffmpeg-static` encodes; `pngjs` strips icon alpha.

**Tech Stack:** Node 24 ESM, `playwright@1.63.0` (pinned: matches the Chromium build already cached on this Mac), `ffmpeg-static@5.3.0`, `pngjs@7`, `@fontsource` / `@fontsource-variable` font packages, `node:test`.

**Spec:** `docs/specs/2026-10-13-app-designer-pro-design.md`

## Global Constraints

- Skill repo: `~/Career/app-designer-pro`; installed by symlink at `~/.claude/skills/app-designer-pro`.
- All design output goes to `design/` under the user's current working directory; scripts never write elsewhere (except `doctor.mjs` installing into the skill dir).
- iOS frame 402×874 CSS px at 3× (renders 1206×2622). Android frame 412×915 CSS px at 2.625× (renders 1082×2402).
- iOS text font stack: `system-ui, BlinkMacSystemFont, sans-serif` (never `-apple-system` first: Chromium ignores it).
- Font shortlist: serif — Fraunces, Instrument Serif, DM Serif Display, Young Serif, Newsreader, Gloock; display sans — Bricolage Grotesque, Familjen Grotesk, Unbounded, Syne, Hanken Grotesk; rounded — Baloo 2; Android text — Roboto Flex. Inter is fallback only.
- Store sizes: App Store screenshot 1320×2868; App Store icon 1024×1024, opaque, square; Play screenshot 1080×1920; Play icon 512×512; adaptive icon layers 432×432; feature graphic 1024×500.
- Critic pass rule: concept, memorability, hero each ≥ 8 and mean ≥ 8; "tidy but forgettable" capped at 6; max 4 rounds per batch.
- Scanner exits 1 on any `error` finding, 0 otherwise. Findings shape: `{ screen, rule, level: "error"|"warning", detail }`.
- No external network at design time except `npm install` / `playwright install` in `doctor.mjs`.
- Scripts accept files or directories (directories expand to `**/*.html`); zero matched files is an error with exit code 2.

## Review Focus

1. **Font files that fail to load** (wrong path in `fonts.css`) silently fall back to Times in renders → `scan.mjs` must report `font-load-failed` as an error. Test in Task 5.
2. **Project paths containing spaces** (`~/My Apps/x`) → every file URL must be built with `pathToFileURL`. Test in Task 3.
3. **Running a script before `init`** (no `design/` folder) → clear message "no design/ folder — run init.mjs first" and exit 2, not a stack trace. Test in Task 2.
4. **Scenes with infinite animations** → capture length is governed by `SCENE.duration`, never hangs. Test in Task 6.
5. **No input files matched** → exit 2 with a message, not a silent success that the model reads as "all clean". Test in Task 3.

---

## File map

```
package.json, .gitignore
SKILL.md                         orchestration (Task 10)
agents/critic.md                 critic prompt (Task 9)
references/taste.md              taste rules (Task 9)
references/{ios,android,copy,paywalls,store-assets,motion}.md   (Task 8)
templates/device.css             safe-area vars, status bar/home indicator styling
templates/device.js              injects status bar + home indicator / gesture handle
templates/tokens.css             starter tokens
templates/screen.html            screen skeleton
templates/scene.html             motion scene skeleton
templates/store.json             store config starter
templates/illustrations.svg      empty <symbol> sprite
scripts/lib/paths.mjs            SKILL_DIR, designDir(), expandInputs(), outPathFor()
scripts/lib/browser.mjs          launch(), DEVICES, platformFromPath(), openScreen()
scripts/lib/color.mjs            parseColor, contrast, hsl, slop checks
scripts/lib/copy.mjs             banned phrases, title case, copy findings
scripts/lib/rules.mjs            evaluate(snapshot) → findings (pure)
scripts/lib/snapshot.mjs         collect() — runs inside the page
scripts/doctor.mjs init.mjs fonts.mjs render.mjs scan.mjs sheet.mjs capture.mjs store.mjs
scripts/test/*.test.mjs, scripts/test/fixtures/**
evals/briefs/a-split.md, evals/briefs/b-margin.md, evals/README.md
```

---

### Task 1: Scaffold, paths, browser, doctor

**Files:**
- Create: `package.json`, `.gitignore`, `scripts/lib/paths.mjs`, `scripts/lib/browser.mjs`, `scripts/doctor.mjs`
- Test: `scripts/test/paths.test.mjs`, `scripts/test/browser.test.mjs`

**Interfaces — Produces:**
- `SKILL_DIR: string` (absolute skill root)
- `designDir(cwd = process.cwd()): string` — `<cwd>/design`, throws `DesignDirMissing` (message `no design/ folder — run init.mjs first`) if absent
- `expandInputs(args: string[]): Promise<string[]>` — files kept, directories expanded to sorted `**/*.html`
- `outPathFor(file, design, rootName = "renders", ext = ".png"): string` — `design/<rootName>/<relative path with ext>`
- `fail(message, code = 2): never` — prints to stderr, exits
- `DEVICES = { ios: { width: 402, height: 874, scale: 3 }, android: { width: 412, height: 915, scale: 2.625 } }`
- `platformFromPath(file): "ios"|"android"` — `"android"` iff a path segment is `android`
- `launch(): Promise<Browser>`; `openScreen(browser, file): Promise<{ page, platform }>` (viewport per platform, `waitUntil: "load"`, then `document.fonts.ready`)

- [ ] **Step 1:** `package.json`

```json
{
  "name": "app-designer-pro",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "scripts": { "test": "node --test scripts/test/" },
  "dependencies": {
    "playwright": "1.63.0",
    "ffmpeg-static": "5.3.0",
    "pngjs": "7.0.0",
    "@fontsource-variable/fraunces": "5.3.0",
    "@fontsource/instrument-serif": "5.3.0",
    "@fontsource/dm-serif-display": "5.3.0",
    "@fontsource/young-serif": "5.3.0",
    "@fontsource-variable/newsreader": "5.3.0",
    "@fontsource/gloock": "5.3.0",
    "@fontsource-variable/bricolage-grotesque": "5.3.0",
    "@fontsource-variable/familjen-grotesk": "5.3.0",
    "@fontsource-variable/unbounded": "5.3.0",
    "@fontsource-variable/syne": "5.3.0",
    "@fontsource-variable/hanken-grotesk": "5.3.0",
    "@fontsource-variable/baloo-2": "5.3.0",
    "@fontsource-variable/roboto-flex": "5.3.0",
    "@fontsource-variable/inter": "5.3.0"
  }
}
```

`.gitignore`: `node_modules/`, `scripts/test/.out/`, `evals/runs/`.

- [ ] **Step 2: Failing tests** — `paths.test.mjs`

```js
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
```

`browser.test.mjs`

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { platformFromPath, DEVICES, launch } from "../lib/browser.mjs";

test("platformFromPath", () => {
  assert.equal(platformFromPath("/x/design/screens/android/01.html"), "android");
  assert.equal(platformFromPath("/x/design/screens/ios/01.html"), "ios");
  assert.equal(platformFromPath("/x/android-app/design/directions/a/main.html"), "ios");
});

test("iOS device size", () => assert.deepEqual(DEVICES.ios, { width: 402, height: 874, scale: 3 }));

test("system-ui resolves to SF Pro on this Mac", { skip: process.platform !== "darwin" }, async () => {
  const browser = await launch();
  const page = await browser.newPage();
  await page.setContent(`<p style="font-family:system-ui">Hi</p>`);
  const cdp = await page.context().newCDPSession(page);
  const { root } = await cdp.send("DOM.getDocument");
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector: "p" });
  await cdp.send("CSS.enable");
  const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
  await browser.close();
  assert.match(fonts[0].familyName, /SF/);
});
```

- [ ] **Step 3:** Run `npm install && npm test` → FAIL (modules missing).
- [ ] **Step 4:** Implement `paths.mjs` (use `fs.promises.glob` / recursive `readdir` and `path.relative`), `browser.mjs` (export `systemFontFamily(browser)` with the CDP logic above so doctor reuses it), and `doctor.mjs`: (1) Node ≥ 22 else fail; (2) if `SKILL_DIR/node_modules` missing, `spawnSync("npm", ["install"], { cwd: SKILL_DIR, stdio: "inherit" })`; (3) try `launch()`, on failure run `npx playwright install chromium` once and retry; (4) `systemFontFamily` — print `✓ SF Pro` or a warning that iOS text will fall back; (5) assert `ffmpeg-static` path exists. Print one `✓`/`✗` line per check; exit 1 if any `✗`.
- [ ] **Step 5:** `npm test` → PASS; `node scripts/doctor.mjs` → all ✓.
- [ ] **Step 6:** Commit `feat: scaffold, paths, browser, doctor`.

### Task 2: Templates, init, fonts

**Files:**
- Create: `templates/{device.css,device.js,tokens.css,screen.html,scene.html,store.json,illustrations.svg}`, `scripts/init.mjs`, `scripts/fonts.mjs`, `scripts/lib/fonts.mjs`
- Test: `scripts/test/init.test.mjs`, `scripts/test/fonts.test.mjs`

**Interfaces — Produces:**
- `init.mjs` creates `design/{screens/ios,screens/android,directions,renders,critique,motion,store,fonts}` and copies `device.css`, `device.js`, `tokens.css`, `illustrations.svg`, `store/store.json`, never overwriting existing files; prints the tree.
- `lib/fonts.mjs`: `SHORTLIST: Record<string, string>` (slug → package name); `installFonts(slugs: string[], fontsDir: string): { families: string[] }` — copies the latin + latin-ext woff2 files and writes `fontsDir/fonts.css` (appending blocks for new slugs, idempotent per slug). Unknown slug → throws listing the shortlist.
- Screens reference `../../tokens.css`, `../../fonts/fonts.css`, `../../device.css`, `../../device.js`.
- `device.js` reads `body[data-platform]` and `body[data-status="dark"|"light"]` (default dark text) and prepends `<div class="sb">` (time `9:41`; signal, wifi and battery as inline SVG) and appends `<div class="home">` (iOS home indicator 134×5 at bottom 8px; Android gesture handle 108×4). Both `aria-hidden` and `pointer-events:none`. Skips if `body[data-chrome="none"]`.
- `device.css` defines `--safe-top` (iOS 54px, Android 36px) and `--safe-bottom` (iOS 34px, Android 24px) via `body[data-platform]`, `html,body{margin:0;width:100%;height:100%;overflow:hidden}`, `-webkit-font-smoothing: antialiased`, and the `.sb`/`.home` styles.

- [ ] **Step 1: Failing tests**

```js
// init.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, existsSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { SKILL_DIR } from "../lib/paths.mjs";

const run = (script, cwd, ...args) =>
  spawnSync(process.execPath, [join(SKILL_DIR, "scripts", script), ...args], { cwd, encoding: "utf8" });

test("init creates the design tree and does not overwrite", () => {
  const cwd = mkdtempSync(join(tmpdir(), "adp-"));
  assert.equal(run("init.mjs", cwd).status, 0);
  for (const p of ["screens/ios", "screens/android", "critique", "device.css", "device.js", "tokens.css", "store/store.json"])
    assert.ok(existsSync(join(cwd, "design", p)), p);
  writeFileSync(join(cwd, "design", "tokens.css"), "/* mine */");
  run("init.mjs", cwd);
  assert.equal(readFileSync(join(cwd, "design", "tokens.css"), "utf8"), "/* mine */");
});

test("scripts that need design/ fail clearly before init", () => {
  const cwd = mkdtempSync(join(tmpdir(), "adp-"));
  const r = run("fonts.mjs", cwd, "fraunces");
  assert.equal(r.status, 2);
  assert.match(r.stderr, /run init\.mjs first/);
});
```

```js
// fonts.test.mjs
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
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. `installFonts`: for each slug resolve the package dir (`createRequire(import.meta.url).resolve(pkg + "/package.json")`); read `index.css` plus any `wght-italic.css` (variable) or `\d+(-italic)?.css` (static); split into `@font-face{…}` blocks; keep blocks whose url contains `-latin-` or `-latin-ext-`; copy those woff2 files; rewrite `url(./files/X)` → `url(./X)`; family name read from the block's `font-family`. Wrap each slug's blocks in `/* adp:<slug> */ … /* /adp:<slug> */` markers for idempotency. `fonts.mjs` CLI: `node fonts.mjs <slug…>` → calls `designDir()` (exit 2 via `fail` on `DesignDirMissing`), installs into `design/fonts`, prints `font-family` names to use.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: templates, init, fonts`.

### Task 3: render and sheet

**Files:**
- Create: `scripts/render.mjs`, `scripts/sheet.mjs`, `scripts/lib/sheet.mjs`, `scripts/test/helpers.mjs` (exports `fixtureProject()` — copies `fixtures/design` plus `templates/device.{css,js}` into a temp dir whose name contains spaces), `scripts/test/fixtures/design/screens/{ios,android}/01-clean.html`
- Test: `scripts/test/render.test.mjs`

**Interfaces:**
- Consumes: `expandInputs`, `outPathFor`, `designDir`, `launch`, `openScreen`, `fail`.
- Produces: `render.mjs <files|dirs…>` → writes `design/renders/<rel>.png` (viewport-clipped screenshot) and prints each path; `renderFile(browser, file, design): Promise<string>` exported for reuse. `sheet.mjs <png…> --out <file> [--bg <css>] [--labels a,b,c]` → device-framed sheet; `sheetHtml({ images, bg, labels }): string` in `lib/sheet.mjs`.

- [ ] **Step 1: Failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, cpSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { PNG } from "pngjs";
import { SKILL_DIR } from "../lib/paths.mjs";

const fixtureProject = () => {
  const cwd = mkdtempSync(join(tmpdir(), "adp project with spaces-"));
  cpSync(join(SKILL_DIR, "scripts/test/fixtures/design"), join(cwd, "design"), { recursive: true });
  for (const f of ["device.css", "device.js"]) cpSync(join(SKILL_DIR, "templates", f), join(cwd, "design", f));
  return cwd;
};
const node = (cwd, ...a) => spawnSync(process.execPath, a, { cwd, encoding: "utf8" });
const size = (p) => { const png = PNG.sync.read(readFileSync(p)); return [png.width, png.height]; };

test("renders iOS at 1206x2622 and Android at 1082x2402 from a path with spaces", () => {
  const cwd = fixtureProject();
  const r = node(cwd, join(SKILL_DIR, "scripts/render.mjs"), "design/screens");
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(size(join(cwd, "design/renders/screens/ios/01-clean.png")), [1206, 2622]);
  assert.deepEqual(size(join(cwd, "design/renders/screens/android/01-clean.png")), [1082, 2402]);
});

test("no matching inputs exits 2", () => {
  const cwd = fixtureProject();
  const r = node(cwd, join(SKILL_DIR, "scripts/render.mjs"), "design/directions-none");
  assert.equal(r.status, 2);
});

test("sheet composes renders into one wide png", () => {
  const cwd = fixtureProject();
  node(cwd, join(SKILL_DIR, "scripts/render.mjs"), "design/screens");
  const r = node(cwd, join(SKILL_DIR, "scripts/sheet.mjs"),
    "design/renders/screens/ios/01-clean.png", "design/renders/screens/android/01-clean.png", "--out", "design/renders/sheet.png");
  assert.equal(r.status, 0, r.stderr);
  const [w, h] = size(join(cwd, "design/renders/sheet.png"));
  assert.ok(w > h, `${w}x${h}`);
});
```

Fixture `01-clean.html` (iOS; Android identical with `data-platform="android"` and `font-family: 'Roboto Flex Variable', sans-serif` replaced by system fonts so the fixture needs no font install):

```html
<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../../device.css">
<style>
  body { background:#F3EEE4; color:#1C1A17; font-family: system-ui, BlinkMacSystemFont, sans-serif; }
  main { padding: calc(var(--safe-top) + 16px) 20px 0; }
  h1 { font: 700 64px/1 Georgia, serif; letter-spacing:-0.02em; margin:24px 0 8px; }
  p { font-size:17px; color:#4A453E; margin:0 0 24px; }
  button { min-height:52px; padding:0 24px; border:0; border-radius:26px; background:#E8501A; color:#fff; font:600 17px system-ui; }
</style></head>
<body data-platform="ios" data-screen-kind="main">
<main><h1>€49<small style="font-size:20px">/mo</small></h1>
<p>Eighteen months to the road bike. You're ahead by two weeks.</p>
<button>Add money</button></main>
<script src="../../device.js"></script></body></html>
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement. `renderFile`: `openScreen` → `page.screenshot({ path, clip: {x:0,y:0,width,height} })` after `mkdir -p`. Files open via `pathToFileURL(file).href`. Sheet: build HTML with each image as `<figure>` inside a frame (`border-radius: 56px` scaled, 10px #111 bezel, a Dynamic-Island pill for iOS images — detect by aspect ratio < 0.462 → iOS), soft background default `radial-gradient(#fff, #EEF0F3)`, 48px gaps, optional labels in Disket-free system font; image width 300 CSS px; screenshot `fullPage` at scale 2. Images embedded as `data:` URIs so the HTML can be set via `setContent`.
- [ ] **Step 4:** `npm test` → PASS. Open the sheet PNG and eyeball the frame.
- [ ] **Step 5:** Commit `feat: render and contact sheet`.

### Task 4: Scanner rules (pure)

**Files:**
- Create: `scripts/lib/color.mjs`, `scripts/lib/copy.mjs`, `scripts/lib/rules.mjs`
- Test: `scripts/test/color.test.mjs`, `scripts/test/copy.test.mjs`, `scripts/test/rules.test.mjs`

**Interfaces — Produces:**
- `color.mjs`: `parseColor(css): {r,g,b,a}|null` (rgb/rgba/hex), `toHex({r,g,b})`, `hsl({r,g,b}): {h,s,l}` (h 0–360, s,l 0–1), `contrast(fg, bg): number` (WCAG), `gradientColors(css): {r,g,b,a}[]`, `TAILWIND_SLOP = ["#6366f1","#8b5cf6","#4f46e5","#7c3aed","#a855f7","#818cf8"]`, `isPurpleBlueGradient(css): boolean` (has a stop with hue 255–300 and s > .35 **and** one with hue 190–254 and s > .35).
- `copy.mjs`: `BANNED: RegExp[]`, `PLACEHOLDER = /lorem ipsum|dolor sit amet|john doe|jane (doe|smith)|\bacme\b|example@|your name here/i`, `copyFindings(texts: {text, fontSize}[]): Finding[]` (screen filled in by caller), `isTitleCase(s): boolean` (≥ 3 words, every word longer than 3 letters capitalised).
- `rules.mjs`: `evaluate(snapshot): Finding[]` where

```ts
type Snapshot = {
  screen: string; platform: "ios"|"android"; bodyPlatform: string|null; kind: string;
  viewport: { width: number; height: number }; scrollWidth: number;
  failedFonts: string[];
  texts: { text: string; fontSize: number; fontWeight: number; family: string; color: string; bg: string|null; align: string; allowEmoji: boolean; inSvg: boolean }[];
  targets: { label: string; width: number; height: number }[];
  colors: { css: string; role: "bg"|"text"|"fill"; area: number; interactive: boolean }[];
  gradients: string[];
  media: { width: number; height: number }[];     // svg/img boxes
  cardGroups: { count: number; identical: boolean }[];
  paywall: Record<"price"|"terms"|"privacy"|"restore"|"close"|"trial"|"after-trial", { visible: boolean; fontSize: number }[]>;
  priceTexts: { fontSize: number; paywallRole: string|null }[];  // texts matching /[€$£¥₹]\s?\d|\d[.,]\d{2}\s?(€|\$)/
};
```

Rules (rule ids are the contract the critic and SKILL.md refer to):

| id | level | condition |
|---|---|---|
| `platform-mismatch` | error | `bodyPlatform` ≠ `platform` |
| `font-load-failed` | error | `failedFonts.length` |
| `overflow-x` | error | `scrollWidth > viewport.width` |
| `generic-display-font` | error | text with fontSize ≥ 28 whose first family is inter/arial/helvetica, or roboto on iOS |
| `tailwind-default-color` | error | any colour's hex in `TAILWIND_SLOP` |
| `purple-blue-gradient` | error | any gradient matches |
| `emoji-icon` | error | text (not `allowEmoji`) matches `/\p{Extended_Pictographic}/u` excluding ©®™ |
| `placeholder-content` | error | any text matches `PLACEHOLDER` |
| `contrast` | error | text not in svg, bg known, ratio < 4.5 (or < 3 when fontSize ≥ 24, or ≥ 18.66 and weight ≥ 700) |
| `touch-target` | error | target smaller than 44×44 (iOS) / 48×48 (Android) |
| `banned-phrase` | error | from `copyFindings` |
| `many-signals` | warning | > 1 hue bucket (30°) among colours with s ≥ .55, .3 ≤ l ≤ .7 used by interactive elements or text |
| `no-hero` | warning | max text fontSize < 3 × body size (mode of fontSize weighted by text length) and no media box ≥ 25% of viewport area |
| `identical-cards` | warning | any `cardGroups` with count ≥ 3 and identical |
| `all-centered` | warning | ≥ 3 texts and all `align === "center"` (skipped when kind is `onboarding`) |
| `exclamations` | warning | > 1 `!` across the screen's texts |
| `title-case` | warning | text with fontSize ≥ 22 where `isTitleCase` |
| `long-sentence` | warning | a sentence > 20 words |
| `paywall-missing` | error | kind `paywall` and any of price/terms/privacy/restore/close absent or invisible |
| `paywall-price-not-prominent` | error | kind `paywall` and some price text without role `price` is larger than the largest `price` |
| `paywall-trial-terms` | error | kind `paywall`, `trial` present, `after-trial` absent or invisible |

- [ ] **Step 1: Failing tests** — build a `base()` snapshot factory that passes every rule, then one test per rule mutating it:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { evaluate } from "../lib/rules.mjs";

const base = () => ({
  screen: "s.html", platform: "ios", bodyPlatform: "ios", kind: "main",
  viewport: { width: 402, height: 874 }, scrollWidth: 402, failedFonts: [],
  texts: [
    { text: "€49", fontSize: 64, fontWeight: 700, family: "Fraunces Variable", color: "rgb(28,26,23)", bg: "rgb(243,238,228)", align: "left", allowEmoji: false, inSvg: false },
    { text: "Eighteen months to the road bike.", fontSize: 17, fontWeight: 400, family: "system-ui", color: "rgb(74,69,62)", bg: "rgb(243,238,228)", align: "left", allowEmoji: false, inSvg: false },
  ],
  targets: [{ label: "Add money", width: 140, height: 52 }],
  colors: [{ css: "rgb(232,80,26)", role: "bg", area: 7000, interactive: true }],
  gradients: [], media: [], cardGroups: [],
  paywall: { price: [], terms: [], privacy: [], restore: [], close: [], trial: [], "after-trial": [] },
  priceTexts: [],
});
const ids = (s) => evaluate(s).map((f) => f.rule);

test("clean snapshot has no findings", () => assert.deepEqual(evaluate(base()), []));
test("tailwind indigo is flagged", () => { const s = base(); s.colors.push({ css: "rgb(99, 102, 241)", role: "bg", area: 10, interactive: false }); assert.ok(ids(s).includes("tailwind-default-color")); });
test("purple-blue gradient", () => { const s = base(); s.gradients.push("linear-gradient(135deg, rgb(139, 92, 246), rgb(59, 130, 246))"); assert.ok(ids(s).includes("purple-blue-gradient")); });
test("emoji icon, unless allowed", () => { const s = base(); s.texts.push({ ...s.texts[1], text: "🔥 Streak" }); assert.ok(ids(s).includes("emoji-icon")); s.texts.at(-1).allowEmoji = true; assert.ok(!ids(s).includes("emoji-icon")); });
test("© is not an emoji", () => { const s = base(); s.texts.push({ ...s.texts[1], text: "© Split 2026" }); assert.ok(!ids(s).includes("emoji-icon")); });
test("Inter as display on iOS", () => { const s = base(); s.texts[0].family = "Inter"; assert.ok(ids(s).includes("generic-display-font")); });
test("Roboto display allowed on Android", () => { const s = base(); s.platform = s.bodyPlatform = "android"; s.texts[0].family = "Roboto Flex Variable"; assert.ok(!ids(s).includes("generic-display-font")); });
test("low contrast body text", () => { const s = base(); s.texts[1].color = "rgb(190,185,178)"; assert.ok(ids(s).includes("contrast")); });
test("small target on Android but fine on iOS", () => { const s = base(); s.targets[0].height = 46; assert.ok(!ids(s).includes("touch-target")); s.platform = s.bodyPlatform = "android"; assert.ok(ids(s).includes("touch-target")); });
test("no hero", () => { const s = base(); s.texts[0].fontSize = 34; assert.ok(ids(s).includes("no-hero")); s.media.push({ width: 402, height: 300 }); assert.ok(!ids(s).includes("no-hero")); });
test("banned phrase", () => { const s = base(); s.texts[1].text = "Unlock your potential with seamless budgeting"; assert.ok(ids(s).includes("banned-phrase")); });
test("placeholder", () => { const s = base(); s.texts[1].text = "John Doe paid you"; assert.ok(ids(s).includes("placeholder-content")); });
test("overflow", () => { const s = base(); s.scrollWidth = 420; assert.ok(ids(s).includes("overflow-x")); });
test("failed font", () => { const s = base(); s.failedFonts = ["Fraunces Variable"]; assert.ok(ids(s).includes("font-load-failed")); });
test("two signal hues", () => { const s = base(); s.colors.push({ css: "rgb(30,144,255)", role: "bg", area: 5000, interactive: true }); assert.ok(ids(s).includes("many-signals")); });
test("identical cards", () => { const s = base(); s.cardGroups.push({ count: 3, identical: true }); assert.ok(ids(s).includes("identical-cards")); });
test("title case headline", () => { const s = base(); s.texts[0] = { ...s.texts[0], text: "Track Your Shared Expenses", fontSize: 28 }; assert.ok(ids(s).includes("title-case")); });

const paywall = () => {
  const s = base(); s.kind = "paywall";
  for (const k of ["price", "terms", "privacy", "restore", "close"]) s.paywall[k] = [{ visible: true, fontSize: k === "price" ? 28 : 13 }];
  s.priceTexts = [{ fontSize: 28, paywallRole: "price" }, { fontSize: 15, paywallRole: null }];
  return s;
};
test("complete paywall passes", () => assert.deepEqual(ids(paywall()).filter((r) => r.startsWith("paywall")), []));
test("paywall without restore", () => { const s = paywall(); s.paywall.restore = []; assert.ok(ids(s).includes("paywall-missing")); });
test("per-week breakdown bigger than billed price", () => { const s = paywall(); s.priceTexts.push({ fontSize: 40, paywallRole: null }); assert.ok(ids(s).includes("paywall-price-not-prominent")); });
test("trial without after-trial price", () => { const s = paywall(); s.paywall.trial = [{ visible: true, fontSize: 15 }]; assert.ok(ids(s).includes("paywall-trial-terms")); });
```

Plus `color.test.mjs` (contrast of black/white = 21, `#777` on white ≈ 4.48, `hsl` of `#ff0000` = h 0 s 1 l .5, `gradientColors` extracts 2 stops from `linear-gradient(90deg, rgb(1, 2, 3) 0%, #fff 100%)`) and `copy.test.mjs` (`isTitleCase("Track Your Shared Expenses")` true, `isTitleCase("Bills, split before anyone asks.")` false; each of `seamless`, `Unlock your`, `elevate`, `supercharge`, `in today's fast-paced` flagged; `Every seed in the packet.` clean).

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement the three modules exactly per the tables above. `BANNED` list: unlock (your|the), seamless(ly)?, effortless(ly)?, elevate, supercharge, empower, your journey, take control, all-in-one, revolutioni[sz]e, game[- ]changer, dive (in|into), in today's fast-paced, next-level, unleash, harness the power, at your fingertips, look no further, whether you're, designed to help you, we've got you covered, say goodbye to, hassle-free.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: scanner rules`.

### Task 5: Snapshot collector and scan CLI

**Files:**
- Create: `scripts/lib/snapshot.mjs`, `scripts/scan.mjs`
- Create fixtures: `scripts/test/fixtures/design/screens/ios/02-sloppy.html`, `03-paywall.html`, `04-badfont.html`
- Test: `scripts/test/scan.test.mjs`

**Interfaces:**
- Consumes: `evaluate`, `openScreen`, `expandInputs`.
- Produces: `collect(): Snapshot-without-screen/platform` (a function passed to `page.evaluate`), `scanFile(browser, file): Promise<Finding[]>`; CLI `scan.mjs <files|dirs…> [--json]` prints a grouped human report (or JSON array with `--json`), exit 1 on any error.

Collector details: visible = non-zero rect, `visibility != hidden`, `opacity > 0`, inside viewport. Texts = elements with a direct non-whitespace text node; `bg` = first ancestor (inclusive) with non-transparent `background-color`, or `null` if a `background-image` is met first. `targets` = `a, button, [role=button], input, select, [data-tap]`. `colors` = background-color, color, and svg `fill` of elements outside `svg` plus interactive ones; `area` = rect area. `gradients` = every computed `background-image` containing `gradient`. `media` = `svg` (top-level only) and `img` boxes. `cardGroups` = for each parent with ≥ 3 element children that have a non-transparent background or border radius > 0: identical when width, height, childElementCount and tag all match (±1px). `failedFonts` = `[...document.fonts].filter(f => f.status === "error").map(f => f.family)` after `document.fonts.ready` and after calling `document.fonts.load` for each declared face referenced by a computed font-family (forces loading). `paywall[k]` from `[data-paywall=k]`. `priceTexts` from texts matching the price regex, with `paywallRole` = closest `[data-paywall]` value.

- [ ] **Step 1: Failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { SKILL_DIR } from "../lib/paths.mjs";
import { fixtureProject } from "./helpers.mjs";

const scan = (cwd, file) => {
  const r = spawnSync(process.execPath, [join(SKILL_DIR, "scripts/scan.mjs"), file, "--json"], { cwd, encoding: "utf8" });
  return { status: r.status, findings: JSON.parse(r.stdout || "[]"), stderr: r.stderr };
};

test("clean screen passes", () => {
  const r = scan(fixtureProject(), "design/screens/ios/01-clean.html");
  assert.equal(r.status, 0, JSON.stringify(r.findings));
  assert.deepEqual(r.findings.filter((f) => f.level === "error"), []);
});

test("sloppy screen produces the expected errors", () => {
  const r = scan(fixtureProject(), "design/screens/ios/02-sloppy.html");
  assert.equal(r.status, 1);
  const rules = new Set(r.findings.map((f) => f.rule));
  for (const id of ["tailwind-default-color", "purple-blue-gradient", "emoji-icon", "banned-phrase", "generic-display-font", "touch-target", "placeholder-content", "identical-cards"])
    assert.ok(rules.has(id), `expected ${id}; got ${[...rules]}`);
});

test("paywall fixture passes paywall rules", () => {
  const r = scan(fixtureProject(), "design/screens/ios/03-paywall.html");
  assert.deepEqual(r.findings.filter((f) => f.rule.startsWith("paywall")), []);
});

test("missing font file is an error", () => {
  const r = scan(fixtureProject(), "design/screens/ios/04-badfont.html");
  assert.ok(r.findings.some((f) => f.rule === "font-load-failed"));
});
```

Fixture `02-sloppy.html`: Inter 40px headline "Unlock Your Financial Potential", `background: linear-gradient(135deg,#8b5cf6,#3b82f6)` hero, `#6366f1` button 36px tall, three identical white cards each "🔥 John Doe", body text "Seamlessly track expenses". `03-paywall.html`: close button (44×44), `data-paywall="price"` "€29.99 a year" 28px, "€0.58 a week" 15px, trial "Free for 7 days" with `data-paywall="trial"` and `data-paywall="after-trial"` "then €29.99/year", restore/terms/privacy links each 44px tall. `04-badfont.html`: `@font-face { font-family: Ghost; src: url(./nope.woff2) }` applied to an h1.

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement collector + CLI. Human report format:

```
design/screens/ios/02-sloppy.html
  ✗ tailwind-default-color  #6366f1 on <button>
  ! identical-cards         3 identical siblings in <section>
2 screens · 9 errors · 3 warnings
```

- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: scan CLI`.

### Task 6: Motion capture

**Files:**
- Create: `scripts/capture.mjs`, `scripts/lib/capture.mjs`, fixture `scripts/test/fixtures/design/motion/pulse.html`
- Test: `scripts/test/capture.test.mjs`

**Interfaces — Produces:** `capture.mjs <scene.html> [--out file.mp4]` → default out `design/motion/out/<name>.mp4`; `seek(page, ms)` pauses and seeks every animation in every frame; `probe(mp4): { width, height, seconds }` (parses `ffmpeg -i` stderr) exported for tests.

Scene contract: `window.SCENE = { duration: ms, fps: 30, width: 1080, height: 1920, scale: 2 }` (viewport = width/scale × height/scale). Animations must be CSS animations or WAAPI created at load. `width`/`height` must be even (capture fails with exit 2 otherwise).

- [ ] **Step 1: Failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { SKILL_DIR } from "../lib/paths.mjs";
import { probe } from "../lib/capture.mjs";
import { fixtureProject } from "./helpers.mjs";

test("captures an infinite-animation scene to an mp4 of the declared length and size", { timeout: 60_000 }, () => {
  const cwd = fixtureProject();
  const r = spawnSync(process.execPath, [join(SKILL_DIR, "scripts/capture.mjs"), "design/motion/pulse.html"], { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const p = probe(join(cwd, "design/motion/out/pulse.mp4"));
  assert.deepEqual([p.width, p.height], [320, 240]);
  assert.ok(Math.abs(p.seconds - 1) < 0.1, String(p.seconds));
});
```

Fixture `pulse.html`: `SCENE = { duration: 1000, fps: 12, width: 320, height: 240, scale: 1 }`, a circle with `animation: pulse 400ms ease-in-out infinite alternate`.

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement: open with viewport from `SCENE`, `waitForFunction(() => window.SCENE)`, fonts ready; spawn `ffmpeg -y -f image2pipe -framerate fps -i - -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart out`; for each frame `seek` then `page.screenshot({ type: "png", animations: "allow" })` → write to stdin (await drain); close stdin; await exit code 0.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: deterministic motion capture`.

### Task 7: Store assets

**Files:**
- Create: `scripts/store.mjs`, `scripts/lib/store.mjs`, fixture `scripts/test/fixtures/design/store/{store.json,icon.svg,feature-graphic.html}`
- Test: `scripts/test/store.test.mjs`

**Interfaces — Produces:** `store.mjs` reads `design/store/store.json`:

```json
{
  "background": "#F3EEE4",
  "ink": "#1C1A17",
  "headlineFont": "'Fraunces Variable', serif",
  "ios": [{ "image": "renders/screens/ios/01-home.png", "headline": "Bills, split before anyone asks." }],
  "android": [{ "image": "renders/screens/android/01-home.png", "headline": "Bills, split before anyone asks." }],
  "icon": "store/icon.svg",
  "iconForeground": "store/icon-foreground.svg",
  "iconBackground": "store/icon-background.svg",
  "featureGraphic": "store/feature-graphic.html"
}
```

Writes `design/store/out/ios/screenshot-<n>.png` (1320×2868), `ios/icon-1024.png` (opaque RGB), `android/screenshot-<n>.png` (1080×1920), `android/icon-512.png`, `android/adaptive-{foreground,background}.png` (432×432, only if both SVGs exist), `android/feature-graphic.png` (1024×500). Missing optional keys are skipped with a note; a referenced file that doesn't exist exits 2. `shotHtml({ image, headline, bg, ink, font, fontsCss, platform }): string` composes headline (top ~24% of canvas, 2 lines max) over a device-framed screenshot bleeding off the bottom edge.

- [ ] **Step 1: Failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { PNG } from "pngjs";
import { SKILL_DIR } from "../lib/paths.mjs";
import { fixtureProject } from "./helpers.mjs";

const meta = (p) => { const buf = readFileSync(p); const png = PNG.sync.read(buf); return { w: png.width, h: png.height, colorType: buf[25] }; };

test("store assets at required sizes; iOS icon has no alpha", { timeout: 60_000 }, () => {
  const cwd = fixtureProject();
  spawnSync(process.execPath, [join(SKILL_DIR, "scripts/render.mjs"), "design/screens"], { cwd });
  const r = spawnSync(process.execPath, [join(SKILL_DIR, "scripts/store.mjs")], { cwd, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const out = (p) => join(cwd, "design/store/out", p);
  assert.deepEqual([meta(out("ios/screenshot-1.png")).w, meta(out("ios/screenshot-1.png")).h], [1320, 2868]);
  assert.deepEqual([meta(out("android/screenshot-1.png")).w, meta(out("android/screenshot-1.png")).h], [1080, 1920]);
  const icon = meta(out("ios/icon-1024.png"));
  assert.deepEqual([icon.w, icon.h, icon.colorType], [1024, 1024, 2]);
  assert.equal(meta(out("android/icon-512.png")).w, 512);
  assert.deepEqual([meta(out("android/feature-graphic.png")).w, meta(out("android/feature-graphic.png")).h], [1024, 500]);
});
```

- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement: screenshots render `shotHtml` at viewport 440×956 scale 3 (iOS) and 360×640 scale 3 (Android); icon renders the SVG in a page sized to the target at scale 1, then for iOS re-encode with `PNG.sync.write(png, { colorType: 2, inputHasAlpha: true, bgColor: bg })`; feature graphic renders the HTML at 1024×500 scale 1.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: store assets`.

### Task 8: Platform, copy, paywall, store and motion references

**Files:** Create `references/{ios,android,copy,paywalls,store-assets,motion}.md`.

Each file opens with a one-paragraph "when to read this" and is ≤ 250 lines. Required content:

- `ios.md`: frame and safe areas (402×874, top 54, bottom 34); status bar via `device.js`; navigation patterns (large title that collapses, tab bar 4–5 items 49pt + safe area, filled SF-style active icon, sheets with grabber, segmented controls); text: SF Pro sizes (Large Title 34, Title1 28, Title2 22, Headline 17 semibold, Body 17, Callout 16, Subhead 15, Footnote 13, Caption 12); 44pt targets; list rows 44–60pt with chevrons; how to draw SF-Symbol-like icons in SVG (1.5–2px rounded strokes, 24 grid); what *not* to copy from the web (hover states, tiny text links, hamburger menus).
- `android.md`: frame 412×915, status 36, gesture 24; Material 3: navigation bar 80dp with pill active indicator 64×32, top app bar (small/medium/large), FAB 56dp / extended FAB, cards, chips, bottom sheets, switches, M3 type scale (Display L 57 … Label S 11), 48dp targets, ripple not needed in stills; Roboto Flex for text, brand display font kept; a translation table iOS → Android (tab bar → navigation bar; large title → large top app bar; chevron rows → plain rows; action sheet → bottom sheet; segmented control → segmented buttons; swipe-back → system back) and a "keep" list (concept, world colour, signal colour, illustration, hero, copy).
- `copy.md`: voice rules (say the specific thing; numbers over adjectives; sentence case; one idea per line; headlines may carry one turn of phrase; buttons are verbs naming the outcome, 1–3 words; empty states say what to do next; no "Oops"); the banned list from Task 4; ten before → after rewrites (e.g. "Unlock your financial potential" → "Rent's covered. €212 left for the month.").
- `paywalls.md`: Apple 3.1.2 checklist (billed amount most prominent; period; what's included; trial length and what's charged after; restore purchases; Terms (EULA) and Privacy links; easy close) and Google Play subscription policy checklist (price, period, trial terms, how to cancel, no hidden dismiss); the `data-paywall` attribute contract; onboarding rules (≤ 3 value screens before the ask, show the product not slogans, permission priming before system prompts, one CTA per screen); three paywall layouts that convert without dark patterns (timeline trial, plan comparison with annual pre-selected and honest per-month, single-plan story) with when to use each.
- `store-assets.md`: all sizes from Global Constraints; App Store: first three screenshots carry the pitch, headlines ≤ 6 words, show real UI not mockups of mockups; icon rules (no text, one silhouette readable at 60px, no rounded corners/alpha in the file); Play: feature graphic shows brand + one product moment, no device-frame clutter, adaptive icon safe zone 66dp circle in 108dp; the `store.json` schema.
- `motion.md`: tokens (`--ease-out: cubic-bezier(.2,.8,.2,1)`, `--ease-spring: linear(...)` approximation, durations 120/240/400/700ms); what to animate (hero numerals counting, progress filling, illustration idle loops ≤ 2px or ≤ 3°, list items staggering 40ms, screen push 350ms); scene contract from Task 6 with a full example scene embedding two screens via iframes and moving between them; three standard scenes the skill should make (hero interaction, onboarding → paywall flow, one delight moment); sizes 1080×1920 (Reels/TikTok/Stories) and 1080×1350 (feed).

- [ ] **Step 1:** Write the six files.
- [ ] **Step 2:** Verify every rule id mentioned exists in `rules.mjs`: `grep -o '\`[a-z-]*\`' references/*.md` cross-checked against the rules table.
- [ ] **Step 3:** Commit `docs: platform, copy, paywall, store, motion references`.

### Task 9: Taste reference and critic

**Files:** Create `references/taste.md`, `agents/critic.md`.

`taste.md` (the core; ≤ 400 lines) sections:
1. **The bar** — the seven patterns from the spec, each with *do* and *fails when* (concrete, e.g. *fails when* "the accent appears on more than the primary action, active tab and one datum").
2. **Concept anchors** — how to find one (a real object, place or ritual connected to the app's job; it must suggest a palette, an illustration subject and a motion), 12 worked examples across genres, and anti-examples ("modern and clean", "friendly", "premium").
3. **Colour worlds** — recipe: world tint (L 92–97%, low chroma) + ink (near-black warmed or cooled toward the world) + ink-2/ink-3 + surface + one signal (high chroma, never used for body text on light backgrounds); six example worlds with hex values; dark worlds allowed when the concept is nocturnal.
4. **Type pairings** — the shortlist with character notes and eight tested pairings; numerals rule (tabular for data, display for heroes, units at 30–40% of numeral size); size scale ratios; letter-spacing for large sizes (−0.02 to −0.04em).
5. **Layout archetypes** — editorial, bento, illustrated world, data-forward: what each looks like, when it fits, its typical hero.
6. **Illustration** — four styles with SVG construction rules (thick-outline flat: 3–4px strokes in ink, flat fills from the world palette, no gradients; glossy spheres: radial-gradient highlight at 30% 30%, soft shadow; line art: single 2px stroke, one fill accent; cut paper: layered shapes with small offset shadows) and the mascot method (build from 4–6 primitives, define 3 poses, reuse across screens via `<symbol>`). Illustrations bleed out of cards and overlap text blocks deliberately.
7. **Composition** — one hero per screen; 4pt grid; radius scale (8/14/20/28 + full); density contrast (one dense region, one quiet region); asymmetry; what "identical cards" means and alternatives (lead card + list, bento with one wide tile).
8. **Anti-slop list** — everything the scanner checks, plus what it can't: generic emoji rows, icon-in-a-circle feature grids, centred-everything onboarding with stock blobs, gradients as decoration, "glassmorphism" by default, dashboards of four equal stat cards, avatars from initials only, every corner the same radius as every button.

`critic.md` (prompt for a fresh general-purpose subagent):
- Role: senior design director at a studio known for memorable consumer apps; default verdict is fail; "good for AI" is not the bar.
- Inputs it will be given (brief, concept, list of PNG paths, platform, batch name, previous round's single requested change if any) and that it must open every PNG with Read and the contact sheet first.
- Rubric (eight criteria, from the spec) with anchors for 4 / 6 / 8 / 10 per criterion.
- Pass rule verbatim from Global Constraints; the "tidy but forgettable" test: "If you would describe it with words like clean, modern, minimal, polished and nothing more specific, it is tidy but forgettable."
- Required output, exact Markdown format:

```
## Scores
concept: n · memorability: n · hero: n · colour: n · type: n · illustration: n · copy: n · craft: n
mean: n.n · verdict: PASS|FAIL
## A stranger would say
<one sentence>
## Weakest screen
<file> — <why, one sentence>
## The one change
<a single concrete instruction a designer can execute, naming screen(s), element and target state>
## Also (max 3)
- …
## Did last round's change land?
yes|partly|no — <one sentence>   (omit on round 1)
```

- [ ] **Step 1:** Write `taste.md` and `critic.md`.
- [ ] **Step 2:** Calibrate the critic: dispatch it (general-purpose subagent, prompt = critic.md + inputs) on the reference-style fixture render and on the sloppy fixture render; it must FAIL the sloppy one with memorability ≤ 4 and must not pass the bare `01-clean` fixture (tidy but has no world). Adjust anchors if it is lenient.
- [ ] **Step 3:** Commit `docs: taste reference and critic`.

### Task 10: SKILL.md and installation

**Files:** Create `SKILL.md`, `templates/screen.html`, `templates/scene.html` (if not done in Task 2), `README.md`.

`SKILL.md` frontmatter:

```yaml
---
name: app-designer-pro
description: Use when designing or redesigning a mobile app's screens (iPhone and Android), or producing its launch material — onboarding, paywall, motion videos, App Store / Google Play screenshots and icons — and the result must look studio-made rather than AI-generated.
---
```

Body (≤ 300 lines): overview (one paragraph + the bar in five bullets); the phase table with each phase's inputs, commands, outputs and gate; exact commands (`node "$SKILL/scripts/doctor.mjs"` etc. where `$SKILL` is the skill's base directory shown when the skill loads); the three-directions procedure; the quality loop with the critic dispatch template (Agent tool, `subagent_type: general-purpose`, prompt = contents of `agents/critic.md` + inputs) and the rule "never show the critic your reasoning or prior scores"; when to read which reference; what to show the user and how (`open <png>` on macOS; never ask the user to judge before the scanner and critic have run); resume rules (inspect `design/` to find the last completed phase); red flags table (e.g. "the critic passed round 1" → be suspicious, check it opened the images; "I'll skip Android, it's the same" → no; "the scanner warning doesn't matter" → fix or justify in `design/critique`).

- [ ] **Step 1:** Write `SKILL.md`, `README.md` (what it is, install: `git clone` + `ln -s`, first run).
- [ ] **Step 2:** `ln -s ~/Career/app-designer-pro ~/.claude/skills/app-designer-pro`; verify discovery: `claude -p "list your available skills" | grep app-designer-pro` (or check the skill list in a new session).
- [ ] **Step 3:** Commit `feat: SKILL.md and install`.

### Task 11: Evaluation against baseline

**Files:** Create `evals/briefs/a-split.md`, `evals/briefs/b-margin.md`, `evals/README.md`; runs go to `evals/runs/<date>/<brief>/{baseline,skill}/` (gitignored); summary committed to `evals/results.md`.

Briefs (each ~15 lines: product, audience, core jobs, monetisation, tone hints but **no** visual direction):
- **A — Split**: four housemates sharing bills and chores; yearly plan €24.99 with a 7-day trial.
- **B — Margin**: a slow book club; friends read the same book and share one highlighted passage a day; monthly €3.99, 7-day trial.

- [ ] **Step 1: Baseline (RED).** For each brief dispatch a general-purpose subagent *without* the skill: "Design the main iOS screens (home, one detail, onboarding, paywall) of this app as HTML files at 402×874 in `<dir>`." Render with `render.mjs`, sheet with `sheet.mjs`, scan, and run the critic. Record scores and verbatim failure patterns.
- [ ] **Step 2: With skill (GREEN).** For each brief dispatch a subagent told to load and follow `~/.claude/skills/app-designer-pro/SKILL.md` in autonomous mode (it plays the user: picks the direction the critic scores highest; skips motion/store for brief B to save time; brief A runs every phase).
- [ ] **Step 3: Compare.** Side-by-side sheet per brief; scores table into `evals/results.md`; eyeball check: does the skill output look studio-made?
- [ ] **Step 4: REFACTOR.** For each failure pattern seen in skill output, tighten `taste.md`, `critic.md` or `SKILL.md` and re-run that brief. Stop when both briefs pass the critic and beat the baseline mean by ≥ 2 points.
- [ ] **Step 5:** Commit `test: baseline vs skill evaluation`.
