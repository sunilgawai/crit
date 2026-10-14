# Crit

**App design that survives a studio critique.** Crit designs iPhone and Android apps a stranger would remember, then makes the launch kit: motion videos, onboarding and paywall, App Store and Google Play assets.

Before anything reaches you, a deterministic scanner rejects the tells of AI design, and a strict critic, running as a fresh subagent with a default verdict of *fail*, scores the screens on concept, memorability and hero. Tidy but forgettable doesn't pass.

## Use

Open Claude Code in your app's folder, or an empty one, and say *"design my app"*. Crit asks at most three questions, shows you three directions, and waits for your pick. Everything it makes goes in a `design/` folder in your project.

A full run (both platforms, motion, store assets) takes about 30–40 minutes and a few hundred thousand tokens.

## Requirements

- **macOS**: iOS renders use the system SF Pro font.
- **Node 22+**.
- **Claude Code**. Crit runs local scripts, so it doesn't work in Claude on the web or mobile.

## What it runs, fetches and sends

- **Runs:** Node scripts inside this plugin (`skills/crit/scripts/`), which Claude runs when the skill tells it to. They render HTML in a local headless Chromium, scan it, and write PNGs, MP4s and store assets into your project's `design/` folder.
- **Fetches, once per installed version:** the `doctor` script runs `npm install` for the pinned dependencies in `skills/crit/package.json` (Playwright, `ffmpeg-static`, fonts from Fontsource) from the npm registry. Playwright then downloads Chromium, and `ffmpeg-static` downloads an ffmpeg binary.
- **Sends:** nothing. Crit has no server, no MCP servers, no analytics, and reads no credentials. Your designs never leave your machine except as part of your normal Claude Code conversation.

See [PRIVACY.md](https://github.com/sunilgawai/crit/blob/master/PRIVACY.md).

## More

Screenshots, how it works, and the evals: [github.com/sunilgawai/crit](https://github.com/sunilgawai/crit). Issues: [github.com/sunilgawai/crit/issues](https://github.com/sunilgawai/crit/issues).

MIT © 2026 Sunil Gawai
