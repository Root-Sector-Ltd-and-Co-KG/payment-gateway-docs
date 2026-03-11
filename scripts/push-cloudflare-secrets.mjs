#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import dotenv from "dotenv";

const args = process.argv.slice(2);
const isWindows = process.platform === "win32";

function getArg(name) {
    const index = args.indexOf(name);
    if (index === -1) {
        return undefined;
    }

    return args[index + 1];
}

const envName = getArg("--env") || "production";
const fileArg = getArg("--file");
const dryRun = args.includes("--dry-run");

if (envName !== "production") {
    console.error("Invalid --env value. payment-gateway-docs currently supports only 'production'.");
    process.exit(1);
}

if (!fileArg) {
    console.error("Missing required argument: --file <path>");
    process.exit(1);
}

const filePath = path.resolve(process.cwd(), fileArg);
if (!fs.existsSync(filePath)) {
    console.error(`Secrets file not found: ${filePath}`);
    process.exit(1);
}

const parsed = dotenv.parse(fs.readFileSync(filePath, "utf8"));
const apiToken = parsed.CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const accountId =
    parsed.CLOUDFLARE_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID;

if (!apiToken) {
    console.error(
        "Missing CLOUDFLARE_API_TOKEN in the secrets file or process environment.",
    );
    process.exit(1);
}

if (!accountId) {
    console.error(
        "Missing CLOUDFLARE_ACCOUNT_ID in the secrets file or process environment.",
    );
    process.exit(1);
}

const credentialKeys = new Set([
    "CLOUDFLARE_API_TOKEN",
    "CLOUDFLARE_ACCOUNT_ID",
]);

const secretKeys = Object.keys(parsed).filter((key) => {
    if (credentialKeys.has(key)) {
        return false;
    }

    const value = parsed[key];
    return typeof value === "string" && value.length > 0;
});

console.log(`Target environment: ${envName}`);
console.log(`Secrets file: ${filePath}`);
console.log("Cloudflare deployment credentials are present.");

if (secretKeys.length === 0) {
    const message = dryRun
        ? "[dry-run] no additional Worker runtime secrets found to upload."
        : "No additional Worker runtime secrets found to upload.";

    console.log(message);
    process.exit(0);
}

console.log(`Secrets to upload: ${secretKeys.length}`);

for (const key of secretKeys) {
    if (dryRun) {
        console.log(`[dry-run] would upload: ${key}`);
        continue;
    }

    console.log(`Uploading secret: ${key}`);
    const result = spawnSync(
        isWindows ? "pnpm.cmd" : "pnpm",
        ["wrangler", "secret", "put", key],
        {
            input: parsed[key],
            stdio: ["pipe", "inherit", "inherit"],
            shell: isWindows,
            env: {
                ...process.env,
                CLOUDFLARE_API_TOKEN: apiToken,
                CLOUDFLARE_ACCOUNT_ID: accountId,
            },
        },
    );

    if (result.error) {
        console.error(`Failed to start upload command for secret: ${key}`);
        console.error(result.error.message);
        process.exit(1);
    }

    if (result.status !== 0) {
        console.error(`Failed to upload secret: ${key}`);
        process.exit(result.status || 1);
    }
}

if (!dryRun) {
    console.log("All configured Worker runtime secrets uploaded successfully.");
}