import { ChangeDetectionStrategy, DestroyRef, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SecretaryAccountShellComponent } from "../../../account/components/secretary-account-shell/secretary-account-shell.component";
import { formatIranDateTime } from "../../../../../utils/iran-datetime.util";
import { SecretarySaleStatus, saleStatusLabel, toman } from "../../models/secretary-sales.models";


@Component({ selector: "app-secretary-sales", standalone: true, imports: [FormsModule, RouterLink, SecretaryAccountShellComponent], templateUrl: "./secretary-sales.component.html", styleUrls: ["../secretary-sales.shared.scss"], changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretarySalesComponent  {
   __init() {this.statuses = SecretarySaleStatus}
   __init2() {this.statusLabel = saleStatusLabel}
   __init3() {this.toman = toman}
   __init4() {this.date = formatIranDateTime}
  __init5() {this.items = []}
  __init6() {this.services = []}
  __init7() {this.search = ""}
  
  
  __init8() {this.fromDate = ""}
  __init9() {this.toDate = ""}
  __init10() {this.page = 1}
  __init11() {this.totalPages = 1}
  __init12() {this.loading = false}
    __init13() {this.destroyRef = inject(DestroyRef)}
  constructor(  api,   cdr) {;this.api = api;this.cdr = cdr;SecretarySalesComponent.prototype.__init.call(this);SecretarySalesComponent.prototype.__init2.call(this);SecretarySalesComponent.prototype.__init3.call(this);SecretarySalesComponent.prototype.__init4.call(this);SecretarySalesComponent.prototype.__init5.call(this);SecretarySalesComponent.prototype.__init6.call(this);SecretarySalesComponent.prototype.__init7.call(this);SecretarySalesComponent.prototype.__init8.call(this);SecretarySalesComponent.prototype.__init9.call(this);SecretarySalesComponent.prototype.__init10.call(this);SecretarySalesComponent.prototype.__init11.call(this);SecretarySalesComponent.prototype.__init12.call(this);SecretarySalesComponent.prototype.__init13.call(this);}
  ngOnInit() { this.api.activeServices().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((items) => { this.services = items; this.cdr.markForCheck(); }); this.load(); }
  apply() { this.page = 1; this.load(); }
  changePage(page) { if (page < 1 || page > this.totalPages || page === this.page) return; this.page = page; this.load(); }
  load() {
    this.loading = true;
    this.api.mySales({ search: this.search, status: this.status, serviceId: this.serviceId, fromDate: this.fromDate, toDate: this.toDate, page: this.page, pageSize: 10 }).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({ next: (result) => { this.items = result.items; this.totalPages = Math.max(result.totalPages, 1); }, error: () => { this.items = []; } });
  }
}
