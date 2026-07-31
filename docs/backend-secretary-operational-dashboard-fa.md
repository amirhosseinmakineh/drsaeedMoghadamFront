# قرارداد بک‌اند داشبورد عملیاتی منشی

## ۱. هدف سند

این سند داده‌ها و قواعدی را مشخص می‌کند که فرانت‌اند برای نمایش داشبورد عملیاتی منشی نیاز دارد. داشبورد شامل چهار شاخص اصلی و چند فهرست کوتاه عملیاتی است:

1. درخواست‌های رزرو جدید و منتظر بررسی؛
2. رزروهای تأییدشده امروز؛
3. پیگیری‌ها و یادآوری‌های امروز؛
4. عدم مراجعه‌ها (`NoShow`).

این قرارداد فقط مربوط به رزرو، هماهنگی بیمار، پیگیری مراجعه و نتیجه مراجعه است و نباید به ایجاد، تخصیص، Dispatch، Pickup، Redispatch یا تبدیل لید وابسته باشد.

## ۲. نکته مهم درباره قراردادهای قدیمی

در مستند `backend-reservation-cleanup-fa.md` گردش کار قدیمی `SecretaryReservationReviewStatus` و endpoint قدیمی `ReviewSecretaryReservation` حذف شده‌اند. بنابراین بک‌اند نباید صرفاً برای داشبورد، همان فیلد یا endpoint منسوخ را بدون تصمیم محصول بازگرداند.

اگر طبق نیاز جدید محصول، درخواست رزرو باید پیش از قطعی‌شدن توسط منشی بررسی شود، این قابلیت باید به‌عنوان گردش کار جدید و مستقل با نام‌های شفاف `reservationRequestStatus` و endpointهای بخش ۷ پیاده‌سازی شود. این وضعیت نباید با `attendanceConfirmationStatus` که مربوط به حضور بعد از زمان مراجعه است، ادغام شود.

## ۳. نقش و دسترسی

- تمام endpointهای این سند باید احراز هویت‌شده باشند.
- نقش `Secretary` مجاز به مشاهده و مدیریت داده‌های عملیاتی رزرو است.
- نقش `Admin` در صورت نیاز گزارش مدیریتی می‌تواند دسترسی Read داشته باشد.
- نقش `Consultant` نباید از endpointهای مدیریتی منشی استفاده کند.
- هر رکورد تغییر وضعیت باید `actorUserId` را از توکن احراز هویت استخراج کند؛ دریافت و اعتماد به `secretaryUserId` ارسالی از کلاینت توصیه نمی‌شود.
- شماره تماس، یادداشت و اطلاعات بیمار فقط در حد نیاز عملیاتی برگردانده شوند.

## ۴. Enumهای موردنیاز

### ۴-۱. وضعیت درخواست رزرو

```text
ReservationRequestStatus
1 = PendingSecretaryReview
2 = Confirmed
3 = Rescheduled
4 = Rejected
5 = Canceled
```

قواعد:

- رزرو ثبت‌شده توسط مشاور با وضعیت `PendingSecretaryReview` ایجاد می‌شود.
- `Confirmed` یعنی زمان رزرو قطعی شده است.
- `Rescheduled` یعنی منشی زمان را تغییر داده و زمان جدید قطعی است.
- `Rejected` باید دارای دلیل رد باشد.
- `Canceled` با رد درخواست اولیه متفاوت است و برای رزروی استفاده می‌شود که قبلاً قطعی شده است.

### ۴-۲. نتیجه مراجعه

```text
VisitResultStatus
1 = Pending
2 = Attended
3 = NoShow
4 = Canceled
5 = NeedsFollowUp
```

### ۴-۳. وضعیت پیگیری

```text
FollowUpStatus
1 = Pending
2 = Completed
3 = Canceled
```

### ۴-۴. اولویت پیگیری

```text
FollowUpPriority
1 = Low
2 = Normal
3 = High
4 = Urgent
```

Enumهای فوق باید در JSON به‌صورت عدد ارسال شوند و مقدار عددی آن‌ها بدون migration سازگارکننده تغییر نکند.

## ۵. endpoint پیشنهادی خلاصه داشبورد

برای جلوگیری از دریافت تمام صفحات رزرو در مرورگر، بک‌اند باید یک endpoint تجمیعی ارائه کند:

