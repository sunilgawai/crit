# CLAUDE.md

Crit is a Claude Code skill: an orchestrated design workflow (`SKILL.md`) that designs iPhone and Android apps as HTML, judges them with a deterministic scanner and a strict critic subagent, and exports renders, MP4s and store assets. Design authority: `docs/specs/2026-10-13-crit-design.md`. Eval method and history: `evals/README.md`, `evals/results.md`.

**Layout.**
- The repo root is a plugin marketplace: `.claude-plugin/marketplace.json` points to `./plugin`.
- `plugin/` is the plugin: `plugin/.claude-plugin/plugin.json`.
- `plugin/skills/crit/` is the skill itself. Paths below (`SKILL.md`, `references/`, `agents/`, `scripts/`) are relative to it.
- Keep `agents/` inside the skill folder. A top-level `agents/` in the plugin would register `critic.md` as a subagent, and it's a prompt the skill reads.
- `npm test` and `npm run validate` (strict validation of both manifests) work from the repo root.

The repo has two halves that change for different reasons:

- **Prose the model runs**: `SKILL.md` (phases, quality loop), `references/*.md` (taste, platforms, copy, paywalls, store, motion), `agents/critic.md`. Changes here change design quality; verify them with an eval (below).
- **Mechanics**: `scripts/*.mjs` are thin CLIs over pure functions in `scripts/lib/`, tested with `node:test` (`npm test`; one file: `node --test scripts/test/scan.test.mjs`). Changes here are verified by tests.

For development, `~/.claude/skills/crit` is a symlink to `plugin/skills/crit`, so every edit is live in real design sessions the moment you save.

**Test the plugin path with that symlink removed.** A personal skill with the same name and folder hides the plugin's. Run `claude --plugin-dir plugin` and check that `crit:crit` loads, then restore the link.

**Releasing:**
1. Bump `version` in `plugin/.claude-plugin/plugin.json`.
2. `npm run validate` must pass.
3. Merge to `master`. Users get the release with `claude plugin update crit@crit`.

## Mechanics

**Every script is loud.** It does its job, or it exits 2 with a one-line message naming what's wrong. A script that exits 0 having done nothing is the bug class this repo has hit most (scans of zero files, symlinked CLIs that never ran, store builds with nothing to build, sprites that render blank). Each new code path gets a test that proves it fails loudly.

- CLIs that also export functions guard their main block with `isMain(import.meta.url)` from `lib/paths.mjs`. It resolves symlinks, which the install uses.
- Build file URLs with `pathToFileURL`. Test fixtures live under a temp path containing spaces (`helpers.fixtureProject()`), and that's deliberate.
- `lib/browser.mjs` launches Chromium with `--allow-file-access-from-files`, so screens can reach sibling files (`<use href="../../illustrations.svg#id">`, XHR checks).
- Platform comes from the path *inside* the nearest `design/` folder (`platformFromPath`), so folders above `design/` named `android` don't count.
- iOS text uses `system-ui, BlinkMacSystemFont` (Chromium maps these to SF Pro on macOS). `-apple-system` resolves to Times in Chromium.

**Scanner anatomy.**
- `lib/snapshot.mjs#collect` runs inside the page and must stay self-contained (Playwright serialises it).
- It produces the `Snapshot` object.
- `lib/rules.mjs#evaluate` is a pure function of that `Snapshot` and returns findings.

To add a rule:
1. Extend `collect()` with the data it needs.
2. Add the check to `evaluate()`.
3. Add a unit test that mutates the clean `base()` snapshot in `rules.test.mjs`.
4. Add an end-to-end case in `scan.test.mjs`. Prove both directions: the bad page is flagged, and the good page stays clean.

Things the scanner learned the hard way:
- Colours are normalised through a 1px canvas, so any CSS colour syntax (oklch, color-mix) compares as sRGB.
- Contrast is measured against what `elementsFromPoint` finds behind the text's centre, not against its ancestors. Text over an image, SVG or gradient is left unjudged.
- A missing `file://` stylesheet still has a `.sheet` in Chromium, so stylesheets and sprites are verified by fetching them.
- A double hyphen inside an XML comment makes a whole sprite invalid, so the scanner parses each referenced sprite.

**Rule IDs are a contract.** `SKILL.md`, the references and critique files cite them (`broken-illustration`, `touch-target`, …). Renaming one means grepping the prose too.

## Changing taste, the critic or the workflow

1. **Calibrate the critic** after any edit to `agents/critic.md`.
   - Render the fixtures in `scripts/test/fixtures/design/screens/ios/` and dispatch the critic on them, the way `SKILL.md` does.
   - `02-sloppy` must FAIL with memorability ≤ 4.
   - `01-clean` + `03-paywall` must FAIL under the tidy-but-forgettable cap (memorability ≤ 6).
2. **Keep examples eval-clean.** Worked examples in `references/` and `agents/` come from genres outside `evals/briefs/`. An example drawn from an eval brief hands that run its answer, which is what invalidated the first eval (see `evals/results.md`).
3. **Run an eval** for changes that should move design quality, following `evals/README.md`.
   - Run projects live outside this repo, so this file and the specs stay out of the eval agent's context.
   - Score skill output and baselines the same way: a fresh critic, round-1 style, no concept given.
   - Record the numbers and caveats in `evals/results.md`.
4. **Close the loop on feedback.** Eval agents log friction to `design/skill-feedback.md` in their run. Turn each real item into a test (mechanics) or a sharper sentence (prose), and keep `SKILL.md`'s commands matching the scripts' actual flags.
