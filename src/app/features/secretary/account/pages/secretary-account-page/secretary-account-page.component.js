 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, DestroyRef, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { finalize, firstValueFrom } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BaseButtonComponent } from "../../../../../basemadual/actions/base-button/base-button.component";
import { BasePageShellComponent } from "../../../../../basemadual/layout/page-shell/page-shell.component";
import { BaseSectionComponent } from "../../../../../basemadual/layout/section/section.component";
import { BaseDrawerComponent } from "../../../../../basemadual/overlays/drawer/drawer.component";
import { BaseModalComponent } from "../../../../../basemadual/overlays/modal/modal.component";
import { BaseConfirmDialogComponent } from "../../../../../basemadual/overlays/confirm-dialog/confirm-dialog.component";

import { SecretaryAccountSummaryComponent } from "../../components/secretary-account-summary/secretary-account-summary.component";
import { SecretaryAccountShellComponent } from "../../components/secretary-account-shell/secretary-account-shell.component";
import { SecretaryTransactionDetailsComponent } from "../../components/secretary-transaction-details/secretary-transaction-details.component";
import { SecretaryTransactionFiltersComponent } from "../../components/secretary-transaction-filters/secretary-transaction-filters.component";
import { SecretaryTransactionFormComponent } from "../../components/secretary-transaction-form/secretary-transaction-form.component";
import { SecretaryTransactionListComponent } from "../../components/secretary-transaction-list/secretary-transaction-list.component";
import { SECRETARY_ACCOUNT_ERROR_MESSAGE, SECRETARY_ACCOUNT_PAGE_SIZE } from "../../constants/secretary-account.constants";