```http
GET /api/Reservation/SecretaryDashboard
Authorization: Bearer {token}
```

### ۵-۱. پارامترهای اختیاری

| پارامتر    | نوع       | توضیح                                                                       |
| ---------- | --------- | --------------------------------------------------------------------------- |
| `date`     | `date`    | تاریخ روز کاری با قالب `YYYY-MM-DD`؛ در صورت نبود، امروز منطقه زمانی کلینیک |
| `timeZone` | `string`  | اختیاری؛ مقدار پیش‌فرض `Asia/Tehran`                                        |
| `listSize` | `integer` | تعداد رکورد هر فهرست تکمیلی؛ پیش‌فرض ۵ و حداکثر ۲۰                          |

تمام محاسبات «امروز» باید در منطقه زمانی `Asia/Tehran` انجام شوند، نه براساس UTC سرور.

### ۵-۲. پاسخ موفق

```json
{
  "isSuccess": true,
  "message": "داشبورد منشی دریافت شد",
  "data": {
    "generatedAt": "2026-07-30T12:30:00Z",
    "businessDate": "2026-07-30",
    "timeZone": "Asia/Tehran",
    "counts": {
      "pendingReservationRequests": 4,
      "confirmedTodayReservations": 8,
      "todayFollowUps": 3,
      "noShows": 2
    },
    "todayReservations": [],
    "priorityFollowUps": [],
    "pendingReservationRequests": [],
    "recentSecretaryActivities": [],
    "upcomingReservations": [],
    "unconfirmedWithPatientReservations": []
  }
}
```

هیچ‌یک از مقدارهای `counts` نباید `null` باشند. در نبود داده مقدار `0` و برای فهرست‌ها آرایه خالی برگردانده شود.

## ۶. تعریف دقیق شمارنده‌ها

### ۶-۱. `pendingReservationRequests`

تعداد رزروهایی که هم‌زمان شرایط زیر را دارند:

- توسط مشاور ثبت شده‌اند؛
- حذف نرم نشده‌اند؛
- `reservationRequestStatus = PendingSecretaryReview`؛
- رد یا لغو نشده‌اند.

### ۶-۲. `confirmedTodayReservations`

تعداد رزروهایی که:

- حذف یا لغو نشده‌اند؛
- `reservationRequestStatus` یکی از `Confirmed` یا `Rescheduled` است؛
- بخش تاریخ `reservationAt` در منطقه زمانی تهران برابر `businessDate` است.

### ۶-۳. `todayFollowUps`

تعداد بیمار/رزروهای یکتایی که حداقل یک پیگیری فعال با شرایط زیر دارند:

- `followUpStatus = Pending`؛
- `scheduledAt` در تاریخ کاری انتخاب‌شده قرار دارد؛ یا
- `reminderAt` در تاریخ کاری انتخاب‌شده قرار دارد؛ یا
- `visitResultStatus = NeedsFollowUp` و پیگیری سررسیدشده و تکمیل‌نشده دارند.

صرف `needsFollowUp = true` بدون تاریخ سررسید نباید باعث ورود رکورد به «پیگیری‌های امروز» شود. در صورت وجود چند پیگیری برای یک رزرو، شمارنده باید براساس `reservationId` یکتا باشد.

### ۶-۴. `noShows`

تعداد رزروهایی که:

- زمان مراجعه آن‌ها گذشته است؛
- حذف یا لغو نشده‌اند؛
- `visitResultStatus = NoShow`؛
- نتیجه مراجعه نهایی و ثبت‌شده است.

این شمارنده نباید صرفاً از ادعای مشاور استنتاج شود. اگر گردش کار فعلی تأیید حضور مبنای نتیجه نهایی است، بک‌اند پس از تأیید ادعای عدم حضور توسط منشی باید `visitResultStatus` را به `NoShow` تغییر دهد.

## ۷. مدیریت درخواست رزرو

### ۷-۱. تأیید درخواست

```http
POST /api/Reservation/{reservationId}/secretary-confirm
```

```json
{
  "note": "زمان با بیمار هماهنگ شد"
}
```

خروجی موفق باید وضعیت جدید، زمان رزرو و تاریخ بررسی را برگرداند.

### ۷-۲. تغییر زمان و تأیید

```http
POST /api/Reservation/{reservationId}/secretary-reschedule
```

```json
{
  "reservationAt": "2026-08-02T10:30:00+03:30",
  "note": "با بیمار برای ساعت جدید هماهنگ شد"
}
```

