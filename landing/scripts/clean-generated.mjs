import { readdir, rm, lstat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const targets = new Set([
  ".preview",
  "docs/qa",
  "coverage",
  "test-results",
  "playwright-report",
  "apps/web/coverage",
  "apps/web/test-results",
  "apps/web/playwright-report",
]);

for (const entry of await readdir(path.join(root, "apps/web"), {
  withFileTypes: true,
})) {
  if (
    entry.isDirectory() &&
    (entry.name === ".next" || entry.name.startsWith(".next-"))
  ) {
    targets.add(`apps/web/${entry.name}/dev`);
    targets.add(`apps/web/${entry.name}/cache/webpack`);
  }
  if (entry.name.endsWith(".tsbuildinfo"))
    targets.add(`apps/web/${entry.name}`);
}

async function collectPythonArtifacts(directory) {
  for (const entry of await readdir(path.join(root, directory), {
    withFileTypes: true,
  })) {
    const relative = path.join(directory, entry.name);
    if (
      ["__pycache__", ".pytest_cache", ".ruff_cache", ".coverage"].includes(
        entry.name,
      )
    )
      targets.add(relative);
    else if (entry.isDirectory() && !entry.name.startsWith("."))
      await collectPythonArtifacts(relative);
    else if (entry.isFile() && /\.py[co]$/.test(entry.name))
      targets.add(relative);
  }
}
await collectPythonArtifacts("apps/api");
await collectPythonArtifacts("scripts");

for (const relative of targets) {
  const target = path.join(root, relative);
  if (await lstat(target).catch(() => null)) {
    await rm(target, { recursive: true, force: true });
    console.log(`Removed ${relative}`);
  }
}
