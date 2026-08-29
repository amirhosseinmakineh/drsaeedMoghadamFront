import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { SecretaryFinancialSummaryDto } from "../../models/secretary-account.models";

@Component({
  selector: "app-secretary-account-summary",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./secretary-account-summary.component.html",
  styleUrl: "./secretary-account-summary.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryAccountSummaryComponent {
  @Input() summary: SecretaryFinancialSummaryDto | null = null;
  @Input() loading = false;
}
