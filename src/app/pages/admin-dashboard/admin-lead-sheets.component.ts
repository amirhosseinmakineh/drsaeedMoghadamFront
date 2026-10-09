import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { finalize } from "rxjs";
import { AdminDashboardService, AdminLeadSheet } from "../../core/admin/admin-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";

@Component({
  selector: "app-admin-lead-sheets",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./admin-lead-sheets.component.html",
  styleUrl: "./admin-lead-sheets.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLeadSheetsComponent {
  private readonly api = inject(AdminDashboardService);
  private readonly toast = inject(ToastService);
  private readonly cdr = inject(ChangeDetectorRef);

  sheetName = "";
  sheets: AdminLeadSheet[] = [];
  activeSheet: AdminLeadSheet | null = null;
  phoneNumber = "";
  firstName = "";
  lastName = "";
  creatingSheet = false;
  loadingSheets = false;
  addingLead = false;

  ngOnInit(): void { this.loadSheets(); }

  loadSheets(): void {
    this.loadingSheets = true;
    this.api.getAdminLeadSheets().pipe(finalize(() => { this.loadingSheets = false; this.cdr.markForCheck(); }))
      .subscribe({ next: (sheets) => { this.sheets = sheets; if (!this.activeSheet && sheets.length) this.activeSheet = sheets[0]; }, error: (error) => this.toast.error(this.errorMessage(error, "دریافت شیت‌ها انجام نشد.")) });
  }

  selectSheet(sheet: AdminLeadSheet): void { this.activeSheet = sheet; }

  createSheet(): void {
    const name = this.sheetName.trim();
    if (!name || this.creatingSheet) return;
    this.creatingSheet = true;
    this.api.createAdminLeadSheet(name).pipe(finalize(() => { this.creatingSheet = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (sheet) => { this.sheets = [sheet, ...this.sheets]; this.activeSheet = sheet; this.sheetName = ""; this.toast.success("شیت با موفقیت ساخته شد."); },
        error: (error) => this.toast.error(this.errorMessage(error, "ساخت شیت انجام نشد.")),
      });
  }

  addLead(): void {
    if (!this.activeSheet || this.addingLead || !this.isLeadValid()) return;
    this.addingLead = true;
    this.api.addAdminSheetLead(this.activeSheet.id, {
      phoneNumber: this.normalizePhone(this.phoneNumber),
      firstName: this.firstName.trim(),
      lastName: this.lastName.trim(),
    }).pipe(finalize(() => { this.addingLead = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: () => { this.phoneNumber = this.firstName = this.lastName = ""; this.toast.success("لید ثبت شد و وارد صف پردازش شیت شد."); },
        error: (error) => this.toast.error(this.errorMessage(error, "ثبت لید انجام نشد.")),
      });
  }

  isLeadValid(): boolean {
    return /^09\d{9}$/.test(this.normalizePhone(this.phoneNumber)) &&
      !!this.firstName.trim() && !!this.lastName.trim();
  }

  private normalizePhone(value: string): string {
    let phone = (value || "").trim().replace(/[\s-]/g, "");
    if (phone.startsWith("+98")) phone = "0" + phone.slice(3);
    else if (phone.startsWith("98") && phone.length === 12) phone = "0" + phone.slice(2);
    else if (phone.startsWith("9") && phone.length === 10) phone = "0" + phone;
    return phone;
  }

  private errorMessage(error: unknown, fallback: string): string {
    const payload = error instanceof HttpErrorResponse ? error.error : error;
    if (typeof payload === "string" && payload.trim()) return payload;
    return (payload as { message?: string } | null)?.message || fallback;
  }
}
