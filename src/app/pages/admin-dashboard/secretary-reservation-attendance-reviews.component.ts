import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import {
  AdminDashboardService,
  ReservationAttendanceReview,
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
          <h2>بررسی تایید حضور مشاورها</h2>
          <p>
            ادعای حضور/عدم حضور ثبت‌شده توسط مشاور را بررسی و تایید یا رد کنید.
          </p>
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
        <p class="empty-copy">در حال دریافت موارد بررسی...</p>
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
                    {{ value(item.consultantName, item.ConsultantName, "-") }}
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
                        item.attendancePrediction,
                        item.AttendancePrediction,
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
              </div>
            </article>
          }
        </div>
      }
    </section>
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
      .review-table {
        display: grid;
        gap: 12px;
      }
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
})
export class SecretaryReservationAttendanceReviewsComponent implements OnInit {
  items: ReservationAttendanceReview[] = [];
  notes: Record<number, string> = {};
  loading = false;
  savingId: number | null = null;
  feedback = "";
  feedbackType: "success" | "error" = "success";

  constructor(
    private adminApi: AdminDashboardService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.feedback = "";
    this.adminApi
      .getReservationAttendanceReviews()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => (this.items = response.items ?? []),
        error: (error) =>
          this.showFeedback(
            error instanceof Error && error.message
              ? error.message
              : "دریافت صف بررسی انجام نشد",
            "error",
          ),
      });
  }

  review(item: ReservationAttendanceReview, approved: boolean): void {
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

  reservationId(item: ReservationAttendanceReview): number | null {
    const value =
      item.id ?? item.Id ?? item.reservationId ?? item.ReservationId;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  status(item: ReservationAttendanceReview): number | null {
    const numeric = Number(
      item.attendanceConfirmationStatus ?? item.AttendanceConfirmationStatus,
    );
    return Number.isFinite(numeric) ? numeric : null;
  }

  probability(item: ReservationAttendanceReview): number | string {
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
  }
}
