import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
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
    if (!user || !this.auth.authToken()) return;

    const token = await this.getCurrentFirebaseToken();
    if (!token) return;

    const resolvedProfileId =
      profileId ?? user.consultantProfileId ?? user.profileId ?? null;
    const registrationKey = `${user.userId ?? resolvedProfileId ?? user.phoneNumber ?? "user"}:${token}`;
    if (this.lastRegisteredKey === registrationKey) return;

    const registered = await this.registerTokenWithBackend(
      token,
      resolvedProfileId,
    );
    if (registered) {
      this.lastRegisteredKey = registrationKey;
    }
  }

  private async registerTokenWithBackend(
    token: string,
    profileId: number | null,
  ): Promise<boolean> {
    if (this.auth.user()?.userId) {
      try {
        await firstValueFrom(this.auth.registerPushToken(token));
        return true;
      } catch (error) {
        console.warn("Auth RegisterPushToken failed", error);
      }
    }

    if (!profileId) return false;

    try {
      await firstValueFrom(
        this.consultantApi.registerPushToken({
          profileId,
          deviceToken: token,
        }),
      );
      return true;
    } catch (error) {
      console.warn("Consultant RegisterPushToken failed", error);
      return false;
    }
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
      return;
    }

    if (data["type"] === "password_changed") {
      this.router.navigate(["/"]);
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
    if (data?.["type"] === "password_changed") return "password-changed";
    return "consultant-notification";
  }

  private titleForData(data?: Record<string, string>): string {
    if (data?.["type"] === "offline_leads") return "لیدهای آفلاین";
    if (data?.["type"] === "realtime_lead") return "لید لحظه‌ای جدید";
    if (data?.["type"] === "password_changed") return "تغییر رمز عبور";
    return "اعلان جدید";
  }

  private bodyForData(data?: Record<string, string>): string {
    if (data?.["type"] === "offline_leads") {
      return `شما ${data["count"] ?? "چند"} لید آفلاین دارید.`;
    }
    if (data?.["type"] === "realtime_lead") {
      return "شما یک لید جدید دارید و ۳ دقیقه زمان دارید برای تماس.";
    }
    if (data?.["type"] === "password_changed") {
      return "کلمه عبور شما با موفقیت تغییر کرد.";
    }
    return "برای مشاهده جزئیات وارد داشبورد شوید.";
  }
}
