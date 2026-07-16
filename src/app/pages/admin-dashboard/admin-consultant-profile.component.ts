import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import {
  AdminConsultantProfile,
  AdminDashboardService,
} from "../../core/admin/admin-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";

@Component({
  selector: "app-admin-consultant-profile",
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./admin-consultant-profile.component.html",
  styles: [
    `
      .profile-panel {
        display: grid;
        gap: 14px;
        padding: 16px;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: var(--surface);
        box-shadow: var(--shadow);
      }
      .panel-heading {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        align-items: start;
      }
      .panel-heading span {
        display: inline-flex;
        color: var(--brand);
        font-weight: 900;
        font-size: 0.82rem;
      }
      .panel-heading h2 {
        margin: 4px 0 0;
        font-size: 1.2rem;
      }
      .panel-heading p {
        margin: 6px 0 0;
        color: var(--muted);
        font-weight: 800;
      }
      .secondary-action.compact {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 8px 14px;
        background: var(--surface-muted);
        font: inherit;
        font-weight: 900;
      }
      .empty-hint,
      .loading-hint {
        margin: 0;
        color: var(--muted);
        line-height: 1.8;
      }
      .profile-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .info-card {
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: var(--surface-muted);
      }
      .editable-card {
        grid-column: 1 / -1;
        background: color-mix(in srgb, var(--brand) 6%, var(--surface));
      }
      .info-card h3 {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 0 0 12px;
        font-size: 1rem;
      }
      .info-card dl {
        display: grid;
        gap: 10px;
        margin: 0;
      }
      .info-card dl > div {
        display: grid;
        gap: 2px;
      }
      .info-card .full-row {
        grid-column: 1 / -1;
      }
      .info-card dt {
        color: var(--muted);
        font-size: 0.78rem;
        font-weight: 900;
      }
      .info-card dd {
        margin: 0;
        font-weight: 800;
        line-height: 1.6;
      }
      .hint {
        margin: 0 0 12px;
        color: var(--muted);
        line-height: 1.7;
        font-size: 0.9rem;
      }
      .stats-row {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin-bottom: 12px;
      }
      .limit-form {
        display: grid;
        gap: 12px;
      }
      .limit-form label {
        display: grid;
        gap: 6px;
        font-weight: 900;
      }
      .limit-form input {
        min-height: 44px;
        border: 1px solid var(--line);
        border-radius: 14px;
        padding: 0 12px;
        background: var(--surface);
        font: inherit;
      }
      .limit-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .ghost-action,
      .solid-action {
        border-radius: 999px;
        padding: 10px 16px;
        font: inherit;
        font-weight: 950;
      }
      .ghost-action {
        border: 1px solid var(--line);
        background: var(--surface);
      }
      .solid-action {
        border: 0;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #1b1712;
      }
      .feedback.error {
        margin: 0;
        color: #b42318;
        font-weight: 900;
      }
      @media (max-width: 760px) {
        .profile-grid,
        .stats-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminConsultantProfileComponent implements OnChanges {
  @Input() profileId: number | null = null;

  profile: AdminConsultantProfile | null = null;
  limitInput = "";
  loading = false;
  saving = false;
  errorMessage = "";

  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;
  private readonly markDirty: () => void;

  constructor(
    private adminApi: AdminDashboardService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {
    this.markDirty = createCoalescedMarkForCheck(this.cdr, () => false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["profileId"]) {
      this.loadProfile();
    }
  }

  loadProfile(): void {
    if (!this.profileId) {
      this.profile = null;
      this.errorMessage = "";
      this.markDirty();
      return;
    }

    this.loading = true;
    this.errorMessage = "";
    this.markDirty();

    this.adminApi
      .getConsultantProfile(this.profileId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.markDirty();
        }),
      )
      .subscribe({
        next: (profile) => {
          this.profile = profile;
          this.limitInput =
            profile.limitNumber === null || profile.limitNumber === undefined
              ? ""
              : String(profile.limitNumber);
          this.markDirty();
        },
        error: (error) => {
          this.profile = null;
          this.errorMessage = this.errorMessageFrom(error);
          this.markDirty();
        },
      });
  }

  resetToDefault(): void {
    this.limitInput = "";
  }

  saveLimit(): void {
    if (!this.profileId || this.saving) return;

    const trimmed = this.limitInput.trim();
    let limitNumber: number | null = null;

    if (trimmed) {
      const parsed = Number(trimmed);
      if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100) {
        this.toast.show("محدودیت باید عدد صحیح بین ۰ تا ۱۰۰ باشد", "error");
        return;
      }
      limitNumber = parsed;
    }

    this.saving = true;
    this.markDirty();

    this.adminApi
      .updateConsultantLimit(this.profileId, limitNumber)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.markDirty();
        }),
      )
      .subscribe({
        next: () => {
          this.toast.show("محدودیت دریافت شماره ذخیره شد", "success");
          this.loadProfile();
        },
        error: (error) =>
          this.toast.show(this.errorMessageFrom(error), "error"),
      });
  }

  fullName(profile: AdminConsultantProfile): string {
    return (
      [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
      "بدون نام"
    );
  }

  formatDateTime(value?: string | null): string {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("fa-IR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  formatTime(value?: string | null): string {
    if (!value) return "-";
    const parts = value.split(":");
    if (parts.length < 2) return value;
    return `${parts[0]}:${parts[1]}`;
  }

  private errorMessageFrom(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    return "دریافت پروفایل مشاور انجام نشد";
  }
}
