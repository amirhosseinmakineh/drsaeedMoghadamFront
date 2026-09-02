// Development builds do not use Angular's service worker. This lightweight
// worker replaces and removes any production worker that was previously
// registered for localhost, preventing it from serving an outdated UI.
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.registration.unregister(),
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("ngsw:"))
            .map((key) => caches.delete(key)),
        ),
      ),
    ]).then(() =>
      self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => client.navigate(client.url));
      }),
    ),
  );
});
