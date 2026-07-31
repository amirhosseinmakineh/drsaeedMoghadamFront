# راهنمای جز‌به‌جز تغییرات بک‌اند پنل منشی

## ۱. هدف و نحوه استفاده

این سند چک‌لیست اجرایی تیم بک‌اند برای پشتیبانی کامل از صفحات زیر است:

- داشبورد عملیاتی منشی؛
- فهرست درخواست‌های رزرو؛
- تأیید، تغییر زمان و رد درخواست؛
- ثبت تماس، یادداشت و پیگیری؛
- ثبت نتیجه مراجعه؛
- جزئیات بیمار و رزرو؛
- تاریخچه کامل فعالیت‌ها.

قرارداد JSON، نمونه پاسخ‌ها و معیارهای کلی در سند `backend-secretary-operational-dashboard-fa.md` آمده است. این سند روی تغییرات لایه‌به‌لایه بک‌اند، ترتیب پیاده‌سازی، Migration، Validation، دسترسی و تست تمرکز دارد.

> دامنه این تغییرات فقط از زمان ثبت درخواست رزرو توسط مشاور آغاز می‌شود. هیچ Entity، Handler، Job، Redis Key، Queue یا API مربوط به ایجاد، Assign، Unassign، Dispatch، Pickup، Redispatch یا تبدیل لید نباید تغییر کند.

## ۲. تصمیم محصول قبل از شروع کدنویسی

پیش از Migration باید این تصمیم قطعی ثبت شود:

### تصمیم موردنیاز

آیا رزرو ثبت‌شده توسط مشاور برای قطعی‌شدن نیازمند بررسی اولیه منشی است؟

- اگر **بله**، گردش کار جدید `ReservationRequestStatus` طبق این سند پیاده‌سازی شود.
- اگر **خیر**، کارت «درخواست‌های رزرو جدید»، عملیات تأیید/رد اولیه و وضعیت `PendingSecretaryReview` از Scope حذف شوند و فرانت براساس قرارداد نهایی اصلاح شود.

نباید فیلد منسوخ `SecretaryReservationReviewStatus` دوباره فعال شود. وضعیت جدید درخواست رزرو با وضعیت بررسی حضور بیمار کاملاً مستقل است:

- `ReservationRequestStatus`: قبل از مراجعه و برای قطعی‌کردن درخواست؛
- `AttendanceConfirmationStatus`: بعد از موعد و برای بررسی ادعای حضور مشاور؛
- `VisitResultStatus`: نتیجه نهایی مراجعه بیمار.

## ۳. تغییرات Domain و Enumها

### ۳-۱. ایجاد Enum وضعیت درخواست

فایل Enum جدید در محل استاندارد Enumهای Reservation ایجاد شود:

```csharp
public enum ReservationRequestStatus
{
    PendingSecretaryReview = 1,
    Confirmed = 2,
    Rescheduled = 3,
    Rejected = 4,
    Canceled = 5,
    WaitingPatientConfirmation = 6,
    NeedsFollowUp = 7,
    Attended = 8,
    NoShow = 9
}
```

قواعد:

- مقدار صفر معتبر نیست.
- مقادیر عددی پس از انتشار نباید بدون Migration سازگارکننده تغییر کنند.
- Enum در JSON به‌صورت عدد برگردد، مگر اینکه کل پروژه استاندارد دیگری داشته باشد.
- وضعیت `Rejected` با `Canceled` یکسان نیست.
- وضعیت `Attended` و `NoShow` می‌توانند Projection نتیجه مراجعه باشند؛ منبع حقیقت همچنان `VisitResultStatus` است.

### ۳-۲. ایجاد Enum نتیجه مراجعه

```csharp
public enum VisitResultStatus
{
    Pending = 1,
    Attended = 2,
    NoShow = 3,
    Canceled = 4,
    NeedsFollowUp = 5
}
```

### ۳-۳. ایجاد Enum وضعیت و اولویت پیگیری

