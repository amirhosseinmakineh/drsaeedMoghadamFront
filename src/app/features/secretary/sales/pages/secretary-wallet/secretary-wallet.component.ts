import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize, forkJoin } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SecretaryAccountShellComponent } from "../../../account/components/secretary-account-shell/secretary-account-shell.component";
import { formatIranDateTime } from "../../../../../utils/iran-datetime.util";
import { SecretaryWallet, SecretaryWalletTransaction, SecretaryWalletTransactionType, toman } from "../../models/secretary-sales.models";
import { SecretarySalesService } from "../../services/secretary-sales.service";

@Component({ selector: "app-secretary-wallet", standalone: true, imports: [FormsModule, SecretaryAccountShellComponent], templateUrl: "./secretary-wallet.component.html", styleUrls: ["../secretary-sales.shared.scss"], changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretaryWalletComponent implements OnInit {
  readonly toman = toman; readonly date = formatIranDateTime; readonly types = SecretaryWalletTransactionType;
  wallet: SecretaryWallet = { balance: 0, totalRewards: 0, approvedSalesCount: 0 };
  items: SecretaryWalletTransaction[] = []; page = 1; totalPages = 1; fromDate = ""; toDate = ""; transactionType?: SecretaryWalletTransactionType; loading = false;
  private readonly destroyRef = inject(DestroyRef);
  constructor(private readonly api: SecretarySalesService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  apply(): void { this.page = 1; this.loadTransactions(); }
  changePage(page: number): void { if (page < 1 || page > this.totalPages || page === this.page) return; this.page = page; this.loadTransactions(); }
  private load(): void { this.loading = true; forkJoin({ wallet: this.api.wallet(), transactions: this.api.walletTransactions({ page: 1, pageSize: 10 }) }).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe(({ wallet, transactions }) => { this.wallet = wallet; this.items = transactions.items; this.totalPages = Math.max(transactions.totalPages, 1); }); }
  private loadTransactions(): void { this.loading = true; this.api.walletTransactions({ page: this.page, pageSize: 10, fromDate: this.fromDate, toDate: this.toDate, transactionType: this.transactionType }).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe((result) => { this.items = result.items; this.totalPages = Math.max(result.totalPages, 1); }); }
}
