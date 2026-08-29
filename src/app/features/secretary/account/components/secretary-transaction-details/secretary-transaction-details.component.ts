import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { SecretaryFinancialTransactionDto } from "../../models/secretary-account.models";
@Component({ selector: "app-secretary-transaction-details", standalone: true, imports: [CommonModule], templateUrl: "./secretary-transaction-details.component.html", styleUrl: "./secretary-transaction-details.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretaryTransactionDetailsComponent { @Input() transaction: SecretaryFinancialTransactionDto | null = null; @Input() loading = false; }
