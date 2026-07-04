import { Injectable, OnDestroy } from "@angular/core";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";
import {
  BehaviorSubject,
  Observable,
  Subscription,
  firstValueFrom,
} from "rxjs";
import { environment } from "../../../environments/environment";
import {
  AcceptLeadResponse,
  BroadcastingLead,
  ConsultantDashboardService,
} from "../consultant/consultant-dashboard.service";

export interface ActiveBroadcastLead {
  leadAssignmentId: number;
  createdAt: string;
  broadcastStartedAt?: string | null;
  maskedName: string;
}

@Injectable({ providedIn: "root" })
export class LeadBroadcastService implements OnDestroy {
  private readonly activeLeadSubject =
    new BehaviorSubject<ActiveBroadcastLead | null>(null);
  private readonly acceptingSubject = new BehaviorSubject(false);
  private readonly ringEnabledSubject = new BehaviorSubject(false);

  readonly activeLead$: Observable<ActiveBroadcastLead | null> =
    this.activeLeadSubject.asObservable();
  readonly accepting$ = this.acceptingSubject.asObservable();
  readonly isRinging$ = this.ringEnabledSubject.asObservable();

  private profileId: number | null = null;
  private isOnline = false;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private hubConnection: HubConnection | null = null;
  private pollSubscription: Subscription | null = null;
  private ringAudio: HTMLAudioElement | null = null;
  private audioUnlocked = false;
  private dismissedLeadIds = new Set<number>();
  private seenLeadIds = new Set<number>();

