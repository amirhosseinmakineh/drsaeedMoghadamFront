import {
  ApplicationConfig,
  isDevMode,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from "@angular/common/http";
import { leadTestModeInterceptor } from "./core/lead-test/lead-test-mode.interceptor";
import { provideServiceWorker } from "@angular/service-worker";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideNoopAnimations(),
    provideHttpClient(withFetch(), withInterceptors([leadTestModeInterceptor])),
    provideServiceWorker("ngsw-worker.js", {
      enabled: !isDevMode(),
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
};
