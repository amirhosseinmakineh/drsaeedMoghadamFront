# سند تغییرات موردنیاز Backend برای جزئیات و ویرایش مالی بیمار

این سند قرارداد موردنیاز Frontend جدید بخش **حسابداری بیماران** را برای تیم Backend مشخص می‌کند. هدف تغییرات این است که منشی یا حسابدار با انتخاب «جزئیات»، تمام اطلاعات مالی بیمار و تمام چک‌ها و سفته‌های همان پرونده را در یک مودال مشاهده کند و فقط فیلدهای مجاز را تا قبل از تعیین وضعیت تعهد ویرایش کند.

> **Base URL فعلی Frontend:** `/api/secretary`
>
> تمام endpointها به JWT معتبر نیاز دارند. دسترسی باید برای نقش/Permission منشی و حسابدار مجاز باشد و Backend نباید صرفاً به مخفی‌بودن دکمه‌ها در Frontend اعتماد کند.

---

## ۱. قواعد قطعی کسب‌وکار

Backend باید قواعد زیر را در سطح سرویس/Domain اعمال کند:

1. پرونده بیمار، بیمار متصل به پرونده، شماره پرونده و خدمت از مودال جزئیات قابل ویرایش نیستند.
2. یک چک فقط وقتی `status = Pending (1)` است قابل ویرایش است.
3. در چک Pending فقط `amount` و `ownerName` قابل ویرایش‌اند.
4. `sayadNumber` و `dueDate` چک بعد از ایجاد **هرگز** از endpoint ویرایش تغییر نمی‌کنند.
5. یک سفته فقط وقتی `status = Pending (1)` است قابل ویرایش است.
6. در سفته Pending فقط `amount` قابل ویرایش است.
7. `serialNumber` و `dueDate` سفته بعد از ایجاد **هرگز** از endpoint ویرایش تغییر نمی‌کنند.
8. پس از `Paid`، `Unpaid` یا `Cancelled` شدن تعهد، هر درخواست ویرایش باید رد شود؛ حتی اگر درخواست مستقیماً خارج از Frontend ارسال شده باشد.
9. تعیین نتیجه چک/سفته (`Paid` یا `Unpaid`) فقط از ابتدای روز سررسید به بعد مجاز است. مقایسه تاریخ باید با timezone رسمی سامانه انجام شود.
10. لغو پرونده مالی فقط برای توافق `Deposit (2)` مجاز است.
11. پس از تأیید اولین پرداخت، پرونده دیگر قابل لغو نیست. معیار مطمئن، وجود تراکنش پرداخت قطعی یا `totalPaidAmount > 0` است؛ صرفاً به وضعیت ارسالی Client اعتماد نشود.
12. توافق `PrePayment (1)` در هیچ شرایطی از این جریان قابل لغو نیست.
13. همه تغییرات مبلغ، وضعیت و لغو باید transaction-safe و ترجیحاً دارای Audit Log شامل کاربر، زمان، مقدار قبلی و مقدار جدید باشند.

---

## ۲. اطلاعات هویتی بیمار در تمام DTOهای مالی

Frontend دیگر `patientId` یا شناسه پرونده مالی را به‌عنوان عنوان بیمار نمایش نمی‌دهد. تمام DTOهایی که در جدول‌های مالی استفاده می‌شوند باید حداقل این دو فیلد را برگردانند:

```json
{
  "patientName": "مریم احمدی",
  "patientFileNumber": "1405-1024"
}
```

`patientId` همچنان می‌تواند برای فیلتر و ارتباط داخلی در DTO وجود داشته باشد، اما `patientName` و `patientFileNumber` نباید `null` یا خالی باشند.

این الزام برای پاسخ endpointهای زیر برقرار است:

- `GET /api/secretary/patient-financial-cases`
- `GET /api/secretary/patient-financial-cases/{caseId}`
- `GET /api/secretary/patient-cheques`
- `GET /api/secretary/patient-promissory-notes`
- `GET /api/secretary/patient-debts`
- `GET /api/secretary/patient-financial-transactions`
- `GET /api/secretary/patient-financial-commitments/due`

