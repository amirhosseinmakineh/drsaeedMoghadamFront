import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Wallet, WalletOperationRequest } from "../../core/financial/financial.models";
import { WalletService } from "../../core/financial/wallet.service";
import { financialError, roleLabel } from "./financial-ui";

type Operation = "deposit" | "withdraw";
@Component({ standalone: true, imports: [CommonModule, FormsModule], templateUrl: "./admin-wallets.component.html", styleUrl: "./financial.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class AdminWalletsComponent implements OnInit {
  readonly wallets = signal<Wallet[]>([]); readonly loading = signal(true); readonly error = signal("");
  readonly selected = signal<Wallet | null>(null); readonly operation = signal<Operation>("deposit");
  readonly submitting = signal(false); readonly formError = signal(""); readonly success = signal("");
  amount = ""; description = ""; readonly roleLabel = roleLabel;
  constructor(private walletService: WalletService) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.loading.set(true); this.error.set(""); this.walletService.getWallets().subscribe({ next: items => { this.wallets.set(items); this.loading.set(false); }, error: error => { this.error.set(financialError(error)); this.loading.set(false); } }); }
  open(wallet: Wallet, operation: Operation): void { this.selected.set(wallet); this.operation.set(operation); this.amount = ""; this.description = ""; this.formError.set(""); this.success.set(""); }
  close(): void { if (!this.submitting()) this.selected.set(null); }
  onAmount(value: string): void { const digits = value.replace(/\D/g, ""); this.amount = digits ? Number(digits).toLocaleString("en-US") : ""; }
  submit(): void {
    const wallet = this.selected(); const amount = Number(this.amount.replace(/,/g, ""));
    if (!wallet || !Number.isFinite(amount) || amount <= 0) { this.formError.set("مبلغ باید یک عدد بزرگ‌تر از صفر باشد"); return; }
    const data: WalletOperationRequest = { amount, description: this.description.trim() || undefined };
    const request = this.operation() === "deposit" ? this.walletService.depositWallet(wallet.userId, data) : this.walletService.withdrawWallet(wallet.userId, data);
    this.submitting.set(true); this.formError.set("");
    request.subscribe({ next: updated => { this.wallets.update(items => items.map(item => item.userId === wallet.userId ? { ...item, ...updated } : item)); this.submitting.set(false); this.success.set(this.operation() === "deposit" ? "کیف پول با موفقیت شارژ شد" : "برداشت با موفقیت انجام شد"); }, error: error => { this.formError.set(financialError(error)); this.submitting.set(false); } });
  }
}
