import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { FinancialService } from "../../core/financial/financial.service";
import { FinancialTransaction } from "../../core/financial/financial.models";
import { financialError, statusLabel, transactionTypeLabel } from "./financial-ui";

@Component({ standalone: true, imports: [CommonModule, RouterLink], templateUrl: "./transaction-details.component.html", styleUrl: "./financial.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class TransactionDetailsComponent implements OnInit {
  readonly transaction = signal<FinancialTransaction | null>(null);
  readonly loading = signal(true); readonly error = signal("");
  readonly typeLabel = transactionTypeLabel; readonly statusLabel = statusLabel;
  constructor(private route: ActivatedRoute, private financial: FinancialService) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading.set(true); this.error.set("");
    this.financial.getTransaction(this.route.snapshot.paramMap.get("id") ?? "").subscribe({ next: value => { this.transaction.set(value); this.loading.set(false); }, error: error => { this.error.set(financialError(error)); this.loading.set(false); } });
  }
}
