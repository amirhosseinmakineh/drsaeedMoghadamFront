 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

import { Subject, catchError, firstValueFrom, of } from "rxjs";






import {
  startRealtimeLeadAlertSoundLoop,
  stopRealtimeLeadAlertSoundLoop,
} from "../push/lead-alert-sound";
import { REALTIME_LEAD_VIBRATE_PATTERN } from "../push/lead-alert.constants";

import {

  normalizeLeadField,
  resolveRealtimeLeadNotificationBody,
  resolveRealtimeLeadNotificationTitle,
} from "./lead-alert-copy";























const DISMISSED_LEAD_COOLDOWN_MS = 10000;
const REMINDER_INTERVAL_MS = 6000;

@Injectable({ providedIn: "root" })
export class RealtimeLeadAlertService  {
    __init() {this.alertsSubject = new Subject()}
    __init2() {this.activeAlerts = new Map()}
    __init3() {this.handledLeadIds = new Set()}
    __init4() {this.dismissedLeadCooldownTimers = new Map


()}
    __init5() {this.processingLeadIds = new Set()}
    __init6() {this.awaitingPickupLeadIds = new Set()}
   __init7() {this.initialized = false}
   __init8() {this.pollTimer = null}
   __init9() {this.pollingProfileId = null}
   __init10() {this.pollingInFlight = false}
    __init11() {this.onServiceWorkerMessage = (
    event,
  ) => {
    void this.handleServiceWorkerMessage(event.data);
  }}
    __init12() {this.onPushMessage = (event) => {
    const detail = (
      event 




    ).detail;
    const leadId = Number(_optionalChain([detail, 'optionalAccess', _21 => _21.data, 'optionalAccess', _22 => _22["leadId"]]));
    if (
      _optionalChain([detail, 'optionalAccess', _23 => _23.data, 'optionalAccess', _24 => _24["type"]]) !== "RealtimeLead" ||
      !Number.isFinite(leadId) ||
      leadId <= 0
    ) {
      if (_optionalChain([detail, 'optionalAccess', _25 => _25.data, 'optionalAccess', _26 => _26["type"]]) === "RealtimeLead") {
        console.error("Invalid leadId in push payload", detail);
      }
      return;
    }

    const leadLimitType =
      _optionalChain([detail, 'access', _27 => _27.data, 'optionalAccess', _28 => _28["leadLimitType"]]) === "Burnt" ? "Burnt" : "Realtime";

    void this.notifyIncomingLead(leadId, {
      leadLimitType,
      userName: _nullishCoalesce(_optionalChain([detail, 'optionalAccess', _29 => _29.data, 'optionalAccess', _30 => _30["userName"]]), () => ( _optionalChain([detail, 'optionalAccess', _31 => _31.data, 'optionalAccess', _32 => _32["UserName"]]))),
      phoneNumber:
        _nullishCoalesce(_optionalChain([detail, 'optionalAccess', _33 => _33.data, 'optionalAccess', _34 => _34["phoneNumber"]]), () => ( _optionalChain([detail, 'optionalAccess', _35 => _35.data, 'optionalAccess', _36 => _36["PhoneNumber"]]))),
      isReminder: _optionalChain([detail, 'optionalAccess', _37 => _37.data, 'optionalAccess', _38 => _38["isReminder"]]) === "true",
      title: _optionalChain([detail, 'optionalAccess', _39 => _39.title]),
      body: _optionalChain([detail, 'optionalAccess', _40 => _40.body]),
    });
  }}

   __init13() {this.alerts$ = this.alertsSubject.asObservable()}

