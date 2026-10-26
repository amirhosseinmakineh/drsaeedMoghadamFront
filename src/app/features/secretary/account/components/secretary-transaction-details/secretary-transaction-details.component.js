import { ChangeDetectionStrategy, EventEmitter, } from "@angular/core";
import { BaseButtonComponent } from "../../../../../basemadual/actions/base-button/base-button.component";
import { PersianDatePipe } from "../../../../../basemadual/date/persian-date.pipe";
import { BaseBadgeComponent } from "../../../../../basemadual/feedback/badge/badge.component";
import { BaseSkeletonComponent } from "../../../../../basemadual/feedback/skeleton/skeleton.component";
import { FinancialTransactionType } from "../../enums/financial-transaction-type.enum";

@Component({
  selector: "app-secretary-transaction-details",
  standalone: true,
  imports: [BaseBadgeComponent, BaseButtonComponent, BaseSkeletonComponent, PersianDatePipe],
  templateUrl: "./secretary-transaction-details.component.html",
  styleUrl: "./secretary-transaction-details.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryTransactionDetailsComponent {constructor() { SecretaryTransactionDetailsComponent.prototype.__init.call(this);SecretaryTransactionDetailsComponent.prototype.__init2.call(this);SecretaryTransactionDetailsComponent.prototype.__init3.call(this);SecretaryTransactionDetailsComponent.prototype.__init4.call(this);SecretaryTransactionDetailsComponent.prototype.__init5.call(this);SecretaryTransactionDetailsComponent.prototype.__init6.call(this);SecretaryTransactionDetailsComponent.prototype.__init7.call(this);SecretaryTransactionDetailsComponent.prototype.__init8.call(this);SecretaryTransactionDetailsComponent.prototype.__init9.call(this);SecretaryTransactionDetailsComponent.prototype.__init10.call(this); }
  Input()
  __init() {this.transaction = null}
  Input()
  __init2() {this.loading = false}
  Input()
  __init3() {this.receiptLoading = false}
  Output()
  __init4() {this.receiptPreviewRequested = new EventEmitter()}
  Output()
  __init5() {this.receiptShareRequested = new EventEmitter()}
  Output()
  __init6() {this.receiptDownloadRequested = new EventEmitter()}
  Output()
  __init7() {this.editRequested = new EventEmitter()}
  Output()
  __init8() {this.deleteRequested = new EventEmitter()}
   __init9() {this.incomeType = FinancialTransactionType.Income}
   __init10() {this.money = new Intl.NumberFormat("fa-IR")}
}
