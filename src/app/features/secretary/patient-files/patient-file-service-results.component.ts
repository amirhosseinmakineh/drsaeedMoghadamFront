import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { SecretaryReservation } from "../../../core/secretary/secretary-dashboard.service";
import { ReservationSyncService } from "../../../core/reservation/reservation-sync.service";
import { PatientFile } from "./patient-file.models";
import { PatientFilesService } from "./patient-files.service";

@Component({
  selector: "app-patient-file-service-results",
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p>بیمار: {{ file.firstName }} {{ file.lastName }} · پرونده {{ file.fileNumber }}</p>
    <p>نتیجه را برای رزرو مربوط به همین مراجعه ثبت کنید.</p>
    @if (feedback) { <p role="status">{{ feedback }}</p> }
    @if (error) { <p class="error" role="alert">{{ error }}</p> }
    @if (loading) { <p role="status">در حال دریافت رزروهای بیمار...</p> }
    @else {
      @for (item of items; track item.id) {
        <article>
          <strong>مراجعه: {{ item.reservationAtPersian || item.reservationAt }}</strong>
          <p>مشاور: {{ item.consultantFullName || '—' }}</p>
          <p>نتیجه: {{ item.patientReceivedService === true ? 'خدمت انجام شد' : item.patientReceivedService === false ? 'خدمت انجام نشد' : 'ثبت نشده' }}</p>
          @if (item.doctorName) { <p>دکتر: {{ item.doctorName }}</p> }
          @if (canReview(item)) {
            @if (approvingId === id(item)) {
              <label>نام دکتر<input [(ngModel)]="doctorName" maxlength="120" [disabled]="saving" autocomplete="off" /></label>
              <label>یادداشت<textarea [(ngModel)]="note" [disabled]="saving"></textarea></label>
              <div class="actions"><button type="button" [disabled]="saving || !doctorName.trim()" (click)="review(item, true)">ثبت انجام خدمت</button><button type="button" [disabled]="saving" (click)="approvingId = null">انصراف</button></div>
            } @else {
              <div class="actions"><button type="button" [disabled]="saving" (click)="start(item)">ثبت نتیجه خدمت</button><button type="button" class="danger" [disabled]="saving" (click)="review(item, false)">خدمت انجام نشد</button></div>
            }
          } @else if (item.patientReceivedService == null && !item.isAttendanceScoreApplied) {
            <p>ثبت نتیجه پس از زمان مراجعه و با دسترسی تأیید حضور امکان‌پذیر است.</p>
          }
        </article>
      } @empty { <p>رزروی برای این بیمار یافت نشد. ابتدا رزرو مربوط به مراجعه را ثبت کنید.</p> }
      @if (pages > 1) { <nav><button type="button" [disabled]="saving || page <= 1" (click)="load(page - 1)">قبلی</button><span>{{ page }} از {{ pages }}</span><button type="button" [disabled]="saving || page >= pages" (click)="load(page + 1)">بعدی</button></nav> }
    }
    <button type="button" [disabled]="loading || saving" (click)="load(page)">به‌روزرسانی</button>
  `,
  styles: [`:host{display:block;direction:rtl}article{padding:16px;margin:12px 0;border:1px solid #d9e5df;border-radius:12px;background:#f9fcfa}p{line-height:1.9}.actions,nav{display:flex;gap:10px;flex-wrap:wrap;align-items:center}label{display:grid;gap:6px;margin:12px 0}input,textarea{width:100%;box-sizing:border-box;padding:10px;border:1px solid #cadbd2;border-radius:8px;font:inherit}button{padding:10px 16px;border:1px solid #cdded5;border-radius:9px;background:#edf6f1;color:#225b44;font:inherit;cursor:pointer}button:disabled{opacity:.5;cursor:default}.danger,.error{color:#a83232}.danger{background:#fff0f0}nav{justify-content:center;margin:14px 0}`],
})
export class PatientFileServiceResultsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) file!: PatientFile;
  @Output() busyChange = new EventEmitter<boolean>();
  items: SecretaryReservation[] = [];
  reviewable: number[] = [];
  page = 1;
  pages = 1;
  loading = false;
  saving = false;
  error = "";
  feedback = "";
  approvingId: number | null = null;
  doctorName = "";
  note = "";
  private requests = new Subscription();
  constructor(private api: PatientFilesService, private cdr: ChangeDetectorRef, private sync: ReservationSyncService) {}
  ngOnInit(): void { this.load(); }
  ngOnDestroy(): void { this.requests.unsubscribe(); }
  id(item: SecretaryReservation): number { return Number(item.id ?? item.Id); }
  canReview(item: SecretaryReservation): boolean {
    const date = new Date(item.reservationAt ?? item.ReservationAt ?? "").getTime();
    return this.file.serviceApproved === true && this.reviewable.includes(this.id(item)) &&
      !item.isCanceled && !item.isAttendanceScoreApplied && item.patientReceivedService == null &&
      Number.isFinite(date) && date <= Date.now();
  }
  start(item: SecretaryReservation): void {
    if (!this.canReview(item)) return;
    this.approvingId = this.id(item); this.doctorName = ""; this.note = ""; this.error = "";
  }
  load(page = 1): void {
    if (this.saving || this.loading) return;
    this.loading = true; this.error = ""; this.approvingId = null;
    this.requests.add(this.api.getServiceResults(this.file.id, page).subscribe({
      next: result => { this.items = result.items; this.reviewable = result.reviewableReservationIds;
        this.page = result.pageNumber; this.pages = result.totalPages; this.loading = false; this.cdr.markForCheck(); },
      error: error => { this.error = error?.error?.message || "دریافت رزروهای بیمار انجام نشد.";
        this.items = []; this.loading = false; this.cdr.markForCheck(); },
    }));
  }
  review(item: SecretaryReservation, received: boolean): void {
    if (this.saving || !this.canReview(item) || (received && !this.doctorName.trim())) return;
    this.saving = true; this.busyChange.emit(true); this.error = ""; this.feedback = "";
    this.requests.add(this.api.reviewServiceResult(this.file.id, {
      reservationId: this.id(item), patientReceivedService: received,
      doctorName: received ? this.doctorName.trim() : null,
      note: this.approvingId === this.id(item) ? this.note.trim() || null : null,
    }).subscribe({
      next: result => {
        this.saving = false; this.busyChange.emit(false);
        if (!result.isSuccess) { this.error = result.message; this.cdr.markForCheck(); return; }
        this.feedback = received ? "انجام خدمت ثبت شد." : "انجام نشدن خدمت ثبت شد.";
        this.sync.requestRefresh();
        this.load(this.page); this.cdr.markForCheck();
      },
      error: error => { this.saving = false; this.busyChange.emit(false); this.error = error?.error?.message || "ثبت نتیجه خدمت انجام نشد."; this.cdr.markForCheck(); },
    }));
  }
}
