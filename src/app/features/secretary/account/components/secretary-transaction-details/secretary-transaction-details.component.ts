import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { BaseBadgeComponent, BaseSkeletonComponent, PersianDatePipe } from "../../../../../basemadual";
import { FinancialTransactionType } from "../../enums/financial-transaction-type.enum";
import { SecretaryFinancialTransactionDto } from "../../models/secretary-account.models";
@Component({
  selector: "app-secretary-transaction-details",
  standalone: true,
  imports: [BaseBadgeComponent, BaseSkeletonComponent, PersianDatePipe],
  templateUrl: "./secretary-transaction-details.component.html",
  styleUrl: "./secretary-transaction-details.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryTransactionDetailsComponent {
  @Input()
  transaction: SecretaryFinancialTransactionDto | null = null;
  @Input()
  loading = false;
  readonly incomeType = FinancialTransactionType.Income;
  readonly money = new Intl.NumberFormat("fa-IR");
}
