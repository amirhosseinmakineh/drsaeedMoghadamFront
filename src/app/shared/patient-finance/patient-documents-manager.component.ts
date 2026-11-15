import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PatientFinanceApiService } from "../../features/secretary/patient-finance/services/patient-finance-api.service";
import { CommitmentStatus, PaginatedResult, PatientCheque, PatientPromissoryNote } from "../../features/secretary/patient-finance/models/patient-finance.models";

type DocumentRow = PatientCheque | PatientPromissoryNote;
@Component({
  selector: "app-patient-documents-manager",
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section dir="rtl" class="documents-manager">
      <h3>مدیریت چک‌ها و سفته‌ها</h3>
      <div class="toolbar">
        <button type="button" [class.selected]="kind === 'cheques'" (click)="switchKind('cheques')">چک‌ها</button>
        <button type="button" [class.selected]="kind === 'notes'" (click)="switchKind('notes')">سفته‌ها</button>
        <label>جست‌وجو <input [(ngModel)]="search" placeholder="نام بیمار یا شماره سند" /></label>
        <label>وضعیت
          <select [(ngModel)]="statusFilter">
            <option value="">همه</option><option value="1">در انتظار</option>
            <option value="2">وصول‌شده</option><option value="3">وصول‌نشده</option>
            <option value="4">لغوشده</option>
          </select>
        </label>
        <button type="button" (click)="load()">بروزرسانی</button>
      </div>
      @if (error) { <p role="alert">{{ error }}</p> }
      @if (loading) { <p>در حال دریافت...</p> }
      <p>تعداد کل: {{ totalCount }}</p>
      <div class="table-scroll">
        <table>
          <thead><tr><th>بیمار</th><th>شماره پرونده</th><th>شماره سند</th><th>مبلغ (تومان)</th><th>سررسید</th><th>وضعیت</th><th>عملیات</th></tr></thead>
          <tbody>
            @for (item of filtered; track item.id) {
              <tr>
                <td>{{ item.patientName }}</td>
                <td>{{ item.patientFileNumber ?? item.fileNumber ?? '—' }}</td>
                <td>{{ number(item) }}</td>
                <td>{{ item.amount.toLocaleString('fa-IR') }}</td>
                <td>{{ item.dueDate | date:'yyyy/MM/dd' }}</td>
                <td>{{ statusText(item.status) }}</td>
                <td>
                  @if (item.status === 1) {
                    <button type="button" [disabled]="busy" (click)="changeStatus(item,2)">وصول شد</button>
                    <button type="button" [disabled]="busy" (click)="changeStatus(item,3)">برگشت خورد</button>
                    <button type="button" [disabled]="busy" (click)="changeStatus(item,4)">لغو</button>
                  }
                  @if (item.status !== 2) {
                    <button type="button" [disabled]="busy" (click)="edit(item)">ویرایش</button>
                    <button type="button" [disabled]="busy" (click)="remove(item)">حذف</button>
                  }
                </td>
              </tr>
            } @empty { <tr><td colspan="7">موردی یافت نشد.</td></tr> }
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <button type="button" [disabled]="loading || page <= 1" (click)="load(page-1)">قبلی</button>
        <span>صفحه {{ page }}</span>
        <button type="button" [disabled]="loading || page * 20 >= totalCount" (click)="load(page+1)">بعدی</button>
      </div>
    </section>
  `,
  styles: [`
    .documents-manager{padding:16px;border:1px solid #ddd;border-radius:12px}
    .toolbar,.pagination{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:14px 0}
    .toolbar label{display:flex;gap:6px;align-items:center}
    .table-scroll{overflow-x:auto}
    table{width:100%;border-collapse:collapse;text-align:right}
    td,th{padding:10px;border-bottom:1px solid #ddd;white-space:nowrap}
    button{padding:7px 12px;cursor:pointer;border:1px solid #aaa;border-radius:6px;background:transparent}
    button.selected{font-weight:bold;border-color:currentColor}
    button:disabled{opacity:.5;cursor:not-allowed}
  `],
})
export class PatientDocumentsManagerComponent implements OnInit {
  kind: "cheques" | "notes" = "cheques";
  rows: DocumentRow[] = [];
  page = 1;
  totalCount = 0;
  search = "";
  statusFilter = "";
  loading = false;
  busy = false;
  error = "";
  constructor(private readonly api: PatientFinanceApiService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  switchKind(kind: "cheques" | "notes"): void { this.kind = kind; this.load(1); }
  get filtered(): DocumentRow[] {
    const term = this.search.trim().toLowerCase();
    return this.rows.filter(row =>
      (!this.statusFilter || String(row.status) === this.statusFilter) &&
      (!term || row.patientName?.toLowerCase().includes(term) || this.number(row).toLowerCase().includes(term)));
  }
  number(row: DocumentRow): string { return "sayadNumber" in row ? row.sayadNumber : row.serialNumber; }
  statusText(status: CommitmentStatus): string {
    return ({1:"در انتظار",2:"وصول‌شده",3:"وصول‌نشده",4:"لغوشده"} as Record<number,string>)[status] || "نامشخص";
  }
  load(page = this.page): void {
    this.page = page; this.loading = true; this.error = "";
    const request = this.kind === "cheques"
      ? this.api.getCheques({page,pageSize:20}) as import("rxjs").Observable<PaginatedResult<DocumentRow>>
      : this.api.getPromissoryNotes({page,pageSize:20}) as import("rxjs").Observable<PaginatedResult<DocumentRow>>;
    request.subscribe({
      next: (result: PaginatedResult<DocumentRow>) => { this.rows = result.items; this.totalCount = result.totalCount; this.loading = false; this.cdr.markForCheck(); },
      error: err => { this.error = err?.error?.message || err?.message || "دریافت اسناد ناموفق بود."; this.loading = false; this.cdr.markForCheck(); }
    });
  }
  changeStatus(row: DocumentRow, status: 2|3|4): void {
    if (this.busy || !confirm("تغییر وضعیت سند تأیید شود؟")) return;
    this.busy = true;
    const req = this.kind === "cheques" ? this.api.updateChequeStatus(row.id,status) : this.api.updatePromissoryNoteStatus(row.id,status);
    req.subscribe({next:()=>{this.busy=false;this.load();},error:err=>{this.busy=false;this.error=err?.error?.message || "تغییر وضعیت ناموفق بود.";this.cdr.markForCheck();}});
  }
  edit(row: DocumentRow): void {
    if (this.busy) return;
    const current = this.number(row);
    const number = prompt(this.kind === "cheques" ? "شماره صیادی" : "شماره سریال سفته",current)?.trim();
    if (!number) return;
    const amountText = prompt("مبلغ (تومان)",String(row.amount));
    if (amountText === null) return;
    const amount = Number(amountText);
    if (!Number.isFinite(amount) || amount <= 0) {this.error="مبلغ معتبر نیست.";return;}
    const dueDate = prompt("تاریخ سررسید (YYYY-MM-DD)",row.dueDate.slice(0,10));
    if (!dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {this.error="تاریخ معتبر نیست.";return;}
    let request;
    if (this.kind === "cheques") {
      const cheque = row as PatientCheque;
      const ownerName = prompt("صاحب چک",cheque.ownerName)?.trim();
      if (!ownerName) return;
      request = this.api.updateCheque(row.id,{sayadNumber:number,amount,dueDate,ownerName,isGuarantee:cheque.isGuarantee});
    } else request = this.api.updatePromissoryNote(row.id,{serialNumber:number,amount,dueDate});
    this.busy=true;
    request.subscribe({next:()=>{this.busy=false;this.load();},error:err=>{this.busy=false;this.error=err?.error?.message || "ویرایش ناموفق بود.";this.cdr.markForCheck();}});
  }
  remove(row: DocumentRow): void {
    if (this.busy || !confirm("این سند حذف شود؟")) return;
    this.busy=true;
    const request = this.kind === "cheques" ? this.api.deleteCheque(row.id) : this.api.deletePromissoryNote(row.id);
    request.subscribe({next:()=>{this.busy=false;this.load();},error:err=>{this.busy=false;this.error=err?.error?.message || "حذف ناموفق بود.";this.cdr.markForCheck();}});
  }
}