```csharp
public enum FollowUpStatus
{
    Pending = 1,
    Completed = 2,
    Canceled = 3
}

public enum FollowUpPriority
{
    Low = 1,
    Normal = 2,
    High = 3,
    Urgent = 4
}
```

### ۳-۴. ایجاد Enum دلیل رد

```csharp
public enum ReservationRejectionReasonCode
{
    NoCapacity = 1,
    PatientNoAnswer = 2,
    RequestedCancellation = 3,
    Other = 4
}
```

## ۴. تغییرات Entity رزرو

به Entity فعلی Reservation، فقط در صورت نبود فیلد معادل، ستون‌های زیر اضافه شوند:

| فیلد                           | نوع پیشنهادی                   | Null | توضیح                                       |
| ------------------------------ | ------------------------------ | ---- | ------------------------------------------- |
| `RequestStatus`                | `ReservationRequestStatus`     | خیر  | وضعیت فعلی درخواست                          |
| `InitialReservationAt`         | `DateTimeOffset`               | خیر  | اولین زمان پیشنهادی؛ پس از ایجاد تغییر نکند |
| `RequestReviewedAt`            | `DateTimeOffset?`              | بله  | زمان نهایی‌سازی اولیه توسط منشی             |
| `RequestReviewedByUserId`      | `Guid?`                        | بله  | کاربر منشی بررسی‌کننده                      |
| `RequestReviewNote`            | `string?`                      | بله  | یادداشت تأیید یا تغییر زمان                 |
| `RejectionReasonCode`          | Enum nullable                  | بله  | کد دلیل رد                                  |
| `RejectionReason`              | `string?`                      | بله  | متن نهایی دلیل رد                           |
| `CancellationReason`           | `string?`                      | بله  | دلیل لغو بعد از قطعی‌شدن                    |
| `IsConfirmedWithPatient`       | `bool?`                        | بله  | نتیجه هماهنگی نهایی                         |
| `ConfirmedWithPatientAt`       | `DateTimeOffset?`              | بله  | زمان ثبت هماهنگی                            |
| `ConfirmedWithPatientByUserId` | `Guid?`                        | بله  | منشی ثبت‌کننده هماهنگی                      |
| `VisitResultStatus`            | Enum                           | خیر  | پیش‌فرض `Pending`                           |
| `VisitResultNote`              | `string?`                      | بله  | توضیح نتیجه مراجعه                          |
| `VisitResultRecordedAt`        | `DateTimeOffset?`              | بله  | زمان ثبت نتیجه                              |
| `VisitResultRecordedByUserId`  | `Guid?`                        | بله  | کاربر ثبت‌کننده نتیجه                       |
| `LastActivityAt`               | `DateTimeOffset`               | خیر  | زمان آخرین فعالیت مرتبط                     |
| `RowVersion`                   | `rowversion`/Concurrency Token | خیر  | جلوگیری از تغییر هم‌زمان                    |

### قواعد Entity

- `InitialReservationAt` در زمان ایجاد برابر `ReservationAt` تنظیم شود.
- تغییر `ReservationAt` نباید `InitialReservationAt` را بازنویسی کند.
- حذف فیزیکی درخواست رد یا لغوشده ممنوع است.
- `LastActivityAt` پس از هر Mutation معتبر به‌روز شود.
- شناسه کاربر عامل از Claims توکن استخراج شود، نه از Body درخواست.
- اگر پروژه `CreatedAt`، `UpdatedAt`، `UpdatedBy` یا RowVersion عمومی دارد، همان فیلدهای موجود Reuse شوند.

## ۵. Entity پیگیری

اگر سیستم Follow-up عمومی وجود دارد، همان Entity و Service توسعه داده شود. در غیر این صورت Entity زیر در ماژول Reservation ایجاد شود:

```text
ReservationFollowUp
- Id: long
- ReservationId: long
- PatientUserId: Guid?
- ScheduledAt: DateTimeOffset
- ReminderAt: DateTimeOffset?
- Status: FollowUpStatus
- Priority: FollowUpPriority
- Reason: string
- Result: string?
- AssignedSecretaryUserId: Guid?
- CompletedAt: DateTimeOffset?
- CompletedByUserId: Guid?
- CreatedAt: DateTimeOffset
- CreatedByUserId: Guid
- UpdatedAt: DateTimeOffset?
- RowVersion: byte[]
```