  constructor(
      auth,
      consultantApi,
      pickupService,
      notifications,
      toast,
      router,
  ) {;this.auth = auth;this.consultantApi = consultantApi;this.pickupService = pickupService;this.notifications = notifications;this.toast = toast;this.router = router;RealtimeLeadAlertService.prototype.__init.call(this);RealtimeLeadAlertService.prototype.__init2.call(this);RealtimeLeadAlertService.prototype.__init3.call(this);RealtimeLeadAlertService.prototype.__init4.call(this);RealtimeLeadAlertService.prototype.__init5.call(this);RealtimeLeadAlertService.prototype.__init6.call(this);RealtimeLeadAlertService.prototype.__init7.call(this);RealtimeLeadAlertService.prototype.__init8.call(this);RealtimeLeadAlertService.prototype.__init9.call(this);RealtimeLeadAlertService.prototype.__init10.call(this);RealtimeLeadAlertService.prototype.__init11.call(this);RealtimeLeadAlertService.prototype.__init12.call(this);RealtimeLeadAlertService.prototype.__init13.call(this);RealtimeLeadAlertService.prototype.__init14.call(this);}

  initialize() {
    if (this.initialized || typeof window === "undefined") return;

    this.initialized = true;
    _optionalChain([navigator, 'access', _41 => _41.serviceWorker, 'optionalAccess', _42 => _42.addEventListener, 'call', _43 => _43(
      "message",
      this.onServiceWorkerMessage,
    )]);
    window.addEventListener("consultant-push-message", this.onPushMessage);
  }

  ngOnDestroy() {
    this.stopPolling();
    for (const leadId of this.awaitingPickupLeadIds) {
      stopRealtimeLeadAlertSoundLoop(leadId);
    }
    this.awaitingPickupLeadIds.clear();
    for (const timer of this.dismissedLeadCooldownTimers.values()) {
      clearTimeout(timer);
    }
    this.dismissedLeadCooldownTimers.clear();
    _optionalChain([navigator, 'access', _44 => _44.serviceWorker, 'optionalAccess', _45 => _45.removeEventListener, 'call', _46 => _46(
      "message",
      this.onServiceWorkerMessage,
    )]);
    window.removeEventListener("consultant-push-message", this.onPushMessage);
    this.alertsSubject.complete();
  }

  startPolling(profileId) {
    this.pollingProfileId = profileId;
    if (this.pollTimer) return;

    void this.pollBroadcastLeads();
    this.pollTimer = setInterval(() => {
      void this.pollBroadcastLeads();
    }, 5000);
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.pollingProfileId = null;
    this.stopAwaitingPickupSounds();
    for (const leadId of [...this.activeAlerts.keys()]) {
      this.dismissLead(leadId);
    }
  }

  async tryPickupLead(leadId) {
    const profileId = this.getProfileId();
    if (!profileId) {
      this.toast.error("شناسه پروفایل مشاور پیدا نشد.");
      return;
    }

    const alert = this.activeAlerts.get(leadId);
    if (_optionalChain([alert, 'optionalAccess', _47 => _47.isSubmitting])) return;

    if (alert) {
      alert.isSubmitting = true;
      this.emitAlerts();
    }

    // Do not repeat the CanPickupLead preflight here. Alerts are already checked
    // before they are displayed and the atomic pickup endpoint enforces the same
    // limit. A second, serial request made the primary action noticeably slower.
    const result = await firstValueFrom(
      this.pickupService.pickupLead(leadId, profileId),
    );

    if (result.status === "success") {
      this.toast.success(result.message);
      this.markLeadTaken(leadId);
      this.notifyLeadPickedUp(leadId, result.callDeadlineAt);
      // Updating availability is housekeeping and must not hold up showing the
      // newly assigned lead. Reconcile it in the background instead.
      void this.setConsultantOfflineAfterPickup(profileId);
      await this.router.navigate(["/dashboard/consultant"], {
        queryParams: {
          section: "leads",
          type: "realtime",
          leadAssignmentId: leadId,
        },
      });
      return;
    }

    if (result.status === "dailyLimitReached") {
      this.showDailyLimitNotificationOnce(result.message);
      this.markLeadTaken(leadId);
      return;
    }

    if (result.status === "alreadyTaken") {
      this.toast.info(result.message || "این لید قبلاً برداشته شده است.");
      this.markLeadTaken(leadId);
      return;
    }

    if (result.status === "workloadBlocked") {
      this.toast.error(result.message || "ابتدا شماره‌های قبلی را تعیین تکلیف کنید.");
      this.markLeadTaken(leadId);
      window.dispatchEvent(
        new CustomEvent("consultant-workload-blocked", {
          detail: { message: result.message },
        }),
      );
      return;
    }

    this.toast.error(result.message || "برداشتن لید ناموفق بود.");
    if (alert) {
      alert.isSubmitting = false;
      this.emitAlerts();
    }
  }

