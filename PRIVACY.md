# Privacy

Crit collects no data.

- It has no server, no MCP servers, no analytics and no telemetry.
- It reads no credentials, tokens or environment secrets.
- It reads the files in the project you run it in (to redesign an existing app) and writes only to that project's `design/` folder.
- Its scripts make no network requests of their own. The only downloads are its dependencies: on first run per installed version, `npm install` fetches the pinned packages in `plugin/skills/crit/package.json` from the npm registry, Playwright downloads Chromium, and `ffmpeg-static` downloads an ffmpeg binary. These requests carry no data about you or your project.

What you type to Claude, and what Claude reads while using Crit, goes through your Claude Code session like any other conversation and is covered by [Anthropic's privacy policy](https://www.anthropic.com/legal/privacy).

Questions: [open an issue](https://github.com/sunilgawai/crit/issues).
