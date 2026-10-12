# Crit — design (drafted under the working title "App Designer Pro")

A Claude Code skill that designs mobile apps (iPhone and Android) to the standard of a good studio, then produces everything needed to launch them: motion videos, human copy, onboarding and paywalls, and store assets. Built for personal use, modelled on the public description of Tobia Donadon's "App Designer Pro" (none of his files are used).

## Goal and the bar

The skill exists to beat a plain Claude session on one thing: **the designs are memorable, not merely clean.** Its author's own diagnosis: "clean doesn't necessarily mean good… a design that looks tidy but has no personality won't get a good score." Every structural choice below serves that.

The bar is the reference set of eight screens studied on 2026-10-13. What it does, which the skill must reproduce:

1. **A world per app, not a theme.** Each app starts from a concrete anchor (a garden with a mole, glossy savings spheres, an illustrated sea) that sets palette, illustration and motion.
2. **One loud signal colour**, used only on the primary action, active tab and single highlighted datum. Everything else sits on a tinted world background (lavender, mint, peach, sky), not white or grey.
3. **One hero per screen at extreme scale** (a wordmark, `€49 /mo`, `1h 15min`); big numerals with small units.
4. **Two type voices**: a heavy display sans for marks and numbers, an editorial serif for sentences.
5. **Owned illustration**: a recurring mascot, thick-outline flat drawings, CSS spheres, line art. All reproducible as hand-written SVG and CSS.
6. **Human copy**: sentence headlines with a turn of phrase and a full stop; specific details ("18 months left", "Arriving by 3pm"); realistic data.
7. **Platform craft**: correct status bar, safe areas, tab bars, radii and spacing rhythm.

Its weaknesses the skill must be stricter about: generic emoji rows, an awkward headline, template-looking lists.

## Non-goals

iPad layouts; dark-mode variants of every screen; Figma export; image-generation APIs (all illustration is SVG/CSS); writing the app's production code. The output is a design, not an implementation.

## Decisions

| Topic | Decision | Why |
|---|---|---|
| Shape | One skill folder (approach A): `SKILL.md`, `references/`, `scripts/`, `agents/critic.md` | One guided conversation, like the original; no global hooks |
| Location | Repo `~/Career/crit`, symlinked to `~/.claude/skills/crit` | Versioned, tweakable, outside the portfolio repo |
| Design medium | HTML/CSS screens at device size + handoff spec | Fast taste loop; same files feed renders, video and store assets |
| Browser | Playwright's bundled Chromium | No Google Chrome on this machine |
| Video encoding | `ffmpeg-static` npm package | No system ffmpeg; no Homebrew dependency |
| Fonts | iOS body: system SF Pro via `system-ui, BlinkMacSystemFont` (Mac only; verified 2026-10-13 — Chromium ignores `-apple-system` and cannot reach New York or SF Rounded). Display and Android fonts: `@fontsource` packages, copied into the design folder | Offline, deterministic, licence-clean |
| Script tests | `node:test` | No extra dependency |
| Output folder | `design/` in the user's current project | Travels with the app |

## User flow

The user opens Claude Code in any folder and says something like "design my app". The skill then runs nine phases, pausing for the user only where marked ★.

0. **Doctor.** `node scripts/doctor.mjs` installs the skill's own dependencies on first run and checks that Chromium launches and `system-ui` resolves to SF Pro.
1. **Intake ★.** New app or existing? For an existing app, read its code and extract the real screens, data shapes and copy. Ask at most three questions (what it does, for whom, how it makes money). Write `design/brief.md`.
2. **Three directions ★.** Draft three directions that differ on **all four** axes: concept anchor, type pairing, layout archetype (editorial / bento / illustrated world / data-forward), colour world. Build each one's main screen, render, scan, and compose a contact sheet. The user picks one, or asks for a mix.
3. **System.** From the chosen direction, write `tokens.css` (colours, type scale, radii, spacing), copy the fonts, and build the illustration kit (mascot or motifs as reusable SVG symbols). Write `design/concept.md`.
4. **iOS screens.** Plan the screen list from the brief (typically 5–8, always including onboarding and, if monetised, a paywall). Build, render, scan, and critique in a loop (see below).
5. **Android screens.** Re-design each screen natively with Material 3 conventions while keeping the world: navigation bar with pill indicator instead of a tab bar, top app bar, FAB where it fits, Roboto Flex body, 48dp targets, gesture handle, no iOS chevrons. Same loop.
6. **Copy pass.** A dedicated rewrite of all visible text against `references/copy.md`, then rescan.
7. **Motion.** Two or three motion scenes (the hero interaction, onboarding flow, one delight moment), captured as MP4s.
8. **Store assets.** Icon, store screenshots and feature graphic for both stores.
9. **Handoff.** `design/handoff.md` (tokens, components, per-screen specs, motion specs with durations and easings, asset list) and `design/index.html`, a gallery of everything.

