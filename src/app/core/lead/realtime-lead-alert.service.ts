import { Injectable, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, catchError, firstValueFrom, of } from "rxjs";
import { AuthService } from "../auth/auth.service";
import {
  BroadcastRealtimeLeadItem,
  ConsultantDashboardService,
} from "../consultant/consultant-dashboard.service";
import { NotificationService } from "../push/notification.service";
import { playRealtimeLeadAlertSound } from "../push/lead-alert-sound";
import { ToastService } from "../toast/toast.service";
import { RealtimeLeadPickupService } from "./realtime-lead-pickup.service";

export interface RealtimeLeadAlert {
  leadId: number;
  isSubmitting: boolean;
  receivedAt: Date;
}

type ServiceWorkerMessage =
  | { type: "RealtimeLeadTaken"; leadId: number }
  | { type: "RealtimeLeadPickup"; leadId: number }
  | { type: "RealtimeLeadOpen"; leadId: number };

@Injectable({ providedIn: "root" })
export class RealtimeLeadAlertService implements OnDestroy {
  private static readonly REDISPATCH_COOLDOWN_MS = 10_000;

  private readonly alertsSubject = new Subject<readonly RealtimeLeadAlert[]>();
  private readonly activeAlerts = new Map<number, RealtimeLeadAlert>();
  private readonly suppressedLeadIds = new Set<number>();
  private readonly dismissedAtByLeadId = new Map<number, number>();
  private readonly processingLeadIds = new Set<number>();
  private readonly limitNotifiedDates = new Set<string>();
  private initialized = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private pollingProfileId: number | null = null;
  private pollingInFlight = false;
  private readonly onPushMessage = (event: Event): void => {
    if (this.auth.user()?.role !== "consultant") return;

    const detail = (
      event as CustomEvent<{
        title?: string;
        body?: string;
        data?: Record<string, string>;
      }>
    ).detail;
    const leadId = Number(detail?.data?.["leadId"]);
    if (detail?.data?.["type"] !== "RealtimeLead" || !Number.isFinite(leadId)) {
      return;
    }

    void this.notifyIncomingLead(leadId);
  };

  readonly alerts$ = this.alertsSubject.asObservable();

  constructor(
    private readonly auth: AuthService,
    private readonly consultantApi: ConsultantDashboardService,
    private readonly pickupService: RealtimeLeadPickupService,
    private readonly notifications: NotificationService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {}

  initialize(): void {
    if (this.initialized || typeof window === "undefined") return;

    this.initialized = true;
    navigator.serviceWorker?.addEventListener(
      "message",
      (event: MessageEvent<ServiceWorkerMessage>) => {
        void this.handleServiceWorkerMessage(event.data);
      },
    );
    window.addEventListener("consultant-push-message", this.onPushMessage);
  }

  ngOnDestroy(): void {
    this.stopPolling();
    window.removeEventListener("consultant-push-message", this.onPushMessage);
    this.alertsSubject.complete();
  }

  startPolling(profileId: number): void {
    this.pollingProfileId = profileId;
    if (this.pollTimer) return;

    void this.pollBroadcastLeads();
    this.pollTimer = setInterval(() => {
      void this.pollBroadcastLeads();
    }, 5000);
  }

  stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.pollingProfileId = null;
  }

  teardownOnLogout(): void {
    this.stopPolling();
    this.activeAlerts.clear();
    this.suppressedLeadIds.clear();
    this.dismissedAtByLeadId.clear();
    this.processingLeadIds.clear();
    this.emitAlerts();
  }

  async tryPickupLead(leadId: number): Promise<void> {
    const profileId = this.getProfileId();
    if (!profileId) {
      this.toast.error("شناسه پروفایل مشاور پیدا نشد.");
      return;
    }

    const alert = this.activeAlerts.get(leadId);
    if (alert?.isSubmitting) return;

    if (alert) {
      alert.isSubmitting = true;
      this.emitAlerts();
    }

    const canPickup = await firstValueFrom(
      this.pickupService.canPickupLead(profileId),
    );
    if (!canPickup) {
      this.showDailyLimitNotificationOnce();
      this.dismissLead(leadId);
      return;
    }

    const result = await firstValueFrom(
      this.pickupService.pickupLead(leadId, profileId),
    );

    if (result.status === "success") {
      this.toast.success(result.message);
      this.suppressLead(leadId);
      await this.setConsultantOfflineAfterPickup(profileId);
      this.notifyLeadPickedUp(leadId);
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
      this.suppressLead(leadId);
      return;
    }

    if (result.status === "alreadyTaken") {
      this.toast.info(result.message || "این لید قبلاً برداشته شده است.");
      this.suppressLead(leadId);
      return;
    }

    this.toast.error(result.message || "برداشتن لید ناموفق بود.");
    if (alert) {
      alert.isSubmitting = false;
      this.emitAlerts();
    }
  }

