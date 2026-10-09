import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { debounceTime, distinctUntilChanged, finalize, Subject } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SecretaryAccountShellComponent } from "../../../account/components/secretary-account-shell/secretary-account-shell.component";
import { ToastService } from "../../../../../core/toast/toast.service";
import { SecretarySalePatient, SecretarySaleService, toman } from "../../models/secretary-sales.models";
import { SecretarySalesService } from "../../services/secretary-sales.service";

@Component({
  selector: "app-create-secretary-sale",
  standalone: true,
  imports: [FormsModule, RouterLink, SecretaryAccountShellComponent],
  templateUrl: "./create-secretary-sale.component.html",
  styleUrls: ["../secretary-sales.shared.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateSecretarySaleComponent implements OnInit {
  readonly toman = toman;
  services: SecretarySaleService[] = [];
  patients: SecretarySalePatient[] = [];
  selectedServiceId: number | null = null;
  selectedPatientId = "";
  patientSearch = "";
  patientPage = 1;
  patientTotalPages = 1;
  loadingPatients = false;
  submitting = false;
  private readonly searchChanges = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly api: SecretarySalesService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
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

  get selectedService(): SecretarySaleService | undefined {
    return this.services.find((item) => item.id === Number(this.selectedServiceId));
  }

  searchPatients(value: string): void {
    this.patientSearch = value;
    this.searchChanges.next(value.trim());
  }

  changePatientPage(page: number): void {
    if (page < 1 || page > this.patientTotalPages || page === this.patientPage) return;
    this.patientPage = page;
    this.loadPatients();
  }

  submit(): void {
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
      error: (error) => this.toast.error(error?.error?.message || "ثبت فروش انجام نشد."),
    });
  }

  private loadPatients(): void {
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
