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
  ReservationType,
} from "../../core/secretary/secretary-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { SecretaryDashboardPreset } from "./secretary-overview.component";
import { formatReservationTime } from "../../utils/iran-datetime.util";
import { SecretaryAnnouncementEditorComponent } from "./secretary-announcement-editor.component";

export type SecretaryReservationTab =
  | "queue"
  | "all"
  | "regular"
  | "after-sales"
  | "completed";

@Component({
  selector: "app-secretary-reservations",
  standalone: true,
  imports: [CommonModule, FormsModule, SecretaryAnnouncementEditorComponent],
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
  loading = false;
  savingId: number | null = null;
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

    const expected = preset === "secretary-confirmed" ? "Confirmed" :
      preset === "secretary-no-answer" ? "NoAnswer" :
      preset === "secretary-cancelled" ? "CancelledByPatient" : "NotCalled";
    return activeItems.filter((item) =>
      (item.secretaryAnnouncementStatus ?? item.SecretaryAnnouncementStatus ?? "NotCalled") === expected,
    );
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

  onAnnouncementSaved(): void {
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
        reservationType:
          this.activeTab === "regular"
            ? ReservationType.Regular
            : this.activeTab === "after-sales"
              ? ReservationType.AfterSalesService
              : null,
        sortDirection: "asc",
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
          this.pageNumber = response.pageNumber;
          this.totalPages = response.totalPages;
          this.markDirty();
        },
        error: (error) => this.handleLoadError(requestId, error),
      });
  }

  review(item: SecretaryReservation, patientReceivedService: boolean): void {
    if (!this.canManage(item)) return;
    const reservationId = this.reservationId(item);
    if (!reservationId) {
      this.showFeedback("شناسه رزرو در دسترس نیست", "error");
      return;
    }

    this.savingId = reservationId;
    this.secretaryApi
      .reviewAttendance({
        reservationId,
        patientReceivedService,
        note: (this.notes[reservationId] || "").trim() || null,
      })
      .pipe(finalize(() => (this.savingId = null)))
      .subscribe({
        next: (response) => {
          this.showFeedback(
            response.message ||
              (patientReceivedService
                ? "انجام خدمت برای بیمار ثبت شد"
                : "انجام نشدن خدمت برای بیمار ثبت شد"),
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

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.load();
  }

  emptyCopy(): string {
    if (this.activeTab === "queue") {
      return "موردی در صف بررسی تایید حضور وجود ندارد.";
    }
    if (this.activeTab === "after-sales")
      return "رزرو خدمات پس از فروشی یافت نشد.";
    if (this.activeTab === "regular") return "رزرو عادی یافت نشد.";
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

  canManage(item: SecretaryReservation): boolean {
    return this.secretaryApi.canManageReservation(item);
  }

  canUpdateAnnouncement(item: SecretaryReservation): boolean {
    return this.secretaryApi.canUpdateAnnouncement(item);
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

  formatAppointmentTime(value: string): string {
    return formatReservationTime(value);
  }

  displayReservationAt(item: SecretaryReservation): string {
    return (
      item.reservationAtPersian ??
      item.ReservationAtPersian ??
      this.formatAppointmentTime(this.reservationAt(item))
    );
  }

  serviceResult(item: SecretaryReservation): string {
    const result = item.patientReceivedService ?? item.PatientReceivedService;
    return result === true
      ? "خدمت انجام شد"
      : result === false
        ? "خدمت انجام نشد"
        : "هنوز بررسی نشده";
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

  private startPolling(): void {
    this.stopPolling();
    const intervalMs = this.activeTab === "queue" ? 15000 : 30000;
    this.pollId = setInterval(() => {
      if (!this.profileReady || this.loading || this.savingId) return;
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
