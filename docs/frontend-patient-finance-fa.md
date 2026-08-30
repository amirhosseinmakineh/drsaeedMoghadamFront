# سند کامل اتصال Frontend به ماژول مالی بیماران

این سند قرارداد فعلی Backend و راهنمای پیاده‌سازی رابط کاربری بخش حسابداری بیمار برای منشی است. هدف این است که Frontend بدون حدس‌زدن درباره وضعیت‌ها، محاسبات مالی یا گردش چک و سفته بتواند Feature را پیاده‌سازی کند.

> **Base URL:** تمام Routeها با `/api/secretary` شروع می‌شوند و به JWT معتبر نیاز دارند. شناسه منشی از Token خوانده می‌شود؛ آن را در Body نفرستید.

---

## 1. مفاهیم اصلی

هر بیمار برای هر خدمت می‌تواند یک یا چند **پرونده مالی مستقل** داشته باشد. تمام چک‌ها، سفته‌ها، بدهی‌ها و پرداخت‌های یک درمان زیر همان پرونده قرار می‌گیرند.

```text
Patient
└── Financial Case (Service + TotalAmount)
    ├── Cheques
    ├── Promissory Notes
    ├── Debts
    └── Confirmed Payment Transactions
```

- ثبت چک یا سفته **پرداخت محسوب نمی‌شود**.
- مبلغ فقط بعد از تغییر وضعیت چک/سفته به `Paid` یا تسویه Debt وارد `totalPaidAmount` می‌شود.
- `remainingAmount` و Summaryها را Frontend محاسبه نکند؛ مقدار Backend مرجع نهایی است.
- رکوردهای مالی حذف فیزیکی نمی‌شوند. حذف پرونده در UI به معنی Cancel کردن آن است.
- مبالغ JSON از نوع number هستند، ولی در UI با روش امن نمایش داده شوند و از محاسبات float به عنوان مقدار نهایی استفاده نشود.

---

## 2. Enumها

| Enum | مقادیر |
|---|---|
| `PatientFinancialAgreementType` | `PrePayment=1`, `Deposit=2` |
| `PatientFinancialCaseStatus` | `Active=1`, `Completed=2`, `Cancelled=3` |
| `PatientChequeStatus` | `Pending=1`, `Paid=2`, `Unpaid=3`, `Cancelled=4` |
| `PatientPromissoryNoteStatus` | `Pending=1`, `Paid=2`, `Unpaid=3`, `Cancelled=4` |
| `PatientDebtStatus` | `Unpaid=1`, `Paid=2`, `Cancelled=3` |
| نوع منبع | `Cheque=1`, `PromissoryNote=2` |
| نوع تراکنش | `Payment=1` |

خدمات فعلی: `Composite=1` (کامپوزیت)، `Implant=2` (ایمپلنت)، `Laminate=3` (لمینت).

در توافق `PrePayment` وجود حداقل یک چک یا سفته هنگام ساخت پرونده الزامی است؛ `Deposit` بدون تعهد اولیه نیز مجاز است.

---

## 3. قرارداد عمومی HTTP

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

```ts
export interface ApiResult<T> {
  data: T | null;
  isSuccess: boolean;
  message: string;
}

export interface IdResponse { id: number; }

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
```

خطای Business معمولاً HTTP 400 با پیام فارسی است و 401 نشانه Token نامعتبر یا منقضی است. `page` حداقل 1 و `pageSize` بین 1 و 100 است. تاریخ‌ها باید ISO-8601 باشند. پارامترهای خالی را در URL قرار ندهید.

---

## 4. ساخت پرونده و فرم داینامیک تعهدات

فرم باید دو `FormArray` مستقل برای چک و سفته و دو دکمه «چک بعدی» و «سفته بعدی» داشته باشد. تعداد Rowها محدود نیست و هر Card پیش از Submit باید قابلیت حذف از فرم داشته باشد. Cardها شماره‌گذاری شوند و هنگام درخواست کل فرم Disable شود.

