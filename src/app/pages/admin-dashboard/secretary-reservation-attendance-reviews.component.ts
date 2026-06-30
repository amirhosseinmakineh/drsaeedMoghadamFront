import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import {
  AdminDashboardService,
  CompletePatientProfileRequest,
  SecretaryReservation,
} from "../../core/admin/admin-dashboard.service";
import { AuthService } from "../../core/auth/auth.service";

@Component({
  selector: "app-secretary-reservation-attendance-reviews",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="admin-panel">
      <header class="panel-heading">
        <div>
          <span>بررسی منشی</span>
          <h2>داشبورد رزروها و بررسی تایید حضور</h2>
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
          <p>در حال دریافت موارد بررسی...</p>
        </div>
      } @else if (!items.length) {
        <p class="empty-copy">موردی برای بررسی تایید حضور وجود ندارد.</p>
      } @else {
        <div class="review-table">
          @for (item of items; track reservationId(item)) {
            <article>
              <header>
                <div>
                  <strong>{{
                    value(item.patientName, item.PatientName, "بیمار بدون نام")
                  }}</strong>
                  <small
                    >{{
                      value(
                        item.patientPhoneNumber,
                        item.PatientPhoneNumber,
                        "-"
                      )
                    }}
                    -
                    {{
                      value(item.patientCity, item.PatientCity, "شهر ثبت نشده")
                    }}</small
                  >
                </div>
                <b [class]="statusBadge(status(item))">{{
                  statusLabel(status(item))
                }}</b>
              </header>
              <dl>
                <div>
                  <dt>مشاور</dt>
                  <dd>
                    {{ value(item.consultantFullName, item.ConsultantFullName, "-") }}
                  </dd>
                </div>
                <div>
                  <dt>زمان رزرو</dt>
                  <dd>
                    {{
                      formatDate(
                        value(item.reservationAt, item.ReservationAt, "")
                      )
                    }}
                  </dd>
                </div>
                <div>
                  <dt>احتمال حضور</dt>
                  <dd>{{ probability(item) }}٪</dd>
                </div>
                <div>
                  <dt>پیش‌بینی مشاور</dt>
                  <dd>
                    {{
                      value(
                        consultantAttendanceText(item),
                        null,
                        "-"
                      )
                    }}
                  </dd>
                </div>
                <div>
                  <dt>یادداشت مشاور</dt>
                  <dd>
                    {{
                      value(
                        item.consultantAttendanceNote,
                        item.ConsultantAttendanceNote,
                        "-"
                      )
                    }}
                  </dd>
                </div>
              </dl>
              <label
                >یادداشت منشی<textarea
                  [(ngModel)]="notes[reservationId(item) || 0]"
                  [name]="'secretaryNote' + reservationId(item)"
                  rows="2"
                ></textarea>
              </label>
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
                @if (isWaitingForSecretaryReview(item)) {
                <button
                  class="primary-action compact"
                  type="button"
                  [disabled]="savingId === reservationId(item)"
                  (click)="review(item, true)"
                >
                  تایید ادعای مشاور
                </button>
                <button
                  class="secondary-action compact danger"
                  type="button"
                  [disabled]="savingId === reservationId(item)"
                  (click)="review(item, false)"
                >
                  رد ادعای مشاور
                </button>
                }
              </div>
            </article>
          }
        </div>
      }
    </section>

      @if (profileDialogOpen) {
        <div class="inline-dialog-backdrop" (click)="closeProfileDialog()">
          <form class="inline-dialog" (click)="$event.stopPropagation()" (ngSubmit)="submitProfile()">
            <h3>تکمیل پرونده بیمار</h3>
            <div class="two-col">
              <label>نام<input [(ngModel)]="profileForm.firstName" name="secPatientFirstName" maxlength="100" /></label>
              <label>نام خانوادگی<input [(ngModel)]="profileForm.lastName" name="secPatientLastName" maxlength="100" /></label>
            </div>
            <div class="two-col">
              <label>موبایل<input [(ngModel)]="profileForm.phoneNumber" name="secPatientPhone" readonly /></label>
              <label>رمز عبور<input [(ngModel)]="profileForm.passwordHash" name="secPatientPassword" type="password" minlength="6" /></label>
            </div>
            <div class="two-col">
              <label>کد ملی<input [(ngModel)]="profileForm.nationalCode" name="secPatientNationalCode" maxlength="10" inputmode="numeric" /></label>
              <label>تاریخ تولد<input [(ngModel)]="profileForm.birthDate" name="secPatientBirthDate" type="date" /></label>
            </div>
            <label>آدرس<textarea [(ngModel)]="profileForm.address" name="secPatientAddress" rows="3"></textarea></label>
            <div class="two-col">
              <label>جنسیت<select [(ngModel)]="profileForm.gender" name="secPatientGender"><option [ngValue]="1">مرد</option><option [ngValue]="2">زن</option></select></label>
              <label>شماره اضطراری<input [(ngModel)]="profileForm.emergencyPhoneNumber" name="secEmergencyPhone" inputmode="tel" /></label>
            </div>
            <label>بیمه<input [(ngModel)]="profileForm.insuranceName" name="secInsurance" /></label>
            <label>توضیحات<textarea [(ngModel)]="profileForm.notes" name="secProfileNotes" rows="2"></textarea></label>
            <div class="dialog-actions">
              <button class="secondary-action" type="button" (click)="closeProfileDialog()">انصراف</button>
              <button class="primary-action" type="submit" [disabled]="profileSaving || validateProfileForm() !== null">{{ profileSaving ? "در حال ثبت..." : "ثبت پرونده" }}</button>
            </div>
          </form>
        </div>
      }
  `,
  styles: [
    `
      .admin-panel {
        display: grid;
        gap: 16px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 30px;
        background: color-mix(in srgb, var(--surface) 88%, transparent);
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
      .panel-heading p {
        margin: 8px 0 0;
        color: var(--muted);
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
      .danger {
        color: #fecaca;
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
        color: #bbf7d0;
      }
      .feedback.error {
        background: color-mix(in srgb, var(--danger) 15%, transparent);
        color: #fecaca;
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
      .review-table {
        display: grid;
        gap: 12px;
      }
      .inline-dialog-backdrop { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 20px; background: rgba(0,0,0,.58); }
      .inline-dialog { width: min(760px, 100%); max-height: 92vh; overflow: auto; display: grid; gap: 12px; padding: 18px; border-radius: 28px; border: 1px solid var(--line); background: var(--surface); box-shadow: var(--shadow); }
      .inline-dialog h3 { margin: 0; }
      .two-col { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      label { display: grid; gap: 7px; color: var(--muted); font-weight: 850; }
      input, select, textarea { width: 100%; border: 1px solid var(--line); border-radius: 16px; padding: 11px 12px; background: var(--surface-muted); color: var(--text); font: inherit; }
      .review-table article {
        display: grid;
        gap: 12px;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: color-mix(in srgb, var(--surface-muted) 58%, transparent);
      }
      .review-table header {
        display: flex;
        justify-content: space-between;
        gap: 12px;
      }
      .review-table strong,
      .review-table small {
        display: block;
      }
      .review-table small,
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
        color: #bbf7d0;
      }
      .warn {
        color: #fde68a;
      }
      .danger {
        color: #fecaca;
      }
      label {
        display: grid;
        gap: 8px;
        color: var(--muted);
        font-weight: 950;
      }
      .dialog-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      @media (max-width: 760px) {
        .panel-heading,
        .review-table header {
          display: grid;
        }
        dl {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryReservationAttendanceReviewsComponent implements OnInit {
  items: SecretaryReservation[] = [];
  profileDialogOpen = false;
  profileSaving = false;
  selectedProfileReservation: SecretaryReservation | null = null;
  profileForm = this.emptyProfileForm();
  notes: Record<number, string> = {};
  loading = false;
  savingId: number | null = null;
  feedback = "";
  feedbackType: "success" | "error" = "success";
  private loadRequestId = 0;

  constructor(
    private adminApi: AdminDashboardService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const requestId = ++this.loadRequestId;
    this.loading = true;
    this.feedback = "";
    this.markDirty();
    this.adminApi
      .getSecretaryReservations({ pageNumber: 1, pageSize: 50, includeCanceled: false })
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
          this.markDirty();
        },
        error: (error) => {
          if (requestId !== this.loadRequestId) return;
          this.showFeedback(
            error instanceof Error && error.message
              ? error.message
              : "دریافت صف بررسی انجام نشد",
            "error",
          );
        },
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
    this.adminApi
      .reviewAttendance({
        reservationId,
        secretaryUserId,
        approved,
        note: (this.notes[reservationId] || "").trim() || null,
      })
      .pipe(finalize(() => (this.savingId = null)))
      .subscribe({
        next: (response) => {
          this.showFeedback(response.message || "بررسی حضور ثبت شد", "success");
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

  requiresPatientProfile(item: SecretaryReservation): boolean {
    return (item.requiresPatientProfile ?? item.RequiresPatientProfile) === true;
  }

  isWaitingForSecretaryReview(item: SecretaryReservation): boolean {
    return (item.isWaitingForSecretaryReview ?? item.IsWaitingForSecretaryReview) === true;
  }

  openProfileDialog(item: SecretaryReservation): void {
    const [firstName, ...rest] = this.value(item.patientName, item.PatientName, "").split(" ").filter(Boolean);
    this.selectedProfileReservation = item;
    this.profileForm = {
      ...this.emptyProfileForm(),
      firstName: firstName || "",
      lastName: rest.join(" "),
      phoneNumber: this.value(item.patientPhoneNumber, item.PatientPhoneNumber, ""),
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
    const reservationId = this.selectedProfileReservation ? this.reservationId(this.selectedProfileReservation) : null;
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
      nationalCode: this.profileForm.nationalCode.trim(),
      address: this.profileForm.address.trim(),
      emergencyPhoneNumber: this.profileForm.emergencyPhoneNumber.trim() || null,
      insuranceName: this.profileForm.insuranceName.trim() || null,
      notes: this.profileForm.notes.trim() || null,
    };
    this.profileSaving = true;
    this.adminApi.completePatientProfile(payload).pipe(finalize(() => (this.profileSaving = false))).subscribe({
      next: (response) => {
        this.showFeedback(response.message || "پرونده بیمار ثبت شد", "success");
        this.closeProfileDialog();
        this.load();
      },
      error: (error) => this.showFeedback(error instanceof Error && error.message ? error.message : "ثبت پرونده انجام نشد", "error"),
    });
  }

  validateProfileForm(): string | null {
    if (!this.profileForm.firstName.trim()) return "نام بیمار الزامی است";
    if (!this.profileForm.lastName.trim()) return "نام خانوادگی بیمار الزامی است";
    if (!/^09\d{9}$/.test(this.profileForm.phoneNumber.trim())) return "شماره موبایل بیمار معتبر نیست";
    if (this.profileForm.passwordHash.length < 6) return "رمز عبور باید حداقل ۶ کاراکتر باشد";
    if (!/^\d{10}$/.test(this.profileForm.nationalCode.trim())) return "کد ملی بیمار باید ۱۰ رقم باشد";
    if (!this.profileForm.address.trim()) return "آدرس بیمار الزامی است";
    if (!this.profileForm.birthDate) return "تاریخ تولد بیمار الزامی است";
    return null;
  }

  private emptyProfileForm() {
    return { firstName: "", lastName: "", phoneNumber: "", passwordHash: "123456", avatarImageName: null, gender: 1, birthDate: "1995-01-01", nationalCode: "", address: "", emergencyPhoneNumber: "", insuranceName: "", notes: "" };
  }

  reservationId(item: SecretaryReservation): number | null {
    const value = item.id ?? item.Id;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  consultantAttendanceText(item: SecretaryReservation): string {
    const value = item.consultantSaysPatientAttended ?? item.ConsultantSaysPatientAttended;
    if (value === true) return "بیمار آمده است";
    if (value === false) return "بیمار نیامده است";
    return "-";
  }

  status(item: SecretaryReservation): number | null {
    const numeric = Number(
      item.attendanceConfirmationStatus ?? item.AttendanceConfirmationStatus,
    );
    return Number.isFinite(numeric) ? numeric : null;
  }

  probability(item: SecretaryReservation): number | string {
    return (
      item.attendanceProbabilityPercent ??
      item.AttendanceProbabilityPercent ??
      "-"
    );
  }

  statusLabel(value: number | null): string {
    if (value === 2) return "مشاور گفته بیمار آمده";
    if (value === 3) return "مشاور گفته بیمار نیامده";
    if (value === 4) return "تایید نهایی منشی";
    if (value === 5) return "رد نهایی منشی";
    return "نامشخص";
  }

  statusBadge(value: number | null): string {
    return value === 2 ? "success" : value === 3 ? "warn" : "danger";
  }

  value(...values: Array<string | null | undefined>): string {
    return (
      values
        .find((value) => typeof value === "string" && value.trim())
        ?.trim() || "-"
    );
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

  private showFeedback(message: string, type: "success" | "error"): void {
    this.feedback = message;
    this.feedbackType = type;
    this.markDirty();
  }

  private markDirty(): void {
    this.cdr.markForCheck();
  }
}
