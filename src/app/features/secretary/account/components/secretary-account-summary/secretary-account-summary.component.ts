import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { BaseStatCardComponent } from "../../../../../basemadual/cards/stat-card/stat-card.component";
import { SecretaryFinancialSummaryDto } from "../../models/secretary-account.models";
@Component({
  selector: "app-secretary-account-summary",
  standalone: true,
  imports: [BaseStatCardComponent],
  templateUrl: "./secretary-account-summary.component.html",
  styleUrl: "./secretary-account-summary.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryAccountSummaryComponent {
  @Input()
  summary: SecretaryFinancialSummaryDto | null = null;
  @Input()
  loading = false;
  private readonly moneyFormatter = new Intl.NumberFormat("fa-IR");
  get transactionCount(): string {
    if (!this.summary) {
      return "—";
    }
    return this.moneyFormatter.format(
      this.summary.incomeCount + this.summary.expenseCount,
    );
  }
  money(value: number | null | undefined): string {
    return value == null ? "—" : `${this.moneyFormatter.format(value)} تومان`;
  }
  count(value: number | null | undefined): string {
    return value == null
      ? ""
      : `${this.moneyFormatter.format(value)} تراکنش`;
  }
}
