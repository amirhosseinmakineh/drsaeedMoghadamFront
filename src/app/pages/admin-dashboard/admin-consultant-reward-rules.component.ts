import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";
import { ConsultantRewardService } from "../../core/consultant/consultant-reward.service";
import { ServiceRewardRule } from "../../core/consultant/service-reward.models";
import { ToastService } from "../../core/toast/toast.service";
import { formatIranDateTime } from "../../utils/iran-datetime.util";

interface RuleDraft {
  serviceId: number; serviceName: string; version: number | null; basis: ServiceRewardRule["basis"];
  units: number | null; remainderMode: ServiceRewardRule["remainderMode"]; amount: number | null;
  isActive: boolean; createdAt?: string;
}

@Component({
  selector: "app-admin-consultant-reward-rules", standalone: true, imports: [FormsModule],
  templateUrl: "./admin-consultant-reward-rules.component.html",
  styleUrl: "./admin-consultant-reward-rules.component.scss", changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminConsultantRewardRulesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  rows: RuleDraft[] = [];
  loading = false;
  savingId: number | null = null;
  error = "";
  constructor(private readonly api: ConsultantRewardService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true; this.error = "";
    this.api.rules().pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.loading = false; this.cdr.markForCheck(); })).subscribe({
      next: rows => this.rows = rows.map(x => ({ serviceId: x.serviceId, serviceName: x.serviceName,
        version: x.rule?.id ?? null, basis: x.rule?.basis ?? "Unit", units: x.rule?.unitsPerReward ?? 1,
        remainderMode: x.rule?.remainderMode ?? "FullBlocks", amount: x.rule?.amount ?? 0,
        isActive: x.rule?.isActive ?? false, createdAt: x.rule?.createdAtUtc })),
      error: e => this.error = e?.error?.message || "دریافت قوانین پاداش انجام نشد.",
    });
  }
  changeBasis(row: RuleDraft): void {
    row.units = row.basis === "Unit" ? 1 : row.basis === "Block" ? 4 : null;
    if (row.basis !== "Block") row.remainderMode = "FullBlocks";
  }
  save(row: RuleDraft): void {
    if (this.savingId !== null) return;
    if (!Number.isInteger(row.units) || row.units! < 1 || row.units! > (row.basis === "Jaw" ? 16 : 32) ||
        row.amount === null || row.amount < 0 || row.amount > 999_999_999_999 || Math.abs(Math.round(row.amount * 100) - row.amount * 100) > 0.000001) {
      this.toast.error("تعداد واحد و مبلغ پاداش را درست وارد کنید."); return;
    }
    this.savingId = row.serviceId;
    this.api.saveRule({ serviceId: row.serviceId, basis: row.basis, unitsPerReward: row.units!,
      remainderMode: row.remainderMode, amount: row.amount, isActive: row.isActive, expectedVersionId: row.version })
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => { this.savingId = null; this.cdr.markForCheck(); })).subscribe({
        next: result => { row.version = result.id; row.createdAt = result.createdAtUtc; this.toast.success(result.message); },
        error: e => this.toast.error(e?.error?.message || "ذخیره قانون انجام نشد؛ تنظیمات را دوباره دریافت کنید."),
      });
  }
  date(value: string): string { return formatIranDateTime(value.endsWith("Z") ? value : value + "Z"); }
}
