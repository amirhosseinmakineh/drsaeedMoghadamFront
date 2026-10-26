 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, DestroyRef, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { BaseButtonComponent } from "../../../../../basemadual/actions/base-button/base-button.component";
import { BasePageShellComponent } from "../../../../../basemadual/layout/page-shell/page-shell.component";
import { BaseModalComponent } from "../../../../../basemadual/overlays/modal/modal.component";

import { SecretaryAccountShellComponent } from "../../components/secretary-account-shell/secretary-account-shell.component";





@Component({
  selector: "app-secretary-expense-categories-page",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, BaseButtonComponent, BasePageShellComponent, BaseModalComponent, SecretaryAccountShellComponent],
  templateUrl: "./secretary-expense-categories-page.component.html",
  styleUrl: "./secretary-expense-categories-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryExpenseCategoriesPageComponent  {
  __init() {this.categories = []}
  __init2() {this.selected = null}
  __init3() {this.dialog = null}
  __init4() {this.loading = false}
  __init5() {this.detailsLoading = false}
  __init6() {this.submitting = false}
  __init7() {this.loadFailed = false}
   __init8() {this.form = new FormGroup({
    title: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    isActive: new FormControl(true, { nonNullable: true }),
  })}
    __init9() {this.destroyRef = inject(DestroyRef)}

  constructor(  api,   toast,   cdr) {;this.api = api;this.toast = toast;this.cdr = cdr;SecretaryExpenseCategoriesPageComponent.prototype.__init.call(this);SecretaryExpenseCategoriesPageComponent.prototype.__init2.call(this);SecretaryExpenseCategoriesPageComponent.prototype.__init3.call(this);SecretaryExpenseCategoriesPageComponent.prototype.__init4.call(this);SecretaryExpenseCategoriesPageComponent.prototype.__init5.call(this);SecretaryExpenseCategoriesPageComponent.prototype.__init6.call(this);SecretaryExpenseCategoriesPageComponent.prototype.__init7.call(this);SecretaryExpenseCategoriesPageComponent.prototype.__init8.call(this);SecretaryExpenseCategoriesPageComponent.prototype.__init9.call(this);}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.loadFailed = false;
    this.api.getManagedExpenseCategories().pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data }) => this.categories = data,
      error: (error) => { this.loadFailed = true; this.showError(error); },
    });
  }

  openCreate() { this.selected = null; this.form.reset({ title: "", isActive: true }); this.dialog = "create"; }
  openEdit(item) { this.selected = item; this.form.reset({ title: item.title, isActive: item.isActive }); this.dialog = "edit"; }
  openDelete(item) { this.selected = item; this.dialog = "delete"; }
  openDetails(item) {
    this.selected = item;
    this.dialog = "details";
    this.detailsLoading = true;
    this.api.getManagedExpenseCategory(item.id).pipe(finalize(() => { this.detailsLoading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ data }) => this.selected = data,
      error: (error) => { if (error.status === 404) { this.closeDialog(); this.load(); } this.showError(error); },
    });
  }
  closeDialog() { if (!this.submitting) { this.dialog = null; this.selected = null; } }

  save() {
    if (this.form.invalid || this.submitting) { this.form.markAllAsTouched(); return; }
    const request = { title: this.form.controls.title.value.trim(), isActive: this.form.controls.isActive.value };
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
      error: (error) => this.showError(error),
    });
  }

  remove() {
    if (!this.selected || this.submitting) return;
    const id = this.selected.id;
    this.submitting = true;
    this.api.deleteExpenseCategory(id).pipe(finalize(() => { this.submitting = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => { this.categories = this.categories.filter(item => item.id !== id); this.dialog = null; this.selected = null; this.toast.success(response.message || "دسته‌بندی حذف شد"); },
      error: (error) => this.showError(error),
    });
  }

  formatDate(value) { return value ? new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "ویرایش نشده"; }
  trackById(_, item) { return item.id; }
   showError(error) { this.toast.error(typeof _optionalChain([error, 'access', _2 => _2.error, 'optionalAccess', _3 => _3.message]) === "string" ? error.error.message : "خطایی رخ داد؛ دوباره تلاش کنید"); }
}
