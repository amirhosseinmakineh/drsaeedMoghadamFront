import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { ToastService } from "../../core/toast/toast.service";
import {
  ConsultantLeadAssignmentSetting,
  LeadAssignmentSourceType,
} from "../../features/admin/lead-assignment-settings/lead-assignment-settings.models";
import { LeadAssignmentSettingsService } from "../../features/admin/lead-assignment-settings/lead-assignment-settings.service";

@Component({
  selector: "app-admin-lead-assignment-settings",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./admin-lead-assignment-settings.component.html",
  styleUrl: "./admin-lead-assignment-settings.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLeadAssignmentSettingsComponent implements OnInit {
  readonly sourceTypes = LeadAssignmentSourceType;
  selectedSource = LeadAssignmentSourceType.NewLeads;
  savedSource = LeadAssignmentSourceType.NewLeads;
  updatedAt: string | null = null;
  loading = true;
  saving = false;
  consultantsLoading = true;
  consultants: ConsultantLeadAssignmentSetting[] = [];
  search = "";
  readonly savingConsultantIds = new Set<number>();

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly api: LeadAssignmentSettingsService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadConsultants();
    this.api.get()
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (setting) => {
          this.selectedSource = setting.assignmentSourceType;
          this.savedSource = setting.assignmentSourceType;
          this.updatedAt = setting.updatedAt ?? null;
        },
        error: (error) => this.toast.error(
          error?.error?.message || "دریافت تنظیمات تخصیص لید انجام نشد.",
        ),
      });
  }

  get filteredConsultants(): ConsultantLeadAssignmentSetting[] {
    const query = this.search.trim().toLocaleLowerCase("fa");
    if (!query) return this.consultants;
    return this.consultants.filter((consultant) =>
      `${consultant.fullName} ${consultant.phoneNumber}`
        .toLocaleLowerCase("fa")
        .includes(query),
    );
  }

  loadConsultants(): void {
    this.consultantsLoading = true;
    this.api.getConsultants()
      .pipe(
        finalize(() => {
          this.consultantsLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (consultants) => {
          this.consultants = consultants;
          this.cdr.markForCheck();
        },
        error: (error) => this.toast.error(
          error?.error?.message || "دریافت تنظیمات مشاوران انجام نشد.",
        ),
      });
  }

  saveConsultant(
    consultant: ConsultantLeadAssignmentSetting,
    value: string,
  ): void {
    if (this.savingConsultantIds.has(consultant.consultantProfileId)) return;
    const preferred = value === "default"
      ? null
      : Number(value) as LeadAssignmentSourceType;
    if (preferred !== null &&
        preferred !== LeadAssignmentSourceType.NewLeads &&
        preferred !== LeadAssignmentSourceType.BurnedLeads) return;

    this.savingConsultantIds.add(consultant.consultantProfileId);
    this.cdr.markForCheck();
    this.api.updateConsultant(consultant.consultantProfileId, preferred)
      .pipe(
        finalize(() => {
          this.savingConsultantIds.delete(consultant.consultantProfileId);
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!result.isSuccess || !result.data) {
            this.toast.error(result.message || "ذخیره نوع لید مشاور انجام نشد.");
            return;
          }
          this.consultants = this.consultants.map((item) =>
            item.consultantProfileId === result.data!.consultantProfileId
              ? result.data!
              : item,
          );
          this.toast.success(result.message || "نوع لید مشاور ذخیره شد.");
        },
        error: (error) => this.toast.error(
          error?.error?.message || "ذخیره نوع لید مشاور انجام نشد.",
        ),
      });
  }

  sourceLabel(source: LeadAssignmentSourceType): string {
    return source === LeadAssignmentSourceType.NewLeads
      ? "لید جدید"
      : "لید سوخته";
  }

  save(): void {
    if (this.saving || this.loading) return;

    this.saving = true;
    this.api.update(this.selectedSource)
      .pipe(
        finalize(() => {
          this.saving = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!result.isSuccess) {
            this.toast.error(result.message || "ذخیره تنظیمات انجام نشد.");
            return;
          }

          this.savedSource = result.data?.assignmentSourceType ?? this.selectedSource;
          this.selectedSource = this.savedSource;
          this.updatedAt = result.data?.updatedAt ?? this.updatedAt;
          this.consultants = this.consultants.map((consultant) =>
            consultant.preferredLeadSourceType === null
              ? { ...consultant, effectiveLeadSourceType: this.savedSource }
              : consultant,
          );
          this.toast.success(result.message || "تنظیمات تخصیص لید با موفقیت ذخیره شد.");
        },
        error: (error) => this.toast.error(
          error?.error?.message || "ذخیره تنظیمات تخصیص لید انجام نشد.",
        ),
      });
  }
}
