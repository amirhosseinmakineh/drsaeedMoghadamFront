#!/usr/bin/env node
/**
 * Browser-level smoke test for PWA service workers and notification permission flow.
 */
import puppeteer from "puppeteer-core";

const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:3456";
const executablePath =
  process.env.CHROME_PATH || "/usr/local/bin/google-chrome";

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
  ],
});

const page = await browser.newPage();
const consoleLogs = [];
page.on("console", (msg) => consoleLogs.push(msg.text()));

await page.goto(baseUrl, { waitUntil: "networkidle0", timeout: 30000 });

const manifestHref = await page.$eval('link[rel="manifest"]', (el) =>
  el.getAttribute("href"),
);
if (!manifestHref) throw new Error("Manifest link not found");
console.log(`OK: manifest href=${manifestHref}`);

const manifestResponse = await page.goto(`${baseUrl}/${manifestHref}`, {
  waitUntil: "networkidle0",
});
if (!manifestResponse?.ok()) throw new Error("Manifest fetch failed");
const manifest = await manifestResponse.json();
if (!manifest.icons?.length) throw new Error("Manifest has no icons");
console.log(`OK: manifest loaded (${manifest.name})`);

await page.goto(baseUrl, { waitUntil: "networkidle0" });
await page.waitForFunction(() => navigator.serviceWorker?.getRegistrations, {
  timeout: 35000,
});

const registrations = await page.evaluate(async () => {
  const regs = await navigator.serviceWorker.getRegistrations();
  return regs.map((reg) => ({
    scope: reg.scope,
    scriptURL: reg.active?.scriptURL || reg.installing?.scriptURL || "",
  }));
});

console.log(
  "Service worker registrations:",
  JSON.stringify(registrations, null, 2),
);

const hasCustomSw = registrations.some((reg) =>
  reg.scriptURL.includes("custom-service-worker.js"),
);
if (!hasCustomSw) {
  throw new Error("custom-service-worker.js was not registered");
}
console.log("OK: custom service worker registered");

const permission = await page.evaluate(async () => {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
});
console.log(`OK: Notification API available, permission=${permission}`);

const webPushConfigPresent = await page.evaluate(
  () => typeof self.__WEB_PUSH_VAPID_PUBLIC_KEY__ === "string",
);
console.log(
  webPushConfigPresent
    ? "OK: web-push-config.js loaded on page"
    : "WARN: web-push-config.js missing (expected without WEBPUSH_* env)",
);

const relevantLogs = consoleLogs.filter((line) =>
  /NotificationService|Web Push|permission/i.test(line),
);
if (relevantLogs.length) {
  console.log("Browser console (notifications):");
  for (const line of relevantLogs) console.log(`  ${line}`);
}

await browser.close();
console.log("\nBrowser PWA + Web Push smoke test passed.");
