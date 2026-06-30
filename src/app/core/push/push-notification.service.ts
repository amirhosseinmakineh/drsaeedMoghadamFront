import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";
import { AuthService } from "../auth/auth.service";
import { ConsultantDashboardService } from "../consultant/consultant-dashboard.service";

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

interface FirebaseMessagePayload {
  notification?: { title?: string; body?: string };
  data?: Record<string, string>;
}

@Injectable({ providedIn: "root" })
export class PushNotificationService {
  private messaging: unknown | null = null;
  private messagingModule: FirebaseMessagingModule | null = null;
  private foregroundUnsubscribe: (() => void) | null = null;
  private lastRegisteredKey: string | null = null;

  constructor(
    private consultantApi: ConsultantDashboardService,
    private auth: AuthService,
    private router: Router,
  ) {
    if (typeof window !== "undefined") {
      window.addEventListener("focus", () => this.syncForCurrentProfile());
    }
  }

  async syncForCurrentProfile(profileId?: number | null): Promise<void> {
    const user = this.auth.user();
    const resolvedProfileId =
      profileId ?? user?.consultantProfileId ?? user?.profileId ?? null;
    if (!resolvedProfileId) return;

    const token = await this.getCurrentFirebaseToken();
    if (!token) return;

    const registrationKey = `${resolvedProfileId}:${token}`;
    if (this.lastRegisteredKey === registrationKey) return;

    this.consultantApi.registerPushToken({
      profileId: resolvedProfileId,
      deviceToken: token,
    }).subscribe({
      next: () => {
        this.lastRegisteredKey = registrationKey;
      },
      error: (error) => console.warn("RegisterPushToken failed", error),
    });
  }

  resetRegisteredTokenCache(): void {
    this.lastRegisteredKey = null;
  }

  async getCurrentFirebaseToken(): Promise<string | null> {
    if (!this.canUseNotifications()) return null;
    if (!this.hasFirebaseConfig()) return null;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied");
      return null;
    }

    const messagingModule = await this.loadMessaging();
    if (!messagingModule) return null;

    try {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
      );
      const token = await messagingModule.getToken(this.messaging, {
        vapidKey: environment.firebaseVapidKey,
        serviceWorkerRegistration: registration,
      });
      this.listenForForegroundMessages(messagingModule);
      return token?.trim() || null;
    } catch (error) {
      console.warn("FCM token could not be resolved", error);
      return null;
    }
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
        : appModule.initializeApp(environment.firebase);
      this.messaging = messagingModule.getMessaging(app);
      this.messagingModule = messagingModule;
      return messagingModule;
    } catch (error) {
      console.warn("Firebase Messaging is unavailable", error);
      return null;
    }
  }

  private listenForForegroundMessages(
    messagingModule: FirebaseMessagingModule,
  ): void {
    if (this.foregroundUnsubscribe || !this.messaging) return;

    this.foregroundUnsubscribe = messagingModule.onMessage(
      this.messaging,
      (payload) => {
        const title = payload.notification?.title || "اعلان جدید";
        const body = payload.notification?.body || this.bodyForData(payload.data);
        window.dispatchEvent(
          new CustomEvent("consultant-push-message", {
            detail: { title, body, data: payload.data },
          }),
        );
        if (Notification.permission === "granted") {
          const notification = new Notification(title, { body, data: payload.data });
          notification.onclick = () => this.handleNotificationData(payload.data);
        }
      },
    );
  }

  private handleNotificationData(data?: Record<string, string>): void {
    if (!data) return;
    if (data["type"] === "offline_leads") {
      this.router.navigate(["/dashboard/consultant"], {
        queryParams: { section: "leads", type: "offline" },
      });
      return;
    }

    if (data["type"] === "realtime_lead") {
      this.router.navigate(["/dashboard/consultant"], {
        queryParams: { section: "leads", type: "realtime", leadAssignmentId: data["leadAssignmentId"] },
      });
    }
  }

  private bodyForData(data?: Record<string, string>): string {
    if (data?.["type"] === "offline_leads") {
      return `شما ${data["count"] ?? "چند"} لید آفلاین دارید.`;
    }
    if (data?.["type"] === "realtime_lead") {
      return "شما یک لید جدید دارید و 3 دقیقه زمان دارید برای تماس.";
    }
    return "برای مشاهده جزئیات وارد داشبورد شوید.";
  }

  private canUseNotifications(): boolean {
    return (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator
    );
  }

  private hasFirebaseConfig(): boolean {
    return Boolean(
      environment.firebaseVapidKey?.trim() &&
        environment.firebase?.apiKey?.trim() &&
        environment.firebase?.projectId?.trim() &&
        environment.firebase?.messagingSenderId?.trim() &&
        environment.firebase?.appId?.trim(),
    );
  }
}
