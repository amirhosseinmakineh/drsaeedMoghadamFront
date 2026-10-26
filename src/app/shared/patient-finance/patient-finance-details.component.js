 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { ChangeDetectionStrategy, EventEmitter, } from "@angular/core";


@Component({
  selector: "app-patient-finance-details",
  standalone: true,
  templateUrl: "./patient-finance-details.component.html",
  styleUrl: "./patient-finance-details.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFinanceDetailsComponent {constructor() { PatientFinanceDetailsComponent.prototype.__init.call(this);PatientFinanceDetailsComponent.prototype.__init2.call(this);PatientFinanceDetailsComponent.prototype.__init3.call(this);PatientFinanceDetailsComponent.prototype.__init4.call(this);PatientFinanceDetailsComponent.prototype.__init5.call(this); }
  Input() __init() {this.finance = null}
  Input() __init2() {this.patientName = ""}
  Input() __init3() {this.loading = false}
  Input() __init4() {this.error = ""}
  Output()  __init5() {this.retry = new EventEmitter()}

  money(value) {
    return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 3 }).format(value || 0)} تومان`;
  }

  date(value) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? "—"
      : new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
  }
  optionalDate(value) { return value ? this.date(value) : ""; }
  optionalMoney(value) { return value == null ? "" : this.money(value); }
  chequeDates(value) {
    return value.cheques.filter(item => item.status !== 4).map(item => this.optionalDate(item.dueDate)).filter(Boolean).join("، ");
  }
  chequeRegistrations(value) {
    return value.cheques.filter(item => item.status !== 4).map(item => item.sayadNumber).filter(Boolean).join("، ");
  }
  noteSerialNumbers(value) {
    return value.promissoryNotes.filter(item => item.status !== 4).map(item => item.serialNumber).filter(Boolean).join("، ");
  }

  agreementLabel(value) { return value === 1 ? "پیش‌پرداخت" : value === 2 ? "ودیعه" : "نامشخص"; }
  caseStatusLabel(value) { return _nullishCoalesce(({ 1: "فعال", 2: "تسویه‌شده", 3: "لغوشده" } )[value], () => ( "نامشخص")); }
  commitmentStatusLabel(value) { return _nullishCoalesce(({ 1: "در انتظار", 2: "وصول/پرداخت‌شده", 3: "برگشتی/پرداخت‌نشده", 4: "لغوشده" } )[value], () => ( "نامشخص")); }
  debtStatusLabel(value) { return _nullishCoalesce(({ 1: "پرداخت‌نشده", 2: "پرداخت‌شده", 3: "لغوشده" } )[value], () => ( "نامشخص")); }
  financialSourceLabel(value) { return value === 1 ? "چک" : value === 2 ? "سفته" : "نامشخص"; }
}
