import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, ViewChild, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { finalize, firstValueFrom } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BaseButtonComponent } from "../../../../../basemadual/actions/base-button/base-button.component";
import { BasePageShellComponent } from "../../../../../basemadual/layout/page-shell/page-shell.component";
import { BaseSectionComponent } from "../../../../../basemadual/layout/section/section.component";
import { BaseDrawerComponent } from "../../../../../basemadual/overlays/drawer/drawer.component";
import { BaseModalComponent } from "../../../../../basemadual/overlays/modal/modal.component";
import { BaseConfirmDialogComponent } from "../../../../../basemadual/overlays/confirm-dialog/confirm-dialog.component";
import { ToastService } from "../../../../../core/toast/toast.service";
import { SecretaryAccountSummaryComponent } from "../../components/secretary-account-summary/secretary-account-summary.component";
import { SecretaryAccountShellComponent } from "../../components/secretary-account-shell/secretary-account-shell.component";
import { SecretaryTransactionDetailsComponent } from "../../components/secretary-transaction-details/secretary-transaction-details.component";
import { SecretaryTransactionFiltersComponent } from "../../components/secretary-transaction-filters/secretary-transaction-filters.component";
import { SecretaryTransactionFormComponent } from "../../components/secretary-transaction-form/secretary-transaction-form.component";
import { SecretaryTransactionListComponent } from "../../components/secretary-transaction-list/secretary-transaction-list.component";
import { SECRETARY_ACCOUNT_ERROR_MESSAGE, SECRETARY_ACCOUNT_PAGE_SIZE } from "../../constants/secretary-account.constants";
import {
  CreateSecretaryFinancialTransactionRequest,
  SecretaryExpenseCategoryDto,
  SecretaryFinancialSummaryDto,
  SecretaryFinancialTransactionDto,
  SecretaryTransactionFilters,
} from "../../models/secretary-account.models";
import { SecretaryAccountService } from "../../services/secretary-account.service";
import { handleTransactionReceipt, ReceiptAction } from "../../utils/transaction-receipt.util";
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
export class SecretaryAccountPageComponent implements OnInit {
  @ViewChild(SecretaryTransactionFormComponent)
  transactionForm?: SecretaryTransactionFormComponent;
  summary: SecretaryFinancialSummaryDto | null = null;
  categories: SecretaryExpenseCategoryDto[] = [];
  transactions: SecretaryFinancialTransactionDto[] = [];
  selectedTransaction: SecretaryFinancialTransactionDto | null = null;
  filters: SecretaryTransactionFilters = {};
  page = 1;
  readonly pageSize = SECRETARY_ACCOUNT_PAGE_SIZE;
  totalCount = 0;
  isLoadingTransactions = false;
  isLoadingSummary = false;
  isSubmittingTransaction = false;
  isLoadingDetails = false;
  transactionsLoadFailed = false;
  createDrawerOpen = false;
  detailsDrawerOpen = false;
  editModalOpen = false;
  deleteDialogOpen = false;
  isDeletingTransaction = false;
  receiptLoadingId: number | null = null;
  private readonly destroyRef = inject(DestroyRef);
  constructor(
    private readonly accountService: SecretaryAccountService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {}
  ngOnInit(): void {
    this.loadCategories();
    this.loadTransactions();
    this.loadSummary();
  }
  openCreateDrawer(): void {
    this.createDrawerOpen = true;
  }
  closeCreateDrawer(): void {
    if (!this.isSubmittingTransaction)
      this.createDrawerOpen = false;
  }
  closeDetailsDrawer(): void {
    this.detailsDrawerOpen = false;
    this.selectedTransaction = null;
  }
  openEdit(transaction: SecretaryFinancialTransactionDto): void {
    this.selectedTransaction = transaction;
    this.detailsDrawerOpen = false;
    this.editModalOpen = true;
  }
  closeEdit(): void {
    if (!this.isSubmittingTransaction) this.editModalOpen = false;
  }
  requestDelete(transaction: SecretaryFinancialTransactionDto): void {
    this.selectedTransaction = transaction;
    this.deleteDialogOpen = true;
  }
  closeDelete(): void {
    if (!this.isDeletingTransaction) this.deleteDialogOpen = false;
  }
  handleFiltersChanged(filters: SecretaryTransactionFilters): void {
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
  handlePageChanged(page: number): void {
    this.page = page;
    this.loadTransactions();
  }
  showDetails(id: number): void {
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
        error: (error: HttpErrorResponse) => this.showError(error),
      });
  }
  createTransaction(request: CreateSecretaryFinancialTransactionRequest): void {
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
        error: (error: HttpErrorResponse) => this.showError(error),
      });
  }
  updateTransaction(request: CreateSecretaryFinancialTransactionRequest): void {
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
      error: (error: HttpErrorResponse) => this.handleMutationError(error),
    });
  }
  deleteTransaction(): void {
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
      error: (error: HttpErrorResponse) => this.handleMutationError(error),
    });
  }
  get deleteMessage(): string {
    const item = this.selectedTransaction;
    if (!item) return "";
    return `آیا از حذف تراکنش ${item.typeTitle} ${item.subject || "بدون عنوان"} به مبلغ ${new Intl.NumberFormat("fa-IR").format(item.amount)} تومان مطمئن هستید؟`;
  }
  async issueReceipt(id: number, action: ReceiptAction = "share"): Promise<void> {
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
  loadTransactions(): void {
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
        error: (error: HttpErrorResponse) => {
          this.transactionsLoadFailed = true;
          this.showError(error);
        },
      });
  }
  private handleCreateSuccess(message: string): void {
    this.toast.success(message || "تراکنش مالی با موفقیت ثبت شد");
    this.transactionForm?.reset();
    this.createDrawerOpen = false;
    this.page = 1;
    this.loadTransactions();
    this.loadSummary();
  }
  private loadSummary(): void {
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
        error: (error: HttpErrorResponse) => this.showError(error),
      });
  }
  private loadCategories(): void {
    this.accountService
      .getExpenseCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ data }) => {
          this.categories = data;
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => this.showError(error),
      });
  }
  private showError(error: HttpErrorResponse): void {
    const apiMessage = error.error?.message;
    const message =
      typeof apiMessage === "string"
        ? apiMessage
        : SECRETARY_ACCOUNT_ERROR_MESSAGE;
    this.toast.error(message);
  }
  private handleMutationError(error: HttpErrorResponse): void {
    this.showError(error);
    if (error.error?.message === "تراکنش مالی یافت نشد") {
      this.loadTransactions();
      this.loadSummary();
    }
  }
  private showReceiptError(error: unknown): void {
    if (error instanceof Error && error.message === "POPUP_BLOCKED") {
      this.toast.error("مرورگر اجازه باز کردن پیش‌نمایش را نداد.");
      return;
    }
    if (error instanceof HttpErrorResponse) {
      const statusMessages: Record<number, string> = {
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
