import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Wallet } from "../../core/financial/financial.models";
import { WalletService } from "../../core/financial/wallet.service";
import { financialError, statusLabel, transactionTypeLabel } from "./financial-ui";

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./wallet-dashboard.component.html",
  styleUrl: "./financial.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletDashboardComponent implements OnInit {
  readonly wallet = signal<Wallet | null>(null);
  readonly loading = signal(true);
  readonly error = signal("");
  readonly typeLabel = transactionTypeLabel;
  readonly statusLabel = statusLabel;
  constructor(private wallets: WalletService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading.set(true); this.error.set("");
    this.wallets.getMyWallet().subscribe({ next: wallet => { this.wallet.set(wallet); this.loading.set(false); }, error: error => { this.error.set(financialError(error)); this.loading.set(false); } });
  }
}