  dismissLead(leadId: number): void {
    this.activeAlerts.delete(leadId);
    this.dismissedAtByLeadId.set(leadId, Date.now());
    void this.notifications.closeRealtimeLeadNotification(leadId);
    this.emitAlerts();
  }

  private async pollBroadcastLeads(): Promise<void> {
    if (this.pollingInFlight) return;
    const profileId = this.pollingProfileId;
    if (!profileId || this.auth.user()?.role !== "consultant") return;

    this.pollingInFlight = true;
    try {
      const response = await firstValueFrom(
        this.consultantApi.getBroadcastRealtimeLeads(profileId),
      );
      if (!response.canReceive) return;

      for (const lead of response.leads ?? []) {
        const leadId = this.readBroadcastLeadId(lead);
        if (!leadId) continue;
        await this.notifyIncomingLead(leadId);
      }
    } catch (error) {
      console.warn("Broadcast realtime lead polling failed", error);
    } finally {
      this.pollingInFlight = false;
    }
  }

  private readBroadcastLeadId(lead: BroadcastRealtimeLeadItem): number | null {
    const leadId = Number(lead.leadAssignmentId ?? lead.LeadAssignmentId ?? 0);
    return Number.isFinite(leadId) && leadId > 0 ? leadId : null;
  }

  private async handleServiceWorkerMessage(
    message: ServiceWorkerMessage | undefined,
  ): Promise<void> {
    if (!message?.type) return;
    if (this.auth.user()?.role !== "consultant") return;

    switch (message.type) {
      case "RealtimeLeadTaken":
        this.suppressLead(message.leadId);
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

  private tryClaimLeadNotification(leadId: number): boolean {
    if (!leadId || this.suppressedLeadIds.has(leadId)) return false;
    if (this.activeAlerts.has(leadId)) return false;
    if (this.processingLeadIds.has(leadId)) return false;

    const now = Date.now();
    const dismissedAt = this.dismissedAtByLeadId.get(leadId);
    if (
      dismissedAt &&
      now - dismissedAt < RealtimeLeadAlertService.REDISPATCH_COOLDOWN_MS
    ) {
      return false;
    }

    this.processingLeadIds.add(leadId);
    return true;
  }

  private async notifyIncomingLead(leadId: number): Promise<void> {
    if (!this.tryClaimLeadNotification(leadId)) return;

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

      if (
        this.suppressedLeadIds.has(leadId) ||
        this.activeAlerts.has(leadId)
      ) {
        return;
      }

      this.activeAlerts.set(leadId, {
        leadId,
        isSubmitting: false,
        receivedAt: new Date(),
      });
      this.dismissedAtByLeadId.delete(leadId);

      playRealtimeLeadAlertSound();
      this.emitAlerts();
    } finally {
      this.processingLeadIds.delete(leadId);
    }
  }

  private suppressLead(leadId: number): void {
    this.suppressedLeadIds.add(leadId);
    this.dismissLead(leadId);
  }

  private notifyLeadPickedUp(leadId: number): void {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("consultant-lead-picked-up", {
        detail: { leadId, isOnline: false },
      }),
    );
  }

  private async setConsultantOfflineAfterPickup(profileId: number): Promise<void> {
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
    } catch {
      // Ignore transient offline API errors; dashboard refresh will reconcile status.
    }
  }

  private showDailyLimitNotificationOnce(message?: string): void {
    const todayKey = new Date().toISOString().slice(0, 10);
    if (this.limitNotifiedDates.has(todayKey)) return;

    this.limitNotifiedDates.add(todayKey);
    this.toast.info(
      message ??
        "سقف روزانه ۱۰ لید پر شده است. امروز دیگر نمی‌توانید لید بردارید.",
    );
  }

  private emitAlerts(): void {
    this.alertsSubject.next([...this.activeAlerts.values()]);
  }

  private getProfileId(): number {
    const user = this.auth.user();
    const profileId = user?.consultantProfileId ?? user?.profileId ?? 0;
    return Number.isFinite(profileId) && profileId > 0 ? profileId : 0;
  }
}
