 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { firstValueFrom } from "rxjs";






import {
  PUSH_BACKEND_SYNC_INTERVAL_MS,
  PUSH_SUBSCRIPTION_HEALTH_CHECK_MS,
} from "./lead-alert.constants";
import {
  buildRealtimeLeadNotificationBody,
  buildRealtimeLeadNotificationTitle,
  resolveRealtimeLeadNotificationBody,
  resolveRealtimeLeadNotificationTitle,
} from "../lead/lead-alert-copy";












@Injectable({ providedIn: "root" })
export class PushNotificationService {
   __init() {this.lastRegisteredKey = null}
   __init2() {this.lastBackendSyncAt = 0}
   __init3() {this.tokenSyncPromise = null}
   __init4() {this.backendRegistrationReady = false}
   __init5() {this.subscriptionHealthTimer = null}

  constructor(
     consultantApi,
     auth,
     router,
     notifications,
  ) {;this.consultantApi = consultantApi;this.auth = auth;this.router = router;this.notifications = notifications;PushNotificationService.prototype.__init.call(this);PushNotificationService.prototype.__init2.call(this);PushNotificationService.prototype.__init3.call(this);PushNotificationService.prototype.__init4.call(this);PushNotificationService.prototype.__init5.call(this);
    if (typeof window !== "undefined") {
      window.addEventListener("focus", () => {
        void this.handleClientActivation();
      });
      window.addEventListener("online", () => {
        void this.handleClientActivation();
      });
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          void this.handleClientActivation();
        }
      });
      this.notifications.onTokenRefresh(() => {
        this.lastBackendSyncAt = 0;
        void this.syncForCurrentProfile();
      });
      this.notifications.onSubscriptionLost(() => {
        this.resetRegisteredTokenCache();
        void this.recoverPushSubscription();
      });
      this.notifications.onForegroundMessage((payload) =>
        this.handleForegroundMessage(payload),
      );
      this.startSubscriptionHealthCheck();
    }
  }

  isBackendRegistrationReady() {
    return this.backendRegistrationReady;
  }

  async syncForCurrentProfile(
    profileId,
  ) {
    if (this.tokenSyncPromise) return this.tokenSyncPromise;

    this.tokenSyncPromise = this.syncToken(profileId).finally(() => {
      this.tokenSyncPromise = null;
    });

    return this.tokenSyncPromise;
  }

   async syncToken(profileId) {
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
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(profileId, () => ( user.consultantProfileId)), () => ( user.profileId)), () => ( null));
    const registrationKey = `${_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(user.userId, () => ( resolvedProfileId)), () => ( user.phoneNumber)), () => ( "user"))}:${subscriptionJson}`;

    const recentlySynced =
      this.lastRegisteredKey === registrationKey &&
      this.backendRegistrationReady &&
      Date.now() - this.lastBackendSyncAt < PUSH_BACKEND_SYNC_INTERVAL_MS;

    if (recentlySynced) {
      return { ok: true, message: "subscription قبلاً روی سرور ثبت شده است." };
    }

    const registered = await this.registerSubscriptionWithBackend(
      subscriptionJson,
      resolvedProfileId,
    );
    this.backendRegistrationReady = registered.ok;
    if (registered.ok) {
      this.lastRegisteredKey = registrationKey;
      this.lastBackendSyncAt = Date.now();
    } else {
      this.lastRegisteredKey = null;
    }

    return registered;
  }

   async registerSubscriptionWithBackend(
    subscriptionJson,
    profileId,
  ) {
    if (_optionalChain([this, 'access', _ => _.auth, 'access', _2 => _2.user, 'call', _3 => _3(), 'optionalAccess', _4 => _4.userId])) {
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

  resetRegisteredTokenCache() {
    this.lastRegisteredKey = null;
    this.lastBackendSyncAt = 0;
    this.backendRegistrationReady = false;
  }

  async recoverPushSubscription() {
    const user = this.auth.user();
    if (!user || !this.auth.authToken()) {
      return { ok: false, message: "برای بازیابی نوتیفیکیشن ابتدا وارد حساب شوید." };
    }

    if (user.role !== "consultant") {
      return { ok: false, message: "بازیابی Web Push فقط برای مشاور لازم است." };
    }

    const environmentIssue = this.notifications.getEnvironmentIssue();
    if (environmentIssue) {
      return { ok: false, message: environmentIssue };
    }

    if (this.notifications.getPermissionStatus() !== "granted") {
      return {
        ok: false,
        message: "اجازه نوتیفیکیشن داده نشده است. دوباره فعال‌سازی را بزنید.",
      };
    }

    const profileId = _nullishCoalesce(_nullishCoalesce(user.consultantProfileId, () => ( user.profileId)), () => ( null));
    const refreshed = await this.notifications.refreshPushSubscription();
    if (!refreshed) {
      return this.enablePushForCurrentProfile(profileId);
    }

    this.resetRegisteredTokenCache();
    return this.syncForCurrentProfile(profileId);
  }

  async getCurrentPushSubscription() {
    return this.notifications.getSubscriptionJson();
  }

  async enablePushForCurrentProfile(
    profileId,
  ) {
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
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(profileId, () => (
      _optionalChain([this, 'access', _5 => _5.auth, 'access', _6 => _6.user, 'call', _7 => _7(), 'optionalAccess', _8 => _8.consultantProfileId]))), () => (
      _optionalChain([this, 'access', _9 => _9.auth, 'access', _10 => _10.user, 'call', _11 => _11(), 'optionalAccess', _12 => _12.profileId]))), () => (
      null));

    const registered = await this.registerSubscriptionWithBackend(
      result.subscriptionJson,
      resolvedProfileId,
    );
    this.backendRegistrationReady = registered.ok;
    if (registered.ok) {
      const user = this.auth.user();
      this.lastRegisteredKey = `${_nullishCoalesce(_nullishCoalesce(_optionalChain([user, 'optionalAccess', _13 => _13.userId]), () => ( resolvedProfileId)), () => ( "user"))}:${result.subscriptionJson}`;
      this.lastBackendSyncAt = Date.now();
      return { ok: true, message: "نوتیفیکیشن فعال و روی سرور ثبت شد." };
    }

    this.lastRegisteredKey = null;
    return {
      ok: false,
      message: `${registered.message} (روی گوشی فعال است ولی سرور هنوز subscription ندارد)`,
    };
  }

  async prepareTestPush(profileId)



 {
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

  handleNotificationData(data) {
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

  async registerForConsultantOnLogin() {
    const user = this.auth.user();
    const profileId = _nullishCoalesce(_nullishCoalesce(_optionalChain([user, 'optionalAccess', _14 => _14.consultantProfileId]), () => ( _optionalChain([user, 'optionalAccess', _15 => _15.profileId]))), () => ( null));
    const permission = this.notifications.getPermissionStatus();

    if (permission === "default" && profileId) {
      return this.enablePushForCurrentProfile(profileId);
    }

    return this.syncPushRegistrationIfReady(profileId);
  }

  needsPushUserActivation() {
    const permission = this.notifications.getPermissionStatus();
    return permission === "default" || permission === "unsupported";
  }

  async syncPushRegistrationIfReady(
    profileId,
  ) {
    const user = this.auth.user();
    if (!user || !this.auth.authToken() || user.role !== "consultant") {
      return { ok: false, message: "ثبت Web Push فقط برای مشاور لازم است." };
    }

    const environmentIssue = this.notifications.getEnvironmentIssue();
    if (environmentIssue) {
      return { ok: false, message: environmentIssue };
    }

    const resolvedProfileId =
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(profileId, () => ( user.consultantProfileId)), () => ( user.profileId)), () => ( null));
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

   async handleClientActivation() {
    const user = this.auth.user();
    if (!user || !this.auth.authToken()) return;

    if (user.role === "consultant") {
      await this.syncPushRegistrationIfReady();
      return;
    }

    await this.syncForCurrentProfile();
  }

   startSubscriptionHealthCheck() {
    if (this.subscriptionHealthTimer) return;

    this.subscriptionHealthTimer = setInterval(() => {
      const user = this.auth.user();
      if (!user || user.role !== "consultant" || !this.auth.authToken()) return;
      if (document.visibilityState !== "visible") return;

      void this.syncPushRegistrationIfReady();
    }, PUSH_SUBSCRIPTION_HEALTH_CHECK_MS);
  }

   extractErrorMessage(error, fallback) {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === "object" && error !== null && "error" in error) {
      const httpError = error 


;
      if (typeof httpError.error === "object" && _optionalChain([httpError, 'access', _16 => _16.error, 'optionalAccess', _17 => _17.message])) {
        return httpError.error.message;
      }
      if (typeof httpError.error === "string" && httpError.error) {
        return httpError.error;
      }
      if (httpError.message) return httpError.message;
    }
    return fallback;
  }

   handleForegroundMessage(payload) {
    const pushType = _optionalChain([payload, 'access', _18 => _18.data, 'optionalAccess', _19 => _19["type"]]);
    const secretaryTypes = [
      "ReservationSecretaryNoAnswer",
      "ReservationSecretaryConfirmed",
      "ReservationSecretaryCancelled",
    ];
    if (
      pushType &&
      pushType !== "test_push" &&
      pushType !== "RealtimeLead" &&
      !secretaryTypes.includes(pushType)
    ) {
      return;
    }

    const title =
      pushType === "RealtimeLead"
        ? resolveRealtimeLeadNotificationTitle(
            {
              leadLimitType:
                _optionalChain([payload, 'access', _20 => _20.data, 'optionalAccess', _21 => _21["leadLimitType"]]) === "Burnt"
                  ? "Burnt"
                  : "Realtime",
              userName: _nullishCoalesce(_optionalChain([payload, 'access', _22 => _22.data, 'optionalAccess', _23 => _23["userName"]]), () => ( _optionalChain([payload, 'access', _24 => _24.data, 'optionalAccess', _25 => _25["UserName"]]))),
              phoneNumber:
                _nullishCoalesce(_optionalChain([payload, 'access', _26 => _26.data, 'optionalAccess', _27 => _27["phoneNumber"]]), () => ( _optionalChain([payload, 'access', _28 => _28.data, 'optionalAccess', _29 => _29["PhoneNumber"]]))),
              isReminder: _optionalChain([payload, 'access', _30 => _30.data, 'optionalAccess', _31 => _31["isReminder"]]) === "true",
            },
            payload.title,
          )
        : payload.title || this.titleForData(payload.data);
    const body =
      pushType === "RealtimeLead"
        ? resolveRealtimeLeadNotificationBody(
            {
              leadLimitType:
                _optionalChain([payload, 'access', _32 => _32.data, 'optionalAccess', _33 => _33["leadLimitType"]]) === "Burnt"
                  ? "Burnt"
                  : "Realtime",
              userName: _nullishCoalesce(_optionalChain([payload, 'access', _34 => _34.data, 'optionalAccess', _35 => _35["userName"]]), () => ( _optionalChain([payload, 'access', _36 => _36.data, 'optionalAccess', _37 => _37["UserName"]]))),
              phoneNumber:
                _nullishCoalesce(_optionalChain([payload, 'access', _38 => _38.data, 'optionalAccess', _39 => _39["phoneNumber"]]), () => ( _optionalChain([payload, 'access', _40 => _40.data, 'optionalAccess', _41 => _41["PhoneNumber"]]))),
              isReminder: _optionalChain([payload, 'access', _42 => _42.data, 'optionalAccess', _43 => _43["isReminder"]]) === "true",
            },
            payload.body,
          )
        : payload.body || this.bodyForData(payload.data);
    const detail = {
      title,
      body,
      data: payload.data,
    };

    window.dispatchEvent(
      new CustomEvent("consultant-push-message", { detail }),
    );
  }

   titleForData(data) {
    if (_optionalChain([data, 'optionalAccess', _44 => _44["type"]]) === "RealtimeLead") {
      return buildRealtimeLeadNotificationTitle({
        leadLimitType:
          data["leadLimitType"] === "Burnt" ? "Burnt" : "Realtime",
        userName: _nullishCoalesce(data["userName"], () => ( data["UserName"])),
        phoneNumber: _nullishCoalesce(data["phoneNumber"], () => ( data["PhoneNumber"])),
        isReminder: data["isReminder"] === "true",
      });
    }
    if (_optionalChain([data, 'optionalAccess', _45 => _45["type"]]) === "test_push") return "تست نوتیفیکیشن";
    return "اعلان جدید";
  }

   bodyForData(data) {
    if (_optionalChain([data, 'optionalAccess', _46 => _46["type"]]) === "RealtimeLead") {
      return buildRealtimeLeadNotificationBody({
        leadLimitType:
          data["leadLimitType"] === "Burnt" ? "Burnt" : "Realtime",
        userName: _nullishCoalesce(data["userName"], () => ( data["UserName"])),
        phoneNumber: _nullishCoalesce(data["phoneNumber"], () => ( data["PhoneNumber"])),
        isReminder: data["isReminder"] === "true",
      });
    }
    if (_optionalChain([data, 'optionalAccess', _47 => _47["type"]]) === "test_push") {
      return "اگر این پیام را می‌بینید، Web Push روی PWA شما فعال است.";
    }
    return "برای مشاهده جزئیات وارد داشبورد شوید.";
  }
}