نمونه DTO پیشنهادی مشترک:

```csharp
public sealed record PatientReferenceDto(
    Guid PatientId,
    string PatientName,
    string PatientFileNumber
);
```

شماره پرونده باید از رکورد قطعی پرونده بیمار خوانده شود و از Client دریافت یا قابل ویرایش نباشد.

---

## ۳. endpoint جزئیات کامل پرونده مالی

```http
GET /api/secretary/patient-financial-cases/{caseId}
Authorization: Bearer <token>
```

برای جلوگیری از چند درخواست و ناسازگاری لحظه‌ای داده‌ها، پاسخ پیشنهادی باید خود پرونده و تمام چک‌ها و سفته‌های مرتبط با همان `caseId` را برگرداند:

```json
{
  "case": {
    "id": 412,
    "patientId": "63d14ab0-d729-4507-a59f-cf9bb463c721",
    "patientName": "مریم احمدی",
    "patientFileNumber": "1405-1024",
    "patientPhoneNumber": "09121112233",
    "serviceId": 1,
    "serviceName": "کامپوزیت",
    "totalAmount": 150000000,
    "prePaymentAmount": 30000000,
    "depositAmount": 0,
    "totalPaidAmount": 0,
    "remainingAmount": 150000000,
    "totalDebtAmount": 0,
    "agreementType": 1,
    "status": 1,
    "createdAt": "2026-09-01T08:30:00Z"
  },
  "chequeCount": 2,
  "chequeAmount": 60000000,
  "promissoryNoteCount": 1,
  "promissoryNoteAmount": 30000000,
  "cheques": [
    {
      "id": 810,
      "patientFinancialCaseId": 412,
      "patientId": "63d14ab0-d729-4507-a59f-cf9bb463c721",
      "patientName": "مریم احمدی",
      "patientFileNumber": "1405-1024",
      "amount": 30000000,
      "sayadNumber": "1234567890123456",
      "ownerName": "علی احمدی",
      "dueDate": "2026-10-01T00:00:00Z",
      "status": 1
    }
  ],
  "promissoryNotes": [
    {
      "id": 910,
      "patientFinancialCaseId": 412,
      "patientId": "63d14ab0-d729-4507-a59f-cf9bb463c721",
      "patientName": "مریم احمدی",
      "patientFileNumber": "1405-1024",
      "serialNumber": "SF-10020",
      "amount": 30000000,
      "dueDate": "2026-11-01T00:00:00Z",
      "status": 1
    }
  ]
}
```

قواعد پاسخ:

- `cheques` و `promissoryNotes` همیشه آرایه باشند؛ در نبود داده `[]` برگردد، نه `null`.
- آرایه‌ها فقط شامل تعهدات همان `caseId` باشند.
- ترتیب پیشنهادی: `dueDate ASC, id ASC` تا شماره کارت‌های UI پایدار باشد.
- مبالغ Summary و Countها در همان snapshot دیتابیس محاسبه شوند.
- کاربر بدون Permission مشاهده مالی باید `403` دریافت کند.
- پرونده ناموجود یا خارج از محدوده دسترسی کاربر باید `404` دریافت کند.

Frontend فعلاً برای سازگاری، در نبود آرایه‌های بالا endpointهای لیست چک و سفته را فراخوانی می‌کند؛ با اضافه‌شدن آرایه‌ها، مودال با درخواست کمتر و قرارداد قابل‌اعتمادتر کار خواهد کرد.

---

## ۴. ویرایش چک Pending

```http
PUT /api/secretary/patient-cheques/{chequeId}
Authorization: Bearer <token>
Content-Type: application/json
```

Body مجاز:

```json
{
  "amount": 35000000,
  "ownerName": "علی احمدی"
}
```

DTO ورودی باید whitelist باشد و فیلدهای `sayadNumber`، `dueDate`، `status`، `patientId` و `patientFinancialCaseId` را نپذیرد:

```csharp
public sealed record UpdatePatientChequeRequest(
    decimal Amount,
    string OwnerName
);
```

