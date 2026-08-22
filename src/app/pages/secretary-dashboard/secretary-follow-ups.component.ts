import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subscription, finalize } from "rxjs";
import { FollowUpService, PatientFollowUpInfo, PatientSearchItem, SecretaryFollowUp } from "../../core/follow-up/follow-up.service";
import { ToastService } from "../../core/toast/toast.service";
import { BaseDialogComponent } from "../../shared/base/base-dialog/base-dialog.component";
import { formatIranDate, formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({ selector: "app-secretary-follow-ups", standalone: true, imports: [CommonModule, FormsModule, BaseDialogComponent], templateUrl: "./secretary-follow-ups.component.html", styleUrl: "./secretary-follow-ups.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretaryFollowUpsComponent implements OnInit, OnDestroy {
  patients: PatientSearchItem[] = []; selectedPatient: PatientFollowUpInfo | null = null; patientSearch = ""; patientLoading = false; patientInfoLoading = false;
  contacted = false; contactResult = ""; saving = false; error = ""; items: SecretaryFollowUp[] = []; loading = false; listSearch = ""; page = 1; pageSize = 20; totalCount = 0;
  editOpen = false; editLoading = false; updating = false; editing: SecretaryFollowUp | null = null; editContacted = false; editContactResult = ""; deleting: SecretaryFollowUp | null = null; deletingSaving = false;
  private patientTimer: ReturnType<typeof setTimeout> | null = null; private searchTimer: ReturnType<typeof setTimeout> | null = null; private patientRequest: Subscription | null = null; private listRequest: Subscription | null = null;
  constructor(private api: FollowUpService, private toast: ToastService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.loadList(); }
  ngOnDestroy(): void { if (this.patientTimer) clearTimeout(this.patientTimer); if (this.searchTimer) clearTimeout(this.searchTimer); this.patientRequest?.unsubscribe(); this.listRequest?.unsubscribe(); }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalCount / this.pageSize)); }
  onPatientSearch(): void { if (this.patientTimer) clearTimeout(this.patientTimer); this.patientTimer = setTimeout(() => this.searchPatients(), 350); }
  searchPatients(): void { const search = this.patientSearch.trim(); if (!search) { this.patients = []; this.patientLoading = false; this.cdr.markForCheck(); return; } this.patientRequest?.unsubscribe(); this.patientLoading = true; this.patientRequest = this.api.searchPatients(search).pipe(finalize(() => { this.patientLoading = false; this.cdr.markForCheck(); })).subscribe({ next: response => { this.patients = response.items; }, error: error => { this.error = error.message; } }); }
  selectPatient(patient: PatientSearchItem): void { this.patientSearch = patient.patientName; this.patients = []; this.selectedPatient = null; this.patientInfoLoading = true; this.api.getPatientFollowUpInfo(patient.patientId).pipe(finalize(() => { this.patientInfoLoading = false; this.cdr.markForCheck(); })).subscribe({ next: info => this.selectedPatient = info, error: error => this.error = error.message }); }
  create(): void { if (!this.selectedPatient || this.saving || !this.contactResult.trim()) return; this.saving = true; this.error = ""; this.api.createSecretaryFollowUp({ patientId: this.selectedPatient.patientId, contacted: this.contacted, contactResult: this.contactResult.trim() }).pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); })).subscribe({ next: item => { this.items = [item, ...this.items]; this.totalCount++; this.resetForm(); this.toast.success("پیگیری با موفقیت ثبت شد."); }, error: error => this.error = error.message }); }
  resetForm(): void { this.selectedPatient = null; this.patientSearch = ""; this.contacted = false; this.contactResult = ""; }
  onListSearch(): void { if (this.searchTimer) clearTimeout(this.searchTimer); this.searchTimer = setTimeout(() => { this.page = 1; this.loadList(); }, 350); }
  loadList(): void { this.listRequest?.unsubscribe(); this.loading = true; this.error = ""; this.listRequest = this.api.getSecretaryFollowUps(this.page, this.pageSize, this.listSearch.trim()).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); })).subscribe({ next: response => { this.items = response.items; this.totalCount = response.totalCount; this.page = response.page; this.pageSize = response.pageSize; }, error: error => this.error = error.message }); }
  goToPage(page: number): void { if (page < 1 || page > this.totalPages || page === this.page) return; this.page = page; this.loadList(); }
  changePageSize(): void { this.page = 1; this.loadList(); }
  openEdit(item: SecretaryFollowUp): void { this.editOpen = true; this.editLoading = true; this.editing = null; this.api.getSecretaryFollowUpById(item.id).pipe(finalize(() => { this.editLoading = false; this.cdr.markForCheck(); })).subscribe({ next: followUp => { this.editing = followUp; this.editContacted = followUp.contacted; this.editContactResult = followUp.contactResult; }, error: error => { this.error = error.message; this.editOpen = false; } }); }
  saveEdit(): void { if (!this.editing || this.updating || !this.editContactResult.trim()) return; this.updating = true; this.api.updateSecretaryFollowUp(this.editing.id, { contacted: this.editContacted, contactResult: this.editContactResult.trim() }).pipe(finalize(() => { this.updating = false; this.cdr.markForCheck(); })).subscribe({ next: item => { this.items = this.items.map(current => current.id === item.id ? item : current); this.editOpen = false; this.toast.success("پیگیری ویرایش شد."); }, error: error => this.error = error.message }); }
  confirmDelete(item: SecretaryFollowUp): void { this.deleting = item; }
  delete(): void { if (!this.deleting || this.deletingSaving) return; const id = this.deleting.id; this.deletingSaving = true; this.api.deleteSecretaryFollowUp(id).pipe(finalize(() => { this.deletingSaving = false; this.cdr.markForCheck(); })).subscribe({ next: () => { this.items = this.items.filter(item => item.id !== id); this.totalCount--; this.deleting = null; this.toast.success("پیگیری حذف شد."); if (!this.items.length && this.page > 1) this.goToPage(this.page - 1); }, error: error => this.error = error.message }); }
  date(value: string): string { return formatIranDate(value); } dateTime(value: string): string { return formatIranDateTime(value); }
}
