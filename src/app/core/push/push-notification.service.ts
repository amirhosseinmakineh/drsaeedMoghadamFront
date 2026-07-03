import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "../auth/auth.service";
import { ConsultantDashboardService } from "../consultant/consultant-dashboard.service";
import {
  FirebaseMessagePayload,
  NotificationService,
} from "./notification.service";

export interface ConsultantPushMessageDetail {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable({ providedIn: "root" })
export class PushNotificationService {
  private lastRegisteredKey: string | null = null;
  private tokenSyncPromise: Promise<void> | null = null;

  constructor(
    private consultantApi: ConsultantDashboardService,
    private auth: AuthService,
    private router: Router,
    private notifications: NotificationService,
  ) {
    if (typeof window !== "undefined") {
      window.addEventListener("focus", () => this.syncForCurrentProfile());
      this.notifications.onTokenRefresh(() => this.syncForCurrentProfile());
      this.notifications.onForegroundMessage((payload) =>
        this.handleForegroundMessage(payload),
      );
    }
  }

  async syncForCurrentProfile(profileId?: number | null): Promise<void> {
    if (this.tokenSyncPromise) return this.tokenSyncPromise;

    this.tokenSyncPromise = this.syncToken(profileId).finally(() => {
      this.tokenSyncPromise = null;
    });

    return this.tokenSyncPromise;
  }

  private async syncToken(profileId?: number | null): Promise<void> {
    const user = this.auth.user();
    const resolvedProfileId =
      profileId ?? user?.consultantProfileId ?? user?.profileId ?? null;
    if (!resolvedProfileId) return;

    const token = await this.getCurrentFirebaseToken();
    if (!token) return;

    const registrationKey = `${resolvedProfileId}:${token}`;
    if (this.lastRegisteredKey === registrationKey) return;

    await new Promise<void>((resolve) => {
      this.consultantApi
        .registerPushToken({
          profileId: resolvedProfileId,
          deviceToken: token,
        })
        .subscribe({
          next: () => {
            this.lastRegisteredKey = registrationKey;
            resolve();
          },
          error: (error) => {
            console.warn("RegisterPushToken failed", error);
            resolve();
          },
        });
    });
  }

  resetRegisteredTokenCache(): void {
    this.lastRegisteredKey = null;
  }

  async getCurrentFirebaseToken(): Promise<string | null> {
    return this.notifications.getToken();
  }

  handleNotificationData(data?: Record<string, string>): void {
    if (!data) return;
    if (data["type"] === "offline_leads") {
      this.router.navigate(["/dashboard/consultant"], {
        queryParams: { section: "leads", type: "offline" },
      });
      return;
    }

    if (data["type"] === "realtime_lead") {
      this.router.navigate(["/dashboard/consultant"], {
        queryParams: {
          section: "leads",
          type: "realtime",
          leadAssignmentId: data["leadAssignmentId"] ?? null,
        },
      });
    }
  }

  private handleForegroundMessage(payload: FirebaseMessagePayload): void {
    const title = payload.notification?.title || this.titleForData(payload.data);
    const body =
      payload.notification?.body || this.bodyForData(payload.data);
    const detail: ConsultantPushMessageDetail = {
      title,
      body,
      data: payload.data,
    };

    window.dispatchEvent(
      new CustomEvent("consultant-push-message", { detail }),
    );

    if (Notification.permission === "granted") {
      const notification = new Notification(title, {
        body,
        data: payload.data,
        tag: this.notificationTag(payload.data),
      });
      notification.onclick = () => {
        notification.close();
        this.handleNotificationData(payload.data);
      };
    }
  }

  private notificationTag(data?: Record<string, string>): string {
    if (data?.["type"] === "realtime_lead" && data["leadAssignmentId"]) {
      return `realtime-lead-${data["leadAssignmentId"]}`;
    }
    if (data?.["type"] === "offline_leads") return "offline-leads";
    return "consultant-notification";
  }

  private titleForData(data?: Record<string, string>): string {
    if (data?.["type"] === "offline_leads") return "لیدهای آفلاین";
    if (data?.["type"] === "realtime_lead") return "لید لحظه‌ای جدید";
    return "اعلان جدید";
  }

  private bodyForData(data?: Record<string, string>): string {
    if (data?.["type"] === "offline_leads") {
      return `شما ${data["count"] ?? "چند"} لید آفلاین دارید.`;
    }
    if (data?.["type"] === "realtime_lead") {
      return "شما یک لید جدید دارید و ۳ دقیقه زمان دارید برای تماس.";
    }
    return "برای مشاهده جزئیات وارد داشبورد شوید.";
  }
}
