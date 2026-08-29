import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, ViewChild, inject } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { Router } from "@angular/router";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToastService } from "../../../../../core/toast/toast.service";
import { SECRETARY_ACCOUNT_ERROR_MESSAGE, SECRETARY_ACCOUNT_PAGE_SIZE } from "../../constants/secretary-account.constants";
import { SecretaryAccountSummaryComponent } from "../../components/secretary-account-summary/secretary-account-summary.component";
import { SecretaryTransactionFiltersComponent } from "../../components/secretary-transaction-filters/secretary-transaction-filters.component";
import { SecretaryTransactionFormComponent } from "../../components/secretary-transaction-form/secretary-transaction-form.component";
import { SecretaryTransactionListComponent } from "../../components/secretary-transaction-list/secretary-transaction-list.component";
import { CreateSecretaryFinancialTransactionRequest, SecretaryExpenseCategoryDto, SecretaryFinancialSummaryDto, SecretaryFinancialTransactionDto, SecretaryTransactionFilters } from "../../models/secretary-account.models";
import { SecretaryAccountService } from "../../services/secretary-account.service";

@Component({ selector: "app-secretary-account-page", standalone: true, imports: [SecretaryAccountSummaryComponent, SecretaryTransactionFiltersComponent, SecretaryTransactionFormComponent, SecretaryTransactionListComponent], templateUrl: "./secretary-account-page.component.html", styleUrl: "./secretary-account-page.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretaryAccountPageComponent implements OnInit {
  @ViewChild(SecretaryTransactionFormComponent) transactionForm?: SecretaryTransactionFormComponent;
  summary: SecretaryFinancialSummaryDto | null = null;
  categories: SecretaryExpenseCategoryDto[] = [];
  transactions: SecretaryFinancialTransactionDto[] = [];
  filters: SecretaryTransactionFilters = {};
  page = 1;
  readonly pageSize = SECRETARY_ACCOUNT_PAGE_SIZE;
  totalCount = 0;
  isLoadingTransactions = false;
  isLoadingSummary = false;
  isLoadingCategories = false;
  isSubmittingTransaction = false;
  private readonly destroyRef = inject(DestroyRef);

  constructor(private readonly accountService: SecretaryAccountService, private readonly toast: ToastService, private readonly router: Router, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.loadCategories(); this.loadTransactions(); this.loadSummary(); }
  handleFiltersChanged(filters: SecretaryTransactionFilters): void { this.filters = filters; this.page = 1; this.loadTransactions(); this.loadSummary(); }
  handlePageChanged(page: number): void { this.page = page; this.loadTransactions(); }
  showDetails(id: number): void { void this.router.navigate(["/secretary/account/transactions", id]); }
  createTransaction(request: CreateSecretaryFinancialTransactionRequest): void {
    if (this.isSubmittingTransaction) return;
    this.isSubmittingTransaction = true;
    this.accountService.createTransaction(request).pipe(finalize(() => { this.isSubmittingTransaction = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (response) => { this.toast.success(response.message || "تراکنش مالی با موفقیت ثبت شد"); this.transactionForm?.reset(); this.loadTransactions(); this.loadSummary(); }, error: (error: HttpErrorResponse) => this.showError(error) });
  }
  private loadTransactions(): void {
    this.isLoadingTransactions = true;
    this.accountService.getTransactions({ ...this.filters, page: this.page, pageSize: this.pageSize }).pipe(finalize(() => { this.isLoadingTransactions = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (response) => { this.transactions = response.data.items; this.totalCount = response.data.totalCount; }, error: (error: HttpErrorResponse) => this.showError(error) });
  }
  private loadSummary(): void {
    this.isLoadingSummary = true;
    this.accountService.getSummary(this.filters.fromDate, this.filters.toDate).pipe(finalize(() => { this.isLoadingSummary = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (response) => { this.summary = response.data; }, error: (error: HttpErrorResponse) => this.showError(error) });
  }
  private loadCategories(): void {
    this.isLoadingCategories = true;
    this.accountService.getExpenseCategories().pipe(finalize(() => { this.isLoadingCategories = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (response) => { this.categories = response.data; }, error: (error: HttpErrorResponse) => this.showError(error) });
  }
  private showError(error: HttpErrorResponse): void { const message = typeof error.error?.message === "string" ? error.error.message : SECRETARY_ACCOUNT_ERROR_MESSAGE; this.toast.error(message); }
}
