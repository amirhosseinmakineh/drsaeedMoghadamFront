import {
  ApplicationConfig,
  isDevMode,
  provideZonelessChangeDetection,
} from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { provideServiceWorker } from "@angular/service-worker";
import { Capacitor } from "@capacitor/core";
import { routes } from "./app.routes";
import { apiNoCacheInterceptor } from "./core/http/api-no-cache.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideNoopAnimations(),
    provideHttpClient(withFetch(), withInterceptors([apiNoCacheInterceptor])),
    provideServiceWorker("ngsw-worker.js", {
      enabled: !isDevMode() && !Capacitor.isNativePlatform(),
      registrationStrategy: "registerWhenStable:30000",
    }),
  ],
};
