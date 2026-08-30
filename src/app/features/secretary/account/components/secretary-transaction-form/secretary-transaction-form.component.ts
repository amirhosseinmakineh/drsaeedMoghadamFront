import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BaseButtonComponent } from "../../../../../basemadual/actions/base-button/base-button.component";
import { BaseSegmentedControlComponent } from "../../../../../basemadual/actions/segmented-control/segmented-control.component";
import { BaseFormErrorComponent } from "../../../../../basemadual/forms/form-error/form-error.component";
import { BaseNumberInputComponent } from "../../../../../basemadual/forms/number-input/number-input.component";
import { PersianDatePickerComponent } from "../../../../../basemadual/forms/persian-date-picker/persian-date-picker.component";
import { BaseSelectInputComponent } from "../../../../../basemadual/forms/select-input/select-input.component";
import { BaseTextInputComponent } from "../../../../../basemadual/forms/text-input/text-input.component";
import { BaseTextareaInputComponent } from "../../../../../basemadual/forms/textarea-input/textarea-input.component";
import { PAYMENT_METHOD_OPTIONS, TRANSACTION_TYPE_OPTIONS } from "../../constants/secretary-account.constants";
import { FinancialTransactionType } from "../../enums/financial-transaction-type.enum";
import { PaymentMethod } from "../../enums/payment-method.enum";
import { normalizeSecretaryTransaction } from "../../mappers/secretary-account.mapper";
import {
  CreateSecretaryFinancialTransactionRequest,
  SecretaryExpenseCategoryDto,
} from "../../models/secretary-account.models";
@Component({
  selector: "app-secretary-transaction-form",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BaseButtonComponent,
    BaseFormErrorComponent,
    BaseNumberInputComponent,
    BaseSegmentedControlComponent,
    BaseSelectInputComponent,
    BaseTextInputComponent,
    BaseTextareaInputComponent,
    PersianDatePickerComponent,
  ],
  templateUrl: "./secretary-transaction-form.component.html",
  styleUrl: "./secretary-transaction-form.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SecretaryTransactionFormComponent implements OnInit {
  @Input()
  categories: SecretaryExpenseCategoryDto[] = [];
  @Input()
  isSubmitting = false;
  @Output()
  transactionSubmitted = new EventEmitter<CreateSecretaryFinancialTransactionRequest>();
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly transactionTypes = TRANSACTION_TYPE_OPTIONS;
  readonly paymentMethods = PAYMENT_METHOD_OPTIONS;
  readonly expenseType = FinancialTransactionType.Expense;
  readonly form = this.formBuilder.group({
    type: this.formBuilder.control<FinancialTransactionType | null>(null, Validators.required),
    amount: this.formBuilder.control<number | null>(null, [Validators.required, Validators.min(1)]),
    transactionDate: this.formBuilder.control<Date | null>(new Date(), Validators.required),
    subject: this.formBuilder.control<string | null>(null, Validators.maxLength(200)),
    counterpartyName: this.formBuilder.control<string | null>(null, Validators.maxLength(200)),
    paymentMethod: this.formBuilder.control<PaymentMethod | null>(null, Validators.required),
    trackingNumber: this.formBuilder.control<string | null>(null, Validators.maxLength(100)),
    description: this.formBuilder.control<string | null>(null, Validators.maxLength(1000)),
    receiptUrl: this.formBuilder.control<string | null>(null, Validators.maxLength(500)),
    expenseCategoryId: this.formBuilder.control<number | null>({ value: null, disabled: true }),
  });
  ngOnInit(): void {
    this.form.controls.type.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => this.updateCategoryControl(type));
  }
  get categoryOptions() {
    return this.categories.map(({ id, title }) => ({ value: id, label: title }));
  }
  setControl(
    name: keyof typeof this.form.controls,
    value: string | number | Date | null,
  ): void {
    this.form.controls[name].setValue(value as never);
    this.form.controls[name].markAsDirty();
  }
  error(name: keyof typeof this.form.controls): string {
    const control = this.form.controls[name];
    if (!(control.touched || control.dirty))
      return "";
    if (control.hasError("required"))
      return "تکمیل این فیلد الزامی است.";
    if (control.hasError("min"))
      return "مبلغ باید بیشتر از صفر باشد.";
    if (control.hasError("maxlength"))
      return "مقدار واردشده بیش از حد مجاز است.";
    return "";
  }
  onSubmit(): void {
    if (this.form.invalid || this.isSubmitting) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (value.type === null || value.amount === null || value.paymentMethod === null || value.transactionDate === null)
      return;
    const request = normalizeSecretaryTransaction({
      ...value,
      type: value.type,
      amount: value.amount,
      transactionDate: this.apiDate(value.transactionDate),
      paymentMethod: value.paymentMethod,
      expenseCategoryId:
        value.type === FinancialTransactionType.Expense
          ? value.expenseCategoryId
          : null,
    });
    this.transactionSubmitted.emit(request);
  }
  reset(): void {
    this.form.reset({ transactionDate: new Date() });
    this.updateCategoryControl(null);
  }
  private updateCategoryControl(type: FinancialTransactionType | null): void {
    const control = this.form.controls.expenseCategoryId;
    if (type === FinancialTransactionType.Expense) {
      control.enable({ emitEvent: false });
      control.setValidators(Validators.required);
    }
    else {
      control.clearValidators();
      control.setValue(null, { emitEvent: false });
      control.disable({ emitEvent: false });
    }
    control.updateValueAndValidity({ emitEvent: false });
  }
  private apiDate(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
}
