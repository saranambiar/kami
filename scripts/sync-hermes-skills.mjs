#!/usr/bin/env node
/**
 * Sync repo skills/ into local Hermes skills home under gtm/.
 * Windows: %LOCALAPPDATA%\hermes\skills\gtm
 * Unix: ~/.hermes/skills/gtm
 */
import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "skills");

const hermesHome =
  process.env.HERMES_HOME ||
  (process.platform === "win32"
    ? join(process.env.LOCALAPPDATA || join(homedir(), "AppData", "Local"), "hermes")
    : join(homedir(), ".hermes"));

const dest = join(hermesHome, "skills", "gtm");

if (!existsSync(src)) {
  console.error("No skills/ directory in repo");
  process.exit(1);
}

mkdirSync(dest, { recursive: true });

const entries = readdirSync(src, { withFileTypes: true }).filter((d) => d.isDirectory());
for (const d of entries) {
  const from = join(src, d.name);
  const to = join(dest, d.name);
  cpSync(from, to, { recursive: true });
  console.log(`synced ${d.name}`);
}

writeFileSync(
  join(hermesHome, "skills", "gtm", "DESCRIPTION.md"),
  `# Kami GTM skills\n\nSynced from Kami repo skills/ on ${new Date().toISOString()}.\n`,
  "utf8",
);

console.log(`\nHermes skills home: ${dest}`);
console.log("Restart or refresh Hermes gateway sessions if skills were already loaded.");
