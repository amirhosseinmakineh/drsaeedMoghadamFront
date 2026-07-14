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
  CompletePatientProfileRequest,
  SecretaryReservation,
  SecretaryDashboardService,
} from "../../core/secretary/secretary-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";

export type SecretaryReservationTab = "queue" | "all" | "completed";

@Component({
  selector: "app-secretary-reservations",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="secretary-panel">
      <header class="panel-heading">
        <div>
          <span>رزروها</span>
          <h2>مدیریت رزرو و بررسی حضور</h2>
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

      <nav class="tab-nav" aria-label="تب‌های رزرو منشی">
        <button
          type="button"
          [class.active]="activeTab === 'queue'"
          (click)="setTab('queue')"
        >
          صف بررسی
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

      @if (activeTab === "all") {
        <div class="filters">
          <label>
            جستجو
            <input
              [(ngModel)]="searchText"
              [ngModelOptions]="ngModelBlurOptions"
              name="secretaryReservationSearch"
              (keyup.enter)="applySearch()"
            />
          </label>
          <label>
            وضعیت
            <select
              [(ngModel)]="statusFilter"
              name="secretaryReservationStatus"
              (ngModelChange)="load()"
            >
              <option [ngValue]="null">همه</option>
              <option [ngValue]="1">منتظر اعلام مشاور</option>
              <option [ngValue]="2">مشاور: بیمار آمده</option>
              <option [ngValue]="3">مشاور: بیمار نیامده</option>
              <option [ngValue]="4">تایید نهایی منشی</option>
              <option [ngValue]="5">رد نهایی منشی</option>
            </select>
          </label>
          <button
            class="secondary-action compact"
            type="button"
            (click)="applySearch()"
          >
            اعمال فیلتر
          </button>
          <label class="checkbox-field">
            <input
              type="checkbox"
              [(ngModel)]="includeCanceled"
              name="secretaryIncludeCanceled"
              (ngModelChange)="load()"
            />
            نمایش لغوشده‌ها
          </label>
        </div>
      }

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
        <div class="reservation-table">
          @for (item of items; track reservationId(item)) {
            <article>
              <header>
                <div>
                  <strong>{{ patientName(item) }}</strong>
                  <small
                    >{{ patientPhone(item) }} - {{ patientCity(item) }}</small
                  >
                </div>
                <b [class]="statusBadge(item)">{{ statusLabel(item) }}</b>
              </header>
              <dl>
                <div>
                  <dt>مشاور</dt>
                  <dd>{{ consultantName(item) }}</dd>
                </div>
                <div>
                  <dt>زمان رزرو</dt>
                  <dd>{{ formatDate(reservationAt(item)) }}</dd>
                </div>
                <div>
                  <dt>احتمال حضور</dt>
                  <dd>{{ probability(item) }}٪</dd>
                </div>
                @if (activeTab !== "all") {
                  <div>
                    <dt>اظهار مشاور</dt>
                    <dd>{{ consultantClaim(item) }}</dd>
                  </div>
                }
                @if (activeTab === "completed") {
                  <div>
                    <dt>امتیاز</dt>
                    <dd [class]="scoreClass(item)">{{ scoreText(item) }}</dd>
                  </div>
                }
                <div>
                  <dt>پرونده بیمار</dt>
                  <dd>
                    {{
                      requiresPatientProfile(item)
                        ? "نیاز به تکمیل"
                        : "تکمیل شده"
                    }}
                  </dd>
                </div>
              </dl>

              @if (canReview(item)) {
                <label>
                  یادداشت منشی
                  <textarea
                    [(ngModel)]="notes[reservationId(item) || 0]"
                    [ngModelOptions]="ngModelBlurOptions"
                    [name]="'secretaryNote' + reservationId(item)"
                    rows="2"
                  ></textarea>
                </label>
              }

              <div class="dialog-actions">
                @if (requiresPatientProfile(item)) {
                  <button
                    class="secondary-action compact"
                    type="button"
                    (click)="openProfileDialog(item)"
                  >
                    تکمیل پرونده
                  </button>
                }
                @if (canReview(item)) {
                  <button
                    class="primary-action compact"
                    type="button"
                    [disabled]="savingId === reservationId(item)"
                    (click)="review(item, true)"
                  >
                    تایید ادعای مشاور (+۱۰)
                  </button>
                  <button
                    class="secondary-action compact danger"
                    type="button"
                    [disabled]="savingId === reservationId(item)"
                    (click)="review(item, false)"
                  >
                    رد ادعای مشاور (-۱۰)
                  </button>
                }
              </div>
            </article>
          }
        </div>

        @if (totalPages > 1) {
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

    @if (profileDialogOpen) {
      <div class="inline-dialog-backdrop" (click)="closeProfileDialog()">
        <form
          class="inline-dialog"
          (click)="$event.stopPropagation()"
          (ngSubmit)="submitProfile()"
        >
          <h3>تکمیل پرونده بیمار</h3>
          <div class="two-col">
            <label
              >نام<input
                [(ngModel)]="profileForm.firstName"
                [ngModelOptions]="ngModelBlurOptions"
                name="resPatientFirstName"
                maxlength="100"
            /></label>
            <label
              >نام خانوادگی<input
                [(ngModel)]="profileForm.lastName"
                [ngModelOptions]="ngModelBlurOptions"
                name="resPatientLastName"
                maxlength="100"
            /></label>
          </div>
          <div class="two-col">
            <label
              >موبایل<input
                [(ngModel)]="profileForm.phoneNumber"
                name="resPatientPhone"
                readonly
            /></label>
            <label
              >رمز عبور<input
                [(ngModel)]="profileForm.passwordHash"
                [ngModelOptions]="ngModelBlurOptions"
                name="resPatientPassword"
                type="password"
                minlength="6"
            /></label>
          </div>
          <div class="two-col">
            <label
              >تاریخ تولد<input
                [(ngModel)]="profileForm.birthDate"
                [ngModelOptions]="ngModelBlurOptions"
                name="resPatientBirthDate"
                type="date"
            /></label>
          </div>
          <label
            >آدرس<textarea
              [(ngModel)]="profileForm.address"
              [ngModelOptions]="ngModelBlurOptions"
              name="resPatientAddress"
              rows="3"
            ></textarea>
          </label>
          <div class="two-col">
            <label
              >جنسیت<select
                [(ngModel)]="profileForm.gender"
                [ngModelOptions]="ngModelBlurOptions"
                name="resPatientGender"
                ><option [ngValue]="1">مرد</option
                ><option [ngValue]="2">زن</option></select
              ></label
            >
            <label
              >شماره اضطراری<input
                [(ngModel)]="profileForm.emergencyPhoneNumber"
                [ngModelOptions]="ngModelBlurOptions"
                name="resEmergencyPhone"
                inputmode="tel"
            /></label>
          </div>
          <label
            >بیمه<input
              [(ngModel)]="profileForm.insuranceName"
              [ngModelOptions]="ngModelBlurOptions"
              name="resInsurance"
          /></label>
          <label
            >توضیحات<textarea
              [(ngModel)]="profileForm.notes"
              [ngModelOptions]="ngModelBlurOptions"
              name="resProfileNotes"
              rows="2"
            ></textarea>
          </label>
          <div class="dialog-actions">
            <button
              class="secondary-action"
              type="button"
              (click)="closeProfileDialog()"
            >
              انصراف
            </button>
            <button
              class="primary-action"
              type="submit"
              [disabled]="profileSaving"
            >
              {{ profileSaving ? "در حال ثبت..." : "ثبت پرونده" }}
            </button>
          </div>
        </form>
      </div>
    }
  `,
  styles: [
    `
      .secretary-panel {
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
      .filters {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto auto;
        gap: 12px;
        align-items: end;
      }
      .checkbox-field {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 48px;
        padding: 0 12px;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: var(--surface-muted);
        color: var(--text);
        font-weight: 900;
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
        background: color-mix(in srgb, #22c55e 16%, transparent);
        color: #166534;
      }
      .feedback.error {
        background: color-mix(in srgb, var(--danger) 15%, transparent);
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
      .reservation-table {
        display: grid;
        gap: 12px;
      }
      .reservation-table article {
        display: grid;
        gap: 12px;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: var(--surface-soft);
      }
      .reservation-table header {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }
      .reservation-table strong,
      .reservation-table small {
        display: block;
      }
      .reservation-table small,
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
      .success {
        color: #166534;
      }
      .warn {
        color: #92400e;
      }
      .muted {
        color: var(--muted);
      }
      .danger {
        color: #991b1b;
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
      input,
      select,
      textarea {
        width: 100%;
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 11px 12px;
        background: var(--surface-muted);
        color: var(--text);
        font: inherit;
      }
      .inline-dialog-backdrop {
        position: fixed;
        inset: 0;
        z-index: 50;
        display: grid;
        place-items: center;
        padding: 20px;
        background: rgba(0, 0, 0, 0.58);
      }
      .inline-dialog {
        width: min(760px, 100%);
        max-height: 92vh;
        overflow: auto;
        display: grid;
        gap: 12px;
        padding: 18px;
        border-radius: 28px;
        border: 1px solid var(--line);
        background: var(--surface);
        box-shadow: var(--shadow);
      }
      .inline-dialog h3 {
        margin: 0;
      }
      .two-col {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      @media (max-width: 760px) {
        .panel-heading,
        .filters,
        .reservation-table header {
          display: grid;
        }
        dl,
        .two-col {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SecretaryReservationsComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() profileReady = false;
  @Input() initialTab: SecretaryReservationTab = "queue";

  activeTab: SecretaryReservationTab = "queue";
  items: SecretaryReservation[] = [];
  notes: Record<number, string> = {};
  profileDialogOpen = false;
  profileSaving = false;
  selectedProfileReservation: SecretaryReservation | null = null;
  profileForm = this.emptyProfileForm();
  loading = false;
  savingId: number | null = null;
  feedback = "";
  feedbackType: "success" | "error" = "success";
  statusFilter: number | null = null;
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
    this.markDirty = createCoalescedMarkForCheck(this.cdr, () => this.destroyed);
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

  load(): void {
    if (!this.profileReady) return;

    const requestId = ++this.loadRequestId;
    this.loading = true;
    this.feedback = "";
    this.markDirty();
    this.loadSubscription?.unsubscribe();

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
            const merged = [...(approved.items ?? []), ...(rejected.items ?? [])]
              .sort(
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

  requiresPatientProfile(item: SecretaryReservation): boolean {
    return (item.requiresPatientProfile ?? item.RequiresPatientProfile) === true;
  }

  openProfileDialog(item: SecretaryReservation): void {
    const [firstName, ...rest] = this.patientName(item).split(" ").filter(Boolean);
    this.selectedProfileReservation = item;
    this.profileForm = {
      ...this.emptyProfileForm(),
      firstName: firstName || "",
      lastName: rest.join(" "),
      phoneNumber: this.patientPhone(item),
    };
    this.profileDialogOpen = true;
  }

  closeProfileDialog(): void {
    if (this.profileSaving) return;
    this.profileDialogOpen = false;
    this.selectedProfileReservation = null;
    this.profileForm = this.emptyProfileForm();
  }

  submitProfile(): void {
    const reservationId = this.selectedProfileReservation
      ? this.reservationId(this.selectedProfileReservation)
      : null;
    const validation = this.validateProfileForm();
    if (!reservationId || validation) {
      this.showFeedback(validation || "شناسه رزرو در دسترس نیست", "error");
      return;
    }

    const payload: CompletePatientProfileRequest = {
      reservationId,
      firstName: this.profileForm.firstName.trim(),
      lastName: this.profileForm.lastName.trim(),
      phoneNumber: this.profileForm.phoneNumber.trim(),
      passwordHash: this.profileForm.passwordHash,
      avatarImageName: null,
      gender: Number(this.profileForm.gender),
      birthDate: new Date(this.profileForm.birthDate).toISOString(),
      address: this.profileForm.address.trim(),
      emergencyPhoneNumber:
        this.profileForm.emergencyPhoneNumber.trim() || null,
      insuranceName: this.profileForm.insuranceName.trim() || null,
      notes: this.profileForm.notes.trim() || null,
    };

    this.profileSaving = true;
    this.secretaryApi
      .completePatientProfile(payload)
      .pipe(finalize(() => (this.profileSaving = false)))
      .subscribe({
        next: (response) => {
          this.showFeedback(
            response.message || "پرونده بیمار ثبت شد",
            "success",
          );
          this.closeProfileDialog();
          this.load();
        },
        error: (error) =>
          this.showFeedback(
            error instanceof Error && error.message
              ? error.message
              : "ثبت پرونده انجام نشد",
            "error",
          ),
      });
  }

  validateProfileForm(): string | null {
    if (!this.profileForm.firstName.trim()) return "نام بیمار الزامی است";
    if (!this.profileForm.lastName.trim()) return "نام خانوادگی بیمار الزامی است";
    if (!/^09\d{9}$/.test(this.profileForm.phoneNumber.trim()))
      return "شماره موبایل بیمار معتبر نیست";
    if (this.profileForm.passwordHash.length < 6)
      return "رمز عبور باید حداقل ۶ کاراکتر باشد";
    if (!this.profileForm.address.trim()) return "آدرس بیمار الزامی است";
    if (!this.profileForm.birthDate) return "تاریخ تولد بیمار الزامی است";
    return null;
  }

  reservationId(item: SecretaryReservation): number | null {
    const value = item.id ?? item.Id;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  patientName(item: SecretaryReservation): string {
    return item.patientName?.trim() || item.PatientName?.trim() || "بیمار بدون نام";
  }

  patientPhone(item: SecretaryReservation): string {
    return item.patientPhoneNumber?.trim() || item.PatientPhoneNumber?.trim() || "-";
  }

  patientCity(item: SecretaryReservation): string {
    return item.patientCity?.trim() || item.PatientCity?.trim() || "شهر ثبت نشده";
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

  private emptyProfileForm() {
    return {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      passwordHash: "123456",
      avatarImageName: null,
      gender: 1,
      birthDate: "1995-01-01",
      address: "",
      emergencyPhoneNumber: "",
      insuranceName: "",
      notes: "",
    };
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
