import {CommonModule} from "@angular/common";
import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {catchError, debounceTime, distinctUntilChanged, finalize, of, Subject, switchMap, takeUntil} from "rxjs";

import {PatientFollowUpInfo, PatientSearchItem, SecretaryFollowUp} from "../../core/follow-up/follow-up.model";
import {FollowUpService} from "../../core/follow-up/follow-up.service";
import {ToastService} from "../../core/toast/toast.service";
import {BaseDialogComponent} from "../../shared/base/base-dialog/base-dialog.component";
import {formatIranDateTime} from "../../utils/iran-datetime.util";

@Component({
  selector: "app-secretary-follow-ups",
  standalone: true,
  imports: [CommonModule, FormsModule, BaseDialogComponent],
  templateUrl: "./secretary-follow-ups.component.html",
  styleUrl: "./secretary-follow-ups.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryFollowUpsComponent implements OnInit {
  createOpen = false;
  patientSearch = "";
  patientOptions: PatientSearchItem[] = [];
  selectedPatient: PatientFollowUpInfo|null = null;
  patientSearching = false;
  patientLoading = false;
  patientSearchError = false;
  contacted = false;
  contactResult = "";
  creating = false;

  items: SecretaryFollowUp[] = [];
  listSearch = "";
  page = 1;
  pageSize = 20;
  totalCount = 0;
  listLoading = false;
  listError = false;

  editOpen = false;
  editLoading = false;
  editSaving = false;
  editItem: SecretaryFollowUp|null = null;
  editContacted = false;
  editContactResult = "";
  deleteItem: SecretaryFollowUp|null = null;
  deleting = false;

  private readonly patientSearch$ = new Subject<string>();
  private readonly listSearch$ = new Subject<string>();
  private readonly destroyed$ = new Subject<void>();
  private readonly destroyRef = inject(DestroyRef);

  constructor(
      private api: FollowUpService, private toast: ToastService, private cdr: ChangeDetectorRef) {
    this.destroyRef.onDestroy(() => {
      this.destroyed$.next();
      this.destroyed$.complete();
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }
  get contactedCount(): number {
    return this.items.filter((item) => item.contacted).length;
  }

  get notContactedCount(): number {
    return this.items.filter((item) => !item.contacted).length;
  }

  ngOnInit(): void {
    this.patientSearch$
        .pipe(
            debounceTime(400),
            distinctUntilChanged(),
            switchMap(search => {
              if (!search.trim()) {
                this.patientOptions = [];
                this.patientSearching = false;
                this.cdr.markForCheck();
                return of(null);
              }
              this.patientSearching = true;
              this.patientSearchError = false;
              this.cdr.markForCheck();
              return this.api.searchPatients(search, 1, 20)
                  .pipe(
                      catchError(() => {
                        this.patientSearchError = true;
                        return of({items: [], page: 1, pageSize: 20, totalCount: 0});
                      }),
                      finalize(() => {
                        this.patientSearching = false;
                        this.cdr.markForCheck();
                      }),
                  );
            }),
            takeUntil(this.destroyed$),
            )
        .subscribe(response => {
          if (response) this.patientOptions = response.items;
          this.cdr.markForCheck();
        });

    this.listSearch$.pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroyed$))
        .subscribe(() => {
          this.page = 1;
          this.loadList();
        });
    this.loadList();
  }

  openCreate(): void {
    this.resetCreateForm();
    this.createOpen = true;
  }

  closeCreate(): void {
    if (this.creating) return;
    this.createOpen = false;
    this.resetCreateForm();
  }

  onPatientSearchChange(): void {
    if (this.selectedPatient?.patientName !== this.patientSearch) {
      this.selectedPatient = null;
    }

    this.patientSearching = Boolean(this.patientSearch.trim());
    this.patientSearch$.next(this.patientSearch);
  }

  selectPatient(patient: PatientSearchItem): void {
    this.patientLoading = true;
    this.selectedPatient = null;
    this.patientOptions = [];
    this.patientSearch = patient.patientName;
    this.api.getPatientFollowUpInfo(patient.patientId)
        .pipe(finalize(() => {
          this.patientLoading = false;
          this.cdr.markForCheck();
        }))
        .subscribe({
          next: value => {
            this.selectedPatient = value;
            this.cdr.markForCheck();
          },
          error: () => this.toast.error("دریافت اطلاعات بیمار انجام نشد. دوباره تلاش کنید.")
        });
  }

  create(): void {
    if (!this.selectedPatient || this.creating) return;
    this.creating = true;
    this.api
        .createSecretaryFollowUp({
          patientId: this.selectedPatient.patientId,
          contacted: this.contacted,
          contactResult: this.contactResult.trim()
        })
        .pipe(finalize(() => {
          this.creating = false;
          this.cdr.markForCheck();
        }))
        .subscribe({
          next: created => {
            if (this.page === 1 && !this.listSearch.trim()) {
              this.items = [created, ...this.items].slice(0, this.pageSize);
              this.totalCount += 1;
            }
            this.createOpen = false;
            this.resetCreateForm();
            this.toast.success("پیگیری با موفقیت ثبت شد.");
            this.cdr.markForCheck();
          },
          error: () => this.toast.error("ثبت پیگیری انجام نشد؛ اطلاعات فرم حفظ شد.")
        });
  }

  onListSearch(): void {
    this.listSearch$.next(this.listSearch);
  }
  loadList(): void {
    this.listLoading = true;
    this.listError = false;
    this.api.getSecretaryFollowUps(this.page, this.pageSize, this.listSearch)
        .pipe(finalize(() => {
          this.listLoading = false;
          this.cdr.markForCheck();
        }))
        .subscribe({
          next: response => {
            this.items = response.items;
            this.totalCount = response.totalCount;
            this.cdr.markForCheck();
          },
          error: () => {
            this.listError = true;
            this.items = [];
          }
        });
  }
  changePage(next: number): void {
    if (next === this.page || next < 1 || next > this.totalPages || this.listLoading) return;
    this.page = next;
    this.loadList();
  }
  changePageSize(): void {
    this.page = 1;
    this.loadList();
  }

  openEdit(id: number): void {
    this.editOpen = true;
    this.editLoading = true;
    this.editItem = null;
    this.api.getSecretaryFollowUpById(id)
        .pipe(finalize(() => {
          this.editLoading = false;
          this.cdr.markForCheck();
        }))
        .subscribe({
          next: item => {
            this.editItem = item;
            this.editContacted = item.contacted;
            this.editContactResult = item.contactResult;
            this.cdr.markForCheck();
          },
          error: () => this.toast.error("دریافت اطلاعات پیگیری انجام نشد.")
        });
  }
  closeEdit(): void {
    if (!this.editSaving) this.editOpen = false;
  }
  saveEdit(): void {
    if (!this.editItem || this.editSaving) return;
    this.editSaving = true;
    this.api
        .updateSecretaryFollowUp(
            this.editItem.id,
            {contacted: this.editContacted, contactResult: this.editContactResult.trim()})
        .pipe(finalize(() => {
          this.editSaving = false;
          this.cdr.markForCheck();
        }))
        .subscribe({
          next: updated => {
            this.items = this.items.map(item => item.id === updated.id ? updated : item);
            this.editOpen = false;
            this.toast.success("پیگیری ویرایش شد.");
            this.cdr.markForCheck();
          },
          error: () => this.toast.error("ویرایش انجام نشد؛ اطلاعات فرم حفظ شد.")
        });
  }
  confirmDelete(): void {
    if (!this.deleteItem || this.deleting) return;
    const id = this.deleteItem.id;
    this.deleting = true;
    this.api.deleteSecretaryFollowUp(id)
        .pipe(finalize(() => {
          this.deleting = false;
          this.cdr.markForCheck();
        }))
        .subscribe({
          next: () => {
            this.items = this.items.filter(item => item.id !== id);
            this.totalCount = Math.max(0, this.totalCount - 1);
            this.deleteItem = null;
            this.toast.success("پیگیری حذف شد.");
            this.cdr.markForCheck();
          },
          error: () => this.toast.error("حذف پیگیری انجام نشد.")
        });
  }

  formatDate(value: string): string {
    return formatIranDateTime(value, {year: "numeric", month: "2-digit", day: "2-digit"});
  }
  formatCreatedAt(value: string): string {
    return formatIranDateTime(value);
  }
  trackById(_: number, item: SecretaryFollowUp|PatientSearchItem): number {
    return "id" in item ? item.id : item.patientId;
  }

  private resetCreateForm(): void {
    this.patientSearch = "";
    this.patientOptions = [];
    this.selectedPatient = null;
    this.patientSearching = false;
    this.patientLoading = false;
    this.patientSearchError = false;
    this.contacted = false;
    this.contactResult = "";
  }
}
