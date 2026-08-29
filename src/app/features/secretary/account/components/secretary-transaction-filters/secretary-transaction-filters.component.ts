import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { debounceTime } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { SEARCH_DEBOUNCE_TIME, TRANSACTION_TYPE_OPTIONS } from "../../constants/secretary-account.constants";
import { SecretaryExpenseCategoryDto, SecretaryTransactionFilters } from "../../models/secretary-account.models";

@Component({ selector: "app-secretary-transaction-filters", standalone: true, imports: [ReactiveFormsModule], templateUrl: "./secretary-transaction-filters.component.html", styleUrl: "./secretary-transaction-filters.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretaryTransactionFiltersComponent implements OnInit {
  @Input() categories: SecretaryExpenseCategoryDto[] = [];
  @Output() filtersChanged = new EventEmitter<SecretaryTransactionFilters>();
  private readonly formBuilder = inject(FormBuilder);
  readonly typeOptions = TRANSACTION_TYPE_OPTIONS;
  readonly form = this.formBuilder.group({ type: this.formBuilder.control<number | null>(null), fromDate: this.formBuilder.control(""), toDate: this.formBuilder.control(""), expenseCategoryId: this.formBuilder.control<number | null>(null), search: this.formBuilder.control("") });
  private readonly destroyRef = inject(DestroyRef);
  ngOnInit(): void { this.form.valueChanges.pipe(debounceTime(SEARCH_DEBOUNCE_TIME), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.emitFilters()); }
  clear(): void { this.form.reset({ type: null, fromDate: "", toDate: "", expenseCategoryId: null, search: "" }); }
  private emitFilters(): void {
    const value = this.form.getRawValue();
    this.filtersChanged.emit({ type: value.type ?? undefined, fromDate: value.fromDate || undefined, toDate: value.toDate || undefined, expenseCategoryId: value.expenseCategoryId ?? undefined, search: value.search?.trim() || undefined });
  }
}
