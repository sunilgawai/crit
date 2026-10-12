---
name: app-designer-pro
description: Use when designing or redesigning a mobile app's screens (iPhone and Android), or producing its launch material (onboarding, paywall, motion videos, App Store and Google Play screenshots and icons), and the result must look studio-made rather than AI-generated.
---

# App Designer Pro

Designs an app the way a good studio would, then makes everything that sells it. The output is HTML screens at device size (the design source of truth), PNG renders, MP4 motion, store assets and a handoff spec, all in `design/` under the current project.

**The point of this skill is taste, not tidiness.** Clean is the floor. A design passes only when a stranger could describe the app in one sentence that fits no other app. Two things enforce that, and neither may be skipped:
- the **scanner** (`scan.mjs`), deterministic checks for AI tells, copy, platform and paywall rules;
- the **critic** (`agents/critic.md`), a fresh subagent that defaults to FAIL and caps "tidy but forgettable" at 6.

`$SKILL` below means this skill's base directory (shown when the skill loads). Run scripts with `node "$SKILL/scripts/<name>.mjs"` from the **project root** (the folder that contains or will contain `design/`).

## The bar (read `references/taste.md` for the full version)

1. A **world** per app from a concrete anchor (a garden with a mole, glossy marbles, a harbour). Never an adjective.
2. One loud **signal** colour (primary action, active tab, one datum); everything else quiet on a tinted world ground.
3. One **hero** per screen at an extreme scale; big numerals with small units.
4. Two **type voices**: display (from the shortlist) + platform text (SF Pro / Roboto Flex).
5. **Owned illustration**, hand-drawn in SVG/CSS, consistent, bleeding out of cards.
6. **Human copy**: specific, sentence case, one turn of phrase at most.
7. **Platform craft**: native on each platform; Android is redesigned, not ported.

## Phases

| # | Phase | Read first | Output | Gate |
|---|---|---|---|---|
| 0 | Doctor + init | — | `design/` | doctor all ✓ |
| 1 | Intake | — | `design/brief.md` | ★ user answers ≤ 3 questions |
| 2 | Three directions | `taste.md` | `design/directions/` + sheet | ★ user picks |
| 3 | System | `taste.md` | `tokens.css`, fonts, `illustrations.svg`, `concept.md` | — |
| 4 | iOS screens | `ios.md`, `copy.md`, `paywalls.md` | `design/screens/ios/` | quality loop passes |
| 5 | Android screens | `android.md` | `design/screens/android/` | quality loop passes |
| 6 | Copy pass | `copy.md` | edited screens | scan clean |
| 7 | Motion | `motion.md` | `design/motion/out/*.mp4` | stills reviewed |
| 8 | Store assets | `store-assets.md` | `design/store/out/` | sizes ✓, icon reads at 60px |
| 9 | Handoff | — | `design/handoff.md`, `design/index.html` | — |

★ = pause for the user. Everywhere else, keep going and report progress in one line per phase. If the user says to decide everything ("you choose", "autonomous"), take the critic's pick at ★ and say what you chose.

**Resuming:** look at `design/` before starting. `brief.md` means Phase 1 is done. `concept.md` means 2–3 are done. A `design/critique/<batch>-round-<n>.md` with `verdict: PASS` means that batch is done. Continue from the first unfinished phase. Never redo a finished one unless asked.

### 0. Doctor + init

```bash
node "$SKILL/scripts/doctor.mjs"   # first run installs dependencies and Chromium
node "$SKILL/scripts/init.mjs"     # creates design/ (never overwrites)
```

### 1. Intake ★

- **Existing app?** Look for `package.json`, `ios/`, `android/`, `*.swift`, `*.kt`, `app/`, `src/screens`. If found, read the screens, navigation, data models and real copy. The redesign keeps the app's real content and jobs and changes how it looks and reads.
- Ask at most three questions (AskUserQuestion), only for what you can't infer: what it does and for whom, the 3 core jobs, and how it makes money (free / subscription with price and trial / one-off).
- Write `design/brief.md`: product, audience, core jobs, screens needed, money, constraints (an existing logo or name to keep), and any tone words the user gave. **No visual direction**: that's Phase 2's job.

### 2. Three directions ★