قواعد:

- `ScheduledAt` هنگام ایجاد باید در آینده باشد.
- Reason بعد از Trim اجباری است.
- پیگیری Completed یا Canceled دوباره قابل تکمیل نیست.
- حذف فیزیکی پیگیری ممنوع است؛ لغو با Status انجام شود.
- چند پیگیری برای یک رزرو مجاز است، اما شمارنده داشبورد باید Reservation را یکتا بشمارد.

## ۶. Entity تماس و یادداشت

### ۶-۱. تماس

اگر Call Log موجود است، همان ساختار Extend شود و `ReservationId` به آن افزوده یا Relation مناسب ایجاد شود. در غیر این صورت:

```text
ReservationContactLog
- Id
- ReservationId
- PatientUserId?
- Result
- Note?
- ContactedAt
- CreatedByUserId
- CreatedAt
```

مقادیر اولیه نتیجه تماس:

- `Answered`
- `NoAnswer`
- `Busy`
- `CallBack`

در صورت وجود Enum رسمی Call Result در پروژه، همان Enum مرجع باشد و مقادیر بالا با آن تطبیق داده شوند.

### ۶-۲. یادداشت

اگر Note عمومی بیمار یا رزرو وجود دارد، همان قابلیت Extend شود. در غیر این صورت:

```text
ReservationNote
- Id
- ReservationId
- Text
- CreatedByUserId
- CreatedAt
- IsDeleted (فقط اگر سیاست عمومی پروژه Soft Delete دارد)
```

منشی نباید endpoint حذف یا ویرایش یادداشت‌های تاریخچه‌ای را دریافت کند، مگر Permission رسمی موجود باشد.

## ۷. Audit Log و تاریخچه

هر Command موفق باید دقیقاً یک Activity قابل مشاهده ایجاد کند. اگر Audit Log عمومی وجود دارد، استفاده از همان سیستم اجباری است.

حداقل داده هر Activity:

```text
- ActivityId
- ReservationId
- PatientUserId?
- ActivityType
- ActorUserId
- ActorDisplayName snapshot
- Description
- PreviousValue?
- NewValue?
- CreatedAt
```

Activity Typeهای لازم:

- `ReservationRequested`
- `ReservationConfirmed`
- `ReservationRescheduled`
- `ReservationRejected`
- `ReservationCanceled`
- `PatientContactLogged`
- `PatientConfirmationChanged`
- `NoteAdded`
- `FollowUpCreated`
- `FollowUpCompleted`
- `ReminderScheduled`
- `VisitResultRecorded`
- `PatientProfileCreated`

برای تغییر زمان، `PreviousValue` و `NewValue` باید تاریخ ISO کامل باشند. History فقط خواندنی است و endpoint حذف History ایجاد نشود.

## ۸. Migration دیتابیس

Migration باید به ترتیب زیر نوشته شود:

1. افزودن ستون‌های nullable یا دارای Default؛
2. Backfill داده‌های موجود؛
3. تبدیل ستون‌های ضروری به Non-null؛
4. ایجاد Foreign Keyها؛
5. ایجاد Indexها؛
6. ایجاد جدول‌های Follow-up، Contact، Note و Activity فقط در صورت نبود سیستم عمومی معادل.

### Backfill پیشنهادی

- رزرو فعال آینده: `RequestStatus = Confirmed`؛
- رزرو لغوشده: `RequestStatus = Canceled`؛
- رزرو دارای حضور نهایی: `VisitResultStatus = Attended`؛
- رزرو دارای عدم حضور نهایی: `VisitResultStatus = NoShow`؛
- سایر رزروهای گذشته: `VisitResultStatus = Pending` تا توسط Job یا کاربر تعیین تکلیف شوند؛
- `InitialReservationAt = ReservationAt` برای داده‌های قبلی؛
- `LastActivityAt = UpdatedAt ?? CreatedAt`.

