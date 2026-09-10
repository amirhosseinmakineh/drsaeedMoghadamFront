import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from "@angular/ssr/node";
import express from "express";
import { extname, join } from "node:path";

const browserDistFolder = join(import.meta.dirname, "../browser");
const app = express();
const angularApp = new AngularNodeAppEngine();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.get("/healthz", (_request, response) => {
  response.status(200).type("text/plain").send("ok");
});

app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    setHeaders(response, filePath) {
      const extension = extname(filePath).toLowerCase();
      if (extension === ".html") {
        response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      } else if ([".xml", ".txt", ".webmanifest"].includes(extension)) {
        response.setHeader("Cache-Control", "public, max-age=3600");
      } else {
        response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);

app.use((request, response, next) => {
  angularApp
    .handle(request)
    .then((renderedResponse) =>
      renderedResponse
        ? writeResponseToNodeResponse(renderedResponse, response)
        : next(),
    )
    .catch(next);
});

app.use((_request, response) => {
  response.status(404).type("text/plain").send("Not Found");
});

if (isMainModule(import.meta.url) || process.env["pm_id"]) {
  const port = Number(process.env["PORT"] || 3000);
  const host = process.env["HOST"] || "0.0.0.0";
  app.listen(port, host, (error) => {
    if (error) throw error;
    console.log(`Angular SSR server listening on http://${host}:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
