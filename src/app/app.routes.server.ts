import { RenderMode, ServerRoute } from "@angular/ssr";

const privateHeaders = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

export const serverRoutes: ServerRoute[] = [
  { path: "select-dashboard", renderMode: RenderMode.Client, headers: privateHeaders },
  { path: "dashboard", renderMode: RenderMode.Client, headers: privateHeaders },
  { path: "dashboard/**", renderMode: RenderMode.Client, headers: privateHeaders },
  { path: "admin/**", renderMode: RenderMode.Client, headers: privateHeaders },
  { path: "consultant/**", renderMode: RenderMode.Client, headers: privateHeaders },
  { path: "secretary/**", renderMode: RenderMode.Client, headers: privateHeaders },
  { path: "", renderMode: RenderMode.Server },
  { path: "services", renderMode: RenderMode.Server },
  { path: "services/:id", renderMode: RenderMode.Server },
  { path: "composite", renderMode: RenderMode.Server },
  { path: "bleaching", renderMode: RenderMode.Server },
  { path: "about", renderMode: RenderMode.Server },
  { path: "contact", renderMode: RenderMode.Server },
  { path: "**", renderMode: RenderMode.Server, status: 404 },
];
