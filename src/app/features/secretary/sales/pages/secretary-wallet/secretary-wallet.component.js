import { ChangeDetectionStrategy, DestroyRef, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize, forkJoin } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SecretaryAccountShellComponent } from "../../../account/components/secretary-account-shell/secretary-account-shell.component";
import { formatIranDateTime } from "../../../../../utils/iran-datetime.util";
import { SecretaryWalletTransactionType, toman } from "../../models/secretary-sales.models";


@Component({ selector: "app-secretary-wallet", standalone: true, imports: [FormsModule, SecretaryAccountShellComponent], templateUrl: "./secretary-wallet.component.html", styleUrls: ["../secretary-sales.shared.scss"], changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretaryWalletComponent  {
   __init() {this.toman = toman}  __init2() {this.date = formatIranDateTime}  __init3() {this.types = SecretaryWalletTransactionType}
  __init4() {this.wallet = { balance: 0, totalRewards: 0, approvedSalesCount: 0 }}
  __init5() {this.items = []} __init6() {this.page = 1} __init7() {this.totalPages = 1} __init8() {this.fromDate = ""} __init9() {this.toDate = ""}  __init10() {this.loading = false}
    __init11() {this.destroyRef = inject(DestroyRef)}
  constructor(  api,   cdr) {;this.api = api;this.cdr = cdr;SecretaryWalletComponent.prototype.__init.call(this);SecretaryWalletComponent.prototype.__init2.call(this);SecretaryWalletComponent.prototype.__init3.call(this);SecretaryWalletComponent.prototype.__init4.call(this);SecretaryWalletComponent.prototype.__init5.call(this);SecretaryWalletComponent.prototype.__init6.call(this);SecretaryWalletComponent.prototype.__init7.call(this);SecretaryWalletComponent.prototype.__init8.call(this);SecretaryWalletComponent.prototype.__init9.call(this);SecretaryWalletComponent.prototype.__init10.call(this);SecretaryWalletComponent.prototype.__init11.call(this);}
  ngOnInit() { this.load(); }
  apply() { this.page = 1; this.loadTransactions(); }
  changePage(page) { if (page < 1 || page > this.totalPages || page === this.page) return; this.page = page; this.loadTransactions(); }
   load() { this.loading = true; forkJoin({ wallet: this.api.wallet(), transactions: this.api.walletTransactions({ page: 1, pageSize: 10 }) }).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe(({ wallet, transactions }) => { this.wallet = wallet; this.items = transactions.items; this.totalPages = Math.max(transactions.totalPages, 1); }); }
   loadTransactions() { this.loading = true; this.api.walletTransactions({ page: this.page, pageSize: 10, fromDate: this.fromDate, toDate: this.toDate, transactionType: this.transactionType }).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe((result) => { this.items = result.items; this.totalPages = Math.max(result.totalPages, 1); }); }
}
