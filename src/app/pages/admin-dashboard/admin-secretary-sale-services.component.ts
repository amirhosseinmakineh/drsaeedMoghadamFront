import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToastService } from "../../core/toast/toast.service";
import { SecretarySaleService, toman } from "../../features/secretary/sales/models/secretary-sales.models";
import { SecretarySalesService } from "../../features/secretary/sales/services/secretary-sales.service";

@Component({ selector: "app-admin-secretary-sale-services", standalone: true, imports: [FormsModule], templateUrl: "./admin-secretary-sale-services.component.html", styleUrl: "./admin-secretary-sales.shared.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class AdminSecretarySaleServicesComponent implements OnInit {
  readonly toman = toman;
  items: SecretarySaleService[] = [];
  editingId: number | null = null;
  form = { title: "", price: null as number | null, secretaryReward: null as number | null, isActive: true };
  search = ""; isActive?: boolean; page = 1; totalPages = 1; loading = false; saving = false;
  private readonly destroyRef = inject(DestroyRef);
  constructor(private readonly api: SecretarySalesService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  apply(): void { this.page = 1; this.load(); }
  edit(item: SecretarySaleService): void { this.editingId = item.id; this.form = { title: item.title, price: item.price, secretaryReward: item.secretaryReward, isActive: item.isActive }; }
  cancelEdit(): void { this.editingId = null; this.form = { title: "", price: null, secretaryReward: null, isActive: true }; }
  save(): void {
    if (this.saving || !this.form.title.trim() || !this.form.price || this.form.price <= 0 || !this.form.secretaryReward || this.form.secretaryReward <= 0) { this.toast.error("عنوان، قیمت و پاداش بیشتر از صفر وارد کنید."); return; }
    this.saving = true;
    const body = { title: this.form.title.trim(), price: this.form.price, secretaryReward: this.form.secretaryReward, isActive: this.form.isActive };
    const request = this.editingId ? this.api.updateService(this.editingId, body) : this.api.createService(body);
    request.pipe(finalize(() => { this.saving = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { if (!result.isSuccess) { this.toast.error(result.message); return; } this.toast.success(result.message); this.cancelEdit(); this.load(); }, error: (error) => this.toast.error(error?.error?.message || "ذخیره خدمت انجام نشد.") });
  }
  toggle(item: SecretarySaleService): void { this.api.setServiceStatus(item.id, !item.isActive).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { if (!result.isSuccess) { this.toast.error(result.message); return; } item.isActive = !item.isActive; this.toast.success(result.message); this.cdr.markForCheck(); }, error: () => this.toast.error("تغییر وضعیت انجام نشد.") }); }
  changePage(page: number): void { if (page < 1 || page > this.totalPages || page === this.page) return; this.page = page; this.load(); }
  private load(): void { this.loading = true; this.api.adminServices({ search: this.search, isActive: this.isActive, page: this.page, pageSize: 10 }).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { this.items = result.items; this.totalPages = Math.max(result.totalPages, 1); }, error: () => this.toast.error("دریافت خدمات فروش منشی انجام نشد.") }); }
}