بک‌اند باید آینده‌بودن زمان، ظرفیت، هم‌پوشانی و معتبر بودن وضعیت فعلی را بررسی کند.

### ۷-۳. رد درخواست

```http
POST /api/Reservation/{reservationId}/secretary-reject
```

```json
{
  "reasonCode": 2,
  "reason": "بازه درخواستی قابل ارائه نیست"
}
```

دلیل رد اجباری است. endpointها باید idempotency یا کنترل concurrency داشته باشند تا یک درخواست دو بار نهایی نشود. در تعارض وضعیت، پاسخ `409 Conflict` مناسب است.

## ۸. قرارداد آیتم رزرو داشبورد

فهرست‌های رزرو باید حداقل ساختار زیر را داشته باشند:

```json
{
  "reservationId": 42,
  "patientUserId": "2d21a1e0-1111-4444-8888-22a123456789",
  "patientName": "علی رضایی",
  "patientPhoneNumber": "09121234567",
  "consultantProfileId": 18,
  "consultantFullName": "مشاور نمونه",
  "reservationAt": "2026-07-30T10:30:00+03:30",
  "reservationRequestStatus": 2,
  "visitResultStatus": 1,
  "isConfirmedWithPatient": true,
  "confirmedWithPatientAt": "2026-07-29T09:00:00Z",
  "isCanceled": false,
  "lastActivityAt": "2026-07-29T09:00:00Z"
}
```

تمام نام فیلدها در JSON باید `camelCase` باشند. ارسال هم‌زمان نسخه‌های PascalCase و camelCase لازم نیست.

## ۹. قرارداد آیتم پیگیری

```json
{
  "followUpId": 73,
  "reservationId": 42,
  "patientUserId": "2d21a1e0-1111-4444-8888-22a123456789",
  "patientName": "علی رضایی",
  "patientPhoneNumber": "09121234567",
  "scheduledAt": "2026-07-30T11:00:00+03:30",
  "reminderAt": "2026-07-30T10:45:00+03:30",
  "status": 1,
  "priority": 3,
  "reason": "هماهنگی نهایی مراجعه",
  "assignedSecretaryUserId": "1ec7c560-2222-4444-9999-a12345678900"
}
```

`priorityFollowUps` باید ابتدا براساس اولویت نزولی و سپس `scheduledAt` صعودی مرتب شود.

## ۱۰. آخرین فعالیت‌های منشی

هر آیتم فعالیت باید نوع اقدام واقعی داشته باشد و صرفاً زمان آخرین تغییر رزرو نباشد:

```json
{
  "activityId": 901,
  "reservationId": 42,
  "patientUserId": "2d21a1e0-1111-4444-8888-22a123456789",
  "patientName": "علی رضایی",
  "actorUserId": "1ec7c560-2222-4444-9999-a12345678900",
  "actorDisplayName": "منشی نمونه",
  "activityType": "PatientContactConfirmed",
  "description": "زمان مراجعه با بیمار نهایی شد",
  "createdAt": "2026-07-30T08:15:00Z"
}
```

مقادیر پیشنهادی `activityType`:

- `ReservationConfirmed`
- `ReservationRescheduled`
- `ReservationRejected`
- `PatientContactLogged`
- `PatientContactConfirmed`
- `ReminderScheduled`
- `FollowUpCreated`
- `FollowUpCompleted`
- `VisitResultRecorded`
- `ReservationCanceled`

## ۱۱. فهرست‌های قابل کلیک کارت‌ها

برای Pagination و جست‌وجوی سمت سرور، endpoint موجود رزروهای منشی باید فیلترهای قطعی زیر را پشتیبانی کند:

```http
GET /api/Reservation/SecretaryReservations
  ?reservationRequestStatus=1
  &visitResultStatus=3
  &followUpDueOn=2026-07-30
  &reservationDate=2026-07-30
  &isConfirmedWithPatient=false
  &searchText=علی
  &pageNumber=1
  &pageSize=20
```

| فیلتر                      | کاربرد                                      |
| -------------------------- | ------------------------------------------- |
| `reservationRequestStatus` | کارت منتظر بررسی و رزروهای قطعی             |
| `visitResultStatus`        | فهرست No Show و نیازمند پیگیری              |
| `followUpDueOn`            | پیگیری‌های یک روز کاری                      |
| `reservationDate`          | رزروهای همان روز، براساس منطقه زمانی کلینیک |
| `isConfirmedWithPatient`   | رزروهای نهایی‌نشده با بیمار                 |
| `searchText`               | جست‌وجوی نام، موبایل و مشاور                |

