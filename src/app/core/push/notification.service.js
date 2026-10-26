 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { firstValueFrom } from "rxjs";
import { environment } from "../../../environments/environment";
import { getWebPushVapidPublicKey } from "./web-push-environment";
import {
  canAttemptPushNotifications,
  getPushEnvironmentHint,
  getPushEnvironmentIssue,
  getPushEnvironmentWarning,
  getPushManagerUnavailableMessage,
  hasBasicNotificationApis,
} from "./pwa-environment";

export const WEB_PUSH_SERVICE_WORKER_URL =
  "/web-push-scope/web-push-sw.js";














@Injectable({ providedIn: "root" })
export class NotificationService {
   __init() {this.swRegistration = null}
   __init2() {this.lastKnownSubscription = null}
   __init3() {this.resolvedVapidPublicKey = null}
   __init4() {this.pushManagerAvailable = null}
    __init5() {this.tokenRefreshListeners = new Set()}
    __init6() {this.subscriptionLostListeners = new Set()}
    __init7() {this.foregroundListeners = new Set

()}

  constructor( http) {;this.http = http;NotificationService.prototype.__init.call(this);NotificationService.prototype.__init2.call(this);NotificationService.prototype.__init3.call(this);NotificationService.prototype.__init4.call(this);NotificationService.prototype.__init5.call(this);NotificationService.prototype.__init6.call(this);NotificationService.prototype.__init7.call(this);
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (_optionalChain([event, 'access', _ => _.data, 'optionalAccess', _2 => _2.type]) === "web-push-subscription-lost") {
          this.handleSubscriptionLost();
          return;
        }

        const secretaryTypes = [
          "ReservationSecretaryNoAnswer",
          "ReservationSecretaryConfirmed",
          "ReservationSecretaryCancelled",
        ];
        if (
          _optionalChain([event, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.type]) !== "web-push-message" &&
          _optionalChain([event, 'access', _5 => _5.data, 'optionalAccess', _6 => _6.type]) !== "RealtimeLead" &&
          !secretaryTypes.includes(_optionalChain([event, 'access', _7 => _7.data, 'optionalAccess', _8 => _8.type]))
        ) {
          return;
        }
        const payload = this.normalizePayload(event.data.payload);
        console.log("[NotificationService] Foreground push received", payload);
        for (const listener of this.foregroundListeners) {
          listener(payload);
        }
      });
    }
  }

  getPermissionStatus() {
    if (!this.canUseNotifications()) return "unsupported";
    return Notification.permission;
  }

  isSupported() {
    return this.canUseNotifications();
  }

  getEnvironmentIssue() {
    return getPushEnvironmentIssue();
  }

  getEnvironmentWarning() {
    return getPushEnvironmentWarning();
  }

  getEnvironmentHint() {
    return getPushEnvironmentHint();
  }

  async getWebPushRegistration() {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return null;
    }

    try {
      const existing = await navigator.serviceWorker.getRegistration(
        "/web-push-scope/",
      );
      if (_optionalChain([existing, 'optionalAccess', _9 => _9.active])) return existing;

      return await this.ensureServiceWorkerRegistration();
    } catch (error) {
      console.warn("Web Push service worker registration is unavailable", error);
      return null;
    }
  }

  async showLocalNotification(
    title,
    body,
    options





 = {},
  ) {
    if (!hasBasicNotificationApis() || Notification.permission !== "granted") {
      return false;
    }

    const notificationOptions = {
      body,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      tag: _nullishCoalesce(options.tag, () => ( "consultant-notification")),
      renotify: true,
      requireInteraction: _nullishCoalesce(options.requireInteraction, () => ( false)),
      data: options.data,
      silent: false,
      vibrate: options.vibrate,
      sound: options.sound,
    } 



;

    try {
      const registration = await this.getWebPushRegistration();
      if (_optionalChain([registration, 'optionalAccess', _10 => _10.showNotification])) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    } catch (error) {
      console.error(
        "[NotificationService] Service worker notification failed",
        error,
      );
      // Fall back to the Notification constructor below.
    }

    try {
      new Notification(title, notificationOptions);
      return true;
    } catch (error) {
      console.error("[NotificationService] Local notification failed", error);
      return false;
    }
  }

  async requestBasicNotificationPermission() {
    if (!hasBasicNotificationApis()) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    return Notification.requestPermission();
  }

  async enablePushNotifications() {
    const environmentIssue = getPushEnvironmentIssue();
    if (environmentIssue) {
      return {
        ok: false,
        permission: "unsupported",
        message: environmentIssue,
      };
    }

    const pushManager = await this.resolvePushManager();
    if (!pushManager) {
      return {
        ok: false,
        permission: "unsupported",
        message: getPushManagerUnavailableMessage(),
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

  async getSubscriptionJson() {
    if (!this.canUseNotifications()) return null;
    if (Notification.permission !== "granted") return null;

    const pushManager = await this.resolvePushManager();
    if (!pushManager) return null;

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

  onTokenRefresh(listener) {
    this.tokenRefreshListeners.add(listener);
    return () => this.tokenRefreshListeners.delete(listener);
  }

  onSubscriptionLost(listener) {
    this.subscriptionLostListeners.add(listener);
    return () => this.subscriptionLostListeners.delete(listener);
  }

  async refreshPushSubscription() {
    this.swRegistration = null;
    this.lastKnownSubscription = null;
    this.pushManagerAvailable = null;
    return this.getSubscriptionJson();
  }

  onForegroundMessage(
    listener,
  ) {
    this.foregroundListeners.add(listener);
    return () => this.foregroundListeners.delete(listener);
  }

  getLastKnownSubscription() {
    return this.lastKnownSubscription;
  }

  async closeRealtimeLeadNotification(leadId) {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const registration = await this.getWebPushRegistration();
    if (!registration) return;

    const tag = `realtime-lead-${leadId}`;
    const notifications = await registration.getNotifications({ tag });
    notifications.forEach((notification) => notification.close());

    await this.postMessageToWebPushWorker({
      type: "CloseRealtimeLeadNotification",
      leadId,
    });
  }

  async postMessageToWebPushWorker(message) {
    const registration = await this.getWebPushRegistration();
    _optionalChain([registration, 'optionalAccess', _11 => _11.active, 'optionalAccess', _12 => _12.postMessage, 'call', _13 => _13(message)]);
  }

   async subscribeWithVapidKey(
    vapidPublicKey,
  ) {
    const registration = await this.ensureServiceWorkerRegistration();
    const pushManager = registration.pushManager;
    if (!pushManager) return null;

    let subscription = await pushManager.getSubscription();

    if (!subscription) {
      subscription = await pushManager.subscribe({
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

   async resolveVapidPublicKey() {
    if (this.resolvedVapidPublicKey) return this.resolvedVapidPublicKey;

    const fromRuntime = getWebPushVapidPublicKey();
    if (fromRuntime) {
      this.resolvedVapidPublicKey = fromRuntime;
      return fromRuntime;
    }

    try {
      const response = await firstValueFrom(
        this.http.get(
          `${environment.apiBaseUrl}/Consultant/WebPushPublicKey`,
        ),
      );
      const isSuccess = Boolean(_nullishCoalesce(response["isSuccess"], () => ( response["IsSuccess"])));
      const data = _nullishCoalesce(response["data"], () => ( response["Data"]));
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

   notifyTokenRefresh(token) {
    for (const listener of this.tokenRefreshListeners) {
      listener(token);
    }
  }

   async resolvePushManager() {
    if (this.pushManagerAvailable === false) return null;

    try {
      const registration = await this.ensureServiceWorkerRegistration();
      const pushManager = _nullishCoalesce(registration.pushManager, () => ( null));
      this.pushManagerAvailable = Boolean(pushManager);
      return pushManager;
    } catch (error) {
      console.warn("Web Push service worker could not be prepared", error);
      this.pushManagerAvailable = false;
      return null;
    }
  }

   async ensureServiceWorkerRegistration() {
    if (_optionalChain([this, 'access', _14 => _14.swRegistration, 'optionalAccess', _15 => _15.active])) {
      await this.swRegistration.update().catch((error) => {
        console.warn("[NotificationService] Service worker update failed", error);
      });
      return this.swRegistration;
    }

    const registration = await navigator.serviceWorker.register(
      WEB_PUSH_SERVICE_WORKER_URL,
      { scope: "/web-push-scope/" },
    );

    await this.waitForRegistrationActivation(registration);
    this.swRegistration = registration;
    return registration;
  }

   async waitForRegistrationActivation(
    registration,
  ) {
    if (registration.active) return;

    const installingWorker = _nullishCoalesce(registration.installing, () => ( registration.waiting));
    if (!installingWorker) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      if (registration.active) return;
      throw new Error("Web Push service worker is not active");
    }

    await new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Web Push service worker activation timed out"));
      }, 15000);

      const handleStateChange = () => {
        if (registration.active) {
          clearTimeout(timeoutId);
          installingWorker.removeEventListener("statechange", handleStateChange);
          resolve();
        }

        if (installingWorker.state === "redundant") {
          clearTimeout(timeoutId);
          installingWorker.removeEventListener("statechange", handleStateChange);
          reject(new Error("Web Push service worker became redundant"));
        }
      };

      installingWorker.addEventListener("statechange", handleStateChange);
      handleStateChange();
    });
  }

   normalizePayload(payload) {
    if (typeof payload !== "object" || payload === null) {
      return { title: "اعلان جدید", body: "" };
    }

    const record = payload ;
    const sourceData =
      typeof record["data"] === "object" && record["data"] !== null
        ? (record["data"] )
        : undefined;
    const rootType = typeof record["type"] === "string" ? record["type"] : undefined;
    const data = rootType ? { ...sourceData, type: rootType } : sourceData;

    return {
      title:
        typeof record["title"] === "string" ? record["title"] : "اعلان جدید",
      body:
        typeof record["message"] === "string"
          ? record["message"]
          : typeof record["body"] === "string" ? record["body"] : "",
      data,
    };
  }

   urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length) ;
    for (let index = 0; index < rawData.length; index += 1) {
      outputArray[index] = rawData.charCodeAt(index);
    }
    return outputArray;
  }

   canUseNotifications() {
    return canAttemptPushNotifications();
  }

   handleSubscriptionLost() {
    this.swRegistration = null;
    this.lastKnownSubscription = null;
    this.pushManagerAvailable = null;

    for (const listener of this.subscriptionLostListeners) {
      listener();
    }
  }
}
