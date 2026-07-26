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
  ConsultantLimitUpdate,
} from "../../core/admin/admin-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({
  selector: "app-admin-consultant-profile",
  standalone: true,
  imports: [CommonModule, FormsModule, FaIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./admin-consultant-profile.component.html",
  styleUrl: "./admin-consultant-profile.component.scss",
})
export class AdminConsultantProfileComponent implements OnChanges {
  @Input() profileId: number | null = null;

  profile: AdminConsultantProfile | null = null;
  limitInput: string | number = "";
  loading = false;
  saving = false;
  errorMessage = "";

  private profileRequestId = 0;
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

  loadProfile(options: { silent?: boolean } = {}): void {
    if (!this.profileId) {
      this.profile = null;
      this.errorMessage = "";
      this.markDirty();
      return;
    }

    const requestId = ++this.profileRequestId;
    const silent = options.silent ?? false;

    if (!silent) {
      this.loading = true;
      this.errorMessage = "";
      this.markDirty();
    }

    this.adminApi
      .getConsultantProfile(this.profileId)
      .pipe(
        finalize(() => {
          if (requestId !== this.profileRequestId) return;
          if (!silent) {
            this.loading = false;
          }
          this.markDirty();
        }),
      )
      .subscribe({
        next: (profile) => {
          if (requestId !== this.profileRequestId) return;
          this.applyProfile(profile);
        },
        error: (error) => {
          if (requestId !== this.profileRequestId) return;
          this.profile = null;
          this.errorMessage = this.errorMessageFrom(error);
          this.markDirty();
        },
      });
  }

  resetToDefault(): void {
    this.limitInput = "";
    this.markDirty();
  }

  saveLimit(): void {
    if (!this.profileId) {
      this.toast.show("شناسه پروفایل مشاور مشخص نیست", "error");
      return;
    }
    if (this.saving) return;

    const trimmed = this.normalizeLimitInput(this.limitInput);
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
        next: (response) => {
          this.toast.show("محدودیت دریافت شماره ذخیره شد", "success");
          if (response.data) {
            this.applyLimitUpdate(response.data);
          }
          this.loadProfile({ silent: true });
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
    return formatIranDateTime(value);
  }

  formatTime(value?: string | null): string {
    if (!value) return "-";
    const parts = value.split(":");
    if (parts.length < 2) return value;
    return `${parts[0]}:${parts[1]}`;
  }

  private applyProfile(profile: AdminConsultantProfile): void {
    this.profile = profile;
    this.limitInput =
      profile.limitNumber === null || profile.limitNumber === undefined
        ? ""
        : String(profile.limitNumber);
    this.markDirty();
  }

  private applyLimitUpdate(update: ConsultantLimitUpdate): void {
    if (!this.profile) return;

    this.profile = {
      ...this.profile,
      limitNumber: update.limitNumber ?? null,
      effectiveDailyLimit: update.effectiveDailyLimit,
      todayPickupCount: update.todayPickupCount,
    };
    this.limitInput =
      update.limitNumber === null || update.limitNumber === undefined
        ? ""
        : String(update.limitNumber);
    this.markDirty();
  }

  private normalizeLimitInput(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

  private errorMessageFrom(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    return "دریافت پروفایل مشاور انجام نشد";
  }
}
