#!/usr/bin/env node
/**
 * Launcher for sales evals — runs the TypeScript harness via tsx (no compile step).
 * Usage: node evals/sales/run.mjs
 *        npm run eval:sales
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const runTs = join(webRoot, "evals", "sales", "run.ts");

const result = spawnSync(
  "npx",
  ["--yes", "tsx", runTs],
  { cwd: webRoot, stdio: "inherit", shell: true },
);

process.exit(result.status ?? 1);