### Indexهای لازم

```text
IX_Reservation_RequestStatus_IsCanceled
IX_Reservation_ReservationAt_RequestStatus
IX_Reservation_VisitResultStatus_ReservationAt
IX_Reservation_LastActivityAt
IX_ReservationFollowUp_Status_ScheduledAt
IX_ReservationFollowUp_ReservationId_Status
IX_ReservationContactLog_ReservationId_CreatedAt
IX_ReservationActivity_ReservationId_CreatedAt
```

قبل از اجرای Migration روی Production، Query Plan فهرست منشی و Summary داشبورد بررسی شود.

## ۹. DTOهای Read

### ۹-۱. `SecretaryReservationListItemDto`

فیلدهای زیر با نام JSON به‌صورت `camelCase` برگردند:

```text
id
patientUserId
patientName
patientPhoneNumber
requestedServiceName
consultantProfileId
consultantFullName
consultantReport
reservationAt
initialReservationAt
requestCreatedAt
reservationRequestStatus
lastActivityAt
lastChangedByName
priority
callCount
isConfirmedWithPatient
rejectionReason
cancellationReason
visitResultStatus
doctorName
roomName
lastFollowUpAt
lastContactResult
isCanceled
```

قواعد Projection:

- `callCount` با Count سمت دیتابیس محاسبه شود و N+1 ایجاد نکند.
- `lastFollowUpAt` و `lastContactResult` با Subquery یا Projection تجمیعی دریافت شوند.
- `lastChangedByName` اطلاعات محرمانه کاربر را افشا نکند.
- اطلاعات فروش، امتیاز لید و Assignment در DTO منشی قرار نگیرند.

### ۹-۲. DTO تاریخچه

```csharp
public sealed record SecretaryReservationActivityDto(
    long ActivityId,
    string ActivityType,
    string Description,
    DateTimeOffset CreatedAt,
    string? ActorDisplayName,
    string? PreviousValue,
    string? NewValue);
```

### ۹-۳. DTO داشبورد

```text
SecretaryDashboardDto
- GeneratedAt
- BusinessDate
- TimeZone
- Counts
- TodayReservations
- PriorityFollowUps
- PendingReservationRequests
- RecentSecretaryActivities
- UpcomingReservations
- UnconfirmedWithPatientReservations
```

هیچ Count یا List در پاسخ نباید Null باشد.

## ۱۰. Query فهرست درخواست‌ها

endpoint:

```http
GET /api/Reservation/SecretaryReservations
```

پارامترهای جدید:

```text
reservationRequestStatus: int?
visitResultStatus: int?
reservationDate: DateOnly?
from: DateTimeOffset?
to: DateTimeOffset?
followUpDueOn: DateOnly?
isConfirmedWithPatient: bool?
consultantName: string?
searchText: string?
sortBy: string?
sortDirection: asc|desc
pageNumber: int
pageSize: int
```

### ترتیب ساخت Query

1. فقط رکوردهای مجاز برای نقش جاری؛
2. اعمال وضعیت درخواست؛
3. اعمال نتیجه مراجعه؛
4. تبدیل `reservationDate` به بازه UTC متناظر با روز تهران؛
5. اعمال `from` و `to`؛
6. اعمال Follow-up با `Any` و بدون Join تکرارساز؛
7. اعمال وضعیت تأیید بیمار؛
8. اعمال مشاور؛
9. جست‌وجوی نام بیمار یا شماره تماس Normalize‌شده؛
10. مرتب‌سازی Whitelist‌شده؛
11. محاسبه `totalCount`؛
12. اعمال `Skip` و `Take`؛
13. Projection مستقیم به DTO.

### محدودیت‌ها

