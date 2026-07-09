import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { AuthService } from "../auth/auth.service";
import { ConsultantDashboardService } from "../consultant/consultant-dashboard.service";
import {
  NotificationService,
  WebPushMessagePayload,
} from "./notification.service";
import { playRealtimeLeadAlertSound } from "./lead-alert-sound";

export interface ConsultantPushMessageDetail {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface PushSyncResult {
  ok: boolean;
  message: string;
}

@Injectable({ providedIn: "root" })
export class PushNotificationService {
  private lastRegisteredKey: string | null = null;
  private tokenSyncPromise: Promise<PushSyncResult> | null = null;
  private backendRegistrationReady = false;

  constructor(
    private consultantApi: ConsultantDashboardService,
    private auth: AuthService,
    private router: Router,
    private notifications: NotificationService,
  ) {
    if (typeof window !== "undefined") {
      window.addEventListener("focus", () => {
        const user = this.auth.user();
        if (user?.role === "consultant") {
          void this.syncPushRegistrationIfReady();
          return;
        }
        void this.syncForCurrentProfile();
      });
      this.notifications.onTokenRefresh(() => {
        void this.syncForCurrentProfile();
      });
      this.notifications.onForegroundMessage((payload) =>
        this.handleForegroundMessage(payload),
      );
    }
  }

  isBackendRegistrationReady(): boolean {
    return this.backendRegistrationReady;
  }

  async syncForCurrentProfile(
    profileId?: number | null,
  ): Promise<PushSyncResult> {
    if (this.tokenSyncPromise) return this.tokenSyncPromise;

    this.tokenSyncPromise = this.syncToken(profileId).finally(() => {
      this.tokenSyncPromise = null;
    });

    return this.tokenSyncPromise;
  }

  private async syncToken(profileId?: number | null): Promise<PushSyncResult> {
    const user = this.auth.user();
    if (!user || !this.auth.authToken()) {
      this.backendRegistrationReady = false;
      return { ok: false, message: "برای ثبت نوتیفیکیشن ابتدا وارد حساب شوید." };
    }

    const subscriptionJson = await this.getCurrentPushSubscription();
    if (!subscriptionJson) {
      this.backendRegistrationReady = false;
      return {
        ok: false,
        message: "subscription محلی یافت نشد. دکمه فعال‌سازی نوتیفیکیشن را بزنید.",
      };
    }

    const resolvedProfileId =
      profileId ?? user.consultantProfileId ?? user.profileId ?? null;
    const registrationKey = `${user.userId ?? resolvedProfileId ?? user.phoneNumber ?? "user"}:${subscriptionJson}`;

    if (this.lastRegisteredKey === registrationKey && this.backendRegistrationReady) {
      return { ok: true, message: "subscription قبلاً روی سرور ثبت شده است." };
    }

    const registered = await this.registerSubscriptionWithBackend(
      subscriptionJson,
      resolvedProfileId,
    );
    this.backendRegistrationReady = registered.ok;
    if (registered.ok) {
      this.lastRegisteredKey = registrationKey;
    } else {
      this.lastRegisteredKey = null;
    }

    return registered;
  }

  private async registerSubscriptionWithBackend(
    subscriptionJson: string,
    profileId: number | null,
  ): Promise<PushSyncResult> {
    if (this.auth.user()?.userId) {
      try {
        await firstValueFrom(this.auth.registerPushToken(subscriptionJson));
        return { ok: true, message: "subscription روی سرور ثبت شد." };
      } catch (error) {
        console.warn("Auth RegisterPushToken failed", error);
      }
    }

    if (!profileId) {
      return {
        ok: false,
        message: "شناسه پروفایل مشاور برای ثبت subscription یافت نشد.",
      };
    }

    try {
      await firstValueFrom(
        this.consultantApi.registerPushToken({
          profileId,
          deviceToken: subscriptionJson,
        }),
      );
      return { ok: true, message: "subscription روی سرور ثبت شد." };
    } catch (error) {
      console.warn("Consultant RegisterPushToken failed", error);
      return {
        ok: false,
        message: this.extractErrorMessage(
          error,
          "ثبت subscription روی سرور انجام نشد.",
        ),
      };
    }
  }

  resetRegisteredTokenCache(): void {
    this.lastRegisteredKey = null;
    this.backendRegistrationReady = false;
  }

  async getCurrentPushSubscription(): Promise<string | null> {
    return this.notifications.getSubscriptionJson();
  }

  async enablePushForCurrentProfile(
    profileId?: number | null,
  ): Promise<PushSyncResult> {
    const result = await this.notifications.enablePushNotifications();
    if (!result.ok) {
      this.backendRegistrationReady = false;
      return { ok: false, message: result.message };
    }

    if (!result.subscriptionJson) {
      this.backendRegistrationReady = false;
      return {
        ok: false,
        message: "subscription محلی ساخته نشد.",
      };
    }

    const resolvedProfileId =
      profileId ??
      this.auth.user()?.consultantProfileId ??
      this.auth.user()?.profileId ??
      null;

    const registered = await this.registerSubscriptionWithBackend(
      result.subscriptionJson,
      resolvedProfileId,
    );
    this.backendRegistrationReady = registered.ok;
    if (registered.ok) {
      const user = this.auth.user();
      this.lastRegisteredKey = `${user?.userId ?? resolvedProfileId ?? "user"}:${result.subscriptionJson}`;
      return { ok: true, message: "نوتیفیکیشن فعال و روی سرور ثبت شد." };
    }

    this.lastRegisteredKey = null;
    return {
      ok: false,
      message: `${registered.message} (روی گوشی فعال است ولی سرور هنوز subscription ندارد)`,
    };
  }