  dismissLead(leadId) {
    this.activeAlerts.delete(leadId);
    this.suppressLeadTemporarily(leadId);
    void this.notifications.closeRealtimeLeadNotification(leadId);
    this.emitAlerts();
  }

   markLeadTaken(leadId) {
    this.awaitingPickupLeadIds.delete(leadId);
    stopRealtimeLeadAlertSoundLoop(leadId);
    this.dismissLead(leadId);
  }

   stopAwaitingPickupSounds() {
    for (const leadId of [...this.awaitingPickupLeadIds]) {
      stopRealtimeLeadAlertSoundLoop(leadId);
    }
    this.awaitingPickupLeadIds.clear();
  }

   async pollBroadcastLeads() {
    if (this.pollingInFlight) return;
    const profileId = this.pollingProfileId;
    if (!profileId || _optionalChain([this, 'access', _48 => _48.auth, 'access', _49 => _49.user, 'call', _50 => _50(), 'optionalAccess', _51 => _51.role]) !== "consultant") return;

    this.pollingInFlight = true;
    try {
      const response = await firstValueFrom(
        this.consultantApi.getBroadcastRealtimeLeads(profileId),
      );
      if (!response.canReceive) {
        this.stopAwaitingPickupSounds();
        return;
      }

      const leads = _nullishCoalesce(response.leads, () => ( []));
      const broadcastLeadIds = new Set(
        leads
          .map((item) => this.readBroadcastLeadId(item))
          .filter((leadId) => leadId !== null),
      );
      const now = Date.now();

      for (const leadId of [...this.awaitingPickupLeadIds]) {
        if (!broadcastLeadIds.has(leadId)) {
          this.markLeadTaken(leadId);
        }
      }

      for (const [leadId, alert] of this.activeAlerts) {
        if (now - alert.receivedAt.getTime() < REMINDER_INTERVAL_MS) continue;
        if (this.handledLeadIds.has(leadId)) continue;
        if (!leads.some((item) => this.readBroadcastLeadId(item) === leadId)) {
          continue;
        }

        await this.notifyIncomingLead(leadId, {
          leadLimitType: alert.leadLimitType,
          userName: alert.userName,
          phoneNumber: alert.phoneNumber,
          isReminder: true,
        });
      }

      const lead = leads.find((item) => {
        const itemLeadId = this.readBroadcastLeadId(item);
        return (
          itemLeadId &&
          !this.handledLeadIds.has(itemLeadId) &&
          !this.activeAlerts.has(itemLeadId) &&
          !this.processingLeadIds.has(itemLeadId)
        );
      });
      if (!lead) return;

      const leadId = this.readBroadcastLeadId(lead);
      if (!leadId) return;

      await this.notifyIncomingLead(leadId, {
        leadLimitType: this.readBroadcastLeadLimitType(lead),
        userName: _nullishCoalesce(lead.userName, () => ( lead.UserName)),
        phoneNumber: _nullishCoalesce(lead.phoneNumber, () => ( lead.PhoneNumber)),
      });
    } catch (error) {
      console.warn("[RealtimeLead] Fallback polling failed", error);
    } finally {
      this.pollingInFlight = false;
    }
  }

