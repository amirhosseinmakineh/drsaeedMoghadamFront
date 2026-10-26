import { ChangeDetectionStrategy, EventEmitter, } from "@angular/core";

import { BaseEmptyStateComponent } from "../../../../../basemadual/feedback/empty-state/empty-state.component";
import { BaseErrorStateComponent } from "../../../../../basemadual/feedback/error-state/error-state.component";
import { BaseSkeletonComponent } from "../../../../../basemadual/feedback/skeleton/skeleton.component";

import { BaseDataTableComponent } from "../../../../../basemadual/table/data-table/data-table.component";
import { BaseTablePaginationComponent } from "../../../../../basemadual/table/table-pagination/table-pagination.component";











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
export class SecretaryTransactionListComponent  {
  Input()
  __init() {this.items = []}
  Input()
  __init2() {this.loading = false}
  Input()
  __init3() {this.hasError = false}
  Input()
  __init4() {this.page = 1}
  Input()
  __init5() {this.pageSize = 20}
  Input()
  __init6() {this.totalCount = 0}
  Input()
  __init7() {this.receiptLoadingId = null}
  Output()
  __init8() {this.detailsRequested = new EventEmitter()}
  Output()
  __init9() {this.receiptRequested = new EventEmitter()}
  Output()
  __init10() {this.pageChanged = new EventEmitter()}
  Output()
  __init11() {this.retry = new EventEmitter()}
   __init12() {this.columns = [
    { key: "type", label: "نوع" },
    { key: "amount", label: "مبلغ", primaryOnMobile: true },
    { key: "subject", label: "عنوان" },
    { key: "counterparty", label: "طرف حساب" },
    { key: "payment", label: "روش پرداخت" },
    { key: "category", label: "دسته‌بندی" },
    { key: "date", label: "تاریخ" },
  ]}
  __init13() {this.rows = []}
    __init14() {this.money = new Intl.NumberFormat("fa-IR")}
  constructor(  persianDate) {;this.persianDate = persianDate;SecretaryTransactionListComponent.prototype.__init.call(this);SecretaryTransactionListComponent.prototype.__init2.call(this);SecretaryTransactionListComponent.prototype.__init3.call(this);SecretaryTransactionListComponent.prototype.__init4.call(this);SecretaryTransactionListComponent.prototype.__init5.call(this);SecretaryTransactionListComponent.prototype.__init6.call(this);SecretaryTransactionListComponent.prototype.__init7.call(this);SecretaryTransactionListComponent.prototype.__init8.call(this);SecretaryTransactionListComponent.prototype.__init9.call(this);SecretaryTransactionListComponent.prototype.__init10.call(this);SecretaryTransactionListComponent.prototype.__init11.call(this);SecretaryTransactionListComponent.prototype.__init12.call(this);SecretaryTransactionListComponent.prototype.__init13.call(this);SecretaryTransactionListComponent.prototype.__init14.call(this);SecretaryTransactionListComponent.prototype.__init15.call(this);}
  ngOnChanges() {
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
  show(row) {
    this.detailsRequested.emit(row.source.id);
  }
   __init15() {this.isReceiptLoading = (row) =>
    row.source.id === this.receiptLoadingId}
}
