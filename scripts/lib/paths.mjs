import { existsSync, realpathSync, statSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const SKILL_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export class DesignDirMissing extends Error {
  constructor(cwd) {
    super(`no design/ folder in ${cwd} — run init.mjs first`);
  }
}

export function designDir(cwd = process.cwd()) {
  const dir = join(cwd, "design");
  if (!existsSync(dir)) throw new DesignDirMissing(cwd);
  return dir;
}

async function htmlFilesIn(dir) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".html"))
    .map((e) => join(e.parentPath, e.name))
    .sort();
}

/** Files are kept as given (resolved); directories expand to their **\/*.html. */
export async function expandInputs(args) {
  const out = [];
  for (const arg of args) {
    const p = resolve(arg);
    if (!existsSync(p)) continue;
    if (statSync(p).isDirectory()) out.push(...(await htmlFilesIn(p)));
    else out.push(p);
  }
  return out;
}

export function outPathFor(file, design, rootName = "renders", ext = ".png") {
  const rel = relative(design, file).replace(/\.html$/, ext);
  if (rel.startsWith("..")) return join(design, rootName, "external", rel.split(sep).filter((s) => s !== "..").join(sep));
  return join(design, rootName, rel);
}

export function fail(message, code = 2) {
  console.error(message);
  process.exit(code);
}

/** designDir() that exits 2 with the friendly message instead of throwing. */
export function requireDesignDir(cwd = process.cwd()) {
  try {
    return designDir(cwd);
  } catch (e) {
    if (e instanceof DesignDirMissing) fail(e.message);
    throw e;
  }
}

/** True when the module at `metaUrl` is the script node was asked to run (symlinks resolved). */
export function isMain(metaUrl) {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(fileURLToPath(metaUrl)) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}
