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

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly api: LeadAssignmentSettingsService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
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
          this.toast.success(result.message || "تنظیمات تخصیص لید با موفقیت ذخیره شد.");
        },
        error: (error) => this.toast.error(
          error?.error?.message || "ذخیره تنظیمات تخصیص لید انجام نشد.",
        ),
      });
  }
}
