 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }import { ChangeDetectionStrategy, EventEmitter, } from "@angular/core";
import { PersianDatePickerComponent } from "../../../../../basemadual/forms/persian-date-picker/persian-date-picker.component";
import { BaseFilterBarComponent } from "../../../../../basemadual/filters/filter-bar/filter-bar.component";
import { BaseSearchFilterComponent } from "../../../../../basemadual/filters/search-filter/search-filter.component";
import { BaseSelectFilterComponent } from "../../../../../basemadual/filters/select-filter/select-filter.component";
import { TRANSACTION_TYPE_OPTIONS } from "../../constants/secretary-account.constants";

@Component({
  selector: "app-secretary-transaction-filters",
  standalone: true,
  imports: [BaseFilterBarComponent, BaseSearchFilterComponent, BaseSelectFilterComponent, PersianDatePickerComponent],
  templateUrl: "./secretary-transaction-filters.component.html",
  styleUrl: "./secretary-transaction-filters.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryTransactionFiltersComponent {constructor() { SecretaryTransactionFiltersComponent.prototype.__init.call(this);SecretaryTransactionFiltersComponent.prototype.__init2.call(this);SecretaryTransactionFiltersComponent.prototype.__init3.call(this);SecretaryTransactionFiltersComponent.prototype.__init4.call(this);SecretaryTransactionFiltersComponent.prototype.__init5.call(this);SecretaryTransactionFiltersComponent.prototype.__init6.call(this);SecretaryTransactionFiltersComponent.prototype.__init7.call(this);SecretaryTransactionFiltersComponent.prototype.__init8.call(this); }
  Input()
  __init() {this.categories = []}
  Output()
  __init2() {this.filtersChanged = new EventEmitter()}
   __init3() {this.typeOptions = TRANSACTION_TYPE_OPTIONS}
  __init4() {this.search = ""}
  __init5() {this.type = null}
  __init6() {this.categoryId = null}
  __init7() {this.fromDate = null}
  __init8() {this.toDate = null}
  get categoryOptions() {
    return this.categories.map(({ id, title }) => ({ value: id, label: title }));
  }
  setSearch(value) {
    this.search = value;
    this.apply();
  }
  setType(value) {
    this.type = value ? Number(value) : null;
  }
  setCategory(value) {
    this.categoryId = value ? Number(value) : null;
  }
  clear() {
    this.search = "";
    this.type = null;
    this.categoryId = null;
    this.fromDate = null;
    this.toDate = null;
    this.apply();
  }
  apply() {
    this.filtersChanged.emit({
      type: _nullishCoalesce(this.type, () => ( undefined)),
      expenseCategoryId: _nullishCoalesce(this.categoryId, () => ( undefined)),
      search: this.search.trim() || undefined,
      fromDate: this.apiDate(this.fromDate),
      toDate: this.apiDate(this.toDate),
    });
  }
   apiDate(value) {
    if (!value)
      return undefined;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
