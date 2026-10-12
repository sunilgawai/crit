import { cpSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SKILL_DIR } from "../lib/paths.mjs";

/** A throwaway project (path contains spaces) with the fixture design/ plus device.css/js from templates. */
export function fixtureProject() {
  const cwd = mkdtempSync(join(tmpdir(), "adp project with spaces-"));
  cpSync(join(SKILL_DIR, "scripts/test/fixtures/design"), join(cwd, "design"), { recursive: true });
  for (const f of ["device.css", "device.js"]) cpSync(join(SKILL_DIR, "templates", f), join(cwd, "design", f));
  return cwd;
}
