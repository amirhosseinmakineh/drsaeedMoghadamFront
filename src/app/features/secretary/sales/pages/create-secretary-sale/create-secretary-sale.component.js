 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { ChangeDetectionStrategy, DestroyRef, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { debounceTime, distinctUntilChanged, finalize, Subject } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SecretaryAccountShellComponent } from "../../../account/components/secretary-account-shell/secretary-account-shell.component";

import { toman } from "../../models/secretary-sales.models";


@Component({
  selector: "app-create-secretary-sale",
  standalone: true,
  imports: [FormsModule, RouterLink, SecretaryAccountShellComponent],
  templateUrl: "./create-secretary-sale.component.html",
  styleUrls: ["../secretary-sales.shared.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSecretarySaleComponent  {
   __init() {this.toman = toman}
  __init2() {this.services = []}
  __init3() {this.patients = []}
  __init4() {this.selectedServiceId = null}
  __init5() {this.selectedPatientId = ""}
  __init6() {this.patientSearch = ""}
  __init7() {this.patientPage = 1}
  __init8() {this.patientTotalPages = 1}
  __init9() {this.loadingPatients = false}
  __init10() {this.submitting = false}
    __init11() {this.searchChanges = new Subject()}
    __init12() {this.destroyRef = inject(DestroyRef)}

  constructor(  api,   toast,   cdr) {;this.api = api;this.toast = toast;this.cdr = cdr;CreateSecretarySaleComponent.prototype.__init.call(this);CreateSecretarySaleComponent.prototype.__init2.call(this);CreateSecretarySaleComponent.prototype.__init3.call(this);CreateSecretarySaleComponent.prototype.__init4.call(this);CreateSecretarySaleComponent.prototype.__init5.call(this);CreateSecretarySaleComponent.prototype.__init6.call(this);CreateSecretarySaleComponent.prototype.__init7.call(this);CreateSecretarySaleComponent.prototype.__init8.call(this);CreateSecretarySaleComponent.prototype.__init9.call(this);CreateSecretarySaleComponent.prototype.__init10.call(this);CreateSecretarySaleComponent.prototype.__init11.call(this);CreateSecretarySaleComponent.prototype.__init12.call(this);}

  ngOnInit() {
    this.api.activeServices().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (items) => { this.services = items; this.cdr.markForCheck(); },
      error: () => this.toast.error("دریافت خدمات قابل فروش انجام نشد."),
    });
    this.searchChanges.pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.patientPage = 1;
      this.loadPatients();
    });
    this.loadPatients();
  }

  get selectedService() {
    return this.services.find((item) => item.id === Number(this.selectedServiceId));
  }

  searchPatients(value) {
    this.patientSearch = value;
    this.searchChanges.next(value.trim());
  }

  changePatientPage(page) {
    if (page < 1 || page > this.patientTotalPages || page === this.patientPage) return;
    this.patientPage = page;
    this.loadPatients();
  }

  submit() {
    if (this.submitting || !this.selectedServiceId || !this.selectedPatientId) {
      if (!this.selectedServiceId || !this.selectedPatientId) this.toast.error("انتخاب خدمت و بیمار الزامی است.");
      return;
    }
    this.submitting = true;
    this.api.createSale(this.selectedPatientId, Number(this.selectedServiceId)).pipe(
      finalize(() => { this.submitting = false; this.cdr.markForCheck(); }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (result) => {
        if (!result.isSuccess) { this.toast.error(result.message); return; }
        this.toast.success(result.message || "فروش شما ثبت شد و در انتظار تأیید ادمین است.");
        this.selectedPatientId = "";
        this.selectedServiceId = null;
      },
      error: (error) => this.toast.error(_optionalChain([error, 'optionalAccess', _ => _.error, 'optionalAccess', _2 => _2.message]) || "ثبت فروش انجام نشد."),
    });
  }

   loadPatients() {
    this.loadingPatients = true;
    this.api.patients(this.patientSearch.trim(), this.patientPage, 20).pipe(
      finalize(() => { this.loadingPatients = false; this.cdr.markForCheck(); }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (result) => { this.patients = result.items; this.patientTotalPages = Math.max(result.totalPages, 1); },
      error: () => this.toast.error("دریافت فهرست بیماران انجام نشد."),
    });
  }
}
