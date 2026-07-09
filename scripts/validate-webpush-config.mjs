#!/usr/bin/env node
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist/demo/browser");

const requiredFiles = [
  "web-push-config.js",
  "web-push-scope/web-push-sw.js",
  "sounds/offline-lead-alert.mp3",
  "manifest.webmanifest",
];

for (const file of requiredFiles) {
  const fullPath = join(dist, file);
  if (!existsSync(fullPath)) {
    console.error(`FAIL: missing ${file} in production build output`);
    process.exit(1);
  }
}

console.log("OK: Web Push PWA assets present in build output");
