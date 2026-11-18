import { ServiceRewardContext, ServiceRewardQuote } from "../../../core/consultant/service-reward.models";
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
  templateUrl: "./patient-file-service-results.component.html",
  styleUrl: "./patient-file-service-results.component.scss",
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
  context: ServiceRewardContext | null = null;
  quote: ServiceRewardQuote | null = null;
  selectedConsultant: number | null = null;
  selected = new Set<string>();
  loadingContext = false;
  previewing = false;
  private contextRequest?: Subscription;
  private quoteRequest?: Subscription;
  key(serviceId: number, toothId: number): string { return serviceId + ":" + toothId; }
  toggle(serviceId: number, toothId: number, checked: boolean): void {
    const key = this.key(serviceId, toothId);
    if (checked) this.selected.add(key); else this.selected.delete(key);
    this.invalidateQuote();
  }
  invalidateQuote(): void { this.quoteRequest?.unsubscribe(); this.quote = null; this.previewing = false; }
  get consultantName(): string { return this.context?.consultants.find(x => x.id === this.selectedConsultant)?.name || "مشاور غیرفعال؛ با مدیر بررسی کنید"; }
  cancel(): void {
    if (this.saving) return;
    this.contextRequest?.unsubscribe(); this.invalidateQuote(); this.approvingId = null; this.loadingContext = false;
  }
  get performedServices(): { serviceId: number; toothIds: number[] }[] {
    const groups = new Map<number, number[]>();
    for (const option of this.context?.options ?? []) {
      if (!this.selected.has(this.key(option.serviceId, option.toothId))) continue;
      groups.set(option.serviceId, [...(groups.get(option.serviceId) ?? []), option.toothId]);
    }
    return [...groups].map(([serviceId, toothIds]) => ({ serviceId, toothIds }));
  }
  money(value: number): string { return value.toLocaleString("fa-IR") + " تومان"; }
  preview(item: SecretaryReservation): void {
    if (this.saving || this.previewing || !this.context || this.performedServices.length === 0 || !this.selectedConsultant) return;
    this.previewing = true; this.error = ""; this.quote = null;
    this.quoteRequest = this.api.previewServiceReward(this.file.id, {
      reservationId: this.id(item), patientReceivedService: true, doctorName: this.doctorName.trim() || null, note: null, rewardConsultantProfileId: this.selectedConsultant,
      performedServices: this.performedServices,
    }).subscribe({
      next: quote => { this.quote = quote; this.previewing = false; this.cdr.markForCheck(); },
      error: e => { this.error = e?.error?.message || "محاسبه پاداش انجام نشد."; this.previewing = false; this.cdr.markForCheck(); },
    });
    this.requests.add(this.quoteRequest);
  }
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
    this.contextRequest?.unsubscribe(); this.invalidateQuote();
    this.context = null; this.selected = new Set(); this.selectedConsultant = null;
    this.approvingId = this.id(item); this.doctorName = ""; this.note = ""; this.error = "";
    this.loadingContext = true;
    this.contextRequest = this.api.getServiceRewardContext(this.file.id, this.id(item)).subscribe({
      next: context => { this.context = context; this.selectedConsultant = context.linkedConsultantProfileId;
        this.loadingContext = false; this.cdr.markForCheck(); },
      error: e => { this.loadingContext = false; this.error = e?.error?.message || "دریافت خدمات و مشاوران انجام نشد."; this.cdr.markForCheck(); },
    });
    this.requests.add(this.contextRequest);
  }
  load(page = 1): void {
    if (this.saving || this.loading) return;
    this.contextRequest?.unsubscribe(); this.invalidateQuote();
    this.loading = true; this.error = ""; this.approvingId = null;
    this.requests.add(this.api.getServiceResults(this.file.id, page).subscribe({
      next: result => { this.items = result.items; this.reviewable = result.reviewableReservationIds;
        this.page = result.pageNumber; this.pages = result.totalPages; this.loading = false; this.cdr.markForCheck(); },
      error: error => { this.error = error?.error?.message || "دریافت رزروهای بیمار انجام نشد.";
        this.items = []; this.loading = false; this.cdr.markForCheck(); },
    }));
  }
  review(item: SecretaryReservation, received: boolean): void {
    if (this.saving || !this.canReview(item) || (received && (!this.doctorName.trim() || !this.quote || !this.context || !this.selectedConsultant || this.approvingId !== this.id(item)))) return;
    this.saving = true; this.busyChange.emit(true); this.error = ""; this.feedback = "";
    this.requests.add(this.api.reviewServiceResult(this.file.id, {
      reservationId: this.id(item), patientReceivedService: received,
      doctorName: received ? this.doctorName.trim() : null,
      ...(received ? { rewardConsultantProfileId: this.selectedConsultant, performedServices: this.performedServices, expectedRewardHash: this.quote!.hash } : {}),
      note: this.approvingId === this.id(item) ? this.note.trim() || null : null,
    }).subscribe({
      next: result => {
        this.saving = false; this.busyChange.emit(false);
        if (!result.isSuccess) { this.error = result.message; this.cdr.markForCheck(); return; }
        this.feedback = received ? "انجام خدمت ثبت شد." : "انجام نشدن خدمت ثبت شد.";
        this.sync.requestRefresh();
        this.load(this.page); this.cdr.markForCheck();
      },
      error: error => { this.saving = false; this.busyChange.emit(false); if (received && error?.status === 409) this.invalidateQuote(); this.error = error?.error?.message || "ثبت نتیجه خدمت انجام نشد."; this.cdr.markForCheck(); },
    }));
  }
}
