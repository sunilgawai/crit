# App Designer Pro

A Claude Code skill that designs iPhone and Android apps to a studio standard, and produces everything that sells them: motion videos, human copy, onboarding and paywalls, and App Store / Google Play assets.

It's built around taste rather than tidiness: a deterministic scanner rejects the tells of AI design, and a strict critic subagent (default verdict: fail) refuses designs that are clean but forgettable.

## Install

```bash
git clone <this repo> ~/Career/app-designer-pro
ln -s ~/Career/app-designer-pro ~/.claude/skills/app-designer-pro
node ~/Career/app-designer-pro/scripts/doctor.mjs   # installs dependencies and Chromium on first run
```

Needs macOS (for SF Pro in iOS renders) and Node 22+. No Chrome or ffmpeg install needed: Playwright's Chromium and `ffmpeg-static` are used.

## Use

Open Claude Code in your app's folder (or an empty one) and say "design my app". Everything lands in `design/`.

## Layout

- `SKILL.md` — the workflow Claude follows
- `references/` — taste, platform, copy, paywall, store and motion rules
- `agents/critic.md` — the critic's prompt
- `scripts/` — `doctor`, `init`, `fonts`, `render`, `scan`, `sheet`, `capture`, `store`, `gallery` (tests: `npm test`)
- `templates/` — device frame, tokens, screen, scene and store starters
- `docs/` — design spec and implementation plan
