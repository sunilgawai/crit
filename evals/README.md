# Evaluations

The skill is tested the way skills should be: the same brief, run once by a plain Claude subagent (**baseline**) and once by a subagent following the skill (**skill**). Both outputs are rendered with `render.mjs`, laid out with `sheet.mjs`, scanned with `scan.mjs` and scored by the critic (`agents/critic.md`) in fresh subagents that don't know which run they're judging.

Run projects live **outside this repo**, in `~/crit-evals/<date>/<brief>/{baseline,skill}/`. Claude Code loads `CLAUDE.md` from parent folders, so a run inside the repo would see the developer notes. Score the skill's final iOS sheet and the baseline the same way: a fresh critic, round-1 style, with the concept marked as not stated. Results are summarised in `results.md`. The 2026-10-13 runs are in `~/crit-evals/2026-10-13/` (first, contaminated) and `~/crit-evals/2026-10-13-clean/`.

## Baseline prompt

> Design the main iOS screens of this app as HTML files: one file per screen, each laid out for a 402×874 CSS px iPhone viewport with a realistic status bar. Put them in `<dir>/design/screens/ios/`, named `01-….html` and so on. Brief: <brief>

## Skill prompt

> Read `~/.claude/skills/crit/SKILL.md` (the dev symlink to `plugin/skills/crit/`) and follow it exactly, in autonomous mode (take the critic's pick at every ★ gate; don't ask questions). `$SKILL` is `~/.claude/skills/crit`. The project root is `<dir>`. Brief: <brief>. Run phases <range>.

## Pass condition

Both briefs: the skill run passes its own critic, and beats the baseline's critic mean by ≥ 2 points. By eye, the skill output must not look AI-made.
