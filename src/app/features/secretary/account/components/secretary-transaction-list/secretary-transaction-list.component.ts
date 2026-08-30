import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";
import { PersianDateService } from "../../../../../basemadual/date/persian-date.service";
import { BaseEmptyStateComponent } from "../../../../../basemadual/feedback/empty-state/empty-state.component";
import { BaseErrorStateComponent } from "../../../../../basemadual/feedback/error-state/error-state.component";
import { BaseSkeletonComponent } from "../../../../../basemadual/feedback/skeleton/skeleton.component";
import type { BaseTableColumn } from "../../../../../basemadual/models/base-ui.models";
import { BaseDataTableComponent } from "../../../../../basemadual/table/data-table/data-table.component";
import { BaseTablePaginationComponent } from "../../../../../basemadual/table/table-pagination/table-pagination.component";
import { SecretaryFinancialTransactionDto } from "../../models/secretary-account.models";
interface TransactionRow {
  type: string;
  amount: string;
  subject: string;
  counterparty: string;
  payment: string;
  category: string;
  date: string;
  source: SecretaryFinancialTransactionDto;
}
@Component({
  selector: "app-secretary-transaction-list",
  standalone: true,
  imports: [
    BaseDataTableComponent,
    BaseEmptyStateComponent,
    BaseErrorStateComponent,
    BaseSkeletonComponent,
    BaseTablePaginationComponent,
  ],
  templateUrl: "./secretary-transaction-list.component.html",
  styleUrl: "./secretary-transaction-list.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryTransactionListComponent implements OnChanges {
  @Input()
  items: SecretaryFinancialTransactionDto[] = [];
  @Input()
  loading = false;
  @Input()
  hasError = false;
  @Input()
  page = 1;
  @Input()
  pageSize = 20;
  @Input()
  totalCount = 0;
  @Output()
  detailsRequested = new EventEmitter<number>();
  @Output()
  pageChanged = new EventEmitter<number>();
  @Output()
  retry = new EventEmitter<void>();
  readonly columns: BaseTableColumn<TransactionRow>[] = [
    { key: "type", label: "نوع" },
    { key: "amount", label: "مبلغ", primaryOnMobile: true },
    { key: "subject", label: "عنوان" },
    { key: "counterparty", label: "طرف حساب" },
    { key: "payment", label: "روش پرداخت" },
    { key: "category", label: "دسته‌بندی" },
    { key: "date", label: "تاریخ" },
  ];
  rows: TransactionRow[] = [];
  private readonly money = new Intl.NumberFormat("fa-IR");
  constructor(private readonly persianDate: PersianDateService) {}
  ngOnChanges(): void {
    this.rows = this.items.map((item) => ({
      type: item.typeTitle,
      amount: `${this.money.format(item.amount)} تومان`,
      subject: item.subject || "—",
      counterparty: item.counterpartyName || "—",
      payment: item.paymentMethodTitle,
      category: item.expenseCategoryTitle || "—",
      date: this.persianDate.format(item.transactionDate),
      source: item,
    }));
  }
  show(row: TransactionRow): void {
    this.detailsRequested.emit(row.source.id);
  }
}