1. Read `references/taste.md` in full.
2. Privately list ~8 anchor candidates (§2 of taste.md). Discard clichés. Keep three that differ on **all four axes**: anchor, type pairing, layout archetype (editorial / bento / illustrated world / data-forward) and colour world. Changing only the colours doesn't count.
3. Write `design/directions/directions.md`, with one section per direction: anchor; palette (hex for world, world-2, surface, ink, ink-2, signal, illustration); fonts; archetype; illustration style; motion idea; the one sentence a stranger would say.
4. Install every font they need: `node "$SKILL/scripts/fonts.mjs" fraunces bricolage-grotesque …`.
5. Build each direction's **main screen**, fully realised (real copy, real illustration, tab bar), at `design/directions/<a|b|c>/main.html` (iOS). Each file carries its own tokens in a `<style>` block and links `../../fonts/fonts.css`, `../../device.css` and `../../device.js`.
6. Run the steps below, then dispatch the critic with batch `directions` (for its `Concept` input, pass `directions.md`: there's no `concept.md` yet):
   ```bash
   node "$SKILL/scripts/render.mjs" design/directions
   node "$SKILL/scripts/scan.mjs" design/directions          # fix every ✗ before going on
   node "$SKILL/scripts/sheet.mjs" design/renders/directions/a/main.png design/renders/directions/b/main.png design/renders/directions/c/main.png --labels "A · <anchor>,B · <anchor>,C · <anchor>" --out design/renders/directions-sheet.png
   ```
7. Show the user: `open design/renders/directions-sheet.png`, plus three lines (one per direction: the anchor and the stranger sentence) and the critic's "most potential" pick. Ask them to choose A, B or C, or describe a mix.

### 3. System

From the chosen direction:
- **`design/tokens.css`**: replace every starter value. Keep the variable names; add more if needed.
- **`design/illustrations.svg`**: the kit, as `<symbol>`s: mascot poses or concept motifs, and drawn icons (tab bar and categories) in the illustration's stroke style. Follow §6 of taste.md.
- **`design/concept.md`**:
  - the anchor and the world in two sentences,
  - where the signal is allowed,
  - the hero for each planned screen,
  - illustration rules,
  - the radius scale,
  - five sample lines of copy in the voice,
  - **the screen list**.

  The usual list is 6–8 screens: 2 onboarding, home, the core detail, one secondary (activity / stats / list), one create or add sheet, a paywall if monetised, and one success or empty-state moment. Number them: `01-welcome`, `02-…`.
- Shared CSS for components used on 2+ screens goes in `design/components.css`.

### 4. iOS screens

Read `ios.md`, `copy.md` and (if monetised) `paywalls.md`. Build every screen in the list from `$SKILL/templates/screen.html` (correct `data-platform`, `data-screen-kind`, `data-status` and `data-paywall` attributes). Then run the **quality loop** with batch `ios-core`.

### 5. Android screens

Read `android.md`. Re-design each iOS screen natively in `design/screens/android/` (same numbering). Install `roboto-flex`. Quality loop with batch `android-core`, and in every round also make a pair sheet and pass it as the critic's `Pair sheet` input:
```bash
node "$SKILL/scripts/sheet.mjs" design/renders/screens/ios/03-*.png design/renders/screens/android/03-*.png design/renders/screens/ios/05-*.png design/renders/screens/android/05-*.png --out design/renders/pair-sheet.png
```
(Use the three most important screens; any numbers.)

### 6. Copy pass

Run `node "$SKILL/scripts/scan.mjs" design/screens --copy` to list every screen's visible text. Follow "Phase 6" in `copy.md` across both platforms, and log each changed line (before → after, which screens) in `design/critique/copy-pass.md`. Re-render and rescan everything; the scan must be clean (no ✗).

### 7. Motion

Read `motion.md`. Make the three standard scenes in `design/motion/` and capture each:
```bash
node "$SKILL/scripts/capture.mjs" design/motion/hero.html --stills 4
```
Then **look at the stills** (Read the PNGs in `design/motion/out/<scene>-stills/`). Check the first frame is composed, the middle shows the motion's peak and the last frame is settled. Fix and recapture if not.

### 8. Store assets

Read `store-assets.md`. Draw `design/store/icon.svg` (and adaptive layers), write the headlines and `store.json`, design `feature-graphic.html`, then:
```bash
node "$SKILL/scripts/store.mjs"
```
Read the first iOS screenshot and the icon to check them. Make sure the icon reads when scaled to 60px.

### 9. Handoff

- Write `design/handoff.md`:
  - tokens (copy `tokens.css`, explained),
  - the type scale,
  - components with states,
  - per-screen notes (the hero, behaviour, empty and error states),
  - motion specs (durations, easings, what moves),
  - the asset list,
  - open critic complaints.
- Then `node "$SKILL/scripts/gallery.mjs"` writes `design/index.html`, a gallery of every render, sheet, video and store asset. Finish with `open design/index.html` and a five-line summary to the user.

## The quality loop

For a batch of screens:

```bash
node "$SKILL/scripts/render.mjs" design/screens/ios
node "$SKILL/scripts/scan.mjs" design/screens/ios
node "$SKILL/scripts/sheet.mjs" design/renders/screens/ios/*.png --out design/renders/ios-core-sheet.png
```

1. **Scan.** Fix every ✗ (error). For each ! (warning), fix it or write one line in the critique file saying why it's intended. Rescan until there are no errors.
2. **Critique.** Dispatch a fresh subagent (Agent tool, `subagent_type: general-purpose`) with this prompt, filled in:
   ```
   Read the file $SKILL/agents/critic.md. Those are your instructions: follow them exactly and reply only with the Markdown output it specifies.
   Inputs:
   - Brief: <contents of design/brief.md>
   - Concept: <contents of design/concept.md, first section only>
   - Platform: <ios|android> · Batch: <batch> · Round <n>
   - Contact sheet: <absolute path>
   - Screens: <absolute paths of every PNG in the batch>
   - Changes applied in earlier rounds (keep them unless they now fail): <numbered list of every "one change" applied so far, or "none">
   - Pair sheet: <absolute path, Android batches only>
   ```
   **Never** include your reasoning, your opinion of the screens or earlier scores. A new subagent every round.
3. **Record** the critic's reply verbatim in `design/critique/<batch>-round-<n>.md`.
   **Snapshot** the files exactly as the critic scored them, before touching anything: `mkdir -p design/critique/<batch>-round-<n>-files && cp -R design/screens/<platform>/. design/critique/<batch>-round-<n>-files/` (for `directions`, copy `design/directions`). This is what you restore the best round from.
   Check the reply's `## Screens opened` lists every screen in the batch. If it doesn't, dispatch a fresh critic on the **same** renders. That re-run doesn't count as a round.
4. **PASS** → the batch is done. You may still apply its one change if it's small; then re-render and rescan, but don't run another critic round. **FAIL** → apply **the one change** first (and the "Also" notes when they're cheap and consistent with the concept), add it to the "changes applied" list, then go back to step 1.
5. **At most 4 rounds.** If round 4 still fails, keep the best-scoring round's files (restore them from `design/critique/<batch>-round-<n>-files/`) and carry its open complaints into `handoff.md`.

## Red flags

| Thought | Reality |
|---|---|
| "The critic passed round 1, great" | Be suspicious. Check its `Screens opened` lists every screen; if not, rerun it on the same renders. |
| "This critic wants to undo what the last one asked for" | It shouldn't: the changes-applied list tells it what to keep. If it insists, keep the earlier change unless the new reply explains why it now fails. |
| "This warning doesn't matter" | Fix it, or write why it's intended in the critique file. |
| "I'll show the user before scanning, to save time" | Never show unscanned, uncritiqued work, except the three directions after their scan. |
| "Android is basically the same" | Re-read `android.md`. A ported iOS screen fails the whole point of Phase 5. |
| "Directions A and C are the same layout in different colours" | Then they're one direction. Change the archetype and the anchor. |
| "An abstract gradient blob will do for illustration" | That's the AI default. Draw the anchor. |
| "Clean and minimal is a safe concept" | It's the tidy-but-forgettable cap. Pick an anchor. |
| "The emoji is just a placeholder" | Placeholders ship. Draw it now. |
| "I'll describe the critic's feedback to it next round" | Give it only the list of changes applied. It must judge the pixels fresh. |
