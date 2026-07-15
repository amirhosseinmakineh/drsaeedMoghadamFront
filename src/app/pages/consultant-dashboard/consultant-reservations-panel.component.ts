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
} from "../../core/consultant/consultant-dashboard.service";
import {
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

export type ConsultantReservationTab = "pending" | "all" | "completed";

@Component({
  selector: "app-consultant-reservations-panel",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="reservation-panel">
      <header class="panel-heading">
        <div>
          <span>رزروها</span>
          <h2>مدیریت رزرو و تایید حضور</h2>
        </div>
        <button
          class="secondary-action compact"
          type="button"
          [disabled]="loading"
          (click)="load()"
        >
          بروزرسانی
        </button>
      </header>

      <nav class="tab-nav" aria-label="تب‌های رزرو">
        <button
          type="button"
          [class.active]="activeTab === 'pending'"
          (click)="setTab('pending')"
        >
          در انتظار تایید
          @if (pendingCount) {
            <b>{{ pendingCount }}</b>
          }
        </button>
        <button
          type="button"
          [class.active]="activeTab === 'all'"
          (click)="setTab('all')"
        >
          همه
        </button>
        <button
          type="button"
          [class.active]="activeTab === 'completed'"
          (click)="setTab('completed')"
        >
          انجام‌شده
        </button>
      </nav>

      @if (feedback) {
        <p
          class="feedback"
          [class.error]="feedbackType === 'error'"
          [class.success]="feedbackType === 'success'"
        >
          {{ feedback }}
        </p>
      }

      @if (loading) {
        <div class="loading-state" role="status" aria-live="polite">
          <span class="loading-spinner" aria-hidden="true"></span>
          <p>در حال دریافت رزروها...</p>
        </div>
      } @else if (!items.length) {
        <p class="empty-copy">{{ emptyCopy() }}</p>
      } @else {
        <div class="reservation-list">
          @for (reservation of items; track reservationId(reservation)) {
            <article>
              <header>
                <div>
                  <strong>{{ patientName(reservation) }}</strong>
                  <small
                    >{{ patientPhone(reservation) }} -
                    {{ patientCity(reservation) }}</small
                  >
                </div>
                <b class="status-badge" [class]="badgeClass(reservation)">{{
                  statusLabel(reservation)
                }}</b>
              </header>
              <dl>
                <div>
                  <dt>زمان رزرو</dt>
                  <dd>{{ formatDateTime(reservationAt(reservation)) }}</dd>
                </div>
                <div>
                  <dt>احتمال حضور</dt>
                  <dd>{{ probability(reservation) }}٪</dd>
                </div>
                @if (activeTab !== "pending") {
                  <div>
                    <dt>پیش‌بینی حضور</dt>
                    <dd>{{ attendancePrediction(reservation) }}</dd>
                  </div>
                }
                @if (isCompletedTab(reservation)) {
                  <div>
                    <dt>امتیاز</dt>
                    <dd [class]="scoreClass(reservation)">
                      {{ scoreText(reservation) }}
                    </dd>
                  </div>
                }
              </dl>

              @if (isPendingNotYetDue(reservation)) {
                <p class="pending-hint">
                  پس از رسیدن زمان رزرو، دکمه‌های تایید حضور فعال می‌شوند.
                </p>
              }

              @if (canConfirm(reservation)) {
                <div class="confirmation-box">
                  <strong>تایید حضور بیمار</strong>
                  <p>
                    لطفاً مشخص کنید بیمار در زمان رزرو حاضر شد یا خیر. پس از
                    تایید، رزرو برای بررسی منشی ارسال می‌شود.
                  </p>
                  <label>
                    یادداشت (اختیاری)
                    <textarea
                      [(ngModel)]="notes[reservationId(reservation) || 0]"
                      [ngModelOptions]="ngModelBlurOptions"
                      [name]="'note' + reservationId(reservation)"
                      rows="2"
                    ></textarea>
                  </label>
                  <div class="dialog-actions">
                    <button
                      class="primary-action compact"
                      type="button"
                      [disabled]="savingId === reservationId(reservation)"
                      (click)="confirm(reservation, true)"
                    >
                      تایید حضور بیمار
                    </button>
                    <button
                      class="secondary-action compact danger"
                      type="button"
                      [disabled]="savingId === reservationId(reservation)"
                      (click)="confirm(reservation, false)"
                    >
                      تایید عدم حضور
                    </button>
                  </div>
                </div>
              }
            </article>
          }
        </div>

        @if (activeTab !== "pending" && totalPages > 1) {
          <nav class="pagination" aria-label="صفحه‌بندی رزروها">
            <button
              class="secondary-action compact"
              type="button"
              [disabled]="pageNumber <= 1 || loading"
              (click)="goToPage(pageNumber - 1)"
            >
              قبلی
            </button>
            <span>{{ pageNumber }} / {{ totalPages }}</span>
            <button
              class="secondary-action compact"
              type="button"
              [disabled]="pageNumber >= totalPages || loading"
              (click)="goToPage(pageNumber + 1)"
            >
              بعدی
            </button>
          </nav>
        }
      }
    </section>
  `,
  styles: [
    `
      .reservation-panel {
        display: grid;
        gap: 16px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 30px;
        background: var(--surface);
        box-shadow: var(--shadow);
      }
      .panel-heading {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }
      .panel-heading span {
        display: inline-flex;
        margin-bottom: 8px;
        padding: 5px 12px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--brand) 14%, transparent);
        color: var(--brand);
        font-weight: 950;
      }
      .panel-heading h2 {
        margin: 0;
        font-size: 1.35rem;
      }
      .tab-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .tab-nav button {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 40px;
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 8px 14px;
        background: var(--surface-muted);
        color: var(--text);
        font: inherit;
        font-weight: 900;
        cursor: pointer;
      }
      .tab-nav button.active {
        border-color: color-mix(in srgb, var(--brand) 40%, var(--line));
        background: color-mix(in srgb, var(--brand) 16%, transparent);
        color: var(--brand);
      }
      .tab-nav b {
        display: inline-grid;
        place-items: center;
        min-width: 22px;
        min-height: 22px;
        border-radius: 999px;
        background: var(--danger);
        color: #fff;
        font-size: 0.75rem;
      }
      .secondary-action,
      .primary-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 48px;
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 12px 16px;
        color: var(--text);
        font: inherit;
        font-weight: 950;
      }
      .primary-action {
        border: 0;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #1b1712;
      }
      .secondary-action {
        background: var(--surface-muted);
      }
      .compact {
        min-height: 40px;
        border-radius: 999px;
        padding: 9px 13px;
        font-size: 0.86rem;
      }
      .danger {
        color: #991b1b;
      }
      .secondary-action:disabled,
      .primary-action:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }
      .feedback,
      .empty-copy {
        margin: 0;
        padding: 12px 14px;
        border-radius: 20px;
        font-weight: 950;
      }
      .feedback.success {
        background: color-mix(in srgb, #22c55e 16%, var(--surface));
        color: #166534;
      }
      .feedback.error {
        background: color-mix(in srgb, var(--danger) 15%, var(--surface));
        color: #991b1b;
      }
      .empty-copy {
        border: 1px dashed var(--line);
        color: var(--muted);
        text-align: center;
      }
      .loading-state {
        display: grid;
        justify-items: center;
        gap: 12px;
        padding: 32px 16px;
        border: 1px solid var(--line);
        border-radius: 22px;
        background: color-mix(in srgb, var(--surface-muted) 70%, transparent);
      }
      .loading-state p {
        margin: 0;
        color: var(--muted);
        font-weight: 900;
      }
      .loading-spinner {
        width: 30px;
        height: 30px;
        border: 3px solid color-mix(in srgb, var(--brand) 24%, transparent);
        border-top-color: var(--brand);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .reservation-list {
        display: grid;
        gap: 12px;
      }
      .reservation-list article {
        display: grid;
        gap: 12px;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: var(--surface-soft);
      }
      .reservation-list header {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }
      .reservation-list strong,
      .reservation-list small {
        display: block;
      }
      .reservation-list small,
      dt {
        color: var(--muted);
        font-weight: 900;
      }
      dl {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin: 0;
      }
      dt,
      dd {
        margin: 0;
      }
      dd {
        font-weight: 950;
      }
      .status-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 30px;
        border-radius: 999px;
        padding: 5px 10px;
        font-size: 0.8rem;
        font-weight: 950;
      }
      .muted {
        background: var(--surface-muted);
        color: var(--muted);
      }
      .info {
        background: color-mix(in srgb, var(--brand) 16%, var(--surface));
        color: var(--brand);
      }
      .success {
        background: color-mix(in srgb, #22c55e 16%, var(--surface));
        color: #166534;
      }
      .warn {
        background: color-mix(in srgb, #f59e0b 16%, var(--surface));
        color: #92400e;
      }
      .danger {
        background: color-mix(in srgb, var(--danger) 12%, var(--surface));
        color: #991b1b;
      }
      .pending-hint {
        margin: 0;
        padding: 10px 12px;
        border-radius: 16px;
        background: color-mix(in srgb, #f59e0b 12%, var(--surface));
        color: #92400e;
        font-weight: 900;
        font-size: 0.9rem;
      }
      .confirmation-box {
        display: grid;
        gap: 10px;
        padding: 12px;
        border: 1px solid color-mix(in srgb, var(--brand) 28%, var(--line));
        border-radius: 18px;
        background: color-mix(in srgb, var(--brand) 8%, var(--surface));
      }
      .confirmation-box strong {
        font-size: 0.95rem;
      }
      .confirmation-box p {
        margin: 0;
        color: var(--muted);
        font-weight: 850;
        font-size: 0.88rem;
        line-height: 1.7;
      }
      .dialog-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
      }
      .pagination span {
        font-weight: 950;
      }
      label {
        display: grid;
        gap: 7px;
        color: var(--muted);
        font-weight: 850;
      }
      textarea {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 11px 12px;
        background: var(--surface-muted);
        color: var(--text);
        font: inherit;
      }
      @media (max-width: 760px) {
        .panel-heading,
        .reservation-list header {
          display: grid;
        }
        dl {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
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
    if (!value) return "-";
    const date = new Date(value);
    return Number.isFinite(date.getTime())
      ? new Intl.DateTimeFormat("fa-IR", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(date)
      : value;
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