پاسخ باید Pagination استاندارد فعلی را حفظ کند:

```json
{
  "isSuccess": true,
  "message": "رزروها دریافت شدند",
  "data": {
    "items": [],
    "totalCount": 0,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPages": 0
  }
}
```

## ۱۲. ثبت نتیجه مراجعه و هماهنگی بیمار

### ثبت هماهنگی نهایی

```http
POST /api/Reservation/{reservationId}/patient-confirmation
```

```json
{
  "confirmed": true,
  "note": "بیمار حضور در زمان تعیین‌شده را تأیید کرد"
}
```

### ثبت نتیجه مراجعه

```http
POST /api/Reservation/{reservationId}/visit-result
```

```json
{
  "visitResultStatus": 3,
  "note": "بیمار در زمان رزرو مراجعه نکرد"
}
```

### ثبت یا تکمیل پیگیری

```http
POST /api/Reservation/{reservationId}/follow-ups
PUT /api/Reservation/{reservationId}/follow-ups/{followUpId}
```

عملیات فوق باید Audit Log ایجاد کنند تا در `recentSecretaryActivities` قابل نمایش باشند.

## ۱۳. خطاها

بدنه خطا باید با الگوی عمومی پروژه سازگار باشد:

```json
{
  "isSuccess": false,
  "message": "رزرو قبلاً توسط کاربر دیگری بررسی شده است",
  "data": null
}
```

کدهای پیشنهادی:

- `400` برای ورودی نامعتبر؛
- `401` برای نبود احراز هویت؛
- `403` برای نقش غیرمجاز؛
- `404` برای رزرو یا پیگیری ناموجود؛
- `409` برای تغییر هم‌زمان، وضعیت نهایی‌شده یا تکمیل ظرفیت؛
- `422` برای نقض قواعد کسب‌وکار؛
- `500` فقط برای خطای غیرمنتظره.

پیام نباید شامل Stack Trace، SQL، شناسه‌های داخلی حساس یا اطلاعات زیرساخت باشد.

## ۱۴. کارایی و سازگاری

- endpoint داشبورد باید شمارنده‌ها را در سرور محاسبه کند؛ فرانت نباید برای محاسبه چهار کارت همه صفحات رزرو را دریافت کند.
- فهرست‌های تکمیلی فقط به اندازه `listSize` برگردند.
- تمام Queryها باید CancellationToken داشته باشند.
- فیلترهای تاریخ و وضعیت باید در دیتابیس اعمال شوند، نه پس از بارگذاری همه رکوردها در حافظه.
- برای ستون‌های پرتکرار مانند `reservationAt`، `reservationRequestStatus`، `visitResultStatus` و زمان/وضعیت Follow-up index مناسب در نظر گرفته شود.
- نتیجه شمارنده و فهرست‌ها باید از یک snapshot منطقی داده تهیه شود تا عدد کارت با فهرست همان پاسخ ناسازگار نباشد.
- پاسخ داشبورد می‌تواند Cache کوتاه‌مدت داشته باشد، اما پس از عملیات منشی باید invalidation انجام شود.

## ۱۵. معیار پذیرش بک‌اند

- [ ] کاربر Secretary پاسخ `200` و کاربر غیرمجاز پاسخ `403` دریافت می‌کند.
- [ ] تمام شمارنده‌ها در نبود داده `0` هستند و هیچ مقدار `null` برنمی‌گردد.
- [ ] محاسبه امروز با `Asia/Tehran` و در مرز نیمه‌شب تست شده است.
- [ ] رزرو لغوشده یا حذف‌شده در شمارنده‌های فعال وارد نمی‌شود.
- [ ] درخواست منتظر بررسی فقط یک بار قابل نهایی‌شدن است.
- [ ] تغییر هم‌زمان توسط دو منشی پاسخ `409` قابل تشخیص تولید می‌کند.
- [ ] Follow-up تکمیل‌شده در پیگیری‌های امروز شمرده نمی‌شود.
- [ ] چند Follow-up یک رزرو باعث شمارش تکراری بیمار/رزرو نمی‌شود.
- [ ] No Show فقط از نتیجه نهایی مراجعه محاسبه می‌شود.
- [ ] فهرست رزروهای امروز براساس ساعت صعودی مرتب است.
- [ ] فهرست پیگیری‌های اولویت‌دار براساس اولویت نزولی مرتب است.
- [ ] هر Mutation یک Audit Log معتبر ثبت می‌کند.
- [ ] Pagination و `totalCount` فهرست‌های قابل کلیک صحیح هستند.
- [ ] endpoint داشبورد برای محاسبه آمار، N+1 Query ایجاد نمی‌کند.