اعتبارسنجی‌ها:

- `amount > 0`؛
- `ownerName` پس از Trim خالی نباشد و محدودیت طول دیتابیس را رعایت کند؛
- چک وجود داشته باشد و کاربر به پرونده آن دسترسی داشته باشد؛
- وضعیت فعلی دقیقاً `Pending` باشد؛
- تغییر مبلغ، قواعد مجموع تعهد/مبلغ پرونده را نقض نکند؛
- بررسی وضعیت و Update در یک Transaction انجام شود تا هم‌زمانی با تأیید/رد چک باعث ویرایش رکورد نهایی‌شده نشود.

پاسخ موفق:

```json
{
  "isSuccess": true,
  "message": "اطلاعات چک با موفقیت ویرایش شد.",
  "data": { "id": 810 }
}
```

اگر چک دیگر Pending نیست، پاسخ پیشنهادی `409 Conflict` است:

```json
{
  "isSuccess": false,
  "message": "چک تأیید یا رد شده است و دیگر قابل ویرایش نیست.",
  "data": null
}
```

وجود هر فیلد اضافه مانند `sayadNumber` یا `dueDate` بهتر است با `400` رد شود، نه اینکه بی‌صدا نادیده گرفته شود.

---

## ۵. ویرایش سفته Pending

```http
PUT /api/secretary/patient-promissory-notes/{promissoryNoteId}
Authorization: Bearer <token>
Content-Type: application/json
```

Body مجاز:

```json
{
  "amount": 32000000
}
```

```csharp
public sealed record UpdatePatientPromissoryNoteRequest(decimal Amount);
```

اعتبارسنجی‌ها:

- `amount > 0`؛
- سفته وجود داشته باشد و کاربر به پرونده آن دسترسی داشته باشد؛
- وضعیت فعلی دقیقاً `Pending` باشد؛
- `serialNumber` و `dueDate` تحت هیچ شرایطی توسط این endpoint تغییر نکنند؛
- بررسی وضعیت و Update اتمیک باشد.

پاسخ موفق `ApiResult<IdResponse>` است. برای سفته غیر Pending، پاسخ `409` با پیام فارسی قابل نمایش برگردد.

---

## ۶. تعیین وضعیت فقط در موعد سررسید

endpointهای فعلی:

```http
PUT /api/secretary/patient-cheques/{chequeId}/status
PUT /api/secretary/patient-promissory-notes/{promissoryNoteId}/status
```

Body:

```json
{ "status": 2 }
```

مقادیر مجاز این جریان:

- `Paid = 2`: ثبت پرداخت قطعی و ایجاد تراکنش؛
- `Unpaid = 3`: ثبت عدم پرداخت و ایجاد بدهی؛
- `Cancelled = 4`: فقط در صورت وجود Use Case مجزای مورد تأیید کسب‌وکار.

قواعد اجباری Backend:

- Source باید `Pending` باشد؛
- برای `Paid` و `Unpaid` باید تاریخ فعلی سامانه `>= dueDate` باشد؛
- قبل از سررسید پاسخ `409` یا `400` با پیام «ثبت نتیجه پرداخت فقط از روز سررسید امکان‌پذیر است» برگردد؛
- عملیات تغییر وضعیت، ساخت Transaction/Debt و محاسبه مجدد وضعیت پرونده در یک Transaction دیتابیس انجام شود؛
- درخواست تکراری نباید تراکنش یا بدهی تکراری بسازد (Idempotency/Unique Constraint بر اساس source پیشنهاد می‌شود).

بخش «نزدیک سررسید» از endpoint زیر استفاده می‌کند:

```http
GET /api/secretary/patient-financial-commitments/due
```

هر آیتم این پاسخ باید شامل `patientName`، `patientFileNumber`، `type`، `amount`، `dueDate` و `status` باشد. بهتر است فقط رکوردهای Pending در بازه موردنظر برگردند.

---

## ۷. محدودیت لغو مالی بیمار

endpoint فعلی:

```http
DELETE /api/secretary/patient-financial-cases/{caseId}
```

