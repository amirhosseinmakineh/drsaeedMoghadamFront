import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

async function clearLocalDevelopmentServiceWorkers(): Promise<void> {
  if (
    typeof window === "undefined" ||
    !["localhost", "127.0.0.1"].includes(window.location.hostname) ||
    !("serviceWorker" in navigator)
  ) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ("caches" in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName.startsWith("ngsw:"))
        .map((cacheName) => caches.delete(cacheName)),
    );
  }
}

clearLocalDevelopmentServiceWorkers()
  .catch(console.error)
  .finally(() => bootstrapApplication(AppComponent, appConfig).catch(console.error));
