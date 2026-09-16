import { spawn } from "node:child_process";

const port = 3210;
const origin = `http://127.0.0.1:${port}`;
const canonicalOrigin = (process.env.SSR_EXPECTED_SITE_URL || "https://drsaeedmoghadam.com")
  .replace(/\/$/, "");
const server = spawn(process.execPath, ["dist/demo/server/server.mjs"], {
  env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

let logs = "";
server.stdout.on("data", (chunk) => { logs += chunk; });
server.stderr.on("data", (chunk) => { logs += chunk; });

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitUntilReady() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${origin}/healthz`);
      if (response.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error(`SSR server did not start.\n${logs}`);
}

const publicRoutes = [
  ["/", `${canonicalOrigin}/`],
  ["/services/", `${canonicalOrigin}/services/`],
  ["/composite/", `${canonicalOrigin}/composite/`],
  ["/bleaching/", `${canonicalOrigin}/bleaching/`],
  ["/services/laminate/", `${canonicalOrigin}/services/laminate/`],
  ["/about/", `${canonicalOrigin}/about/`],
  ["/contact/", `${canonicalOrigin}/contact/`],
];

try {
  await waitUntilReady();
  for (const [path, canonical] of publicRoutes) {
    const response = await fetch(`${origin}${path}`);
    const html = await response.text();
    if (response.status !== 200) throw new Error(`${path} returned ${response.status}`);
    for (const expected of ["<title>", "<h1", "application/ld+json", `rel=\"canonical\" href=\"${canonical}`]) {
      if (!html.includes(expected)) throw new Error(`${path} SSR HTML is missing ${expected}`);
    }
  }

  const dashboard = await fetch(`${origin}/dashboard/admin`);
  if (dashboard.status !== 200 || !dashboard.headers.get("x-robots-tag")?.includes("noindex")) {
    throw new Error("Private dashboard CSR/noindex contract failed");
  }

  const missing = await fetch(`${origin}/does-not-exist`);
  if (missing.status !== 404) throw new Error(`Unknown route returned ${missing.status}`);
  if (/ERROR|uncaughtException|UnhandledPromiseRejection/i.test(logs)) throw new Error(`SSR runtime logged an error.\n${logs}`);

  console.log(`SSR runtime validation passed (${publicRoutes.length} rendered public routes).`);
} finally {
  server.kill("SIGTERM");
}