```ts
financialCaseForm = this.fb.group({
  patientId: this.fb.control<number | null>(null, Validators.required),
  serviceId: this.fb.control<number | null>(null, Validators.required),
  totalAmount: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
  agreementType: this.fb.control<1 | 2>(2, Validators.required),
  cheques: this.fb.array<FormGroup>([]),
  promissoryNotes: this.fb.array<FormGroup>([]),
}, { validators: prePaymentCommitmentValidator });

function prePaymentCommitmentValidator(control: AbstractControl): ValidationErrors | null {
  const agreementType = control.get('agreementType')?.value;
  const chequeCount = (control.get('cheques') as FormArray)?.length ?? 0;
  const noteCount = (control.get('promissoryNotes') as FormArray)?.length ?? 0;
  return agreementType === 1 && chequeCount + noteCount === 0
    ? { prePaymentRequiresCommitment: true }
    : null;
}
```

برای `PrePayment=1` حداقل یک تعهد الزامی است؛ با تغییر نوع توافق Validator فوراً به‌روزرسانی شود. مجموع چک و سفته را با عنوان «مجموع تعهدات ثبت‌شده»، نه پرداخت، نمایش دهید.

### ایجاد پرونده

```http
POST /api/secretary/patient-financial-cases
```

```json
{
  "patientId": 125,
  "serviceId": 1,
  "totalAmount": 150000000,
  "agreementType": 1,
  "cheques": [{
    "amount": 30000000,
    "sayadNumber": "1234567890123456",
    "ownerName": "علی رضایی",
    "dueDate": "2026-09-23T00:00:00Z"
  }],
  "promissoryNotes": [{
    "serialNumber": "PN-10020",
    "amount": 25000000,
    "dueDate": "2026-11-23T00:00:00Z"
  }]
}
```

پاسخ موفق `ApiResult<IdResponse>` است. سپس فرم Reset و کاربر به `/patient-financial-cases/{id}` هدایت شود.

---

## 5. CRUD پرونده مالی

### لیست

```http
GET /api/secretary/patient-financial-cases
```

Filters: `search`, `patientId`, `serviceId`, `agreementType`, `status`, `fromDate`, `toDate`, `page`, `pageSize`.

```ts
interface PatientFinancialCase {
  id: number;
  patientId: number;
  patientName: string;
  patientPhoneNumber: string | null;
  serviceId: number;
  serviceName: string;
  totalAmount: number;
  totalPaidAmount: number;
  remainingAmount: number;
  totalDebtAmount: number;
  agreementType: 1 | 2;
  status: 1 | 2 | 3;
  createdAt: string;
}
```

### جزئیات، ویرایش و لغو

```http
GET /api/secretary/patient-financial-cases/{caseId}
PUT /api/secretary/patient-financial-cases/{caseId}
DELETE /api/secretary/patient-financial-cases/{caseId}
```

جزئیات شامل `case`، `chequeCount`، `chequeAmount`، `promissoryNoteCount` و `promissoryNoteAmount` است. Body ویرایش شامل `totalAmount` و `agreementType` است. فقط پرونده Active قابل ویرایش/لغو است و مبلغ کل جدید نباید از پرداخت قطعی کمتر باشد. DELETE حذف فیزیکی نیست و وضعیت را Cancelled می‌کند؛ Confirmation نمایش دهید.

---

## 6. افزودن تعهد پس از ساخت

```http
POST /api/secretary/patient-financial-cases/{caseId}/cheques
POST /api/secretary/patient-financial-cases/{caseId}/promissory-notes
```

Body چک شامل `amount`, `sayadNumber`, `ownerName`, `dueDate` و Body سفته شامل `serialNumber`, `amount`, `dueDate` است. برای ارسال چند Row از `concatMap` استفاده کنید، نتیجه هر Row را مستقل نشان دهید، فقط Row موفق را حذف کنید و در پایان Child list و Summary را Refresh کنید.

---

## 7. چک‌ها و سفته‌ها

