import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { AuthService } from "../../core/auth/auth.service";
import { PatientPortalCase, PatientPortalOverview, PatientPortalService } from "./patient-portal.service";
@Component({
  selector: "app-patient-portal",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./patient-portal.component.html",
  styleUrl: "./patient-portal.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientPortalComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  readonly tabs = [{ id: "overview", label: "داشبورد" }, { id: "profile", label: "اطلاعات من" },
    { id: "finance", label: "پرونده‌های مالی" }, { id: "installments", label: "اقساط و اسناد" },
    { id: "security", label: "امنیت حساب" }] as const;
  activeTab: "overview" | "profile" | "finance" | "installments" | "security" = "overview";
  data: PatientPortalOverview | null = null;
  loading = false; saving = false; error = ""; success = "";
  firstName = ""; lastName = ""; currentPassword = ""; newPassword = ""; confirmPassword = "";
  selectedCase: PatientPortalCase | null = null;
  constructor(private readonly api: PatientPortalService, private readonly auth: AuthService,
    private readonly router: Router, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.refresh(); }
  refresh(): void {
    this.loading = true; this.error = "";
    this.api.overview().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; this.cdr.markForCheck(); }))
      .subscribe({ next: data => { this.data = data; this.firstName = data.profile.firstName; this.lastName = data.profile.lastName; },
        error: e => this.error = e?.error?.message || "دریافت اطلاعات حساب انجام نشد." });
  }
  saveProfile(): void {
    if (this.saving || !this.firstName.trim() || !this.lastName.trim()) return;
    this.saving = true; this.error = ""; this.success = "";
    this.api.updateProfile(this.firstName.trim(), this.lastName.trim())
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({ next: () => { this.success = "اطلاعات شخصی ذخیره شد."; this.refresh(); },
        error: e => this.error = e?.error?.message || "ویرایش اطلاعات ناموفق بود." });
  }
  savePassword(): void {
    if (this.saving) return;
    if (this.newPassword.length < 10 || this.newPassword !== this.confirmPassword) {
      this.error = "رمز جدید باید حداقل ۱۰ کاراکتر باشد و با تکرار آن مطابقت داشته باشد."; return;
    }
    this.saving = true; this.error = ""; this.success = "";
    this.api.changePassword(this.currentPassword, this.newPassword)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.saving = false; this.cdr.markForCheck(); }))
      .subscribe({ next: () => { this.currentPassword = ""; this.newPassword = ""; this.confirmPassword = "";
          this.auth.logout(); this.router.navigateByUrl("/"); },
        error: e => this.error = e?.error?.message || "تغییر رمز ناموفق بود." });
  }
  money(v: number | null | undefined): string { return Number(v || 0).toLocaleString("fa-IR") + " تومان"; }
  date(v: string | null | undefined): string {
    if (!v) return "—";
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("fa-IR-u-ca-persian", { year: "numeric", month: "long", day: "numeric" }).format(d);
  }
  stage(s: string): string {
    const stages: Record<string,string> = { FinancialCaseOnly: "پرونده مالی مستقل", TreatmentPending: "در انتظار طرح درمان",
      FinancePending: "در انتظار تأیید مالی", ProfilePending: "در انتظار تأیید پروفایل",
      TreatmentApprovalPending: "در انتظار مجوز درمان", TreatmentApproved: "مجاز به انجام درمان" };
    return stages[s] || "در حال بررسی";
  }
  commitmentStatus(status: number): string {
    return ({ 1: "در انتظار وصول", 2: "وصول‌شده", 3: "برگشتی / پرداخت‌نشده", 4: "لغوشده" } as Record<number,string>)[status] || "نامشخص";
  }
  get installments() {
    return (this.data?.cases || []).flatMap(c => [
      ...c.cheques.filter(x => !x.isGuarantee).map(x => ({ caseId: c.id, fileNumber: c.fileNumber, kind: "چک", number: x.sayadNumber, amount: x.amount, dueDate: x.dueDate, status: x.status })),
      ...c.notes.map(x => ({ caseId: c.id, fileNumber: c.fileNumber, kind: "سفته", number: x.serialNumber, amount: x.amount, dueDate: x.dueDate, status: x.status })),
    ]).sort((a,b) => a.dueDate.localeCompare(b.dueDate));
  }
}