  constructor(private consultantApi: ConsultantDashboardService) {
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type !== "lead-broadcast-alert") return;
        const leadAssignmentId = Number(event.data.leadAssignmentId);
        this.handlePushLeadBroadcast(
          Number.isFinite(leadAssignmentId) ? leadAssignmentId : null,
        );
        this.unlockAudio();
      });
    }
  }

  ngOnDestroy(): void {
    this.stop();
  }

  unlockAudio(): void {
    if (this.audioUnlocked || typeof window === "undefined") return;

    try {
      const audio = this.ensureRingAudio();
      audio.muted = true;
      const playPromise = audio.play();
      if (playPromise) {
        void playPromise
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
            this.audioUnlocked = true;
          })
          .catch(() => undefined);
      }
    } catch {
      // Ignore autoplay restrictions until the next user gesture.
    }
  }

  start(profileId: number, isOnline: boolean): void {
    this.profileId = profileId;
    this.isOnline = isOnline;

    if (!isOnline) {
      this.stopMonitoring();
      this.clearActiveLead();
      return;
    }

    this.startSignalR();
    this.startPolling();
    void this.refreshBroadcastingLeads();
  }

  stop(): void {
    this.stopMonitoring();
    this.clearActiveLead();
    this.profileId = null;
    this.isOnline = false;
  }

  async acceptActiveLead(): Promise<AcceptLeadResponse> {
    const profileId = this.profileId;
    const active = this.activeLeadSubject.value;
    if (!profileId || !active) {
      throw new Error("لید فعالی برای پذیرش وجود ندارد.");
    }

    this.acceptingSubject.next(true);
    try {
      const response = await firstValueFrom(
        this.consultantApi.acceptLead({
          leadAssignmentId: active.leadAssignmentId,
          consultantProfileId: profileId,
        }),
      );

      const data = response.data;
      if (!data) {
        throw new Error(response.message || "پذیرش لید انجام نشد.");
      }

      this.dismissLead(active.leadAssignmentId);
      return data;
    } finally {
      this.acceptingSubject.next(false);
    }
  }

  dismissActiveLead(): void {
    const active = this.activeLeadSubject.value;
    const profileId = this.profileId;
    if (!active || !profileId) {
      this.clearActiveLead();
      return;
    }

    this.dismissedLeadIds.add(active.leadAssignmentId);
    this.clearActiveLead();

    void firstValueFrom(
      this.consultantApi.rejectBroadcast({
        leadAssignmentId: active.leadAssignmentId,
        consultantProfileId: profileId,
      }),
    ).catch(() => undefined);
  }

  handlePushLeadBroadcast(leadAssignmentId: number | null): void {
    if (!this.isOnline || !leadAssignmentId) return;
    void this.refreshBroadcastingLeads(leadAssignmentId);
  }

  private startPolling(): void {
    if (this.pollTimer) return;

    this.pollTimer = setInterval(() => {
      void this.refreshBroadcastingLeads();
    }, 3000);
  }

  private startSignalR(): void {
    if (typeof window === "undefined") return;

    const hubUrl =
      "signalrHubUrl" in environment &&
      typeof (environment as { signalrHubUrl?: string }).signalrHubUrl ===
        "string"
        ? (environment as { signalrHubUrl: string }).signalrHubUrl
        : `${environment.apiBaseUrl.replace(/\/api\/?$/, "")}/hubs/lead-broadcast`;
    if (!hubUrl) return;

    if (!this.hubConnection) {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .build();

      this.hubConnection.on("LeadBroadcastStarted", (payload: unknown) => {
        const leadAssignmentId = this.readLeadAssignmentId(payload);
        if (leadAssignmentId) void this.refreshBroadcastingLeads(leadAssignmentId);
      });

      this.hubConnection.on("LeadClaimed", (payload: unknown) => {
        const leadAssignmentId = this.readLeadAssignmentId(payload);
        const claimedBy = this.readClaimedBy(payload);
        if (!leadAssignmentId) return;

        if (
          this.activeLeadSubject.value?.leadAssignmentId === leadAssignmentId &&
          claimedBy !== this.profileId
        ) {
          this.dismissLead(leadAssignmentId);
        }
      });

      this.hubConnection.on("LeadBroadcastExpired", (payload: unknown) => {
        const leadAssignmentId = this.readLeadAssignmentId(payload);
        if (
          leadAssignmentId &&
          this.activeLeadSubject.value?.leadAssignmentId === leadAssignmentId
        ) {
          this.dismissLead(leadAssignmentId);
        }
      });
    }

    if (this.hubConnection.state === HubConnectionState.Connected) return;

    void this.hubConnection
      .start()
      .then(() => this.hubConnection?.invoke("JoinOnlineConsultants"))
      .catch(() => undefined);
  }

  private async refreshBroadcastingLeads(
    preferredLeadId?: number,
  ): Promise<void> {
    const profileId = this.profileId;
    if (!profileId || !this.isOnline) return;

    this.pollSubscription?.unsubscribe();
    this.pollSubscription = this.consultantApi
      .getBroadcastingLeads(profileId)
      .subscribe({
        next: (response) => {
          const items = response.items ?? [];
          const candidate =
            items.find((item) => item.leadAssignmentId === preferredLeadId) ??
            items.find(
              (item) =>
                item.leadAssignmentId &&
                !this.dismissedLeadIds.has(item.leadAssignmentId),
            ) ??
            null;

          if (!candidate?.leadAssignmentId) {
            if (!this.activeLeadSubject.value) this.stopRing();
            return;
          }

          if (this.dismissedLeadIds.has(candidate.leadAssignmentId)) return;

          const nextLead = this.toActiveLead(candidate);
          const current = this.activeLeadSubject.value;
          if (
            current?.leadAssignmentId === nextLead.leadAssignmentId ||
            !current
          ) {
            this.activeLeadSubject.next(nextLead);
            this.startRing();
          }

          this.seenLeadIds.add(nextLead.leadAssignmentId);
        },
        error: () => undefined,
      });
  }

  private toActiveLead(lead: BroadcastingLead): ActiveBroadcastLead {
    const firstName = lead.firstName?.trim() ?? "";
    const lastName = lead.lastName?.trim() ?? "";
    const maskedName = [firstName, lastName].filter(Boolean).join(" ") || "لید جدید";

    return {
      leadAssignmentId: lead.leadAssignmentId,
      createdAt: lead.createdAt,
      broadcastStartedAt: lead.broadcastStartedAt,
      maskedName,
    };
  }

  private dismissLead(leadAssignmentId: number): void {
    this.dismissedLeadIds.add(leadAssignmentId);
    if (this.activeLeadSubject.value?.leadAssignmentId === leadAssignmentId) {
      this.clearActiveLead();
    }
  }

  private clearActiveLead(): void {
    this.activeLeadSubject.next(null);
    this.stopRing();
  }

  private stopMonitoring(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }

    this.pollSubscription?.unsubscribe();
    this.pollSubscription = null;

    if (this.hubConnection) {
      void this.hubConnection
        .invoke("LeaveOnlineConsultants")
        .catch(() => undefined);
      void this.hubConnection.stop().catch(() => undefined);
      this.hubConnection = null;
    }
  }

  private ensureRingAudio(): HTMLAudioElement {
    if (!this.ringAudio) {
      this.ringAudio = new Audio("/assets/sounds/lead-ring.mp3");
      this.ringAudio.loop = true;
      this.ringAudio.preload = "auto";
    }
    return this.ringAudio;
  }

  private startRing(): void {
    if (!this.isOnline) return;

    this.ringEnabledSubject.next(true);
    const audio = this.ensureRingAudio();

    const play = () => {
      audio.loop = true;
      void audio.play().catch(() => undefined);
    };

    if (this.audioUnlocked) {
      play();
      return;
    }

    this.unlockAudio();
    play();
  }

  private stopRing(): void {
    this.ringEnabledSubject.next(false);
    if (!this.ringAudio) return;
    this.ringAudio.pause();
    this.ringAudio.currentTime = 0;
  }

  private readLeadAssignmentId(payload: unknown): number | null {
    if (!payload || typeof payload !== "object") return null;
    const value =
      (payload as Record<string, unknown>)["leadAssignmentId"] ??
      (payload as Record<string, unknown>)["LeadAssignmentId"];
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private readClaimedBy(payload: unknown): number | null {
    if (!payload || typeof payload !== "object") return null;
    const value =
      (payload as Record<string, unknown>)["claimedByConsultantProfileId"] ??
      (payload as Record<string, unknown>)["ClaimedByConsultantProfileId"];
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }
}