   readBroadcastLeadId(lead) {
    const leadId = Number(_nullishCoalesce(_nullishCoalesce(lead.leadAssignmentId, () => ( lead.LeadAssignmentId)), () => ( 0)));
    return Number.isFinite(leadId) && leadId > 0 ? leadId : null;
  }

   readBroadcastLeadLimitType(
    lead,
  ) {
    return (_nullishCoalesce(lead.leadLimitType, () => ( lead.LeadLimitType))) === "Burnt"
      ? "Burnt"
      : "Realtime";
  }

   async handleServiceWorkerMessage(
    message,
  ) {
    if (!_optionalChain([message, 'optionalAccess', _52 => _52.type])) return;

    if (_optionalChain([this, 'access', _53 => _53.auth, 'access', _54 => _54.user, 'call', _55 => _55(), 'optionalAccess', _56 => _56.role]) !== "consultant") return;

    switch (message.type) {
      case "RealtimeLeadTaken":
        this.markLeadTaken(message.leadId);
        break;
      case "RealtimeLeadPickup":
        await this.tryPickupLead(message.leadId);
        break;
      case "RealtimeLeadOpen":
        await this.router.navigate(["/dashboard/consultant"], {
          queryParams: {
            section: "leads",
            type: "realtime",
            leadAssignmentId: message.leadId,
          },
        });
        break;
      default:
        break;
    }
  }

   async notifyIncomingLead(
    leadId,
    details = {},
  ) {
    if (!leadId || this.handledLeadIds.has(leadId) || this.processingLeadIds.has(leadId)) {
      return;
    }

    this.processingLeadIds.add(leadId);
    try {
      const profileId = this.getProfileId();
      if (!profileId) return;

      const canPickup = await firstValueFrom(
        this.pickupService.canPickupLead(profileId),
      );
      if (!canPickup) {
        this.showDailyLimitNotificationOnce();
        void this.notifications.closeRealtimeLeadNotification(leadId);
        return;
      }

      const enrichedDetails = await this.enrichIncomingLeadDetails(
        leadId,
        details,
        profileId,
      );
      const notificationDetails = {
        leadLimitType: enrichedDetails.leadLimitType,
        userName: enrichedDetails.userName,
        phoneNumber: enrichedDetails.phoneNumber,
        isReminder: enrichedDetails.isReminder,
      };
      const title = resolveRealtimeLeadNotificationTitle(
        notificationDetails,
        enrichedDetails.title,
      );
      const body = resolveRealtimeLeadNotificationBody(
        notificationDetails,
        enrichedDetails.body,
      );

      const existingAlert = this.activeAlerts.get(leadId);
      if (existingAlert) {
        existingAlert.leadLimitType = _nullishCoalesce(enrichedDetails.leadLimitType, () => ( "Realtime"));
        existingAlert.userName =
          _nullishCoalesce(notificationDetails.userName, () => ( existingAlert.userName));
        existingAlert.phoneNumber =
          _nullishCoalesce(notificationDetails.phoneNumber, () => ( existingAlert.phoneNumber));
        existingAlert.receivedAt = new Date();
      } else {
        this.activeAlerts.set(leadId, {
          leadId,
          leadLimitType: _nullishCoalesce(enrichedDetails.leadLimitType, () => ( "Realtime")),
          userName: notificationDetails.userName,
          phoneNumber: notificationDetails.phoneNumber,
          isSubmitting: false,
          receivedAt: new Date(),
        });
      }

      this.awaitingPickupLeadIds.add(leadId);
      startRealtimeLeadAlertSoundLoop(leadId);
      this.emitAlerts();

      if (this.isAppInForeground()) {
        void this.notifications.closeRealtimeLeadNotification(leadId);
        return;
      }

      await this.notifications.showLocalNotification(title, body, {
        tag: `realtime-lead-${leadId}`,
        requireInteraction: true,
        vibrate: [...REALTIME_LEAD_VIBRATE_PATTERN],
        data: {
          type: "RealtimeLead",
          leadId: String(leadId),
          leadLimitType: _nullishCoalesce(enrichedDetails.leadLimitType, () => ( "Realtime")),
          userName: _nullishCoalesce(notificationDetails.userName, () => ( "")),
          phoneNumber: _nullishCoalesce(notificationDetails.phoneNumber, () => ( "")),
          isReminder: notificationDetails.isReminder ? "true" : "false",
        },
      });
    } finally {
      this.processingLeadIds.delete(leadId);
    }
  }

