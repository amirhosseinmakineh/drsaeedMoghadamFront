import { HttpErrorResponse } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { BaseButtonComponent } from "../../../../../basemadual/actions/base-button/base-button.component";
import { BasePageShellComponent } from "../../../../../basemadual/layout/page-shell/page-shell.component";
import { BaseModalComponent } from "../../../../../basemadual/overlays/modal/modal.component";
import { ToastService } from "../../../../../core/toast/toast.service";
import { SecretaryAccountShellComponent } from "../../components/secretary-account-shell/secretary-account-shell.component";
import { SecretaryExpenseCategoryManagementDto, SaveSecretaryExpenseCategoryRequest } from "../../models/secretary-account.models";
import { SecretaryAccountService } from "../../services/secretary-account.service";

type Dialog = "create" | "edit" | "delete" | "details" | null;

@Component({
  selector: "app-secretary-expense-categories-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BaseButtonComponent, BasePageShellComponent, BaseModalComponent, SecretaryAccountShellComponent],
  templateUrl: "./secretary-expense-categories-page.component.html",
  styleUrl: "./secretary-expense-categories-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryExpenseCategoriesPageComponent implements OnInit {
  categories: SecretaryExpenseCategoryManagementDto[] = [];
  selected: SecretaryExpenseCategoryManagementDto | null = null;
  dialog: Dialog = null;
  loading = false;
  detailsLoading = false;
  submitting = false;
  loadFailed = false;
  readonly form = new FormGroup({
    title: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    isActive: new FormControl(true, { nonNullable: true }),
  });
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly api: SecretaryAccountService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.loadFailed = false;
    this.api.getManagedExpenseCategories().pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data }) => this.categories = data,
      error: (error: HttpErrorResponse) => { this.loadFailed = true; this.showError(error); },
    });
  }

  openCreate(): void { this.selected = null; this.form.reset({ title: "", isActive: true }); this.dialog = "create"; }
  openEdit(item: SecretaryExpenseCategoryManagementDto): void { this.selected = item; this.form.reset({ title: item.title, isActive: item.isActive }); this.dialog = "edit"; }
  openDelete(item: SecretaryExpenseCategoryManagementDto): void { this.selected = item; this.dialog = "delete"; }
  openDetails(item: SecretaryExpenseCategoryManagementDto): void {
    this.selected = item;
    this.dialog = "details";
    this.detailsLoading = true;
    this.api.getManagedExpenseCategory(item.id).pipe(finalize(() => { this.detailsLoading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data }) => this.selected = data,
      error: (error: HttpErrorResponse) => { if (error.status === 404) { this.closeDialog(); this.load(); } this.showError(error); },
    });
  }
  closeDialog(): void { if (!this.submitting) { this.dialog = null; this.selected = null; } }

  save(): void {
    if (this.form.invalid || this.submitting) { this.form.markAllAsTouched(); return; }
    const request: SaveSecretaryExpenseCategoryRequest = { title: this.form.controls.title.value.trim(), isActive: this.form.controls.isActive.value };
    if (!request.title) { this.form.controls.title.setErrors({ required: true }); return; }
    this.submitting = true;
    const operation = this.dialog === "edit" && this.selected ? this.api.updateExpenseCategory(this.selected.id, request) : this.api.createExpenseCategory(request);
    operation.pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        if (this.dialog === "edit") this.categories = this.categories.map(item => item.id === response.data.id ? response.data : item);
        else this.load();
        this.toast.success(response.message || "دسته‌بندی با موفقیت ذخیره شد");
        this.dialog = null;
      },
      error: (error: HttpErrorResponse) => this.showError(error),
    });
  }

  remove(): void {
    if (!this.selected || this.submitting) return;
    const id = this.selected.id;
    this.submitting = true;
    this.api.deleteExpenseCategory(id).pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => { this.categories = this.categories.filter(item => item.id !== id); this.dialog = null; this.selected = null; this.toast.success(response.message || "دسته‌بندی حذف شد"); },
      error: (error: HttpErrorResponse) => this.showError(error),
    });
  }

  formatDate(value: string | null): string { return value ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "ویرایش نشده"; }
  trackById(_: number, item: SecretaryExpenseCategoryManagementDto): number { return item.id; }
  private showError(error: HttpErrorResponse): void { this.toast.error(typeof error.error?.message === "string" ? error.error.message : "خطایی رخ داد؛ دوباره تلاش کنید"); }
}