import { handleTransactionReceipt, } from "../../utils/transaction-receipt.util";
@Component({
  selector: "app-secretary-account-page",
  standalone: true,
  imports: [
    BaseButtonComponent,
    BaseDrawerComponent,
    BaseModalComponent,
    BaseConfirmDialogComponent,
    BasePageShellComponent,
    BaseSectionComponent,
    SecretaryAccountSummaryComponent,
    SecretaryAccountShellComponent,
    SecretaryTransactionDetailsComponent,
    SecretaryTransactionFiltersComponent,
    SecretaryTransactionFormComponent,
    SecretaryTransactionListComponent,
    RouterLink,
  ],
  templateUrl: "./secretary-account-page.component.html",
  styleUrl: "./secretary-account-page.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryAccountPageComponent  {
  ViewChild(SecretaryTransactionFormComponent)
  
  __init() {this.summary = null}
  __init2() {this.categories = []}
  __init3() {this.transactions = []}
  __init4() {this.selectedTransaction = null}
  __init5() {this.filters = {}}
  __init6() {this.page = 1}
   __init7() {this.pageSize = SECRETARY_ACCOUNT_PAGE_SIZE}
  __init8() {this.totalCount = 0}
  __init9() {this.isLoadingTransactions = false}
  __init10() {this.isLoadingSummary = false}
  __init11() {this.isSubmittingTransaction = false}
  __init12() {this.isLoadingDetails = false}
  __init13() {this.transactionsLoadFailed = false}
  __init14() {this.createDrawerOpen = false}
  __init15() {this.detailsDrawerOpen = false}
  __init16() {this.editModalOpen = false}
  __init17() {this.deleteDialogOpen = false}
  __init18() {this.isDeletingTransaction = false}
  __init19() {this.receiptLoadingId = null}
    __init20() {this.destroyRef = inject(DestroyRef)}
  constructor(
      accountService,
      toast,
      cdr,
  ) {;this.accountService = accountService;this.toast = toast;this.cdr = cdr;SecretaryAccountPageComponent.prototype.__init.call(this);SecretaryAccountPageComponent.prototype.__init2.call(this);SecretaryAccountPageComponent.prototype.__init3.call(this);SecretaryAccountPageComponent.prototype.__init4.call(this);SecretaryAccountPageComponent.prototype.__init5.call(this);SecretaryAccountPageComponent.prototype.__init6.call(this);SecretaryAccountPageComponent.prototype.__init7.call(this);SecretaryAccountPageComponent.prototype.__init8.call(this);SecretaryAccountPageComponent.prototype.__init9.call(this);SecretaryAccountPageComponent.prototype.__init10.call(this);SecretaryAccountPageComponent.prototype.__init11.call(this);SecretaryAccountPageComponent.prototype.__init12.call(this);SecretaryAccountPageComponent.prototype.__init13.call(this);SecretaryAccountPageComponent.prototype.__init14.call(this);SecretaryAccountPageComponent.prototype.__init15.call(this);SecretaryAccountPageComponent.prototype.__init16.call(this);SecretaryAccountPageComponent.prototype.__init17.call(this);SecretaryAccountPageComponent.prototype.__init18.call(this);SecretaryAccountPageComponent.prototype.__init19.call(this);SecretaryAccountPageComponent.prototype.__init20.call(this);}
  ngOnInit() {
    this.loadCategories();
    this.loadTransactions();
    this.loadSummary();
  }
  openCreateDrawer() {
    this.createDrawerOpen = true;
  }
  closeCreateDrawer() {
    if (!this.isSubmittingTransaction)
      this.createDrawerOpen = false;
  }
  closeDetailsDrawer() {
    this.detailsDrawerOpen = false;
    this.selectedTransaction = null;
  }
  openEdit(transaction) {
    this.selectedTransaction = transaction;
    this.detailsDrawerOpen = false;
    this.editModalOpen = true;
  }
  closeEdit() {
    if (!this.isSubmittingTransaction) this.editModalOpen = false;
  }
  requestDelete(transaction) {
    this.selectedTransaction = transaction;
    this.deleteDialogOpen = true;
  }
  closeDelete() {
    if (!this.isDeletingTransaction) this.deleteDialogOpen = false;
  }
  handleFiltersChanged(filters) {
    const dateRangeChanged =
      filters.fromDate !== this.filters.fromDate ||
      filters.toDate !== this.filters.toDate;
    this.filters = filters;
    this.page = 1;
    this.loadTransactions();
    if (dateRangeChanged) {
      this.loadSummary();
    }
  }
  handlePageChanged(page) {
    this.page = page;
    this.loadTransactions();
  }
  showDetails(id) {
    this.detailsDrawerOpen = true;
    this.selectedTransaction = null;
    this.isLoadingDetails = true;

    this.accountService
      .getTransaction(id)
      .pipe(
        finalize(() => {
          this.isLoadingDetails = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (!response.isSuccess) {
            this.toast.error(response.message);
            this.closeDetailsDrawer();
            this.loadTransactions();
            return;
          }
          this.selectedTransaction = response.data;
        },
        error: (error) => this.showError(error),
      });
  }
  createTransaction(request) {
    if (this.isSubmittingTransaction)
      return;
    this.isSubmittingTransaction = true;
    this.accountService
      .createTransaction(request)
      .pipe(
        finalize(() => {
          this.isSubmittingTransaction = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.handleCreateSuccess(response.message),
        error: (error) => this.showError(error),
      });
  }
  updateTransaction(request) {
    if (this.isSubmittingTransaction || !this.selectedTransaction) return;
    this.isSubmittingTransaction = true;
    const id = this.selectedTransaction.id;
    this.accountService.updateTransaction(id, request).pipe(
      finalize(() => { this.isSubmittingTransaction = false; this.cdr.markForCheck(); }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (response) => {
        if (!response.isSuccess) { this.toast.error(response.message); return; }
        this.toast.success(response.message || "تراکنش مالی با موفقیت ویرایش شد");
        this.editModalOpen = false;
        this.loadTransactions();
        this.loadSummary();
        this.showDetails(id);
      },
      error: (error) => this.handleMutationError(error),
    });
  }
  deleteTransaction() {
    if (this.isDeletingTransaction || !this.selectedTransaction) return;
    this.isDeletingTransaction = true;
    this.accountService.deleteTransaction(this.selectedTransaction.id).pipe(
      finalize(() => { this.isDeletingTransaction = false; this.cdr.markForCheck(); }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: (response) => {
        if (!response.isSuccess) { this.toast.error(response.message); return; }
        this.toast.success(response.message || "تراکنش مالی با موفقیت حذف شد");
        this.deleteDialogOpen = false;
        this.detailsDrawerOpen = false;
        this.selectedTransaction = null;
        this.loadTransactions();
        this.loadSummary();
      },
      error: (error) => this.handleMutationError(error),
    });
  }
  get deleteMessage() {
    const item = this.selectedTransaction;
    if (!item) return "";
    return `آیا از حذف تراکنش ${item.typeTitle} ${item.subject || "بدون عنوان"} به مبلغ ${new Intl.NumberFormat("fa-IR").format(item.amount)} تومان مطمئن هستید؟`;
  }
  async issueReceipt(id, action = "share") {
    if (this.receiptLoadingId !== null) return;
    this.receiptLoadingId = id;
    this.cdr.markForCheck();
    try {
      const response = await firstValueFrom(this.accountService.getTransactionReceipt(id));
      await handleTransactionReceipt(response, id, action);
    } catch (error) {
      this.showReceiptError(error);
    } finally {
      this.receiptLoadingId = null;
      this.cdr.markForCheck();
    }
  }
  loadTransactions() {
    this.isLoadingTransactions = true;
    this.transactionsLoadFailed = false;
    const request = { ...this.filters, page: this.page, pageSize: this.pageSize };

    this.accountService
      .getTransactions(request)
      .pipe(
        finalize(() => {
          this.isLoadingTransactions = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ data }) => {
          this.transactions = data.items;
          this.totalCount = data.totalCount;
        },
        error: (error) => {
          this.transactionsLoadFailed = true;
          this.showError(error);
        },
      });
  }
   handleCreateSuccess(message) {
    this.toast.success(message || "تراکنش مالی با موفقیت ثبت شد");
    _optionalChain([this, 'access', _ => _.transactionForm, 'optionalAccess', _2 => _2.reset, 'call', _3 => _3()]);
    this.createDrawerOpen = false;
    this.page = 1;
    this.loadTransactions();
    this.loadSummary();
  }
   loadSummary() {
    this.isLoadingSummary = true;
    this.accountService
      .getSummary(this.filters.fromDate, this.filters.toDate)
      .pipe(
        finalize(() => {
          this.isLoadingSummary = false;
          this.cdr.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ data }) => (this.summary = data),
        error: (error) => this.showError(error),
      });
  }
   loadCategories() {
    this.accountService
      .getExpenseCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ data }) => {
          this.categories = data;
          this.cdr.markForCheck();
        },
        error: (error) => this.showError(error),
      });
  }
   showError(error) {
    const apiMessage = _optionalChain([error, 'access', _4 => _4.error, 'optionalAccess', _5 => _5.message]);
    const message =
      typeof apiMessage === "string"
        ? apiMessage
        : SECRETARY_ACCOUNT_ERROR_MESSAGE;
    this.toast.error(message);
  }
   handleMutationError(error) {
    this.showError(error);
    if (_optionalChain([error, 'access', _6 => _6.error, 'optionalAccess', _7 => _7.message]) === "تراکنش مالی یافت نشد") {
      this.loadTransactions();
      this.loadSummary();
    }
  }
   showReceiptError(error) {
    if (error instanceof Error && error.message === "POPUP_BLOCKED") {
      this.toast.error("مرورگر اجازه باز کردن پیش‌نمایش را نداد.");
      return;
    }
    if (error instanceof HttpErrorResponse) {
      const statusMessages = {
        400: "شناسه تراکنش معتبر نیست.",
        401: "برای دریافت رسید دوباره وارد حساب کاربری شوید.",
        404: "تراکنش موردنظر پیدا نشد.",
      };
      this.toast.error(statusMessages[error.status] || SECRETARY_ACCOUNT_ERROR_MESSAGE);
      return;
    }
    this.toast.error("دریافت رسید تراکنش ناموفق بود.");
  }
}
