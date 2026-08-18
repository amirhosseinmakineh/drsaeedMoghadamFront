import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subscription, finalize, forkJoin, map } from "rxjs";
import { AuthService } from "../../core/auth/auth.service";
import {
  AttendanceConfirmationStatus,
  attendanceScoreLabel,
  attendanceStatusPresentation,
  canSecretaryReviewAttendance,
  consultantAttendanceClaimLabel,
  readAttendanceStatus,
} from "../../core/reservation/reservation-attendance";
import {
  SecretaryReservation,
  SecretaryDashboardService,
} from "../../core/secretary/secretary-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { SecretaryDashboardPreset } from "./secretary-overview.component";

export type SecretaryReservationTab = "queue" | "all" | "completed";

@Component({
  selector: "app-secretary-reservations",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./secretary-reservations.component.html",
  styleUrl: "./secretary-reservations.component.scss",
})
export class SecretaryReservationsComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() profileReady = false;
  @Input() initialTab: SecretaryReservationTab = "queue";
  @Input() preset: SecretaryDashboardPreset | null = null;

  activeTab: SecretaryReservationTab = "queue";
  items: SecretaryReservation[] = [];
  notes: Record<number, string> = {};
  announcements: Record<number, string> = {};
  loading = false;
  savingId: number | null = null;
  readonly savingAnnouncementIds = new Set<number>();
  feedback = "";
  feedbackType: "success" | "error" = "success";
  statusFilter: AttendanceConfirmationStatus | null = null;
  readonly statusOptions = [
    AttendanceConfirmationStatus.PendingConsultantConfirmation,
    AttendanceConfirmationStatus.ConsultantConfirmedPresent,
    AttendanceConfirmationStatus.ConsultantConfirmedAbsent,
    AttendanceConfirmationStatus.SecretaryApproved,
    AttendanceConfirmationStatus.SecretaryRejected,
  ].map((value) => ({
    value,
    label: attendanceStatusPresentation(value).label,
  }));
  searchText = "";
  includeCanceled = false;
  pageNumber = 1;
  pageSize = 20;
  totalPages = 1;

  private loadRequestId = 0;
  private pollId: ReturnType<typeof setInterval> | null = null;
  private loadSubscription: Subscription | null = null;
  private destroyed = false;
  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;
  private readonly markDirty: () => void;

  constructor(
    private secretaryApi: SecretaryDashboardService,
    private auth: AuthService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.markDirty = createCoalescedMarkForCheck(
      this.cdr,
      () => this.destroyed,
    );
  }

  ngOnInit(): void {
    this.activeTab = this.initialTab;
    if (this.profileReady) {
      this.load();
      this.startPolling();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["initialTab"]?.currentValue) {
      this.activeTab = changes["initialTab"].currentValue;
    }
    if (
      changes["preset"] &&
      !changes["preset"].firstChange &&
      this.profileReady
    ) {
      this.pageNumber = 1;
      this.load();
    }
    if (changes["profileReady"]?.currentValue === true) {
      this.load();
      this.startPolling();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopPolling();
    this.loadSubscription?.unsubscribe();
  }

  private filterPreset(
    items: SecretaryReservation[],
    preset: SecretaryDashboardPreset,
  ): SecretaryReservation[] {
    const activeItems = items.filter(
      (item) => !(item.isCanceled ?? item.IsCanceled ?? false),
    );
    const isToday = (value: string): boolean => {
      const date = new Date(value);
      if (!Number.isFinite(date.getTime())) return false;
      const formatter = new Intl.DateTimeFormat("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "Asia/Tehran",
      });
      return formatter.format(date) === formatter.format(new Date());
    };

    if (preset === "pending") {
      return activeItems.filter(
        (item) =>
          Number(
            item.secretaryReservationReviewStatus ??
              item.SecretaryReservationReviewStatus,
          ) === 1,
      );
    }
    if (preset === "confirmed-today") {
      return activeItems.filter(
        (item) =>
          isToday(this.reservationAt(item)) &&
          [2, 3].includes(
            Number(
              item.secretaryReservationReviewStatus ??
                item.SecretaryReservationReviewStatus,
            ),
          ),
      );
    }
    if (preset === "followups-today") {
      return activeItems.filter(
        (item) =>
          isToday(item.followUpAt ?? item.FollowUpAt ?? "") ||
          isToday(item.reminderAt ?? item.ReminderAt ?? "") ||
          (item.needsFollowUp ?? item.NeedsFollowUp) === true,
      );
    }

    return activeItems.filter((item) => {
      const reservationTime = new Date(this.reservationAt(item)).getTime();
      return (
        Number.isFinite(reservationTime) &&
        reservationTime < Date.now() &&
        (item.consultantSaysPatientAttended ??
          item.ConsultantSaysPatientAttended) === false &&
        readAttendanceStatus(item, "attendanceConfirmationStatus") ===
          AttendanceConfirmationStatus.SecretaryApproved
      );
    });
  }

  setTab(tab: SecretaryReservationTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.pageNumber = 1;
    this.load();
    this.startPolling();
  }

  applySearch(): void {
    this.pageNumber = 1;
    this.load();
  }

  applyStatusFilter(): void {
    this.pageNumber = 1;
    this.load();
  }

  load(): void {
    if (!this.profileReady) return;

    const requestId = ++this.loadRequestId;
    this.loading = true;
    this.feedback = "";
    this.markDirty();
    this.loadSubscription?.unsubscribe();

    if (this.preset) {
      this.loadSubscription = this.secretaryApi
        .getDashboardReservations()
        .pipe(
          map((items) => this.filterPreset(items, this.preset!)),
          finalize(() => {
            if (requestId === this.loadRequestId) {
              this.loading = false;
              this.markDirty();
            }
          }),
        )
        .subscribe({
          next: (items) => {
            if (requestId !== this.loadRequestId) return;
            this.totalPages = Math.max(
              1,
              Math.ceil(items.length / this.pageSize),
            );
            const start = (this.pageNumber - 1) * this.pageSize;
            this.items = items.slice(start, start + this.pageSize);
            this.syncAnnouncements(this.items);
            this.markDirty();
          },
          error: (error) => this.handleLoadError(requestId, error),
        });
      return;
    }

    if (this.activeTab === "queue") {
      this.loadSubscription = this.secretaryApi
        .getAttendanceReviews(this.pageNumber, this.pageSize)
        .pipe(
          finalize(() => {
            if (requestId === this.loadRequestId) {
              this.loading = false;
              this.markDirty();
            }
          }),
        )
        .subscribe({
          next: (response) => {
            if (requestId !== this.loadRequestId) return;
            this.items = response.items ?? [];
            this.syncAnnouncements(this.items);
            this.pageNumber = response.pageNumber;
            this.totalPages = response.totalPages;
            this.markDirty();
          },
          error: (error) => this.handleLoadError(requestId, error),
        });
      return;
    }

    if (this.activeTab === "completed") {
      this.loadSubscription = forkJoin({
        approved: this.secretaryApi.getReservations({
          attendanceConfirmationStatus:
            AttendanceConfirmationStatus.SecretaryApproved,
          includeCanceled: false,
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
        }),
        rejected: this.secretaryApi.getReservations({
          attendanceConfirmationStatus:
            AttendanceConfirmationStatus.SecretaryRejected,
          includeCanceled: false,
          pageNumber: this.pageNumber,
          pageSize: this.pageSize,
        }),
      })
        .pipe(
          map(({ approved, rejected }) => {
            const merged = [
              ...(approved.items ?? []),
              ...(rejected.items ?? []),
            ].sort(
              (left, right) =>
                new Date(this.reservationAt(right)).getTime() -
                new Date(this.reservationAt(left)).getTime(),
            );
            const totalCount =
              (approved.totalCount ?? 0) + (rejected.totalCount ?? 0);
            const totalPages = Math.max(
              approved.totalPages ?? 1,
              rejected.totalPages ?? 1,
              Math.ceil(totalCount / this.pageSize),
            );
            return { items: merged, pageNumber: this.pageNumber, totalPages };
          }),
          finalize(() => {
            if (requestId === this.loadRequestId) {
              this.loading = false;
              this.markDirty();
            }
          }),
        )
        .subscribe({
          next: (response) => {
            if (requestId !== this.loadRequestId) return;
            this.items = response.items;
            this.syncAnnouncements(this.items);
            this.pageNumber = response.pageNumber;
            this.totalPages = response.totalPages;
            this.markDirty();
          },
          error: (error) => this.handleLoadError(requestId, error),
        });
      return;
    }

    this.loadSubscription = this.secretaryApi
      .getReservations({
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
        includeCanceled: this.includeCanceled,
        attendanceConfirmationStatus: this.statusFilter,
        searchText: this.searchText.trim() || undefined,
      })
      .pipe(
        finalize(() => {
          if (requestId === this.loadRequestId) {
            this.loading = false;
            this.markDirty();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.loadRequestId) return;
          this.items = response.items ?? [];
          this.syncAnnouncements(this.items);
          this.pageNumber = response.pageNumber;
          this.totalPages = response.totalPages;
          this.markDirty();
        },
        error: (error) => this.handleLoadError(requestId, error),
      });
  }

  review(item: SecretaryReservation, approved: boolean): void {
    const reservationId = this.reservationId(item);
    const secretaryUserId = this.auth.user()?.userId;
    if (!reservationId || !secretaryUserId) {
      this.showFeedback(
        "شناسه رزرو یا شناسه کاربر منشی در دسترس نیست",
        "error",
      );
      return;
    }

    this.savingId = reservationId;
    this.secretaryApi
      .reviewAttendance({
        reservationId,
        secretaryUserId,
        approved,
        note: (this.notes[reservationId] || "").trim() || null,
      })
      .pipe(finalize(() => (this.savingId = null)))
      .subscribe({
        next: (response) => {
          this.showFeedback(
            response.message ||
              (approved
                ? "ادعای مشاور تایید شد (+۱۰ امتیاز)"
                : "ادعای مشاور رد شد (-۱۰ امتیاز)"),
            "success",
          );
          this.load();
        },
        error: (error) =>
          this.showFeedback(
            error instanceof Error && error.message
              ? error.message
              : "ثبت بررسی انجام نشد",
            "error",
          ),
      });
  }

  saveAnnouncement(item: SecretaryReservation): void {
    const reservationId = this.reservationId(item);
    const secretaryUserId = this.auth.user()?.userId;
    if (!reservationId || !secretaryUserId) {
      this.showFeedback(
        "شناسه رزرو یا شناسه کاربر منشی در دسترس نیست",
        "error",
      );
      return;
    }
    if (this.isCanceled(item) || this.savingAnnouncementIds.has(reservationId)) {
      return;
    }

    const announcement = (this.announcements[reservationId] ?? "").trim();
    this.savingAnnouncementIds.add(reservationId);
    this.markDirty();
    this.secretaryApi
      .updateSecretaryAnnouncement({
        reservationId,
        secretaryUserId,
        secretaryAnnouncement: announcement || null,
      })
      .pipe(
        finalize(() => {
          this.savingAnnouncementIds.delete(reservationId);
          this.markDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          item.secretaryAnnouncement = announcement || null;
          item.secretaryAnnouncementUpdatedAt = new Date().toISOString();
          item.secretaryAnnouncementUserId = secretaryUserId;
          this.announcements[reservationId] = announcement;
          this.showFeedback(
            response.message || "اعلام منشی با موفقیت ثبت شد",
            "success",
          );
          this.markDirty();
        },
        error: (error) =>
          this.showFeedback(
            error instanceof Error && error.message
              ? error.message
              : "ثبت اعلام منشی انجام نشد",
            "error",
          ),
      });
  }

  announcementUpdatedAt(item: SecretaryReservation): string {
    return (
      item.secretaryAnnouncementUpdatedAt ??
      item.SecretaryAnnouncementUpdatedAt ??
      ""
    );
  }

  isCanceled(item: SecretaryReservation): boolean {
    return (item.isCanceled ?? item.IsCanceled) === true;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.load();
  }

  emptyCopy(): string {
    if (this.activeTab === "queue") {
      return "موردی در صف بررسی تایید حضور وجود ندارد.";
    }
    if (this.activeTab === "completed") {
      return "رزروی با بررسی نهایی منشی یافت نشد.";
    }
    return "رزروی برای نمایش وجود ندارد.";
  }

  canReview(item: SecretaryReservation): boolean {
    if (this.activeTab !== "queue") return false;
    return canSecretaryReviewAttendance(
      readAttendanceStatus(
        item,
        "attendanceConfirmationStatus",
        "AttendanceConfirmationStatus",
      ),
      (item.isWaitingForSecretaryReview ?? item.IsWaitingForSecretaryReview) ===
        true,
    );
  }

  reservationId(item: SecretaryReservation): number | null {
    const value = item.id ?? item.Id;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  patientName(item: SecretaryReservation): string {
    return (
      item.patientName?.trim() || item.PatientName?.trim() || "بیمار بدون نام"
    );
  }

  patientPhone(item: SecretaryReservation): string {
    return (
      item.patientPhoneNumber?.trim() || item.PatientPhoneNumber?.trim() || "-"
    );
  }

  patientCity(item: SecretaryReservation): string {
    return (
      item.patientCity?.trim() || item.PatientCity?.trim() || "شهر ثبت نشده"
    );
  }

  consultantName(item: SecretaryReservation): string {
    return (
      item.consultantFullName?.trim() || item.ConsultantFullName?.trim() || "-"
    );
  }

  reservationAt(item: SecretaryReservation): string {
    return item.reservationAt || item.ReservationAt || "";
  }

  probability(item: SecretaryReservation): number | string {
    return (
      item.attendanceProbabilityPercent ??
      item.AttendanceProbabilityPercent ??
      "-"
    );
  }

  consultantClaim(item: SecretaryReservation): string {
    return consultantAttendanceClaimLabel(
      item.consultantSaysPatientAttended ?? item.ConsultantSaysPatientAttended,
    );
  }

  statusLabel(item: SecretaryReservation): string {
    return attendanceStatusPresentation(
      readAttendanceStatus(
        item,
        "attendanceConfirmationStatus",
        "AttendanceConfirmationStatus",
      ),
    ).label;
  }

  statusBadge(item: SecretaryReservation): string {
    return attendanceStatusPresentation(
      readAttendanceStatus(
        item,
        "attendanceConfirmationStatus",
        "AttendanceConfirmationStatus",
      ),
    ).badgeClass;
  }

  scoreText(item: SecretaryReservation): string {
    const applied =
      item.isAttendanceScoreApplied ?? item.IsAttendanceScoreApplied;
    const value = item.attendanceScoreValue ?? item.AttendanceScoreValue;
    if (applied && value !== null && value !== undefined) {
      return value > 0 ? `+${value}` : `${value}`;
    }

    return attendanceScoreLabel(
      item.secretaryApprovedConsultantConfirmation ??
        item.SecretaryApprovedConsultantConfirmation,
    );
  }

  scoreClass(item: SecretaryReservation): string {
    const text = this.scoreText(item);
    if (text.startsWith("+")) return "success";
    if (text.startsWith("-")) return "danger";
    return "muted";
  }

  formatDate(value: string): string {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date)
      : value;
  }

  private handleLoadError(requestId: number, error: unknown): void {
    if (requestId !== this.loadRequestId) return;
    this.items = [];
    this.showFeedback(
      error instanceof Error && error.message
        ? error.message
        : "دریافت رزروها انجام نشد",
      "error",
    );
  }

  private syncAnnouncements(items: SecretaryReservation[]): void {
    for (const item of items) {
      const id = this.reservationId(item);
      if (!id || this.savingAnnouncementIds.has(id)) continue;
      this.announcements[id] =
        item.secretaryAnnouncement ?? item.SecretaryAnnouncement ?? "";
    }
  }

  private startPolling(): void {
    this.stopPolling();
    const intervalMs = this.activeTab === "queue" ? 15000 : 30000;
    this.pollId = setInterval(() => {
      if (
        !this.profileReady ||
        this.loading ||
        this.savingId ||
        this.savingAnnouncementIds.size
      )
        return;
      this.load();
    }, intervalMs);
  }

  private stopPolling(): void {
    if (this.pollId) {
      clearInterval(this.pollId);
      this.pollId = null;
    }
  }

  private showFeedback(message: string, type: "success" | "error"): void {
    this.feedback = message;
    this.feedbackType = type;
    if (type === "success") {
      this.toast.success(message);
      return;
    }
    this.toast.error(message);
    this.markDirty();
  }
}