DELETE در اینجا حذف فیزیکی نیست و فقط Case را Cancel می‌کند. Backend قبل از لغو باید همه شروط زیر را بررسی کند:

```text
case.Status == Active
AND case.AgreementType == Deposit
AND case.TotalPaidAmount == 0
AND NOT EXISTS(Paid transaction for this case)
```

وجود اولین چک/سفته وصول‌شده یا هر تراکنش پرداخت قطعی باید لغو را برای همیشه مسدود کند. برای جلوگیری از Race Condition، بررسی و تغییر وضعیت در یک Transaction انجام شود.

پاسخ خطای پیشنهادی:

```json
{
  "isSuccess": false,
  "message": "پس از ثبت اولین پرداخت، لغو مالی بیمار امکان‌پذیر نیست.",
  "data": null
}
```

برای توافق PrePayment:

```json
{
  "isSuccess": false,
  "message": "لغو مالی فقط برای توافق ودیعه امکان‌پذیر است.",
  "data": null
}
```

حتی اگر Frontend دکمه لغو را نمایش ندهد، Backend باید این محدودیت‌ها را مستقل اعمال کند.

---

## ۸. Permissionهای پیشنهادی

هر دو گروه منشی و حسابدار باید با Permission کنترل شوند، نه با اعتماد صرف به نام Role:

| عملیات | Permission پیشنهادی |
|---|---|
| مشاهده پرونده، Summary و تعهدات | `PatientFinance.View` |
| ویرایش مبلغ/صاحب تعهد Pending | `PatientFinance.EditPendingCommitment` |
| تأیید یا رد در سررسید | `PatientFinance.ResolveCommitment` |
| لغو ودیعه واجد شرایط | `PatientFinance.CancelDeposit` |

قواعد Domain برای Pending بودن، موعد سررسید و لغو ودیعه علاوه بر Permission همیشه اجرا شوند.

---

## ۹. Envelope و Status Codeها

پاسخ Mutationها با قرارداد زیر سازگار باشد:

```json
{
  "data": { "id": 810 },
  "isSuccess": true,
  "message": "عملیات با موفقیت انجام شد."
}
```

| وضعیت | کاربرد |
|---|---|
| `400 Bad Request` | Body نامعتبر، مبلغ نامعتبر یا فیلد غیرمجاز |
| `401 Unauthorized` | Token نامعتبر/منقضی |
| `403 Forbidden` | نداشتن Permission یا دسترسی به بیمار |
| `404 Not Found` | پرونده، چک یا سفته ناموجود |
| `409 Conflict` | تعهد دیگر Pending نیست، قبل از سررسید است یا پرونده قابل لغو نیست |

پیام `message` باید فارسی، قابل نمایش به کاربر و بدون اطلاعات فنی یا Stack Trace باشد.

---

## ۱۰. سناریوهای تست پذیرش Backend

### جزئیات

- دریافت Case دارای دو چک و سه سفته باید دقیقاً دو آیتم در `cheques` و سه آیتم در `promissoryNotes` برگرداند.
- هیچ تعهد متعلق به Case دیگر، حتی برای همان بیمار، نباید در پاسخ باشد.
- تمام آیتم‌ها باید `patientName` و `patientFileNumber` معتبر داشته باشند.

### ویرایش

- ویرایش `amount` و `ownerName` چک Pending موفق است.
- ویرایش `amount` سفته Pending موفق است.
- ویرایش چک/سفته در وضعیت Paid، Unpaid یا Cancelled با `409` رد می‌شود.
- تلاش برای تغییر `sayadNumber`، `serialNumber` یا `dueDate` با `400` رد می‌شود و دیتابیس تغییر نمی‌کند.
- Race بین Update و Resolve فقط یکی از عملیات را موفق می‌کند.

### سررسید

- Paid/Unpaid کردن تعهد قبل از due date رد می‌شود.
- در روز due date عملیات مجاز است.
- Paid کردن، فقط یک Payment Transaction می‌سازد.
- Unpaid کردن، فقط یک Debt می‌سازد.
- ارسال تکراری، تراکنش یا بدهی تکراری تولید نمی‌کند.