- `pageNumber >= 1`؛
- `pageSize` فقط ۱۰، ۲۰ یا ۵۰؛
- حداکثر طول Search برابر ۱۰۰؛
- `sortBy` فقط `requestCreatedAt`، `reservationAt` یا `reservationRequestStatus`؛
- Sort ناشناخته با `400` رد شود یا به Default امن برگردد؛
- Default Sort برابر `requestCreatedAt desc`؛
- تمام فیلترها با AND ترکیب شوند.

## ۱۱. Query خلاصه داشبورد

endpoint:

```http
GET /api/Reservation/SecretaryDashboard?date=2026-07-30&listSize=5
```

### مراحل Handler

1. تاریخ کاری و مرز شروع/پایان روز در `Asia/Tehran` محاسبه شود؛
2. مرزها برای Query دیتابیس به UTC تبدیل شوند؛
3. Count درخواست‌های Pending محاسبه شود؛
4. Count رزروهای Confirmed/Rescheduled امروز محاسبه شود؛
5. Count رزروهای دارای Follow-up سررسیدشده به‌صورت Distinct محاسبه شود؛
6. Count نتیجه‌های `NoShow` محاسبه شود؛
7. شش فهرست کوتاه با `Take(listSize)` دریافت شوند؛
8. تمام Collectionها در نبود داده آرایه خالی باشند؛
9. `GeneratedAt` از Clock استاندارد پروژه گرفته شود.

فرانت نباید برای Dashboard تمام صفحات رزرو را دریافت کند؛ پس این endpoint باید قبل از حذف راه‌حل موقت فرانت آماده شود.

## ۱۲. Command تأیید درخواست

```http
POST /api/Reservation/{id}/secretary-confirm
```

Body:

```json
{
  "note": "زمان با بیمار هماهنگ شد"
}
```

مراحل Handler:

1. احراز نقش Secretary؛
2. دریافت رزرو فعال با RowVersion یا Transaction؛
3. بررسی `RequestStatus == PendingSecretaryReview`؛
4. بررسی حذف یا لغو نبودن؛
5. بررسی معتبر بودن زمان فعلی و ظرفیت؛
6. تغییر Status به `Confirmed`؛
7. ثبت `RequestReviewedAt` و User از Token؛
8. ثبت Note در صورت وجود؛
9. ثبت Activity `ReservationConfirmed`؛
10. ذخیره تراکنشی؛
11. Queue کردن Notification پس از Commit؛
12. برگرداندن DTO به‌روز.

درخواست تکراری یا تغییر هم‌زمان باید `409 Conflict` برگرداند.

## ۱۳. Command تغییر زمان

```http
POST /api/Reservation/{id}/secretary-reschedule
```

Validation:

- `reservationAt` الزامی و معتبر؛
- زمان جدید در آینده؛
- زمان جدید با زمان قبلی متفاوت؛
- داخل ساعات کاری؛
- ظرفیت بازه تکمیل نباشد؛
- تداخل پزشک، اتاق یا بیمار وجود نداشته باشد؛
- Status فعلی اجازه تغییر زمان بدهد؛
- طول Reason و Note در محدوده تعریف‌شده باشد.

مراحل تغییر:

1. Snapshot زمان قبلی؛
2. تغییر `ReservationAt` بدون تغییر `InitialReservationAt`؛
3. تغییر Status به `Rescheduled`؛
4. ثبت کاربر و زمان بررسی؛
5. ثبت Activity با Previous/New Value؛
6. ذخیره تراکنشی؛
7. ارسال اعلان زمان جدید بعد از Commit؛
8. حفظ History قبلی.

خطای ظرفیت و تداخل با `409` و پیام قابل فهم برگردد.

## ۱۴. Command رد درخواست

```http
POST /api/Reservation/{id}/secretary-reject
```

Validation:

- `reasonCode` اجباری و عضو Enum؛
- اگر Reason برابر `Other` است، متن Trim‌شده اجباری؛
- درخواست فقط از `PendingSecretaryReview` قابل رد است؛
- رد باعث Hard Delete نشود.

تغییرات تراکنشی:

