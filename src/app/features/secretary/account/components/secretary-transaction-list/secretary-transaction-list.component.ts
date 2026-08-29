import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import { SecretaryFinancialTransactionDto } from "../../models/secretary-account.models";

@Component({ selector: "app-secretary-transaction-list", standalone: true, imports: [CommonModule], templateUrl: "./secretary-transaction-list.component.html", styleUrl: "./secretary-transaction-list.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretaryTransactionListComponent {
  @Input() items: SecretaryFinancialTransactionDto[] = [];
  @Input() loading = false;
  @Input() page = 1;
  @Input() pageSize = 20;
  @Input() totalCount = 0;
  @Output() detailsRequested = new EventEmitter<number>();
  @Output() pageChanged = new EventEmitter<number>();
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalCount / this.pageSize)); }
  previousPage(): void { if (this.page > 1) this.pageChanged.emit(this.page - 1); }
  nextPage(): void { if (this.page < this.totalPages) this.pageChanged.emit(this.page + 1); }
}