## ۱۶. ترتیب پیشنهادی تحویل

1. نهایی‌کردن تصمیم محصول درباره بازگشت گردش کار تأیید اولیه رزرو توسط منشی؛
2. افزودن مدل‌ها و migrationهای وضعیت درخواست، نتیجه مراجعه، هماهنگی بیمار و Follow-up؛
3. پیاده‌سازی Mutationها و Audit Log؛
4. توسعه فیلترهای Server-side `SecretaryReservations`؛
5. پیاده‌سازی `SecretaryDashboard` summary endpoint؛
6. انتشار OpenAPI/Swagger به‌روز و نمونه پاسخ واقعی برای اتصال نهایی فرانت؛
7. تست دسترسی، منطقه زمانی، concurrency، Pagination و کارایی.

## ۱۷. قرارداد تکمیلی صفحه درخواست‌های رزرو

فرانت صفحه درخواست‌ها از همان `GET /api/Reservation/SecretaryReservations` استفاده می‌کند و علاوه بر فیلترهای بخش ۱۱، فیلدهای زیر را در هر آیتم مصرف می‌کند:

| فیلد                       | نوع              | الزامی | کاربرد                            |
| -------------------------- | ---------------- | ------ | --------------------------------- |
| `reservationId` یا `id`    | `integer`        | بله    | شناسه پایدار درخواست              |
| `patientName`              | `string`         | بله    | نام بیمار                         |
| `patientPhoneNumber`       | `string`         | بله    | تماس مستقیم                       |
| `requestedServiceName`     | `string`         | خیر    | خدمت یا درمان درخواستی            |
| `consultantFullName`       | `string`         | بله    | مشاور ثبت‌کننده                   |
| `consultantReport`         | `string`         | خیر    | گزارش کامل مشاور                  |
| `reservationAt`            | `DateTimeOffset` | بله    | زمان فعلی رزرو                    |
| `initialReservationAt`     | `DateTimeOffset` | خیر    | زمان پیشنهادی اولیه و تغییرناپذیر |
| `requestCreatedAt`         | `DateTimeOffset` | بله    | زمان ثبت درخواست                  |
| `lastActivityAt`           | `DateTimeOffset` | خیر    | آخرین تغییر                       |
| `lastChangedByName`        | `string`         | خیر    | آخرین کاربر تغییردهنده            |
| `reservationRequestStatus` | `integer`        | بله    | وضعیت رسمی درخواست                |
| `priority`                 | `integer`        | خیر    | اولویت عملیاتی                    |
| `callCount`                | `integer`        | خیر    | تعداد تماس‌های ثبت‌شده            |
| `isConfirmedWithPatient`   | `boolean`        | خیر    | نتیجه هماهنگی بیمار               |
| `rejectionReason`          | `string`         | خیر    | دلیل رد                           |
| `cancellationReason`       | `string`         | خیر    | دلیل لغو                          |
| `visitResultStatus`        | `integer`        | خیر    | نتیجه مراجعه                      |
| `doctorName`               | `string`         | خیر    | پزشک رزرو                         |
| `roomName`                 | `string`         | خیر    | اتاق یا یونیت                     |
| `lastFollowUpAt`           | `DateTimeOffset` | خیر    | زمان آخرین پیگیری بیمار           |
| `lastContactResult`        | `string`         | خیر    | نتیجه آخرین تماس ثبت‌شده          |

پارامترهای `sortBy` مجاز باید Whitelist شوند: `requestCreatedAt`، `reservationAt` و `reservationRequestStatus`. مقدار `sortDirection` فقط `asc` یا `desc` است. فیلتر `consultantName` باید در سمت سرور اعمال شود. ترکیب تمام فیلترها باید با عملگر منطقی AND انجام شود.

