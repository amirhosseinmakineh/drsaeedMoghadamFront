import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from "@angular/core";
import {
  BaseFilterBarComponent,
  BaseSearchFilterComponent,
  BaseSelectFilterComponent,
  PersianDatePickerComponent,
} from "../../../../../basemadual/index";
import { TRANSACTION_TYPE_OPTIONS } from "../../constants/secretary-account.constants";
import { SecretaryExpenseCategoryDto, SecretaryTransactionFilters } from "../../models/secretary-account.models";
@Component({
  selector: "app-secretary-transaction-filters",
  standalone: true,
  imports: [BaseFilterBarComponent, BaseSearchFilterComponent, BaseSelectFilterComponent, PersianDatePickerComponent],
  templateUrl: "./secretary-transaction-filters.component.html",
  styleUrl: "./secretary-transaction-filters.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryTransactionFiltersComponent {
  @Input()
  categories: SecretaryExpenseCategoryDto[] = [];
  @Output()
  filtersChanged = new EventEmitter<SecretaryTransactionFilters>();
  readonly typeOptions = TRANSACTION_TYPE_OPTIONS;
  search = "";
  type: number | null = null;
  categoryId: number | null = null;
  fromDate: Date | null = null;
  toDate: Date | null = null;
  get categoryOptions() {
    return this.categories.map(({ id, title }) => ({ value: id, label: title }));
  }
  setSearch(value: string): void {
    this.search = value;
    this.apply();
  }
  setType(value: string): void {
    this.type = value ? Number(value) : null;
  }
  setCategory(value: string): void {
    this.categoryId = value ? Number(value) : null;
  }
  clear(): void {
    this.search = "";
    this.type = null;
    this.categoryId = null;
    this.fromDate = null;
    this.toDate = null;
    this.apply();
  }
  apply(): void {
    this.filtersChanged.emit({
      type: this.type ?? undefined,
      expenseCategoryId: this.categoryId ?? undefined,
      search: this.search.trim() || undefined,
      fromDate: this.apiDate(this.fromDate),
      toDate: this.apiDate(this.toDate),
    });
  }
  private apiDate(value: Date | null): string | undefined {
    if (!value)
      return undefined;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
