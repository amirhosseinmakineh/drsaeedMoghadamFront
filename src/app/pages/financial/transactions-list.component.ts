import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { FinancialTransaction } from "../../core/financial/financial.models";
import { FinancialService } from "../../core/financial/financial.service";
import { financialError, statusLabel, transactionTypeLabel } from "./financial-ui";

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./transactions-list.component.html",
  styleUrl: "./financial.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsListComponent implements OnInit {
  readonly transactions = signal<FinancialTransaction[]>([]);
  readonly loading = signal(true);
  readonly error = signal("");
  readonly typeLabel = transactionTypeLabel;
  readonly statusLabel = statusLabel;

  constructor(private financial: FinancialService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set("");
    this.financial.getTransactions().subscribe({
      next: (items) => { this.transactions.set(items); this.loading.set(false); },
      error: (error) => { this.error.set(financialError(error)); this.loading.set(false); },
    });
  }
}