## ۱۸. تاریخچه رزرو و بیمار

```http
GET /api/Reservation/{reservationId}/history
```

پاسخ `data` یک آرایه مرتب‌شده از جدیدترین به قدیمی‌ترین با ساختار زیر است:

```json
{
  "activityId": 12,
  "activityType": "ReservationRescheduled",
  "description": "زمان رزرو تغییر کرد",
  "createdAt": "2026-08-01T10:15:00Z",
  "actorDisplayName": "منشی کلینیک",
  "previousValue": "2026-08-02T09:00:00+03:30",
  "newValue": "2026-08-02T11:00:00+03:30"
}
```

تاریخچه باید شامل ایجاد درخواست، تأیید، تغییر زمان، رد، لغو، تماس، یادداشت، Reminder، Follow-up، نتیجه مراجعه و تشکیل پرونده باشد. این endpoint فقط Read است و endpoint حذف History نباید برای منشی ارائه شود.

## ۱۹. ثبت تماس، یادداشت، پیگیری و نتیجه مراجعه

### ثبت تماس

```http
POST /api/Reservation/{reservationId}/contacts
```

```json
{
  "result": "Answered",
  "note": "زمان مراجعه با بیمار مرور شد"
}
```

مقادیر رسمی `result` باید توسط بک‌اند اعلام شوند. مقادیر فعلی مورد انتظار فرانت `Answered`، `NoAnswer`، `Busy` و `CallBack` هستند.

### ثبت یادداشت

```http
POST /api/Reservation/{reservationId}/notes
```

```json
{
  "note": "بیمار درخواست هماهنگی مجدد دارد"
}
```

یادداشت خالی یا فقط Space رد شود و محدودیت طول در OpenAPI اعلام شود.

### ثبت پیگیری

```http
POST /api/Reservation/{reservationId}/follow-ups
```

```json
{
  "scheduledAt": "2026-08-02T10:00:00Z",
  "reason": "تماس مجدد برای تایید نهایی"
}
```

زمان گذشته پذیرفته نشود و ایجاد پیگیری باید `reservationRequestStatus` را در صورت قواعد محصول به `NeedsFollowUp` تغییر دهد.

### ثبت نتیجه مراجعه

```http
POST /api/Reservation/{reservationId}/visit-result
```

```json
{
  "visitResultStatus": 3,
  "note": "بیمار مراجعه نکرد"
}
```

ثبت نتیجه فقط پس از سررسید رزرو و برای وضعیت‌های مجاز انجام شود. نتیجه جدید، Activity تاریخچه و شمارنده داشبورد را به‌صورت تراکنشی به‌روز کند.

## ۲۰. APIهای هنوز لازم برای تکمیل اتصال فرانت

در زمان نگارش این سند، APIهای زیر در قرارداد فعلی مخزن مستند نشده‌اند و باید توسط بک‌اند پیاده‌سازی و در Swagger منتشر شوند:

- `GET /api/Reservation/SecretaryDashboard` برای آمار و فهرست‌های داشبورد؛
- فیلترهای `reservationRequestStatus`، `reservationDate`، `followUpDueOn`، `visitResultStatus`، `isConfirmedWithPatient`، `consultantName`، `sortBy` و `sortDirection` روی `SecretaryReservations`؛
- `POST /api/Reservation/{id}/secretary-confirm`؛
- `POST /api/Reservation/{id}/secretary-reschedule`؛
- `POST /api/Reservation/{id}/secretary-reject`؛
- `GET /api/Reservation/{id}/history`؛
- `POST /api/Reservation/{id}/contacts`؛
- `POST /api/Reservation/{id}/notes`؛
- `POST /api/Reservation/{id}/follow-ups`؛
- `POST /api/Reservation/{id}/visit-result`؛
- API ظرفیت و ساعات کاری، اگر اعتبارسنجی پیش از Submit در فرانت الزامی است؛
- API جزئیات محدود بیمار برای منشی، اگر اطلاعات موردنیاز داخل DTO رزرو قابل ارائه نیست؛
- وضعیت ارسال Notification به بیمار پس از تأیید یا تغییر زمان.

تا قبل از ارائه API ساعات کاری و ظرفیت، بک‌اند مرجع نهایی اعتبارسنجی تداخل، ظرفیت و ساعات مجاز است و باید پیام خطای قابل فهم و کد `409` یا `422` برگرداند.
