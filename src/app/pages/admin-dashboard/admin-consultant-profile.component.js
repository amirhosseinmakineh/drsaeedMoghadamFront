 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,





} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";






import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({
  selector: "app-admin-consultant-profile",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./admin-consultant-profile.component.html",
  styleUrl: "./admin-consultant-profile.component.scss",
})
export class AdminConsultantProfileComponent  {
  Input() __init() {this.profileId = null}

  __init2() {this.profile = null}
  __init3() {this.limitInput = ""}
  __init4() {this.loading = false}
  __init5() {this.saving = false}
  __init6() {this.errorMessage = ""}

   __init7() {this.profileRequestId = 0}
  

  constructor(
     adminApi,
     toast,
     cdr,
  ) {;this.adminApi = adminApi;this.toast = toast;this.cdr = cdr;AdminConsultantProfileComponent.prototype.__init.call(this);AdminConsultantProfileComponent.prototype.__init2.call(this);AdminConsultantProfileComponent.prototype.__init3.call(this);AdminConsultantProfileComponent.prototype.__init4.call(this);AdminConsultantProfileComponent.prototype.__init5.call(this);AdminConsultantProfileComponent.prototype.__init6.call(this);AdminConsultantProfileComponent.prototype.__init7.call(this);
    this.markDirty = createCoalescedMarkForCheck(this.cdr, () => false);
  }

  ngOnChanges(changes) {
    if (changes["profileId"]) {
      this.loadProfile();
    }
  }

  loadProfile(options = {}) {
    if (!this.profileId) {
      this.profile = null;
      this.errorMessage = "";
      this.markDirty();
      return;
    }

    const requestId = ++this.profileRequestId;
    const silent = _nullishCoalesce(options.silent, () => ( false));

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

  resetToDefault() {
    this.limitInput = "";
    this.markDirty();
  }

  saveLimit() {
    if (!this.profileId) {
      this.toast.show("شناسه پروفایل مشاور مشخص نیست", "error");
      return;
    }
    if (this.saving) return;

    const trimmed = this.normalizeLimitInput(this.limitInput);
    let limitNumber = null;

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

  fullName(profile) {
    return (
      [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim() ||
      "بدون نام"
    );
  }

  formatDateTime(value) {
    return formatIranDateTime(value);
  }

  formatTime(value) {
    if (!value) return "-";
    const parts = value.split(":");
    if (parts.length < 2) return value;
    return `${parts[0]}:${parts[1]}`;
  }

   applyProfile(profile) {
    this.profile = profile;
    this.limitInput =
      profile.limitNumber === null || profile.limitNumber === undefined
        ? ""
        : String(profile.limitNumber);
    this.markDirty();
  }

   applyLimitUpdate(update) {
    if (!this.profile) return;

    this.profile = {
      ...this.profile,
      limitNumber: _nullishCoalesce(update.limitNumber, () => ( null)),
      effectiveDailyLimit: update.effectiveDailyLimit,
      todayPickupCount: update.todayPickupCount,
    };
    this.limitInput =
      update.limitNumber === null || update.limitNumber === undefined
        ? ""
        : String(update.limitNumber);
    this.markDirty();
  }

   normalizeLimitInput(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }

   errorMessageFrom(error) {
    if (error instanceof Error && error.message) return error.message;
    return "دریافت پروفایل مشاور انجام نشد";
  }
}
