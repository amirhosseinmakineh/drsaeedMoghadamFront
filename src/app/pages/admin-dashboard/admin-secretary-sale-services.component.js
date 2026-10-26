 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { ChangeDetectionStrategy, DestroyRef, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { toman } from "../../features/secretary/sales/models/secretary-sales.models";

import { BaseNumberInputComponent } from "../../basemadual/forms/number-input/number-input.component";

@Component({ selector: "app-admin-secretary-sale-services", standalone: true, imports: [FormsModule, BaseNumberInputComponent], templateUrl: "./admin-secretary-sale-services.component.html", styleUrl: "./admin-secretary-sales.shared.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class AdminSecretarySaleServicesComponent  {
   __init() {this.toman = toman}
  __init2() {this.items = []}
  __init3() {this.editingId = null}
  __init4() {this.form = { title: "", price: null , secretaryReward: null , isActive: true }}
  __init5() {this.search = ""}  __init6() {this.page = 1} __init7() {this.totalPages = 1} __init8() {this.loading = false} __init9() {this.saving = false}
    __init10() {this.destroyRef = inject(DestroyRef)}
  constructor(  api,   toast,   cdr) {;this.api = api;this.toast = toast;this.cdr = cdr;AdminSecretarySaleServicesComponent.prototype.__init.call(this);AdminSecretarySaleServicesComponent.prototype.__init2.call(this);AdminSecretarySaleServicesComponent.prototype.__init3.call(this);AdminSecretarySaleServicesComponent.prototype.__init4.call(this);AdminSecretarySaleServicesComponent.prototype.__init5.call(this);AdminSecretarySaleServicesComponent.prototype.__init6.call(this);AdminSecretarySaleServicesComponent.prototype.__init7.call(this);AdminSecretarySaleServicesComponent.prototype.__init8.call(this);AdminSecretarySaleServicesComponent.prototype.__init9.call(this);AdminSecretarySaleServicesComponent.prototype.__init10.call(this);}
  ngOnInit() { this.load(); }
  apply() { this.page = 1; this.load(); }
  edit(item) { this.editingId = item.id; this.form = { title: item.title, price: item.price, secretaryReward: item.secretaryReward, isActive: item.isActive }; }
  cancelEdit() { this.editingId = null; this.form = { title: "", price: null, secretaryReward: null, isActive: true }; }
  save() {
    if (this.saving || !this.form.title.trim() || !this.form.price || this.form.price <= 0 || !this.form.secretaryReward || this.form.secretaryReward <= 0) { this.toast.error("عنوان، قیمت و پاداش بیشتر از صفر وارد کنید."); return; }
    this.saving = true;
    const body = { title: this.form.title.trim(), price: this.form.price, secretaryReward: this.form.secretaryReward, isActive: this.form.isActive };
    const request = this.editingId ? this.api.updateService(this.editingId, body) : this.api.createService(body);
    request.pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { if (!result.isSuccess) { this.toast.error(result.message); return; } this.toast.success(result.message); this.cancelEdit(); this.load(); }, error: (error) => this.toast.error(_optionalChain([error, 'optionalAccess', _ => _.error, 'optionalAccess', _2 => _2.message]) || "ذخیره خدمت انجام نشد.") });
  }
  toggle(item) { this.api.setServiceStatus(item.id, !item.isActive).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { if (!result.isSuccess) { this.toast.error(result.message); return; } item.isActive = !item.isActive; this.toast.success(result.message); this.cdr.markForCheck(); }, error: () => this.toast.error("تغییر وضعیت انجام نشد.") }); }
  changePage(page) { if (page < 1 || page > this.totalPages || page === this.page) return; this.page = page; this.load(); }
   load() { this.loading = true; this.api.adminServices({ search: this.search, isActive: this.isActive, page: this.page, pageSize: 10 }).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { this.items = result.items; this.totalPages = Math.max(result.totalPages, 1); }, error: () => this.toast.error("دریافت خدمات فروش منشی انجام نشد.") }); }
}