At the end the skill presents the contact sheets, videos and gallery path, plus the critic's last remaining complaints.

## The quality loop

For every batch of screens:

1. **Render** each screen to PNG at device resolution.
2. **Scan** (`scan.mjs`), deterministic. Any error-level finding fails the screen before the critic sees it.
3. **Critique.** A fresh subagent receives only `agents/critic.md`, the brief, the concept and the PNG paths. It never sees the designer's reasoning or earlier scores.
4. **Fix** the critic's single highest-impact change, then go back to step 1.

The loop stops when the critic passes the batch, or after four rounds; the skill then keeps the best-scoring round and records the open complaints. Each round is saved to `design/critique/<batch>-round-<n>.md`.

## The critic

Scores 1–10 on eight criteria:

| Criterion | Question |
|---|---|
| Concept | Is the world visible on every screen, not just the first? |
| Memorability | Could you describe this app in one sentence that fits no other app? Would it stop a thumb in an App Store feed? |
| Hero | Does each screen have exactly one focal element with at least 3× scale contrast? |
| Colour | World tint + quiet neutrals + one signal used sparingly? |
| Type | Two distinct voices, real size contrast, numerals treated as display? |
| Illustration | Owned, consistent, integrated (bleeding out of cards), not stock icons in hero spots? |
| Copy | Would a person say this? Specific, short, no filler? |
| Craft & platform | Spacing rhythm, alignment, radii, platform conventions, legibility |

**Pass rule:** concept, memorability and hero each ≥ 8 **and** mean ≥ 8. A batch the critic judges "tidy but forgettable" is capped at 6 regardless of craft. Craft cannot buy back personality.

The critic must return: the scorecard, a one-sentence description of the app as a stranger would see it, the weakest screen, and **one** highest-impact change (plus at most three secondary notes). It is told that its default should be failure, and that the reference bar is studio work, not "good for AI".

## The scanner (`scan.mjs`)

Loads each screen in Chromium and inspects the rendered DOM, computed styles and text. Output is JSON findings `{screen, rule, level, detail}`.

Design tells (error): Inter, Roboto or Arial in display roles on iOS; Tailwind default indigo/violet (`#6366f1`, `#8b5cf6`, `#4f46e5`, `#7c3aed`) as a colour; purple-to-blue gradients; emoji glyphs used as icons; lorem ipsum or placeholder names (John Doe, Jane Smith, Acme); horizontal overflow; text contrast below WCAG AA; interactive elements below 44×44pt (iOS) or 48×48dp (Android).

Design tells (warning): more than one saturated signal hue in use; no element with font size at least 3× the body size; three or more sibling cards with identical size and structure; every text block centred.

Copy tells (error): a banned-phrase list (e.g. "unlock your potential", "seamless", "effortlessly", "elevate", "supercharge", "empower", "your journey", "take control", "all-in-one", "revolutionize", "game-changer", "dive in", "in today's fast-paced"). Copy tells (warning): more than one exclamation mark per screen; Title Case headlines; sentences over 14 words (copy.md).

Paywall rules (error, only on screens marked `data-screen-kind="paywall"`): elements marked `data-paywall="price"`, `"terms"`, `"privacy"`, `"restore"` and `"close"` must exist and be visible; the billed price (`data-paywall="price"`) must be the largest price-like text on screen (Apple 3.1.2(c)); if `data-paywall="trial"` exists, the post-trial price must also be visible.

## Platform references

