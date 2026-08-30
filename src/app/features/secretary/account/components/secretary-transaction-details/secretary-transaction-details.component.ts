import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { PersianDatePipe } from "../../../../../basemadual/date/persian-date.pipe";
import { BaseBadgeComponent } from "../../../../../basemadual/feedback/badge/badge.component";
import { BaseSkeletonComponent } from "../../../../../basemadual/feedback/skeleton/skeleton.component";
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