### لغو

- Deposit فعال بدون پرداخت قابل لغو است.
- PrePayment قابل لغو نیست.
- Deposit دارای حداقل یک تراکنش قطعی قابل لغو نیست.
- Case تسویه‌شده یا لغوشده دوباره قابل لغو نیست.

### امنیت

- کاربر بدون Permission مشاهده، پاسخ `403` می‌گیرد.
- کاربر دارای View ولی بدون Edit نمی‌تواند endpoint ویرایش را فراخوانی کند.
- ارسال شناسه تعهد متعلق به بیمار خارج از محدوده دسترسی با `403` یا `404` کنترل‌شده پاسخ می‌گیرد.

---

## ۱۱. چک‌لیست تحویل Backend

- [ ] `patientName` و `patientFileNumber` به تمام DTOهای مالی مورد استفاده Frontend اضافه شده‌اند.
- [ ] جزئیات Case آرایه کامل `cheques` و `promissoryNotes` همان Case را برمی‌گرداند.
- [ ] `PUT /patient-cheques/{id}` فقط `amount` و `ownerName` را می‌پذیرد.
- [ ] `PUT /patient-promissory-notes/{id}` فقط `amount` را می‌پذیرد.
- [ ] ویرایش تعهد غیر Pending در Backend مسدود است.
- [ ] شماره صیادی، سریال سفته و تاریخ سررسید از مسیر ویرایش تغییرپذیر نیستند.
- [ ] Paid/Unpaid فقط از روز سررسید به بعد ممکن است.
- [ ] تغییر وضعیت و ساخت Transaction/Debt اتمیک و تکرارناپذیر است.
- [ ] لغو فقط برای Deposit فعال بدون هیچ پرداخت قطعی ممکن است.
- [ ] لغو بعد از اولین پرداخت در Backend مسدود است.
- [ ] Permissionهای مشاهده، ویرایش، تعیین وضعیت و لغو اعمال شده‌اند.
- [ ] خطاها با Status Code مناسب و پیام فارسی قابل نمایش برمی‌گردند.
- [ ] تست‌های Unit و Integration تمام سناریوهای بخش ۱۰ را پوشش می‌دهند.

---

## ۱۲. الحاقیه قرارداد Backend بر اساس آخرین تغییرات Frontend

این بخش نیازمندی‌های جدید تب‌های «چک‌ها»، «سفته‌ها»، «نزدیک سررسید» و «بدهی‌ها» را مشخص می‌کند. موارد این بخش برای Backend الزامی‌اند؛ محدودیت‌ها و فیلترهای Frontend صرفاً برای تجربه کاربری هستند و جای Validation سمت سرور را نمی‌گیرند.

### ۱۲.۱. تفکیک قطعی چک و سفته بر اساس پرونده

Frontend هنگام بازکردن مودال چک‌های یک بیمار درخواست زیر را می‌فرستد:

```http
GET /api/secretary/patient-cheques?patientFinancialCaseId=412&page=1&pageSize=100
```

و برای مودال سفته‌ها:

```http
GET /api/secretary/patient-promissory-notes?patientFinancialCaseId=412&page=1&pageSize=100
```

Backend باید پارامتر `patientFinancialCaseId` را واقعاً در Query اعمال کند. پاسخ endpoint چک فقط باید `PatientCheque` و پاسخ endpoint سفته فقط باید `PatientPromissoryNote` برگرداند. هیچ رکورد متعلق به پرونده دیگر، حتی اگر بیمار آن یکسان باشد، مجاز نیست در پاسخ قرار گیرد.

نمونه Query منطقی:

```csharp
var query = db.PatientCheques
    .Where(x => x.PatientFinancialCaseId == request.PatientFinancialCaseId);
```

قواعد لازم:

