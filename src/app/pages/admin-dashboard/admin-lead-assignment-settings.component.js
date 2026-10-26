 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import {
  ChangeDetectionStrategy,


  DestroyRef,

  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";

import {

  LeadAssignmentSourceType,
} from "../../features/admin/lead-assignment-settings/lead-assignment-settings.models";


@Component({
  selector: "app-admin-lead-assignment-settings",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./admin-lead-assignment-settings.component.html",
  styleUrl: "./admin-lead-assignment-settings.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLeadAssignmentSettingsComponent  {
   __init() {this.sourceTypes = LeadAssignmentSourceType}
  __init2() {this.selectedSource = LeadAssignmentSourceType.NewLeads}
  __init3() {this.savedSource = LeadAssignmentSourceType.NewLeads}
  __init4() {this.updatedAt = null}
  __init5() {this.loading = true}
  __init6() {this.saving = false}
  __init7() {this.consultantsLoading = true}
  __init8() {this.consultants = []}
  __init9() {this.search = ""}
   __init10() {this.savingConsultantIds = new Set()}

    __init11() {this.destroyRef = inject(DestroyRef)}

  constructor(
      api,
      toast,
      cdr,
  ) {;this.api = api;this.toast = toast;this.cdr = cdr;AdminLeadAssignmentSettingsComponent.prototype.__init.call(this);AdminLeadAssignmentSettingsComponent.prototype.__init2.call(this);AdminLeadAssignmentSettingsComponent.prototype.__init3.call(this);AdminLeadAssignmentSettingsComponent.prototype.__init4.call(this);AdminLeadAssignmentSettingsComponent.prototype.__init5.call(this);AdminLeadAssignmentSettingsComponent.prototype.__init6.call(this);AdminLeadAssignmentSettingsComponent.prototype.__init7.call(this);AdminLeadAssignmentSettingsComponent.prototype.__init8.call(this);AdminLeadAssignmentSettingsComponent.prototype.__init9.call(this);AdminLeadAssignmentSettingsComponent.prototype.__init10.call(this);AdminLeadAssignmentSettingsComponent.prototype.__init11.call(this);}

  ngOnInit() {
    this.loadConsultants();
    this.api.get()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (setting) => {
          this.selectedSource = setting.assignmentSourceType;
          this.savedSource = setting.assignmentSourceType;
          this.updatedAt = _nullishCoalesce(setting.updatedAt, () => ( null));
        },
        error: (error) => this.toast.error(
          _optionalChain([error, 'optionalAccess', _ => _.error, 'optionalAccess', _2 => _2.message]) || "دریافت تنظیمات تخصیص لید انجام نشد.",
        ),
      });
  }

  get filteredConsultants() {
    const query = this.search.trim().toLocaleLowerCase("fa");
    if (!query) return this.consultants;
    return this.consultants.filter((consultant) =>
      `${consultant.fullName} ${consultant.phoneNumber}`
        .toLocaleLowerCase("fa")
        .includes(query),
    );
  }

  loadConsultants() {
    this.consultantsLoading = true;
    this.api.getConsultants()
      .pipe(
        finalize(() => {
          this.consultantsLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (consultants) => {
          this.consultants = consultants;
          this.cdr.markForCheck();
        },
        error: (error) => this.toast.error(
          _optionalChain([error, 'optionalAccess', _3 => _3.error, 'optionalAccess', _4 => _4.message]) || "دریافت تنظیمات مشاوران انجام نشد.",
        ),
      });
  }

  saveConsultant(
    consultant,
    value,
  ) {
    if (this.savingConsultantIds.has(consultant.consultantProfileId)) return;
    const preferred = value === "default"
      ? null
      : Number(value) ;
    if (preferred !== null &&
        preferred !== LeadAssignmentSourceType.NewLeads &&
        preferred !== LeadAssignmentSourceType.BurnedLeads) return;

    this.savingConsultantIds.add(consultant.consultantProfileId);
    this.cdr.markForCheck();
    this.api.updateConsultant(consultant.consultantProfileId, preferred)
      .pipe(
        finalize(() => {
          this.savingConsultantIds.delete(consultant.consultantProfileId);
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!result.isSuccess || !result.data) {
            this.toast.error(result.message || "ذخیره نوع لید مشاور انجام نشد.");
            return;
          }
          this.consultants = this.consultants.map((item) =>
            item.consultantProfileId === result.data.consultantProfileId
              ? result.data
              : item,
          );
          this.toast.success(result.message || "نوع لید مشاور ذخیره شد.");
        },
        error: (error) => this.toast.error(
          _optionalChain([error, 'optionalAccess', _5 => _5.error, 'optionalAccess', _6 => _6.message]) || "ذخیره نوع لید مشاور انجام نشد.",
        ),
      });
  }

  sourceLabel(source) {
    return source === LeadAssignmentSourceType.NewLeads
      ? "لید جدید"
      : "لید سوخته";
  }

  save() {
    if (this.saving || this.loading) return;

    this.saving = true;
    this.api.update(this.selectedSource)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!result.isSuccess) {
            this.toast.error(result.message || "ذخیره تنظیمات انجام نشد.");
            return;
          }

          this.savedSource = _nullishCoalesce(_optionalChain([result, 'access', _7 => _7.data, 'optionalAccess', _8 => _8.assignmentSourceType]), () => ( this.selectedSource));
          this.selectedSource = this.savedSource;
          this.updatedAt = _nullishCoalesce(_optionalChain([result, 'access', _9 => _9.data, 'optionalAccess', _10 => _10.updatedAt]), () => ( this.updatedAt));
          this.consultants = this.consultants.map((consultant) =>
            consultant.preferredLeadSourceType === null
              ? { ...consultant, effectiveLeadSourceType: this.savedSource }
              : consultant,
          );
          this.toast.success(result.message || "تنظیمات تخصیص لید با موفقیت ذخیره شد.");
        },
        error: (error) => this.toast.error(
          _optionalChain([error, 'optionalAccess', _11 => _11.error, 'optionalAccess', _12 => _12.message]) || "ذخیره تنظیمات تخصیص لید انجام نشد.",
        ),
      });
  }
}