- Status به `Rejected`؛
- ذخیره Reason Code و متن نهایی؛
- ثبت کاربر و زمان؛
- ثبت Audit Activity؛
- لغو Reminderهای ارسال‌نشده مخصوص همان رزرو، در صورت قواعد محصول؛
- Invalidate کردن Cache داشبورد.

## ۱۵. ثبت تماس

```http
POST /api/Reservation/{id}/contacts
```

مراحل:

1. بررسی دسترسی به رزرو؛
2. اعتبارسنجی Result رسمی؛
3. Trim و محدودیت طول Note؛
4. درج Contact Log؛
5. به‌روزرسانی LastActivityAt؛
6. ثبت Audit Activity؛
7. برگرداندن `callCount` جدید و آخرین نتیجه تماس.

هیچ شماره‌ای از Body برای شناسایی بیمار پذیرفته نشود؛ شماره از Reservation/Patient خوانده شود.

## ۱۶. ثبت یادداشت

```http
POST /api/Reservation/{id}/notes
```

- Note پس از Trim اجباری؛
- طول پیشنهادی ۱ تا ۲۰۰۰ کاراکتر؛
- متن HTML خام ذخیره نشود یا قبل از نمایش Encode شود؛
- یادداشت در Timeline دیده شود؛
- اطلاعات حساس در Log فنی ثبت نشود.

## ۱۷. ثبت پیگیری

```http
POST /api/Reservation/{id}/follow-ups
```

Validation:

- `scheduledAt` و Reason اجباری؛
- زمان گذشته غیرمجاز؛
- Priority معتبر؛
- رزرو Rejected/Canceled فقط در صورت Business Rule صریح قابل پیگیری است.

پس از ایجاد:

- Activity ایجاد شود؛
- در صورت نیاز Status رزرو به `NeedsFollowUp` تغییر کند؛
- Reminder Job با Idempotency Key ایجاد شود؛
- Cache داشبورد Invalid شود.

## ۱۸. ثبت نتیجه مراجعه

```http
POST /api/Reservation/{id}/visit-result
```

قواعد:

- فقط برای رزرو Confirmed یا Rescheduled؛
- فقط بعد از سررسید زمان رزرو، مگر Permission ویژه مدیر؛
- نتیجه باید عضو `VisitResultStatus` باشد؛
- نتیجه `NoShow` شمارنده عدم مراجعه را افزایش دهد؛
- نتیجه `NeedsFollowUp` بدون ایجاد یا زمان‌بندی پیگیری نباید در کارت «امروز» شمرده شود؛
- تغییر نتیجه نهایی ثبت‌شده فقط با Permission جداگانه و Activity اصلاحی مجاز باشد.

## ۱۹. History endpoint

```http
GET /api/Reservation/{id}/history
```

Query باید Activityهای زیر را با ترتیب `CreatedAt desc` برگرداند:

- ایجاد درخواست؛
- مشاهده توسط منشی، فقط اگر این Event واقعاً ذخیره می‌شود؛
- تأیید، تغییر زمان، رد و لغو؛
- تماس و نتیجه تماس؛
- یادداشت؛
- پیگیری و Reminder؛
- تأیید بیمار؛
- نتیجه مراجعه؛
- تشکیل پرونده.

اگر Eventهای چند جدول استفاده می‌شوند، Mapping به DTO مشترک در Application Layer انجام شود. Pagination History در صورت حجم بالا با `pageNumber/pageSize` اضافه شود.

## ۲۰. جزئیات محدود بیمار برای منشی

اولویت با افزودن داده‌های لازم به DTO جزئیات رزرو است. اگر endpoint جدا لازم شد:

```http
GET /api/Patient/{patientUserId}/secretary-view
```

فقط فیلدهای زیر مجازند:

- نام؛
- شماره تماس؛
- درمان درخواستی؛
- مشاور مرتبط؛
- رزرو جاری؛
- زمان مراجعه؛
- آخرین پیگیری؛
- نتیجه آخرین تماس.

اطلاعات فروش، قیمت‌گذاری داخلی، KPI، Assignment لید، یادداشت محرمانه مدیر و داده پزشکی خارج از نیاز منشی برگردانده نشوند.