```http
GET /api/secretary/patient-cheques
PUT /api/secretary/patient-cheques/{chequeId}/status
GET /api/secretary/patient-promissory-notes
PUT /api/secretary/patient-promissory-notes/{promissoryNoteId}/status
```

Filters هر دو لیست: `patientFinancialCaseId`, `patientId`, `search`, `status`, `fromDueDate`, `toDueDate`, `page`, `pageSize`.

```ts
interface PatientCheque {
  id: number; patientFinancialCaseId: number; patientId: number;
  patientName: string; amount: number; sayadNumber: string;
  ownerName: string; dueDate: string; status: 1 | 2 | 3 | 4;
}

interface PatientPromissoryNote {
  id: number; patientFinancialCaseId: number; patientId: number;
  patientName: string; serialNumber: string; amount: number;
  dueDate: string; status: 1 | 2 | 3 | 4;
}
```

فقط برای Pending اکشن‌های `Paid=2`، `Unpaid=3` و `Cancelled=4` نمایش داده شوند. Paid تراکنش پرداخت، Unpaid بدهی و Cancelled هیچ پرداختی ایجاد نمی‌کند. Paid/Unpaid نیازمند Confirmation است. Transition دوباره مجاز نیست و پس از موفقیت Row و Summary از Backend Reload شوند.

---

## 8. بدهی‌ها و تسویه

```http
GET /api/secretary/patient-debts
POST /api/secretary/patient-debts/{debtId}/pay
```

Filters: `patientId`, `patientFinancialCaseId`, `sourceType`, `status`, `year`, `month`, `fromDueDate`, `toDueDate`, `search`, `page`, `pageSize`. سال و ماه شمسی همیشه باید با هم ارسال شوند.

```ts
interface PatientDebt {
  id: number; patientId: number; patientName: string;
  patientPhoneNumber: string | null; patientFinancialCaseId: number;
  serviceName: string; amount: number; sourceType: 1 | 2;
  sourceId: number; dueDate: string; status: 1 | 2 | 3;
}
```

Pay بدون Body است و فقط برای Unpaid فعال می‌شود. عملیات، تراکنش می‌سازد و Source اصلی را Paid می‌کند. دکمه تا پایان درخواست Disable شود.

---

## 9. تراکنش‌های پرداخت

```http
GET /api/secretary/patient-financial-transactions
```

Filters: `patientId`, `patientFinancialCaseId`, `sourceType`, `fromDate`, `toDate`, `page`, `pageSize`.

```ts
interface PatientFinancialTransaction {
  id: number; patientFinancialCaseId: number; patientId: number;
  amount: number; type: 1; sourceType: 1 | 2;
  sourceId: number; createdAt: string;
}
```

تراکنش‌ها History قطعی‌اند و Edit/Delete ندارند.

---

## 10. Summary پرونده و بیمار

```http
GET /api/secretary/patient-financial-cases/{caseId}/summary
GET /api/secretary/patients/{patientId}/financial-summary
```

```ts
interface PatientFinancialCaseSummary {
  totalAmount: number; totalPaidAmount: number; remainingAmount: number;
  totalChequeAmount: number; paidChequeAmount: number;
  pendingChequeAmount: number; unpaidChequeAmount: number;
  totalPromissoryNoteAmount: number; paidPromissoryNoteAmount: number;
  pendingPromissoryNoteAmount: number; unpaidPromissoryNoteAmount: number;
  totalDebtAmount: number;
}

interface PatientFinancialSummary {
  patientId: number; totalTreatmentAmount: number; totalPaidAmount: number;
  remainingAmount: number; totalDebtAmount: number;
  activeFinancialCasesCount: number; unpaidChequesCount: number;
  unpaidPromissoryNotesCount: number;
}
```

کارت‌ها باید مبلغ کل، پرداخت قطعی، مانده، بدهی باز و جمع Pending/Paid/Unpaid چک و سفته را از پاسخ Backend نمایش دهند.