- `patientFinancialCaseId` باید به پرونده‌ای موجود و قابل مشاهده برای کاربر متصل باشد؛
- عدم دسترسی به پرونده با `403` یا `404` کنترل‌شده پاسخ داده شود؛
- فیلتر باید قبل از Pagination اعمال شود؛
- `totalCount` تعداد رکوردهای همان نوع و همان پرونده باشد؛
- چک و سفته نباید با یک DTO مشترک مبهم یا یک لیست ترکیبی برگردند؛
- ترتیب پیشنهادی `dueDate ASC, id ASC` است.

Frontend برای محافظت بیشتر پاسخ را دوباره با `patientFinancialCaseId` فیلتر می‌کند، اما Backend نباید به این فیلتر ثانویه متکی باشد.

### ۱۲.۲. جلوگیری از ثبت سررسید گذشته

تاریخ سررسید چک و سفته در تمام مسیرهای ایجاد باید **امروز یا آینده** باشد. این قانون باید با timezone رسمی سامانه (پیشنهاد: `Asia/Tehran`) بررسی شود، نه timezone مرورگر یا UTC خام.

endpointهای مشمول:

```http
POST /api/secretary/patient-financial-cases
POST /api/secretary/patient-financial-cases/{caseId}/cheques
POST /api/secretary/patient-financial-cases/{caseId}/promissory-notes
```

قاعده اعتبارسنجی:

```text
DueDateInClinicTimezone.Date >= TodayInClinicTimezone.Date
```

در ایجاد پرونده، این Validation باید برای **تک‌تک** اعضای `cheques` و `promissoryNotes` انجام شود. وجود حتی یک تاریخ گذشته باید کل درخواست را با `400 Bad Request` رد کند و هیچ پرونده یا تعهد ناقصی در دیتابیس ثبت نشود.

پاسخ خطای پیشنهادی:

```json
{
  "isSuccess": false,
  "message": "تاریخ سررسید چک یا سفته نمی‌تواند قبل از امروز باشد.",
  "data": null
}
```

تاریخ امروز مجاز است. برای تاریخ نامعتبر یا بدون timezone نیز باید قرارداد Parse مشخص و Validation قطعی وجود داشته باشد.

### ۱۲.۳. قرارداد «نزدیک سررسید» با بازه سه‌روزه

Frontend از endpoint زیر استفاده می‌کند:

```http
GET /api/secretary/patient-financial-commitments/due
```

قرارداد پیشنهادی این endpoint:

- فقط تعهدهای `Pending` برگردند؛
- تعهدهایی که تاریخ سررسید آن‌ها امروز، فردا، دو روز بعد یا سه روز بعد است نمایش داده شوند؛
- تعهد Pending عقب‌افتاده نیز تا زمان تعیین تکلیف در لیست باقی بماند؛
- تعهدهای `Paid`، `Unpaid` و `Cancelled` در این endpoint برگردانده نشوند؛
- نوع تعهد در فیلد `type` با `Cheque=1` و `PromissoryNote=2` مشخص شود؛
- پاسخ شامل اطلاعات لازم برای عنوان بیمار و ثبت نتیجه باشد.

شرط منطقی پیشنهادی:

```text
Status == Pending
AND DueDate.Date <= Today.Date + 3 days
```

نمونه آیتم پاسخ:

```json
{
  "id": 810,
  "type": 1,
  "patientFinancialCaseId": 412,
  "patientId": "63d14ab0-d729-4507-a59f-cf9bb463c721",
  "patientName": "مریم احمدی",
  "patientFileNumber": "1405-1024",
  "amount": 35000000,
  "dueDate": "2026-09-04T00:00:00+03:30",
  "status": 1
}
```

Frontend دکمه‌های «تأیید پرداخت» و «ثبت عدم پرداخت» را برای سه روز مانده به سررسید غیرفعال نمایش می‌دهد و در روز سررسید فعال می‌کند. Backend نیز باید مستقل از UI، هر درخواست تعیین وضعیت قبل از روز سررسید را رد کند.

### ۱۲.۴. سازگاری وضعیت چک/سفته، تراکنش و بدهی