   async enrichIncomingLeadDetails(
    leadId,
    details,
    profileId,
  ) {
    const userName = normalizeLeadField(details.userName);
    const phoneNumber = normalizeLeadField(details.phoneNumber);
    if (userName && phoneNumber) return details;

    try {
      const response = await firstValueFrom(
        this.consultantApi.getBroadcastRealtimeLeads(profileId),
      );
      const lead = (_nullishCoalesce(response.leads, () => ( []))).find(
        (item) => this.readBroadcastLeadId(item) === leadId,
      );
      if (!lead) return details;

      return {
        ...details,
        leadLimitType: this.readBroadcastLeadLimitType(lead),
        userName:
          userName ||
          normalizeLeadField(_nullishCoalesce(lead.userName, () => ( lead.UserName))) ||
          details.userName,
        phoneNumber:
          phoneNumber ||
          normalizeLeadField(_nullishCoalesce(lead.phoneNumber, () => ( lead.PhoneNumber))) ||
          details.phoneNumber,
      };
    } catch (e) {
      return details;
    }
  }

   async setConsultantOfflineAfterPickup(profileId) {
    this.stopPolling();

    try {
      await firstValueFrom(
        this.consultantApi
          .setOnlineStatus({
            profileId,
            isOnline: false,
            isOffline: true,
          })
          .pipe(catchError(() => of(null))),
      );
    } catch (e2) {
      // Ignore transient offline API errors; dashboard refresh will reconcile status.
    }
  }

   notifyLeadPickedUp(
    leadId,
    callDeadlineAt,
  ) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("consultant-lead-picked-up", {
        detail: { leadId, callDeadlineAt },
      }),
    );
  }

   showDailyLimitNotificationOnce(message) {
    const todayKey = new Date().toISOString().slice(0, 10);
    if (this.limitNotifiedDates.has(todayKey)) return;

    this.limitNotifiedDates.add(todayKey);
    this.toast.info(
      _nullishCoalesce(message, () => (
        "سقف دریافت لید امروز تکمیل شده است.")),
    );
  }

   suppressLeadTemporarily(leadId) {
    this.handledLeadIds.add(leadId);

    const existingTimer = this.dismissedLeadCooldownTimers.get(leadId);
    if (existingTimer) clearTimeout(existingTimer);

    this.dismissedLeadCooldownTimers.set(
      leadId,
      setTimeout(() => {
        this.handledLeadIds.delete(leadId);
        this.dismissedLeadCooldownTimers.delete(leadId);
      }, DISMISSED_LEAD_COOLDOWN_MS),
    );
  }

   isAppInForeground() {
    if (typeof document === "undefined") return false;

    return (
      document.visibilityState === "visible" &&
      (typeof document.hasFocus !== "function" || document.hasFocus())
    );
  }

   emitAlerts() {
    this.alertsSubject.next([...this.activeAlerts.values()]);
  }

   getProfileId() {
    const user = this.auth.user();
    const profileId = _nullishCoalesce(_nullishCoalesce(_optionalChain([user, 'optionalAccess', _57 => _57.consultantProfileId]), () => ( _optionalChain([user, 'optionalAccess', _58 => _58.profileId]))), () => ( 0));
    return Number.isFinite(profileId) && profileId > 0 ? profileId : 0;
  }

    __init14() {this.limitNotifiedDates = new Set()}
}
