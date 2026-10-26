import { ChangeDetectionStrategy, } from "@angular/core";
import { BaseStatCardComponent } from "../../../../../basemadual/cards/stat-card/stat-card.component";

@Component({
  selector: "app-secretary-account-summary",
  standalone: true,
  imports: [BaseStatCardComponent],
  templateUrl: "./secretary-account-summary.component.html",
  styleUrl: "./secretary-account-summary.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryAccountSummaryComponent {constructor() { SecretaryAccountSummaryComponent.prototype.__init.call(this);SecretaryAccountSummaryComponent.prototype.__init2.call(this);SecretaryAccountSummaryComponent.prototype.__init3.call(this); }
  Input()
  __init() {this.summary = null}
  Input()
  __init2() {this.loading = false}
    __init3() {this.moneyFormatter = new Intl.NumberFormat("fa-IR")}
  get transactionCount() {
    if (!this.summary) {
      return "—";
    }
    return this.moneyFormatter.format(
      this.summary.incomeCount + this.summary.expenseCount,
    );
  }
  money(value) {
    return value == null ? "—" : `${this.moneyFormatter.format(value)} تومان`;
  }
  count(value) {
    return value == null
      ? ""
      : `${this.moneyFormatter.format(value)} تراکنش`;
  }
}
