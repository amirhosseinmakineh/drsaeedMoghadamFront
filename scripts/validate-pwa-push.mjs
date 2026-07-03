#!/usr/bin/env node
/**
 * Validates PWA + push notification build artifacts and service worker reachability.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { request as httpRequest } from "node:http";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist/demo/browser");
const port = 3456;
const base = `http://127.0.0.1:${port}`;

const requiredFiles = [
  "index.html",
  "manifest.webmanifest",
  "ngsw-worker.js",
  "ngsw.json",
  "firebase-config.js",
  "firebase-cloud-messaging-push-scope/firebase-messaging-sw.js",
  "icons/icon-192x192.png",
];

let failures = 0;

for (const file of requiredFiles) {
  const path = join(dist, file);
  if (!existsSync(path)) {
    console.error(`FAIL: missing ${file}`);
    failures++;
  } else {
    console.log(`OK: ${file}`);
  }
}

const manifest = JSON.parse(
  readFileSync(join(dist, "manifest.webmanifest"), "utf8"),
);
if (!manifest.name || !manifest.icons?.length) {
  console.error("FAIL: manifest.webmanifest is incomplete");
  failures++;
} else {
  console.log(`OK: manifest name="${manifest.name}" icons=${manifest.icons.length}`);
}

const indexHtml = readFileSync(join(dist, "index.html"), "utf8");
if (!indexHtml.includes('rel="manifest"')) {
  console.error("FAIL: index.html missing manifest link");
  failures++;
} else {
  console.log("OK: index.html links manifest");
}

const fcmSw = readFileSync(
  join(dist, "firebase-cloud-messaging-push-scope/firebase-messaging-sw.js"),
  "utf8",
);
for (const needle of [
  "onBackgroundMessage",
  "notificationclick",
  "importScripts",
]) {
  if (!fcmSw.includes(needle)) {
    console.error(`FAIL: FCM SW missing ${needle}`);
    failures++;
  }
}
console.log("OK: FCM service worker contains required handlers");

function fetchPath(path) {
  return new Promise((resolve, reject) => {
    httpRequest(`${base}${path}`, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () =>
        resolve({ status: res.statusCode, body: Buffer.concat(chunks) }),
      );
    }).on("error", reject);
  });
}

const server = createServer((req, res) => {
  const urlPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const filePath = join(dist, decodeURIComponent(urlPath));
  if (!filePath.startsWith(dist) || !existsSync(filePath)) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }
  res.writeHead(200);
  res.end(readFileSync(filePath));
});

await new Promise((resolve) => server.listen(port, "127.0.0.1", resolve));

try {
  for (const path of [
    "/manifest.webmanifest",
    "/ngsw-worker.js",
    "/firebase-cloud-messaging-push-scope/firebase-messaging-sw.js",
    "/firebase-config.js",
  ]) {
    const { status, body } = await fetchPath(path);
    if (status !== 200 || body.length === 0) {
      console.error(`FAIL: HTTP ${status} for ${path}`);
      failures++;
    } else {
      console.log(`OK: HTTP 200 ${path} (${body.length} bytes)`);
    }
  }
} finally {
  server.close();
}

if (failures > 0) {
  console.error(`\n${failures} validation failure(s)`);
  process.exit(1);
}

console.log("\nAll PWA + push artifact checks passed.");
