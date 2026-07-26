import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subscription, finalize } from "rxjs";
import {
  ConsultantDashboardService,
  ConsultantReservation,
  ConfirmAttendanceRequest,
  UpdateReservationRequest,
} from "../../core/consultant/consultant-dashboard.service";
import {
  AttendanceConfirmationStatus,
  attendanceScoreLabel,
  attendanceStatusPresentation,
  canConsultantConfirmDueReservation,
  isAwaitingConsultantAttendanceConfirmation,
  isPendingConsultantConfirmationNotYetDue,
  isSecretaryReviewCompleted,
  readAttendanceStatus,
} from "../../core/reservation/reservation-attendance";
import { ToastService } from "../../core/toast/toast.service";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { BaseDialogComponent } from "../../shared/base/base-dialog/base-dialog.component";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import {
  combineIranDateAndTime,
  formatIranDateTime,
  nowInIran,
  startOfIranDay,
  toIranTimeInputValue,
} from "../../utils/iran-datetime.util";

export type ConsultantReservationTab = "pending" | "all" | "completed";

@Component({
  selector: "app-consultant-reservations-panel",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent, BaseDatepickerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./consultant-reservations-panel.component.html",
  styleUrl: "./consultant-reservations-panel.component.scss",
})
export class ConsultantReservationsPanelComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input({ required: true }) profileId = 0;
  @Input() profileReady = false;
  @Output() pendingCountChange = new EventEmitter<number>();

  activeTab: ConsultantReservationTab = "pending";
  items: ConsultantReservation[] = [];
  notes: Record<number, string> = {};
  loading = false;
  savingId: number | null = null;
  feedback = "";
  feedbackType: "success" | "error" = "success";
  pageNumber = 1;
  pageSize = 20;
  totalPages = 1;
  pendingCount = 0;
  editDialogOpen = false;
  editSaving = false;
  editingReservation: ConsultantReservation | null = null;
  editForm = {
    reservationDate: null as Date | null,
    reservationTime: "",
    patientCity: "",
    patientRegion: "",
    attendanceProbabilityPercent: 80,
    attendancePrediction: "",
    secondaryPhoneNumber: "",
    description: "",
  };
  readonly reservationDatePickerLabel = {
    fa: "تاریخ رزرو",
    en: "Reservation date",
  };

  private loadRequestId = 0;
  private pollId: ReturnType<typeof setInterval> | null = null;
  private loadSubscription: Subscription | null = null;
  private destroyed = false;
  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;
  private readonly markDirty: () => void;

  constructor(
    private consultantApi: ConsultantDashboardService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.markDirty = createCoalescedMarkForCheck(this.cdr, () => this.destroyed);
  }

  ngOnInit(): void {
    if (this.profileReady) {
      this.load();
      this.startPolling();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["profileReady"]?.currentValue === true) {
      this.load();
      this.startPolling();
    }
    if (changes["profileId"] && this.profileReady) {
      this.load();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopPolling();
    this.loadSubscription?.unsubscribe();
  }

  setTab(tab: ConsultantReservationTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.pageNumber = 1;
    this.load();
    this.startPolling();
  }

  load(): void {
    if (!this.profileReady || !this.profileId) return;

    const requestId = ++this.loadRequestId;
    this.loading = true;
    this.feedback = "";
    this.markDirty();
    this.loadSubscription?.unsubscribe();

    if (this.activeTab === "pending") {
      this.loadSubscription = this.consultantApi
        .getDueConfirmations(this.profileId)
        .pipe(
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
            this.items = items ?? [];
            this.pendingCount = this.items.length;
            this.pendingCountChange.emit(this.pendingCount);
            this.markDirty();
          },
          error: (error) => {
            if (requestId !== this.loadRequestId) return;
            this.items = [];
            this.pendingCount = 0;
            this.pendingCountChange.emit(0);
            this.showFeedback(this.errorMessage(error), "error");
          },
        });
      return;
    }

    this.loadSubscription = this.consultantApi
      .getReservations({
        consultantProfileId: this.profileId,
        includeCanceled: false,
        onlySecretaryReviewed: this.activeTab === "completed" ? true : undefined,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize,
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
        error: (error) => {
          if (requestId !== this.loadRequestId) return;
          this.items = [];
          this.showFeedback(this.errorMessage(error), "error");
        },
      });
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.load();
  }

  confirm(reservation: ConsultantReservation, patientAttended: boolean): void {
    const reservationId = this.reservationId(reservation);
    if (!this.profileId || !reservationId) return;

    const payload: ConfirmAttendanceRequest = {
      reservationId,
      consultantProfileId: this.profileId,
      patientAttended,
      note: (this.notes[reservationId] || "").trim() || null,
    };

    this.savingId = reservationId;
    this.consultantApi
      .confirmAttendance(payload)
      .pipe(finalize(() => (this.savingId = null)))
      .subscribe({
        next: (response) => {
          this.showFeedback(
            response.message ||
              (patientAttended
                ? "حضور بیمار ثبت شد و برای بررسی منشی ارسال شد"
                : "عدم حضور بیمار ثبت شد و برای بررسی منشی ارسال شد"),
            "success",
          );
          this.load();
        },
        error: (error) =>
          this.showFeedback(this.errorMessage(error), "error"),
      });
  }

  emptyCopy(): string {
    if (this.activeTab === "pending") {
      return "رزروی در انتظار تایید حضور وجود ندارد.";
    }
    if (this.activeTab === "completed") {
      return "رزروی با بررسی نهایی منشی یافت نشد.";
    }
    return "رزروی برای نمایش وجود ندارد.";
  }

  reservationId(reservation: ConsultantReservation): number | null {
    const value =
      reservation.id ??
      reservation.Id ??
      reservation.reservationId ??
      reservation.ReservationId ??
      null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  patientName(reservation: ConsultantReservation): string {
    return reservation.patientName || reservation.PatientName || "بدون نام";
  }

  patientPhone(reservation: ConsultantReservation): string {
    return (
      reservation.patientPhoneNumber || reservation.PatientPhoneNumber || "-"
    );
  }

  patientCity(reservation: ConsultantReservation): string {
    return reservation.patientCity || reservation.PatientCity || "شهر ثبت نشده";
  }

  reservationAt(reservation: ConsultantReservation): string {
    return reservation.reservationAt || reservation.ReservationAt || "";
  }

  probability(reservation: ConsultantReservation): number | string {
    return (
      reservation.attendanceProbabilityPercent ??
      reservation.AttendanceProbabilityPercent ??
      "-"
    );
  }

  attendancePrediction(reservation: ConsultantReservation): string {
    return (
      reservation.attendancePrediction ||
      reservation.AttendancePrediction ||
      "-"
    );
  }

  statusLabel(reservation: ConsultantReservation): string {
    return attendanceStatusPresentation(
      readAttendanceStatus(
        reservation,
        "attendanceConfirmationStatus",
        "AttendanceConfirmationStatus",
      ),
    ).label;
  }

  badgeClass(reservation: ConsultantReservation): string {
    return attendanceStatusPresentation(
      readAttendanceStatus(
        reservation,
        "attendanceConfirmationStatus",
        "AttendanceConfirmationStatus",
      ),
    ).badgeClass;
  }

  canConfirm(reservation: ConsultantReservation): boolean {
    if (this.activeTab === "pending") {
      return isAwaitingConsultantAttendanceConfirmation(reservation);
    }

    return canConsultantConfirmDueReservation(reservation);
  }

  isPendingNotYetDue(reservation: ConsultantReservation): boolean {
    return isPendingConsultantConfirmationNotYetDue(reservation);
  }

  isCompletedTab(reservation: ConsultantReservation): boolean {
    return (
      this.activeTab === "completed" &&
      isSecretaryReviewCompleted(
        readAttendanceStatus(
          reservation,
          "attendanceConfirmationStatus",
          "AttendanceConfirmationStatus",
        ),
      )
    );
  }

  scoreText(reservation: ConsultantReservation): string {
    const applied =
      reservation.isAttendanceScoreApplied ??
      reservation.IsAttendanceScoreApplied;
    const value =
      reservation.attendanceScoreValue ?? reservation.AttendanceScoreValue;
    if (applied && value !== null && value !== undefined) {
      return value > 0 ? `+${value}` : `${value}`;
    }

    return attendanceScoreLabel(
      reservation.secretaryApprovedConsultantConfirmation ??
        reservation.SecretaryApprovedConsultantConfirmation,
    );
  }

  scoreClass(reservation: ConsultantReservation): string {
    const text = this.scoreText(reservation);
    if (text.startsWith("+")) return "success";
    if (text.startsWith("-")) return "danger";
    return "muted";
  }

  formatDateTime(value: string): string {
    return formatIranDateTime(value);
  }

  canEdit(reservation: ConsultantReservation): boolean {
    const status = readAttendanceStatus(
      reservation,
      "attendanceConfirmationStatus",
      "AttendanceConfirmationStatus",
    );
    return (
      status !== AttendanceConfirmationStatus.SecretaryApproved &&
      status !== AttendanceConfirmationStatus.SecretaryRejected &&
      !(reservation.isCanceled ?? reservation.IsCanceled)
    );
  }

  openEditDialog(reservation: ConsultantReservation): void {
    const reservationAt = this.reservationAt(reservation);
    const date = reservationAt ? new Date(reservationAt) : new Date();
    this.editingReservation = reservation;
    this.editForm = {
      reservationDate: Number.isFinite(date.getTime()) ? date : new Date(),
      reservationTime: toIranTimeInputValue(date),
      patientCity: this.patientCity(reservation) === "شهر ثبت نشده"
        ? ""
        : this.patientCity(reservation),
      patientRegion: reservation.patientRegion || reservation.PatientRegion || "",
      attendanceProbabilityPercent: Number(this.probability(reservation)) || 80,
      attendancePrediction:
        reservation.attendancePrediction ||
        reservation.AttendancePrediction ||
        "بیمار گفت در تاریخ و ساعت رزرو شده در مطب حاضر می‌شود.",
      secondaryPhoneNumber:
        reservation.secondaryPhoneNumber ||
        reservation.SecondaryPhoneNumber ||
        "",
      description: reservation.description || reservation.Description || "",
    };
    this.editDialogOpen = true;
    this.markDirty();
  }

  closeEditDialog(): void {
    this.editDialogOpen = false;
    this.editSaving = false;
    this.editingReservation = null;
    this.markDirty();
  }

  setEditReservationDate(date: Date): void {
    this.editForm.reservationDate = date;
  }

  submitEdit(): void {
    const reservationId = this.editingReservation
      ? this.reservationId(this.editingReservation)
      : null;
    if (!this.profileId || !reservationId) return;

 if (!this.editForm.reservationDate) {
  this.showFeedback("تاریخ و ساعت رزرو را وارد کنید", "error");
  return;
}

const reservationAt = combineIranDateAndTime(
  this.editForm.reservationDate,
  this.editForm.reservationTime,
);
    if (!reservationAt) {
      this.showFeedback("تاریخ و ساعت رزرو را وارد کنید", "error");
      return;
    }

    const payload: UpdateReservationRequest = {
      reservationId,
      consultantProfileId: this.profileId,
      reservationAt: reservationAt.toISOString(),
      patientCity: this.editForm.patientCity.trim(),
      patientRegion: this.editForm.patientRegion.trim(),
      attendanceProbabilityPercent: this.editForm.attendanceProbabilityPercent,
      attendancePrediction: this.editForm.attendancePrediction.trim(),
      secondaryPhoneNumber: this.editForm.secondaryPhoneNumber.trim() || null,
      description: this.editForm.description.trim() || null,
    };

    this.editSaving = true;
    this.consultantApi
      .updateReservation(payload)
      .pipe(finalize(() => (this.editSaving = false)))
      .subscribe({
        next: (response) => {
          this.showFeedback(response.message || "رزرو با موفقیت ویرایش شد", "success");
          this.closeEditDialog();
          this.load();
        },
        error: (error) =>
          this.showFeedback(this.errorMessage(error), "error"),
      });
  }

  minimumReservationDate(): Date {
    return startOfIranDay(nowInIran());
  }

  private startPolling(): void {
    this.stopPolling();
    const intervalMs = this.activeTab === "pending" ? 15000 : 30000;
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

  private errorMessage(error: unknown): string {
    return error instanceof Error && error.message
      ? error.message
      : "عملیات انجام نشد";
  }

  private showFeedback(message: string, type: "success" | "error"): void {
    this.feedback = message;
    this.feedbackType = type;
    if (type === "success") this.toast.success(message);
    else     this.toast.error(message);
    this.markDirty();
  }
}
