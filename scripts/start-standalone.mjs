#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standaloneDir = path.join(root, ".next", "standalone");
const serverPath = path.join(standaloneDir, "server.js");

async function ensureExists(target, message) {
  try {
    await fs.access(target);
  } catch {
    throw new Error(message);
  }
}

async function copyIfExists(source, target) {
  try {
    await fs.access(source);
  } catch {
    return;
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.cp(source, target, { recursive: true });
}

await ensureExists(
  serverPath,
  "Standalone server not found. Run `pnpm build` before `pnpm start`.",
);
await copyIfExists(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"));
await copyIfExists(path.join(root, "public"), path.join(standaloneDir, "public"));

const child = spawn(process.execPath, [serverPath], {
  cwd: standaloneDir,
  env: process.env,
  stdio: "inherit",
  windowsHide: true,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
