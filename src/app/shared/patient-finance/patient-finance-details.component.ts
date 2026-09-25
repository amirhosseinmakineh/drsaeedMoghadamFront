import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { PatientFinanceDetails } from "./patient-finance-details.models";

@Component({
  selector: "app-patient-finance-details",
  standalone: true,
  templateUrl: "./patient-finance-details.component.html",
  styleUrl: "./patient-finance-details.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientFinanceDetailsComponent {
  @Input() finance: PatientFinanceDetails | null = null;
  @Input() patientName = "";
  @Input() loading = false;
  @Input() error = "";
  @Output() readonly retry = new EventEmitter<void>();

  money(value: number): string {
    return `${new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 3 }).format(value || 0)} تومان`;
  }

  date(value: string): string {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? "—"
      : new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(parsed);
  }
  optionalDate(value: string | null | undefined): string { return value ? this.date(value) : ""; }
  optionalMoney(value: number | null | undefined): string { return value == null ? "" : this.money(value); }
  chequeDates(value: PatientFinanceDetails["cases"][number]): string {
    return value.cheques.filter(item => item.status !== 4).map(item => this.optionalDate(item.dueDate)).filter(Boolean).join("، ");
  }
  chequeRegistrations(value: PatientFinanceDetails["cases"][number]): string {
    return value.cheques.filter(item => item.status !== 4).map(item => item.sayadNumber).filter(Boolean).join("، ");
  }
  noteSerialNumbers(value: PatientFinanceDetails["cases"][number]): string {
    return value.promissoryNotes.filter(item => item.status !== 4).map(item => item.serialNumber).filter(Boolean).join("، ");
  }

  agreementLabel(value: number): string { return value === 1 ? "پیش‌پرداخت" : value === 2 ? "ودیعه" : "نامشخص"; }
  caseStatusLabel(value: number): string { return ({ 1: "فعال", 2: "تسویه‌شده", 3: "لغوشده" } as Record<number, string>)[value] ?? "نامشخص"; }
  commitmentStatusLabel(value: number): string { return ({ 1: "در انتظار", 2: "وصول/پرداخت‌شده", 3: "برگشتی/پرداخت‌نشده", 4: "لغوشده" } as Record<number, string>)[value] ?? "نامشخص"; }
  debtStatusLabel(value: number): string { return ({ 1: "پرداخت‌نشده", 2: "پرداخت‌شده", 3: "لغوشده" } as Record<number, string>)[value] ?? "نامشخص"; }
  financialSourceLabel(value: number): string { return value === 1 ? "چک" : value === 2 ? "سفته" : "نامشخص"; }
}