---

## 11. تعهدات نزدیک سررسید

```http
GET /api/secretary/patient-financial-commitments/due
```

Filters: `fromDate`, `toDate`, `type`, `patientId`, `page`, `pageSize`. بدون تاریخ، بازه امروز تا هفت روز آینده بازگردانده می‌شود. فقط Pendingها نمایش داده می‌شوند؛ `type=1` چک و `type=2` سفته است.

```ts
interface PatientFinancialCommitment {
  id: number; type: 1 | 2; patientFinancialCaseId: number;
  patientId: number; patientName: string; amount: number;
  dueDate: string; status: number;
}
```

Tabهای پیشنهادی: «امروز»، «فردا»، «این هفته» و «بازه دلخواه» همراه Filter نوع تعهد.

---

## 12. ساختار پیشنهادی Frontend

```text
patient-finance/
├── models/
├── services/patient-finance-api.service.ts
├── pages/
│   ├── financial-case-list/
│   ├── financial-case-create/
│   ├── financial-case-details/
│   ├── cheque-list/
│   ├── promissory-note-list/
│   ├── debt-list/
│   ├── transaction-list/
│   └── due-commitments/
└── components/
    ├── dynamic-cheques-form/
    ├── dynamic-promissory-notes-form/
    ├── financial-summary-cards/
    └── commitment-status-actions/
```

Service مرکزی باید تمام URLها را از `${environment.apiUrl}/api/secretary` بسازد و پاسخ‌های Write را با `ApiResult<IdResponse>` type کند.

---

## 13. Error و Refresh داده‌ها

پیام Business Backend را مستقیم در Toast/Dialog نشان دهید. خطاهای متداول شامل بیمار/خدمت نامعتبر، نبود تعهد PrePayment، پرونده غیر Active، تعیین قبلی وضعیت، بدهی تکراری، پرداخت قبلی، پرداخت بیش از مبلغ کل و مبلغ کل کمتر از پرداخت قطعی است.

| Mutation | داده‌های نیازمند Refresh |
|---|---|
| Create/Update/Cancel Case | Case list، Details، Patient Summary |
| Add Cheque/Note | Child list، Case Details، Case Summary |
| Paid/Unpaid/Cancelled | Child list، Case Summary، Patient Summary، Debt/Transaction list |
| Pay Debt | Debt list، Source list، Transactions، Case Summary، Patient Summary |

---

## 14. Acceptance Checklist فرانت

- [ ] JWT در تمام Requestها ارسال می‌شود و `secretaryUserId` از Client ارسال نمی‌شود.
- [ ] فرم ساخت دارای دو FormArray مستقل چک و سفته و دکمه‌های افزودن هم‌زمان است.
- [ ] تعداد نامحدود Row قابل افزودن و هر Row پیش از Submit قابل حذف است.
- [ ] PrePayment بدون تعهد Submit نمی‌شود؛ Deposit بدون تعهد مجاز است.
- [ ] شماره صیاد، صاحب چک، سریال سفته، مبلغ مثبت و DueDate Validate می‌شوند.
- [ ] تاریخ‌ها ISO ارسال و تاریخ شمسی فقط در Presentation استفاده می‌شود.
- [ ] ثبت چک/سفته به عنوان پرداخت نمایش داده نمی‌شود.
- [ ] Action وضعیت فقط برای Pending فعال است و Confirmation دارد.
- [ ] دکمه‌های Mutation هنگام Request Disable هستند.
- [ ] Paid، Remaining و Debt از Backend خوانده می‌شوند.
- [ ] تمام Listها Paging و Filterهای تعریف‌شده را دارند.
- [ ] Year و Month شمسی بدهی همیشه با هم ارسال می‌شوند.
- [ ] بعد از Mutation، Summary و Listهای مرتبط Reload می‌شوند.
- [ ] تراکنش قطعی Edit/Delete ندارد.
- [ ] Cancel Case لغو وضعیت است، نه حذف سابقه مالی.
