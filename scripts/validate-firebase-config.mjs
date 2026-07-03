#!/usr/bin/env node
/**
 * Validates generated Firebase config artifacts after a production build.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const distConfig = join(root, "dist/demo/browser/firebase-config.js");
const envProd = join(root, "src/environments/environment.prod.ts");

const shouldRequireConfig =
  !["1", "true"].includes(process.env.SKIP_FIREBASE_CONFIG_CHECK ?? "") &&
  (process.env.REQUIRE_FIREBASE_CONFIG === "1" ||
    process.env.REQUIRE_FIREBASE_CONFIG === "true" ||
    process.env.CI === "true" ||
    process.env.NETLIFY === "true");

function readConfigFromSwFile(path) {
  const source = readFileSync(path, "utf8");
  const configMatch = source.match(
    /self\.__FIREBASE_CONFIG__\s*=\s*(\{[\s\S]*?\});/,
  );
  const vapidMatch = source.match(
    /self\.__FIREBASE_VAPID_KEY__\s*=\s*("(?:\\.|[^"\\])*"|''|"");/,
  );
  if (!configMatch) return null;

  const config = JSON.parse(configMatch[1]);
  const vapidKey = vapidMatch ? JSON.parse(vapidMatch[1]) : "";
  return { config, vapidKey };
}

function isConfigured({ config, vapidKey }) {
  return Boolean(
    vapidKey &&
      config.apiKey &&
      config.projectId &&
      config.messagingSenderId &&
      config.appId,
  );
}

let failures = 0;

for (const file of [distConfig, join(root, "public/firebase-config.js")]) {
  if (!existsSync(file)) {
    console.error(`FAIL: missing ${file}`);
    failures++;
    continue;
  }

  const parsed = readConfigFromSwFile(file);
  if (!parsed) {
    console.error(`FAIL: could not parse Firebase config in ${file}`);
    failures++;
    continue;
  }

  if (isConfigured(parsed)) {
    console.log(`OK: ${file} has Firebase project ${parsed.config.projectId}`);
  } else if (shouldRequireConfig) {
    console.error(`FAIL: ${file} has empty Firebase config`);
    failures++;
  } else {
    console.warn(`WARN: ${file} has empty Firebase config (local build)`);
  }
}

if (!existsSync(envProd)) {
  console.error("FAIL: missing src/environments/environment.prod.ts");
  failures++;
} else {
  const envSource = readFileSync(envProd, "utf8");
  if (!envSource.includes('"projectId"')) {
    console.error("FAIL: environment.prod.ts missing firebase.projectId");
    failures++;
  } else if (shouldRequireConfig && envSource.includes('"projectId": ""')) {
    console.error("FAIL: environment.prod.ts has empty firebase.projectId");
    failures++;
  } else {
    console.log("OK: environment.prod.ts generated");
  }
}

if (failures > 0) {
  console.error(`\n${failures} Firebase config validation failure(s)`);
  process.exit(1);
}

console.log("\nFirebase config validation passed.");