## ۲۱. Permission و Policyها

Policyهای پیشنهادی:

```text
SecretaryReservation.Read
SecretaryReservation.Review
SecretaryReservation.Reschedule
SecretaryReservation.Reject
SecretaryReservation.Contact.Write
SecretaryReservation.Note.Write
SecretaryReservation.FollowUp.Write
SecretaryReservation.VisitResult.Write
SecretaryReservation.History.Read
```

- Role به Policy Map شود؛ Controller مستقیماً فقط نام Role را تکرار نکند، اگر سیستم Permission موجود است.
- Admin Read براساس تصمیم محصول؛ Write مدیریتی Permission جدا داشته باشد.
- Consultant فقط endpointهای فعلی متعلق به خودش را حفظ کند.
- تمام Queryها علاوه بر Authorization، Scope داده را نیز کنترل کنند.

## ۲۲. Notification و Reminder

پس از این رویدادها Notification بیمار در صورت وجود کانال معتبر Queue شود:

- تأیید رزرو؛
- تغییر زمان؛
- ثبت Reminder؛
- لغو رزرو.

قواعد:

- ارسال داخل Transaction دیتابیس انجام نشود؛ از Outbox/Queue موجود استفاده شود.
- Command با شکست Notification Rollback نشود؛ وضعیت ارسال جدا ثبت شود.
- Idempotency Key از ReservationId + ActivityId ساخته شود.
- API Command وضعیت `notificationQueued` یا نتیجه قابل‌فهم معادل را برگرداند.
- شماره تماس یا Payload حساس در Application Log چاپ نشود.

## ۲۳. Error Contract

تمام endpointها قالب عمومی پروژه را حفظ کنند:

```json
{
  "isSuccess": false,
  "message": "ظرفیت بازه انتخاب‌شده تکمیل است",
  "data": null,
  "errorCode": "RESERVATION_SLOT_FULL"
}
```

Error Codeهای پیشنهادی:

```text
RESERVATION_NOT_FOUND
RESERVATION_INVALID_STATUS
RESERVATION_ALREADY_REVIEWED
RESERVATION_SLOT_FULL
RESERVATION_TIME_CONFLICT
RESERVATION_TIME_IN_PAST
RESERVATION_OUTSIDE_WORKING_HOURS
REJECTION_REASON_REQUIRED
FOLLOW_UP_TIME_IN_PAST
VISIT_RESULT_TOO_EARLY
CONCURRENCY_CONFLICT
```

فرانت Message را نمایش می‌دهد؛ بنابراین پیام Backend نباید با متن عمومی و نادرست جایگزین شود.

## ۲۴. Cache و Invalidation

اگر Summary داشبورد Cache می‌شود، پس از این عملیات Cache مربوط به Business Date و منشی/کلینیک Invalid شود:

- Confirm؛
- Reschedule؛
- Reject؛
- Cancel؛
- Follow-up Create/Complete؛
- Patient Confirmation؛
- Visit Result.

TTL پیشنهادی Dashboard کوتاه و حداکثر ۳۰ تا ۶۰ ثانیه است. Key نباید شامل Token یا اطلاعات حساس باشد.

## ۲۵. تست‌های Unit

حداقل Unit Testهای Handlerها:

- تأیید Pending موفق است؛
- تأیید رکورد نهایی‌شده خطا می‌دهد؛
- تغییر زمان گذشته رد می‌شود؛
- تغییر زمان برابر زمان قبلی رد می‌شود؛
- ظرفیت تکمیل خطای مشخص می‌دهد؛
- Other بدون توضیح رد می‌شود؛
- پیگیری گذشته رد می‌شود؛
- NoShow قبل از موعد رد می‌شود؛
- Activity در هر Command دقیقاً یک بار ساخته می‌شود؛
- Actor از Token گرفته می‌شود؛
- درخواست تکراری Activity تکراری نمی‌سازد.

## ۲۶. تست‌های Integration

