 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,


} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";




import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { downloadBlob } from "../../utils/file-download.util";

import { nowInIran, toIranDateInputValue } from "../../utils/iran-datetime.util";

@Component({
  selector: "app-admin-lead-call-reports",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDatepickerComponent],
  templateUrl: "./admin-lead-call-reports.component.html",
  styleUrl: "./admin-lead-call-reports.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLeadCallReportsComponent {
  __init() {this.fromDate = null}
  __init2() {this.toDate = null}
  __init3() {this.downloading = false}
  __init4() {this.feedback = ""}
  __init5() {this.feedbackType = "success"}
   __init6() {this.fromDatePickerLabel = { fa: "از تاریخ", en: "From date" }}
   __init7() {this.toDatePickerLabel = { fa: "تا تاریخ", en: "To date" }}

  constructor(
     adminApi,
     toast,
     cdr,
  ) {;this.adminApi = adminApi;this.toast = toast;this.cdr = cdr;AdminLeadCallReportsComponent.prototype.__init.call(this);AdminLeadCallReportsComponent.prototype.__init2.call(this);AdminLeadCallReportsComponent.prototype.__init3.call(this);AdminLeadCallReportsComponent.prototype.__init4.call(this);AdminLeadCallReportsComponent.prototype.__init5.call(this);AdminLeadCallReportsComponent.prototype.__init6.call(this);AdminLeadCallReportsComponent.prototype.__init7.call(this);}

  setFromDate(date) {
    this.fromDate = date;
    this.markDirty();
  }
  setToDate(date) {
    this.toDate = date;
    this.markDirty();
  }

  resetFilters() {
    this.fromDate = null;
    this.toDate = null;
    this.feedback = "";
    this.markDirty();
  }

validateFilters() {
  if (this.fromDate && this.toDate) {
    const from = new Date(this.fromDate);
    from.setHours(0, 0, 0, 0);

    const to = new Date(this.toDate);
    to.setHours(0, 0, 0, 0);

    if (from.getTime() > to.getTime()) {
      return "تاریخ شروع نباید بعد از تاریخ پایان باشد";
    }
  }

  return null;
}

  download() {
    const validationError = this.validateFilters();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    const filters = {
      ...(this.fromDate ? { from: this.toDateString(this.fromDate) } : {}),
      ...(this.toDate ? { to: this.toDateString(this.toDate) } : {}),
    };

    this.downloading = true;
    this.feedback = "";
    this.markDirty();
    this.adminApi
      .exportLeadCallReports(filters)
      .pipe(
        finalize(() => {
          this.downloading = false;
          this.markDirty();
        }),
      )
      .subscribe({
        next: (blob) => {
          downloadBlob(blob, this.fileName(filters));
          this.showFeedback(
            "فایل گزارش تماس درخواست‌های مشاوره دانلود شد",
            "success",
          );
        },
        error: (error) =>
          this.showFeedback(
            error instanceof Error && error.message
              ? error.message
              : "خطا در دریافت گزارش. لطفاً دوباره تلاش کنید.",
            "error",
          ),
      });
  }

   fileName(filters) {
    const today = this.toDateString(nowInIran()).replaceAll("-", "");
    const from = _nullishCoalesce(_optionalChain([filters, 'access', _ => _.from, 'optionalAccess', _2 => _2.replaceAll, 'call', _3 => _3("-", "")]), () => ( today));
    const to = _nullishCoalesce(_optionalChain([filters, 'access', _4 => _4.to, 'optionalAccess', _5 => _5.replaceAll, 'call', _6 => _6("-", "")]), () => ( from));
    return `lead-call-reports-${from}-${to}.csv`;
  }

   toDateString(date) {
    return toIranDateInputValue(date);
  }
   showFeedback(message, type) {
    this.feedback = message;
    this.feedbackType = type;
    if (type === "success") {
      this.toast.success(message);
    } else {
      this.toast.error(message);
    }
    this.markDirty();
  }

   markDirty() {
    this.cdr.markForCheck();
  }
}
