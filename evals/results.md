# Evaluation results

## Clean run — 2026-10-13 (the numbers to quote)

Run after removing every brief-derived example from `references/`. The baselines are unchanged from the first run (they never saw the references). **Every score below comes from a fresh critic subagent, scoring round-1 style with no concept given, on each project's final iOS screens.** Skill and baseline were scored the same way.

| Brief | Plain Claude | Crit | Δ |
|---|---|---|---|
| A — Split (housemates) | 6.0 FAIL · concept 5, memorability 5, hero 7 | **8.4 PASS** · concept 9, memorability 9, hero 8 | **+2.4** |
| B — Margin (book club) | 7.5 FAIL · concept 8, memorability 7, hero 7 | **8.1 FAIL** · concept 9, memorability 8, hero 7 | +0.6 |

What a stranger would say:
- A, plain Claude: "A clean, yellow-and-cream bill splitter for flatmates."
- A, Crit: "the flatshare app where your house is a cutaway dollhouse and each flatmate's window lights up once they've paid."
- B, plain Claude: "the book club app where your friends' notes look like lined index cards passed in class."
- B, Crit: "each friend is a coloured ribbon hanging out of the same green hardback, and yours is the amber one."

Reading it honestly:
- Crit wins on concept and memorability in both briefs. It clears the full pass rule on A only.
- On B, the critic still wants a stronger home-screen hero.
- Both skill runs reported PASS from their own loop, then changed screens after passing without re-scoring. The blind score is the honest one, and on B it disagrees.
- Remaining caveats:
  - the critic is the same model family as the designer;
  - Crit spent ~33 minutes per run against ~15 for the baseline;
  - n = 2 briefs.

---

# First run — 2026-10-13 (superseded: contaminated)

Same brief, plain Claude (baseline) vs a subagent following the skill. Scores come from fresh critic subagents (`agents/critic.md`); baselines were scored blind, as round 1.

| Brief | Baseline | Skill, iOS | Skill, Android | Rounds (iOS / Android) |
|---|---|---|---|---|
| A — Split (housemates) | **6.0 FAIL** · concept 5, memorability 5 | **8.3 PASS** · concept 9, memorability 9 | **8.5 PASS** | 2 / 2 |
| B — Margin (book club) | **7.5 FAIL** · concept 8, memorability 7 | **8.1 PASS** · concept 9, memorability 8 | **8.1 PASS** | 3 / 1 |

What a stranger would say (critic):
- A baseline: "A clean, yellow-and-cream bill splitter for flatmates, with black cards and pastel initials."
- A skill: the washing line, with each housemate as a garment on a shared line and T-shirt yellow meaning "this one's on you".
- B baseline: "the book club app where your friends' notes look like lined index cards passed in class."
- B skill: a school exercise book with feint rules, a red margin, a highlighter, and folded notes that open at their page.

Run A also produced 3 motion MP4s (hero, flow, delight), 5 + 5 store screenshots, icons for both stores, a feature graphic, `handoff.md` and a gallery.

## Against the pass condition

- A: the skill passes and beats the baseline by 2.3. **Met.**
- B: the skill passes where the baseline failed, but by 0.6, not 2. **Not met as written.** The baseline was already strong, and "≥ 2 points" can't be reached from a 7.5 baseline without scores of 9.5+. The condition should be "passes the 8/8/8 rule where the baseline doesn't, and wins on memorability".

## Validity caveats (read before trusting the numbers)

1. **Contamination.** During these runs, the reference files contained examples I wrote with both briefs in view: a "book club → library-book margins" anchor, a "bill splitting → fridge door" anchor, €24.99 prices, and the names Priya, Tomás and Mei. Run B's concept is close to that example. Run A's (washing line) is not. Fixed afterwards in `references/`. A clean re-run is needed for a valid number.
2. **Same-family judge.** The critic is the same model family as the designers, and the skill runs could see their own critique loop. The baselines got one round and no iteration.
3. **Unequal effort.** The skill runs took ~35–40 minutes each against ~15 for the baselines. Part of the gain is simply iteration.
4. **Scanner bugs during the runs.** `render` and `scan` silently did nothing through the symlink, so both runs worked around it by calling the real path. A sprite with "--" in an XML comment rendered blank in run A, so it inlined its sprite.

## By eye

Both skill runs have a world a stranger would remember. A's washing line is more original than anything in the baseline. B's baseline was already good, and the skill's version is bolder (the hero numerals, "Tomás is 39 pages ahead.") but not a different class. Weak spots in the skill output:
- run A repeats the washing line in the same place on most screens;
- run A has a lot of empty pale ground;
- Android is adapted rather than re-composed;
- craft stayed at 7 throughout run A.

## Fixed from the runs' feedback (all with failing-first tests)

- symlink main-guard;
- translucent-background contrast;
- invalid or missing sprites are now `broken-illustration` errors;
- font width/optical axes kept;
- tab bars and segmented controls exempt from false positives;
- `scan --copy`;
- store headline weight/size no longer synthesised;
- the Play icon keeps its alpha;
- the long-sentence limit is aligned with `copy.md`;
- the critic gets the history of applied changes and lists the screens it opened;
- round snapshots, PASS handling, Phase 2 and pair-sheet critic inputs.
