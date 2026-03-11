#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const args = process.argv.slice(2);

function getArg(name) {
    const index = args.indexOf(name);
    if (index === -1) {
        return undefined;
    }

    return args[index + 1];
}

const fileArg = getArg("--file");
const dryRun = args.includes("--dry-run");

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

console.log(`Secrets file: ${filePath}`);
console.log("Cloudflare deployment credentials are present.");

if (dryRun) {
    console.log(
        "[dry-run] payment-gateway-docs has no additional Worker runtime secrets to upload.",
    );
    process.exit(0);
}

console.log(
    "payment-gateway-docs currently relies only on Wrangler Cloudflare credentials. No Worker runtime secrets were uploaded.",
);