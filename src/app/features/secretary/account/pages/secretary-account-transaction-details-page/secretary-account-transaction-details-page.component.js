 function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, DestroyRef, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { BaseCardComponent } from "../../../../../basemadual/cards/base-card/base-card.component";
import { BasePageShellComponent } from "../../../../../basemadual/layout/page-shell/page-shell.component";
import { finalize, firstValueFrom } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { SecretaryTransactionDetailsComponent } from "../../components/secretary-transaction-details/secretary-transaction-details.component";
import { SecretaryAccountShellComponent } from "../../components/secretary-account-shell/secretary-account-shell.component";
import { SECRETARY_ACCOUNT_ERROR_MESSAGE } from "../../constants/secretary-account.constants";


import { handleTransactionReceipt, } from "../../utils/transaction-receipt.util";

@Component({ selector: "app-secretary-account-transaction-details-page", standalone: true, imports: [RouterLink, BaseCardComponent, BasePageShellComponent, SecretaryAccountShellComponent, SecretaryTransactionDetailsComponent], templateUrl: "./secretary-account-transaction-details-page.component.html", styleUrl: "./secretary-account-transaction-details-page.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretaryAccountTransactionDetailsPageComponent  {
  __init() {this.transaction = null}
  __init2() {this.isLoadingDetails = false}
  __init3() {this.receiptLoading = false}
    __init4() {this.destroyRef = inject(DestroyRef)}
  constructor(  route,   accountService,   toast,   cdr) {;this.route = route;this.accountService = accountService;this.toast = toast;this.cdr = cdr;SecretaryAccountTransactionDetailsPageComponent.prototype.__init.call(this);SecretaryAccountTransactionDetailsPageComponent.prototype.__init2.call(this);SecretaryAccountTransactionDetailsPageComponent.prototype.__init3.call(this);SecretaryAccountTransactionDetailsPageComponent.prototype.__init4.call(this);}
  ngOnInit() { const id = Number(this.route.snapshot.paramMap.get("id")); if (Number.isInteger(id) && id > 0) this.loadDetails(id); else this.toast.error("شناسه تراکنش معتبر نیست."); }
  async issueReceipt(id, action) {
    if (this.receiptLoading) return;
    this.receiptLoading = true;
    this.cdr.markForCheck();
    try {
      const response = await firstValueFrom(this.accountService.getTransactionReceipt(id));
      await handleTransactionReceipt(response, id, action);
    } catch (error) {
      if (error instanceof Error && error.message === "POPUP_BLOCKED") this.toast.error("مرورگر اجازه باز کردن پیش‌نمایش را نداد.");
      else if (error instanceof HttpErrorResponse) {
        const messages = { 400: "شناسه تراکنش معتبر نیست.", 401: "برای دریافت رسید دوباره وارد حساب کاربری شوید.", 404: "تراکنش موردنظر پیدا نشد." };
        this.toast.error(messages[error.status] || SECRETARY_ACCOUNT_ERROR_MESSAGE);
      } else this.toast.error("دریافت رسید تراکنش ناموفق بود.");
    } finally {
      this.receiptLoading = false;
      this.cdr.markForCheck();
    }
  }
   loadDetails(id) { this.isLoadingDetails = true; this.accountService.getTransaction(id).pipe(finalize(() => { this.isLoadingDetails = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (response) => { this.transaction = response.data; }, error: (error) => { const message = typeof _optionalChain([error, 'access', _ => _.error, 'optionalAccess', _2 => _2.message]) === "string" ? error.error.message : SECRETARY_ACCOUNT_ERROR_MESSAGE; this.toast.error(message); } }); }
}
