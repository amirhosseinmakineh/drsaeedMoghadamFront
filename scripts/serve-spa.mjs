import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(process.cwd(), "dist/demo/browser");
const indexFile = resolve(root, "index.html");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || "0.0.0.0";

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function sendFile(request, response, filePath, fileStat) {
  const extension = extname(filePath).toLowerCase();
  if (response.statusCode < 400) response.statusCode = 200;
  response.setHeader("Content-Type", mimeTypes.get(extension) || "application/octet-stream");
  response.setHeader("Content-Length", fileStat.size);
  response.setHeader(
    "Cache-Control",
    extension === ".html" ? "no-cache, no-store, must-revalidate" : "public, max-age=31536000, immutable",
  );

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  createReadStream(filePath)
    .on("error", () => {
      if (!response.headersSent) response.statusCode = 500;
      response.end();
    })
    .pipe(response);
}

function isPrivateRoute(pathname) {
  return ["/admin", "/consultant", "/dashboard", "/secretary", "/select-dashboard"]
    .some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"));
}

function isKnownClientRoute(pathname) {
  if (isPrivateRoute(pathname)) return true;
  if (["/", "/about", "/bleaching", "/composite", "/contact", "/services"].includes(pathname.replace(/\/$/, "") || "/")) return true;
  return /^\/services\/[^/]+\/?$/.test(pathname);
}

async function existingFile(pathname) {
  const candidate = resolve(root, "." + pathname);
  if (candidate !== root && !candidate.startsWith(root + sep)) return null;

  try {
    const candidateStat = await stat(candidate);
    if (candidateStat.isFile()) return { path: candidate, stat: candidateStat };
    if (candidateStat.isDirectory()) {
      const nestedIndex = resolve(candidate, "index.html");
      const nestedStat = await stat(nestedIndex);
      if (nestedStat.isFile()) return { path: nestedIndex, stat: nestedStat };
    }
  } catch {
    return null;
  }

  return null;
}

createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.statusCode = 405;
    response.setHeader("Allow", "GET, HEAD");
    response.end("Method Not Allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
  } catch {
    response.statusCode = 400;
    response.end("Bad Request");
    return;
  }

  const requestedFile = await existingFile(pathname);
  if (requestedFile) {
    sendFile(request, response, requestedFile.path, requestedFile.stat);
    return;
  }

  // Only browser navigation routes fall back to Angular. Missing assets must stay
  // 404 so a stale deployment cannot return index.html as JavaScript or CSS.
  if (extname(pathname)) {
    response.statusCode = 404;
    response.end("Not Found");
    return;
  }

  try {
    const indexStat = await stat(indexFile);
    if (isPrivateRoute(pathname)) response.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    if (!isKnownClientRoute(pathname)) response.statusCode = 404;
    sendFile(request, response, indexFile, indexStat);
  } catch {
    response.statusCode = 503;
    response.end("Application build is not available");
  }
}).listen(port, host, () => {
  console.log(`Angular SPA server listening on http://${host}:${port}`);
});