مشکل مهمی که Backend باید از آن جلوگیری کند، نمایش بدهی باز برای چک یا سفته‌ای است که بعداً پرداخت‌شده محسوب شده است. وضعیت Source، Debt و Transaction باید همواره سازگار بماند.

#### ثبت پرداخت مستقیم تعهد

هنگام تغییر وضعیت یک چک یا سفته Pending به `Paid`:

1. وضعیت Source به `Paid` تغییر کند؛
2. دقیقاً یک `PaymentTransaction` برای همان `sourceType + sourceId` ساخته شود؛
3. هیچ Debt باز برای همان Source وجود نداشته باشد؛
4. اگر به علت داده قدیمی Debt باز وجود دارد، در همان Transaction دیتابیس به `Paid/Cancelled` تبدیل شود؛
5. Summary پرونده دوباره محاسبه شود.

#### ثبت عدم پرداخت

هنگام تغییر وضعیت Pending به `Unpaid`:

1. وضعیت Source به `Unpaid` تغییر کند؛
2. دقیقاً یک Debt باز برای همان `sourceType + sourceId` ساخته شود؛
3. PaymentTransaction ساخته نشود؛
4. Unique Constraint یا Idempotency مانع Debt تکراری شود.

#### تسویه بدهی

هنگام فراخوانی:

```http
POST /api/secretary/patient-debts/{debtId}/pay
```

Backend پیش از تسویه باید بررسی کند هیچ چک یا سفته‌ای با وضعیت `Pending` برای `patientFinancialCaseId` همان بدهی وجود ندارد. اگر تعهد در گردش وجود داشت، درخواست با `409 Conflict` و پیام «تا تعیین تکلیف همه چک‌ها و سفته‌های در گردش، تسویه کامل بدهی امکان‌پذیر نیست» رد شود. این شرط باید در Backend اجرا شود و غیرفعال‌بودن دکمه Frontend کافی نیست.

Backend سپس باید در یک Transaction دیتابیس:

1. Debt را از `Unpaid` به `Paid` تغییر دهد؛
2. Source اصلی چک یا سفته را به `Paid` تغییر دهد؛
3. دقیقاً یک PaymentTransaction ایجاد کند؛
4. Summary و مجموع پرداخت‌شده/مانده پرونده را به‌روزرسانی کند؛
5. از اجرای دوباره عملیات و ایجاد پرداخت تکراری جلوگیری کند.

### ۱۲.۵. قرارداد فهرست بدهی‌ها

Frontend برای نمایش بدهی‌های جاری درخواست زیر را ارسال می‌کند:

```http
GET /api/secretary/patient-debts?status=1&page=1&pageSize=20
```

Backend باید فیلتر `status=1` را اعمال کند و فقط Debtهای واقعاً باز را برگرداند. یک Debt نباید صرفاً به علت باقی‌ماندن رکورد تاریخی، باز محسوب شود؛ وضعیت آن باید با Source اصلی و تراکنش‌های قطعی سازگار باشد.

قواعد پیشنهادی Integrity:

```text
Open Debt is valid only when:
Debt.Status == Unpaid
AND Source.Status == Unpaid
AND no successful payment transaction exists for the same source
```

برای داده‌های قدیمی ناسازگار، Migration یا Cleanup Job لازم است:

- Debt باز دارای Source پرداخت‌شده بسته شود؛
- Debt تکراری بر اساس `sourceType + sourceId` ادغام/اصلاح شود؛
- تراکنش تکراری شناسایی و مطابق قواعد حسابداری اصلاح شود؛
- پس از Cleanup یک Unique Index مناسب اضافه شود.

پیشنهاد Constraint:

```text
UNIQUE (SourceType, SourceId) WHERE DebtStatus = Unpaid
UNIQUE (SourceType, SourceId, TransactionType)
```

نحوه دقیق Partial Index با توجه به Database Provider تعیین شود.

### ۱۲.۶. محاسبات مالی بعد از تأیید یا رد

بعد از تعیین تکلیف تعهد، مقادیر زیر باید فقط در Backend محاسبه و در endpoint Summary برگردانده شوند:

