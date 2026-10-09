import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SecretaryAccountShellComponent } from "../../../account/components/secretary-account-shell/secretary-account-shell.component";
import { formatIranDateTime } from "../../../../../utils/iran-datetime.util";
import { SecretarySale, SecretarySaleService, SecretarySaleStatus, saleStatusLabel, toman } from "../../models/secretary-sales.models";
import { SecretarySalesService } from "../../services/secretary-sales.service";

@Component({ selector: "app-secretary-sales", standalone: true, imports: [FormsModule, RouterLink, SecretaryAccountShellComponent], templateUrl: "./secretary-sales.component.html", styleUrls: ["../secretary-sales.shared.scss"], changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretarySalesComponent implements OnInit {
  readonly statuses = SecretarySaleStatus;
  readonly statusLabel = saleStatusLabel;
  readonly toman = toman;
  readonly date = formatIranDateTime;
  items: SecretarySale[] = [];
  services: SecretarySaleService[] = [];
  search = "";
  status?: SecretarySaleStatus;
  serviceId?: number;
  fromDate = "";
  toDate = "";
  page = 1;
  totalPages = 1;
  loading = false;
  private readonly destroyRef = inject(DestroyRef);
  constructor(private readonly api: SecretarySalesService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.api.activeServices().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => { this.services = items; this.cdr.markForCheck(); }); this.load(); }
  apply(): void { this.page = 1; this.load(); }
  changePage(page: number): void { if (page < 1 || page > this.totalPages || page === this.page) return; this.page = page; this.load(); }
  load(): void {
    this.loading = true;
    this.api.mySales({ search: this.search, status: this.status, serviceId: this.serviceId, fromDate: this.fromDate, toDate: this.toDate, page: this.page, pageSize: 10 }).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { this.items = result.items; this.totalPages = Math.max(result.totalPages, 1); }, error: () => { this.items = []; } });
  }
}
