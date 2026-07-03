import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import { getWebPushVapidPublicKey } from "./web-push-environment";

export const WEB_PUSH_SERVICE_WORKER_URL =
  "/web-push-scope/web-push-sw.js";

export interface WebPushMessagePayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface EnablePushResult {
  ok: boolean;
  permission: NotificationPermission | "unsupported";
  message: string;
  subscriptionJson?: string;
}

@Injectable({ providedIn: "root" })
export class NotificationService {
  private swRegistration: ServiceWorkerRegistration | null = null;
  private lastKnownSubscription: string | null = null;
  private resolvedVapidPublicKey: string | null = null;
  private readonly tokenRefreshListeners = new Set<(token: string) => void>();
  private readonly foregroundListeners = new Set<
    (payload: WebPushMessagePayload) => void
  >();

  constructor(private http: HttpClient) {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type !== "web-push-message") return;
        const payload = this.normalizePayload(event.data.payload);
        for (const listener of this.foregroundListeners) {
          listener(payload);
        }
      });
    }
  }

  getPermissionStatus(): NotificationPermission | "unsupported" {
    if (!this.canUseNotifications()) return "unsupported";
    return Notification.permission;
  }

  isSupported(): boolean {
    return this.canUseNotifications();
  }

  async enablePushNotifications(): Promise<EnablePushResult> {
    if (!this.canUseNotifications()) {
      return {
        ok: false,
        permission: "unsupported",
        message:
          "مرورگر یا حالت فعلی از نوتیفیکیشن PWA پشتیبانی نمی‌کند. روی اندروید PWA را نصب کنید؛ روی iOS حتماً Add to Home Screen بزنید.",
      };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        ok: false,
        permission,
        message:
          permission === "denied"
            ? "اجازه نوتیفیکیشن رد شده است. از تنظیمات مرورگر یا PWA دوباره فعال کنید."
            : "اجازه نوتیفیکیشن داده نشد.",
      };
    }

    const vapidPublicKey = await this.resolveVapidPublicKey();
    if (!vapidPublicKey) {
      return {
        ok: false,
        permission,
        message:
          "کلید Web Push پیکربندی نشده است. WEBPUSH_VAPID_PUBLIC_KEY را در Netlify و بک‌اند ست کنید.",
      };
    }

    try {
      const subscriptionJson = await this.subscribeWithVapidKey(vapidPublicKey);
      if (!subscriptionJson) {
        return {
          ok: false,
          permission,
          message: "ثبت subscription انجام نشد.",
        };
      }

      return {
        ok: true,
        permission,
        message: "نوتیفیکیشن فعال شد.",
        subscriptionJson,
      };
    } catch (error) {
      console.warn("Web Push subscription could not be created", error);
      return {
        ok: false,
        permission,
        message: "خطا در فعال‌سازی Web Push. PWA را یک‌بار ببندید و دوباره امتحان کنید.",
      };
    }
  }

  async getSubscriptionJson(): Promise<string | null> {
    if (!this.canUseNotifications()) return null;
    if (Notification.permission !== "granted") return null;

    const vapidPublicKey = await this.resolveVapidPublicKey();
    if (!vapidPublicKey) {
      console.warn(
        "Web Push is not configured. Set WEBPUSH_VAPID_PUBLIC_KEY before build or configure backend.",
      );
      return null;
    }

    try {
      return await this.subscribeWithVapidKey(vapidPublicKey);
    } catch (error) {
      console.warn("Web Push subscription could not be refreshed", error);
      return null;
    }
  }

  onTokenRefresh(listener: (token: string) => void): () => void {
    this.tokenRefreshListeners.add(listener);
    return () => this.tokenRefreshListeners.delete(listener);
  }

  onForegroundMessage(
    listener: (payload: WebPushMessagePayload) => void,
  ): () => void {
    this.foregroundListeners.add(listener);
    return () => this.foregroundListeners.delete(listener);
  }

  getLastKnownSubscription(): string | null {
    return this.lastKnownSubscription;
  }

  private async subscribeWithVapidKey(
    vapidPublicKey: string,
  ): Promise<string | null> {
    const registration = await this.ensureServiceWorkerRegistration();
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });
    }

    const subscriptionJson = JSON.stringify(subscription.toJSON());
    if (subscriptionJson && subscriptionJson !== this.lastKnownSubscription) {
      this.lastKnownSubscription = subscriptionJson;
      console.log("[NotificationService] Web Push subscription ready");
      this.notifyTokenRefresh(subscriptionJson);
    }

    return subscriptionJson;
  }

  private async resolveVapidPublicKey(): Promise<string | null> {
    if (this.resolvedVapidPublicKey) return this.resolvedVapidPublicKey;

    const fromRuntime = getWebPushVapidPublicKey();
    if (fromRuntime) {
      this.resolvedVapidPublicKey = fromRuntime;
      return fromRuntime;
    }

    try {
      const response = await firstValueFrom(
        this.http.get<Record<string, unknown>>(
          `${environment.apiBaseUrl}/Consultant/WebPushPublicKey`,
        ),
      );
      const isSuccess = Boolean(response["isSuccess"] ?? response["IsSuccess"]);
      const data = response["data"] ?? response["Data"];
      const publicKey = typeof data === "string" ? data.trim() : "";
      if (isSuccess && publicKey) {
        this.resolvedVapidPublicKey = publicKey;
        return publicKey;
      }
    } catch (error) {
      console.warn("WebPush public key could not be loaded from backend", error);
    }

    return null;
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
      WEB_PUSH_SERVICE_WORKER_URL,
      { scope: "/web-push-scope/" },
    );
    await navigator.serviceWorker.ready;
    this.swRegistration = registration;
    return registration;
  }

  private normalizePayload(payload: unknown): WebPushMessagePayload {
    if (typeof payload !== "object" || payload === null) {
      return { title: "اعلان جدید", body: "" };
    }

    const record = payload as Record<string, unknown>;
    const data =
      typeof record["data"] === "object" && record["data"] !== null
        ? (record["data"] as Record<string, string>)
        : undefined;

    return {
      title:
        typeof record["title"] === "string" ? record["title"] : "اعلان جدید",
      body: typeof record["body"] === "string" ? record["body"] : "",
      data,
    };
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length) as Uint8Array<ArrayBuffer>;
    for (let index = 0; index < rawData.length; index += 1) {
      outputArray[index] = rawData.charCodeAt(index);
    }
    return outputArray;
  }

  private canUseNotifications(): boolean {
    return (
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window
    );
  }
}