```text
totalPaidAmount
remainingAmount
totalDebtAmount
paidChequeAmount
pendingChequeAmount
unpaidChequeAmount
paidPromissoryNoteAmount
pendingPromissoryNoteAmount
unpaidPromissoryNoteAmount
```

قواعد پایه:

- `Paid` وارد `totalPaidAmount` می‌شود؛
- `Pending` نه پرداخت است و نه بدهی قطعی؛
- `Unpaid` تا قبل از تسویه وارد `totalDebtAmount` می‌شود؛
- Debt تسویه‌شده دیگر وارد `totalDebtAmount` نمی‌شود و مبلغ پرداخت آن فقط یک‌بار در `totalPaidAmount` محاسبه می‌شود؛
- `remainingAmount` و `totalDebtAmount` مفاهیم مستقل‌اند و نباید با جمع ساده یا دوباره‌شماری Source و Debt محاسبه شوند.

تمام Mutationهای وضعیت باید پس از Commit پاسخ موفق بدهند تا Refresh بعدی Frontend Summary قطعی و سازگار دریافت کند.

### ۱۲.۷. تست‌های پذیرش تکمیلی

- [ ] درخواست چک با `patientFinancialCaseId=A` هیچ چک متعلق به Case B را برنمی‌گرداند.
- [ ] endpoint سفته هیچ DTO چک برنمی‌گرداند و بالعکس.
- [ ] ایجاد چک یا سفته با سررسید دیروز با `400` رد می‌شود.
- [ ] ایجاد چک یا سفته با سررسید امروز موفق است.
- [ ] اگر یکی از تعهدات آرایه ایجاد پرونده تاریخ گذشته داشته باشد، کل عملیات Rollback می‌شود.
- [ ] تعهد Pending سه روز مانده به موعد در due endpoint نمایش داده می‌شود.
- [ ] دکمه ممکن است در UI وجود داشته باشد، اما Resolve قبل از سررسید در Backend رد می‌شود.
- [ ] تعهد Paid یا Cancelled در due endpoint نمایش داده نمی‌شود.
- [ ] Paid کردن Source دارای Debt قدیمی، Debt باز را باقی نمی‌گذارد.
- [ ] تا وقتی Case تعهد Pending دارد، PayDebt با `409` رد می‌شود.
- [ ] پرداخت Debt پس از تعیین تکلیف همه تعهدات، Source را Paid می‌کند و فقط یک Transaction می‌سازد.
- [ ] `GET patient-debts?status=1` هیچ Debt تسویه‌شده یا ناسازگار با Source Paid برنمی‌گرداند.
- [ ] Summary بعد از Paid، Unpaid و PayDebt بدون دوباره‌شماری مبلغ درست است.

### ۱۲.۸. چک‌لیست فوری تیم Backend

- [ ] فیلتر `patientFinancialCaseId` در endpointهای چک و سفته قبل از Pagination اعمال شده است.
- [ ] پاسخ چک و سفته کاملاً تفکیک شده است.
- [ ] سررسید گذشته در Create Case، Add Cheque و Add Promissory Note رد می‌شود.
- [ ] due endpoint فقط Pendingهای تا سه روز آینده و Pendingهای عقب‌افتاده را می‌دهد.
- [ ] Resolve قبل از سررسید در Domain/Service مسدود است.
- [ ] Paid کردن Source هیچ Debt بازی برای همان Source باقی نمی‌گذارد.
- [ ] Unpaid کردن Source فقط یک Debt ایجاد می‌کند.
- [ ] PayDebt در حضور هر چک یا سفته Pending مسدود است.
- [ ] PayDebt پس از نبود تعهد در گردش، وضعیت Debt و Source را اتمیک Paid می‌کند و یک Transaction می‌سازد.
- [ ] فیلتر `status=1` فهرست بدهی‌ها درست اعمال می‌شود.
- [ ] داده‌های قدیمی ناسازگار با Migration یا Cleanup Job اصلاح شده‌اند.
- [ ] Summary بعد از هر Mutation از اطلاعات قطعی و بدون دوباره‌شماری محاسبه می‌شود.
