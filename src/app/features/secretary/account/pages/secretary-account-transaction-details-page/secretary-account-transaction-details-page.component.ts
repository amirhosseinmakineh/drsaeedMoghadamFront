import { HttpErrorResponse } from "@angular/common/http";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { BaseCardComponent } from "../../../../../basemadual/cards/base-card/base-card.component";
import { BasePageShellComponent } from "../../../../../basemadual/layout/page-shell/page-shell.component";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ToastService } from "../../../../../core/toast/toast.service";
import { SecretaryTransactionDetailsComponent } from "../../components/secretary-transaction-details/secretary-transaction-details.component";
import { SECRETARY_ACCOUNT_ERROR_MESSAGE } from "../../constants/secretary-account.constants";
import { SecretaryFinancialTransactionDto } from "../../models/secretary-account.models";
import { SecretaryAccountService } from "../../services/secretary-account.service";

@Component({ selector: "app-secretary-account-transaction-details-page", standalone: true, imports: [RouterLink, BaseCardComponent, BasePageShellComponent, SecretaryTransactionDetailsComponent], templateUrl: "./secretary-account-transaction-details-page.component.html", styleUrl: "./secretary-account-transaction-details-page.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretaryAccountTransactionDetailsPageComponent implements OnInit {
  transaction: SecretaryFinancialTransactionDto | null = null;
  isLoadingDetails = false;
  private readonly destroyRef = inject(DestroyRef);
  constructor(private readonly route: ActivatedRoute, private readonly accountService: SecretaryAccountService, private readonly toast: ToastService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { const id = Number(this.route.snapshot.paramMap.get("id")); if (Number.isInteger(id) && id > 0) this.loadDetails(id); else this.toast.error("شناسه تراکنش معتبر نیست."); }
  private loadDetails(id: number): void { this.isLoadingDetails = true; this.accountService.getTransaction(id).pipe(finalize(() => { this.isLoadingDetails = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (response) => { this.transaction = response.data; }, error: (error: HttpErrorResponse) => { const message = typeof error.error?.message === "string" ? error.error.message : SECRETARY_ACCOUNT_ERROR_MESSAGE; this.toast.error(message); } }); }
}
