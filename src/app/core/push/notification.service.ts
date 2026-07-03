import { Injectable } from "@angular/core";
import {
  getFirebaseConfig,
  getFirebaseVapidKey,
  hasFirebaseClientConfig,
} from "./firebase-environment";

export const FCM_SERVICE_WORKER_URL =
  "/firebase-cloud-messaging-push-scope/firebase-messaging-sw.js";

interface FirebaseAppModule {
  initializeApp: (config: Record<string, unknown>) => unknown;
  getApps: () => unknown[];
  getApp: () => unknown;
}

interface FirebaseMessagingModule {
  getMessaging: (app?: unknown) => unknown;
  getToken: (
    messaging: unknown,
    options: { vapidKey: string; serviceWorkerRegistration?: ServiceWorkerRegistration },
  ) => Promise<string>;
  onMessage: (
    messaging: unknown,
    nextOrObserver: (payload: FirebaseMessagePayload) => void,
  ) => () => void;
  isSupported: () => Promise<boolean>;
}

export interface FirebaseMessagePayload {
  notification?: { title?: string; body?: string };
  data?: Record<string, string>;
}

@Injectable({ providedIn: "root" })
export class NotificationService {
  private messaging: unknown | null = null;
  private messagingModule: FirebaseMessagingModule | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private foregroundUnsubscribe: (() => void) | null = null;
  private tokenRefreshUnsubscribe: (() => void) | null = null;
  private lastKnownToken: string | null = null;
  private readonly tokenRefreshListeners = new Set<(token: string) => void>();
  private readonly foregroundListeners = new Set<
    (payload: FirebaseMessagePayload) => void
  >();

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.canUseNotifications()) return "denied";
    return Notification.requestPermission();
  }

  async getToken(): Promise<string | null> {
    if (!this.canUseNotifications()) return null;
    if (!hasFirebaseClientConfig()) {
      console.warn(
        "Firebase push is not configured. Set FIREBASE_* env vars before build.",
      );
      return null;
    }

    const permission = await this.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    const messagingModule = await this.loadMessaging();
    if (!messagingModule) return null;

    try {
      const registration = await this.ensureServiceWorkerRegistration();
      const token = await messagingModule.getToken(this.messaging, {
        vapidKey: getFirebaseVapidKey(),
        serviceWorkerRegistration: registration,
      });
      const normalized = token?.trim() || null;
      if (normalized && normalized !== this.lastKnownToken) {
        this.lastKnownToken = normalized;
        console.log("[NotificationService] FCM token generated");
        this.notifyTokenRefresh(normalized);
      }
      this.ensureForegroundListener(messagingModule);
      this.ensureTokenRefreshListener(messagingModule);
      return normalized;
    } catch (error) {
      console.warn("FCM token could not be resolved", error);
      return null;
    }
  }

  onTokenRefresh(listener: (token: string) => void): () => void {
    this.tokenRefreshListeners.add(listener);
    return () => this.tokenRefreshListeners.delete(listener);
  }

  onForegroundMessage(
    listener: (payload: FirebaseMessagePayload) => void,
  ): () => void {
    this.foregroundListeners.add(listener);
    return () => this.foregroundListeners.delete(listener);
  }

  getLastKnownToken(): string | null {
    return this.lastKnownToken;
  }

  private notifyTokenRefresh(token: string): void {
    for (const listener of this.tokenRefreshListeners) {
      listener(token);
    }
  }

  private async ensureServiceWorkerRegistration(): Promise<ServiceWorkerRegistration> {
    if (this.swRegistration) {
      await this.swRegistration.update().catch(() => undefined);
      return this.swRegistration;
    }

    const registration = await navigator.serviceWorker.register(
      FCM_SERVICE_WORKER_URL,
      { scope: "/firebase-cloud-messaging-push-scope/" },
    );
    await navigator.serviceWorker.ready;
    this.swRegistration = registration;
    return registration;
  }

  private async loadMessaging(): Promise<FirebaseMessagingModule | null> {
    if (this.messagingModule && this.messaging) return this.messagingModule;

    try {
      const [appModule, messagingModule] = await Promise.all([
        // @ts-expect-error Firebase's browser ESM CDN is loaded at runtime.
        import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js") as Promise<FirebaseAppModule>,
        // @ts-expect-error Firebase's browser ESM CDN is loaded at runtime.
        import("https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging.js") as Promise<FirebaseMessagingModule>,
      ]);

      if (!(await messagingModule.isSupported())) return null;
      const app = appModule.getApps().length
        ? appModule.getApp()
        : appModule.initializeApp(
            getFirebaseConfig() as unknown as Record<string, unknown>,
          );
      this.messaging = messagingModule.getMessaging(app);
      this.messagingModule = messagingModule;
      return messagingModule;
    } catch (error) {
      console.warn("Firebase Messaging is unavailable", error);
      return null;
    }
  }

  private ensureForegroundListener(
    messagingModule: FirebaseMessagingModule,
  ): void {
    if (this.foregroundUnsubscribe || !this.messaging) return;

    this.foregroundUnsubscribe = messagingModule.onMessage(
      this.messaging,
      (payload) => {
        for (const listener of this.foregroundListeners) {
          listener(payload);
        }
      },
    );
  }

  private ensureTokenRefreshListener(
    messagingModule: FirebaseMessagingModule,
  ): void {
    if (this.tokenRefreshUnsubscribe || !this.messaging) return;

    const refreshToken = async (): Promise<void> => {
      if (!this.swRegistration || !this.messaging) return;
      try {
        const token = await messagingModule.getToken(this.messaging, {
          vapidKey: getFirebaseVapidKey(),
          serviceWorkerRegistration: this.swRegistration,
        });
        const normalized = token?.trim() || null;
        if (normalized && normalized !== this.lastKnownToken) {
          this.lastKnownToken = normalized;
          console.log("[NotificationService] FCM token refreshed");
          this.notifyTokenRefresh(normalized);
        }
      } catch (error) {
        console.warn("FCM token refresh failed", error);
      }
    };

    const onVisibilityChange = (): void => {
      if (document.visibilityState === "visible") {
        void refreshToken();
      }
    };

    const onFocus = (): void => {
      void refreshToken();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    this.tokenRefreshUnsubscribe = () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }

  private canUseNotifications(): boolean {
    return (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator
    );
  }
}