- Secretary مجاز `200/201` دریافت کند؛
- Consultant و Patient روی endpointهای منشی `403` بگیرند؛
- فیلترهای ترکیبی نتیجه صحیح دهند؛
- Search نام و شماره Normalize‌شده کار کند؛
- Pagination بدون رکورد تکراری باشد؛
- Sort Whitelist از SQL Injection جلوگیری کند؛
- مرز نیمه‌شب تهران صحیح باشد؛
- تغییر هم‌زمان دو منشی یکی موفق و دیگری `409` شود؛
- Transaction در شکست Activity یا Save ناقص باقی نماند؛
- History مقادیر قدیم و جدید را حفظ کند؛
- Query داشبورد N+1 نداشته باشد.

## ۲۷. تست Performance

روی دیتاست نزدیک Production اندازه‌گیری شود:

- P95 فهرست صفحه اول؛
- P95 Dashboard Summary؛
- تعداد Queryهای هر endpoint؛
- Query Plan فیلتر تاریخ و وضعیت؛
- حافظه مصرفی Projection؛
- رفتار ۲۰ درخواست هم‌زمان منشی.

هیچ endpoint داشبوردی نباید ابتدا تمام رزروها را در حافظه Load و سپس Count یا Filter کند.

## ۲۸. Swagger و تحویل به فرانت

قبل از اعلام تکمیل بک‌اند:

- Enumها با مقدار عددی در Swagger مشخص شوند؛
- تمام Request/Response DTOها نمونه واقعی داشته باشند؛
- Error Codeها مستند شوند؛
- Nullable بودن فیلدها دقیق باشد؛
- منطقه زمانی هر DateTime مشخص شود؛
- فیلترها و Sortهای مجاز نوشته شوند؛
- Postman/Bruno Collection یا OpenAPI به‌روز تحویل شود؛
- یک کاربر تست Secretary و داده تست غیرحساس فراهم شود.

## ۲۹. ترتیب Pull Requestهای پیشنهادی بک‌اند

### PR اول: Domain و Migration

- Enumها؛
- ستون‌ها؛
- Backfill؛
- Indexها؛
- Entityهای Follow-up/Contact/Activity در صورت نیاز.

### PR دوم: Queryها

- DTO فهرست؛
- فیلترها؛
- Sort و Pagination؛
- History Read؛
- Permissionهای Read.

### PR سوم: Commandهای درخواست

- Confirm؛
- Reschedule؛
- Reject؛
- Concurrency؛
- Audit.

### PR چهارم: عملیات تکمیلی

- Contact؛
- Note؛
- Follow-up؛
- Visit Result؛
- Notification/Outbox.

### PR پنجم: Dashboard Summary

- Countها؛
- فهرست‌های کوتاه؛
- Cache؛
- Invalidation؛
- Performance tests.

## ۳۰. Definition of Done بک‌اند

- [ ] تصمیم محصول درباره تأیید اولیه ثبت شده است.
- [ ] Migration روی نسخه کپی Production بدون خطا اجرا شده است.
- [ ] Rollback Plan نوشته شده است.
- [ ] هیچ منطق Lead Assignment تغییر نکرده است.
- [ ] DTO منشی اطلاعات خارج از دسترسی ندارد.
- [ ] فیلتر، Sort و Pagination کاملاً Server-side هستند.
- [ ] تمام Mutationها Transaction و Concurrency Control دارند.
- [ ] تمام Mutationها Activity ثبت می‌کنند.
- [ ] History فقط‌خواندنی است.
- [ ] Dashboard تمام Countها را Non-null برمی‌گرداند.
- [ ] تاریخ «امروز» براساس `Asia/Tehran` محاسبه می‌شود.
- [ ] Cache پس از Mutationها Invalid می‌شود.
- [ ] Notification با Outbox/Queue و Idempotency ارسال می‌شود.
- [ ] Unit، Integration و Performance Testها پاس شده‌اند.
- [ ] Swagger و Collection به‌روز تحویل فرانت شده‌اند.
- [ ] APIهای جدید روی محیط Staging با فرانت تست شده‌اند.