- `references/ios.md`: frame 402×874pt (iPhone 16 Pro), status bar 54pt with Dynamic Island, home indicator, large titles, tab bar, sheets, SF Pro text, 44pt targets.
- `references/android.md`: frame 412×915dp (Pixel), status bar 24dp, gesture handle, Material 3 navigation bar, top app bar, FAB, Roboto Flex, 48dp targets, what changes and what must not change when translating from iOS.
- `references/paywalls.md`: Apple 3.1.2 and Google Play subscription policy as a checklist; onboarding patterns (value first, three screens max, permission priming); paywall layouts that convert without dark patterns.
- `references/store-assets.md`: App Store screenshots 1320×2868 (6.9"), icon 1024×1024 without alpha or rounded corners; Google Play screenshots 1080×1920, icon 512×512, adaptive icon layers 432×432 with a 66dp-diameter safe zone, feature graphic 1024×500.
- `references/taste.md`: the seven bar patterns above as rules with "do" and "fails when" examples, the font shortlist and pairings, layout archetypes, colour-world recipes, illustration styles with SVG construction rules, spacing (4pt grid) and radius scales.
- `references/copy.md`: voice rules, banned phrases, rewrite examples.
- `references/motion.md`: easing and duration tokens, what to animate (hero numbers counting, illustration idle loops, screen transitions), how to author scenes for capture.

## Screen file contract

Every screen is one HTML file under `design/screens/<platform>/<nn>-<name>.html` that:

- links `../../tokens.css` and `../../device.css` (status bar, safe areas, home indicator / gesture handle, provided by the skill and copied into `design/`);
- sets `<body data-platform="ios|android" data-screen-kind="main|onboarding|paywall|list|detail|other">`;
- uses inline SVG or `<use href="../../illustrations.svg#…">` for illustration;
- contains real, specific content.

## Scripts

All in `scripts/`, Node ESM, no build step. Each takes paths relative to the current directory.

| Script | Does |
|---|---|
| `doctor.mjs` | Installs dependencies if missing, checks Chromium and SF Pro |
| `init.mjs` | Creates `design/` with `device.css`, `tokens.css` starter, `fonts/` |
| `fonts.mjs <family…>` | Copies chosen `@fontsource` families into `design/fonts/` and writes `fonts.css` |
| `render.mjs <glob>` | Screens → PNG at 3× into `design/renders/<platform>/` |
| `scan.mjs <glob>` | Findings JSON to stdout; exit 1 on any error |
| `sheet.mjs <pngs…> --out <file>` | Device-framed contact sheet on a soft background (like the reference image) |
| `capture.mjs <scene.html>` | Frame-stepped video capture → MP4 |
| `store.mjs` | Composes store screenshots, feature graphic and icons from `design/store/store.json` |

**Motion capture** is deterministic: a scene page defines `window.SCENE = { duration, fps, size }` and animates only with CSS animations or the Web Animations API (scenes may embed screens via iframes). `capture.mjs` pauses every animation in every frame, sets `currentTime` for each frame, screenshots it, and pipes the frames to ffmpeg (H.264, yuv420p, 30fps). No dropped frames, and the output is identical across runs.

## Folder layout

```
crit/
  SKILL.md
  agents/critic.md
  references/{taste,ios,android,copy,paywalls,store-assets,motion}.md
  templates/{device.css,tokens.css,screen.html,scene.html,store.json}
  scripts/{doctor,init,fonts,render,scan,sheet,capture,store}.mjs
  scripts/lib/*.mjs, scripts/test/*.test.mjs
  evals/briefs/{a-housemates.md,b-bookclub.md}
  package.json
  docs/specs, docs/plans
```

## Evaluation

Script behaviour is covered by `node:test` against fixture screens (a clean screen must pass; a deliberately sloppy one must produce the expected findings; capture must emit an MP4 of the right duration and size).

Skill behaviour is tested the way skills should be: a **baseline** run of each brief by a subagent without the skill ("design the main screens of this app as HTML"), then a run with the skill, both rendered and placed side by side. The skill passes when its output wins on the critic's rubric by a clear margin and, judged by eye, does not look AI-made.

- **Brief A — "Split" for housemates:** shared bills and chores for a flat of four. Fintech-adjacent utility, the genre where AI output is most generic. Monetised by a yearly plan.
- **Brief B — "Margin," a slow book club:** friends read the same book and share one highlighted passage a day. Social and expressive. Monetised by a monthly plan with a 7-day trial.

## Risks

- **SF Pro resolves only on a Mac.** Chromium maps `system-ui` to `.SF NS` there (verified). The doctor checks it and, elsewhere, warns that iOS body text will fall back to Inter. Serifs always come from `@fontsource`.
- **Taste does not transfer from rules alone.** Mitigation: the rules come with worked do/fail examples, and the three-direction step plus the strict critic force divergence and iteration rather than trusting a first draft.
- **Long runs.** A full run (both platforms, motion, store) is long. The skill reports progress per phase, and each phase's outputs are files, so a run can resume from where it stopped.
