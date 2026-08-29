import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { PAYMENT_METHOD_OPTIONS, TRANSACTION_TYPE_OPTIONS } from "../../constants/secretary-account.constants";
import { FinancialTransactionType } from "../../enums/financial-transaction-type.enum";
import { PaymentMethod } from "../../enums/payment-method.enum";
import { normalizeSecretaryTransaction } from "../../mappers/secretary-account.mapper";
import { CreateSecretaryFinancialTransactionRequest, SecretaryExpenseCategoryDto } from "../../models/secretary-account.models";

@Component({ selector: "app-secretary-transaction-form", standalone: true, imports: [ReactiveFormsModule], templateUrl: "./secretary-transaction-form.component.html", styleUrl: "./secretary-transaction-form.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretaryTransactionFormComponent implements OnInit {
  @Input() categories: SecretaryExpenseCategoryDto[] = [];
  @Input() isSubmitting = false;
  @Output() transactionSubmitted = new EventEmitter<CreateSecretaryFinancialTransactionRequest>();
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly transactionTypes = TRANSACTION_TYPE_OPTIONS;
  readonly paymentMethods = PAYMENT_METHOD_OPTIONS;
  readonly expenseType = FinancialTransactionType.Expense;
  readonly form = this.formBuilder.group({
    type: this.formBuilder.control<FinancialTransactionType | null>(null, Validators.required),
    amount: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(1)]),
    transactionDate: this.formBuilder.control("", Validators.required),
    subject: this.formBuilder.control<string | null>(null, Validators.maxLength(200)),
    counterpartyName: this.formBuilder.control<string | null>(null, Validators.maxLength(200)),
    paymentMethod: this.formBuilder.control<PaymentMethod | null>(null, Validators.required),
    trackingNumber: this.formBuilder.control<string | null>(null, Validators.maxLength(100)),
    description: this.formBuilder.control<string | null>(null, Validators.maxLength(1000)),
    receiptUrl: this.formBuilder.control<string | null>(null, Validators.maxLength(500)),
    expenseCategoryId: this.formBuilder.control<number | null>({ value: null, disabled: true }),
  });

  ngOnInit(): void { this.form.controls.type.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((type) => this.updateCategoryControl(type)); }
  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    if (
      value.type === null ||
      value.amount === null ||
      value.paymentMethod === null ||
      value.transactionDate === null
    ) {
      return;
    }
    const request = normalizeSecretaryTransaction({
      ...value,
      type: value.type,
      amount: value.amount,
      transactionDate: value.transactionDate,
      paymentMethod: value.paymentMethod,
      expenseCategoryId:
        value.type === FinancialTransactionType.Expense
          ? value.expenseCategoryId
          : null,
    });
    this.transactionSubmitted.emit(request);
  }
  reset(): void { this.form.reset(); this.updateCategoryControl(null); }
  showError(name: keyof typeof this.form.controls, error: string): boolean {
    const control = this.form.controls[name];
    return Boolean(control.hasError(error) && (control.touched || control.dirty));
  }
  private updateCategoryControl(type: FinancialTransactionType | null): void {
    const control = this.form.controls.expenseCategoryId;
    if (type === FinancialTransactionType.Expense) { control.enable({ emitEvent: false }); control.setValidators(Validators.required); }
    else { control.clearValidators(); control.setValue(null, { emitEvent: false }); control.disable({ emitEvent: false }); }
    control.updateValueAndValidity({ emitEvent: false });
  }
}
