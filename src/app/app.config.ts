import {
  ApplicationConfig,
  isDevMode,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { provideServiceWorker } from "@angular/service-worker";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideNoopAnimations(),
    provideHttpClient(withFetch()),
    provideServiceWorker("custom-service-worker.js", {
      enabled: !isDevMode(),
      registrationStrategy: "registerImmediately",
    }),
  ],
};