  async prepareTestPush(profileId: number): Promise<{
    ok: boolean;
    message: string;
    deviceToken?: string;
  }> {
    const environmentIssue = this.notifications.getEnvironmentIssue();
    if (environmentIssue) {
      return { ok: false, message: environmentIssue };
    }

    let subscription = await this.getCurrentPushSubscription();
    if (!subscription) {
      const enabled = await this.enablePushForCurrentProfile(profileId);
      if (!enabled.ok) {
        return { ok: false, message: enabled.message };
      }
      subscription = await this.getCurrentPushSubscription();
    }

    if (!subscription) {
      return {
        ok: false,
        message: "subscription محلی یافت نشد. دوباره فعال‌سازی نوتیفیکیشن را بزنید.",
      };
    }

    const synced = await this.syncForCurrentProfile(profileId);
    if (!synced.ok) {
      return {
        ok: false,
        message: synced.message,
        deviceToken: subscription,
      };
    }

    return {
      ok: true,
      message: synced.message,
      deviceToken: subscription,
    };
  }

  handleNotificationData(data?: Record<string, string>): void {
    if (!data) return;

    if (data["type"] === "RealtimeLead" && data["leadId"]) {
      this.router.navigate(["/dashboard/consultant"], {
        queryParams: {
          section: "leads",
          type: "realtime",
          leadAssignmentId: data["leadId"],
        },
      });
      return;
    }

    if (data["type"] === "test_push") {
      this.router.navigate(["/dashboard/consultant"]);
    }
  }

  async registerForConsultantOnLogin(): Promise<PushSyncResult> {
    const user = this.auth.user();
    const profileId = user?.consultantProfileId ?? user?.profileId ?? null;
    const permission = this.notifications.getPermissionStatus();

    if (permission === "default" && profileId) {
      return this.enablePushForCurrentProfile(profileId);
    }

    return this.syncPushRegistrationIfReady(profileId);
  }

  needsPushUserActivation(): boolean {
    const permission = this.notifications.getPermissionStatus();
    return permission === "default" || permission === "unsupported";
  }

  async syncPushRegistrationIfReady(
    profileId?: number | null,
  ): Promise<PushSyncResult> {
    const user = this.auth.user();
    if (!user || !this.auth.authToken() || user.role !== "consultant") {
      return { ok: false, message: "ثبت Web Push فقط برای مشاور لازم است." };
    }

    const environmentIssue = this.notifications.getEnvironmentIssue();
    if (environmentIssue) {
      return { ok: false, message: environmentIssue };
    }

    const resolvedProfileId =
      profileId ?? user.consultantProfileId ?? user.profileId ?? null;
    const permission = this.notifications.getPermissionStatus();
    if (permission === "denied") {
      return {
        ok: false,
        message: "اجازه نوتیفیکیشن رد شده است. از تنظیمات مرورگر/PWA دوباره فعال کنید.",
      };
    }

    if (permission !== "granted") {
      return {
        ok: false,
        message: "برای فعال‌سازی نوتیفیکیشن، دکمه «فعال‌سازی نوتیفیکیشن» را بزنید.",
      };
    }

    const subscription = await this.getCurrentPushSubscription();
    if (!subscription) {
      return this.enablePushForCurrentProfile(resolvedProfileId);
    }

    return this.syncForCurrentProfile(resolvedProfileId);
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === "object" && error !== null && "error" in error) {
      const httpError = error as {
        error?: { message?: string } | string;
        message?: string;
      };
      if (typeof httpError.error === "object" && httpError.error?.message) {
        return httpError.error.message;
      }
      if (typeof httpError.error === "string" && httpError.error) {
        return httpError.error;
      }
      if (httpError.message) return httpError.message;
    }
    return fallback;
  }

  private handleForegroundMessage(payload: WebPushMessagePayload): void {
    const pushType = payload.data?.["type"];
    if (
      pushType &&
      pushType !== "test_push" &&
      pushType !== "RealtimeLead"
    ) {
      return;
    }

    const title = payload.title || this.titleForData(payload.data);
    const body = payload.body || this.bodyForData(payload.data);
    const detail: ConsultantPushMessageDetail = {
      title,
      body,
      data: payload.data,
    };

    if (pushType === "RealtimeLead") {
      playRealtimeLeadAlertSound();
    }

    window.dispatchEvent(
      new CustomEvent("consultant-push-message", { detail }),
    );
  }

  private titleForData(data?: Record<string, string>): string {
    if (data?.["type"] === "RealtimeLead") return "لید جدید!";
    if (data?.["type"] === "test_push") return "تست نوتیفیکیشن";
    return "اعلان جدید";
  }

  private bodyForData(data?: Record<string, string>): string {
    if (data?.["type"] === "RealtimeLead") {
      return "یک لید لحظه‌ای آماده دریافت است. سریع برداریدش!";
    }
    if (data?.["type"] === "test_push") {
      return "اگر این پیام را می‌بینید، Web Push روی PWA شما فعال است.";
    }
    return "برای مشاهده جزئیات وارد داشبورد شوید.";
  }
}
