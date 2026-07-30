# قرارداد بک‌اند تغییر زمان رزرو توسط منشی و تایید مشاور

این سند تغییرات لازم بک‌اند برای گردش کار جدید را مشخص می‌کند. مرحله قدیمی «تایید زمان فعلی توسط منشی» همچنان حذف‌شده باقی می‌ماند؛ اما منشی می‌تواند زمان را تغییر دهد و تغییر باید توسط مشاور تایید شود.

## گردش کار

1. منشی در فهرست رزروها تاریخ و ساعت جدید و یک توضیح اختیاری ثبت می‌کند.
2. بک‌اند زمان رزرو را تغییر می‌دهد، رکورد را در وضعیت `PendingConsultantConfirmation` قرار می‌دهد و برای مشاور مالک رزرو اعلان ارسال می‌کند.
3. مشاور در فهرست رزروهای خود زمان جدید و توضیح منشی را می‌بیند و «تایید زمان جدید» را انتخاب می‌کند.
4. بک‌اند تایید مشاور را ثبت و وضعیت درخواست تغییر را `Confirmed` می‌کند.
5. تا قبل از تایید مشاور، تغییر مجدد همان رزرو توسط منشی یا مشاور مجاز نیست.

## API تغییر زمان توسط منشی

`POST /Reservation/SecretaryChangeTime`

```json
{
  "reservationId": 123,
  "secretaryUserId": "user-id",
  "newReservationAt": "2026-08-01T10:30:00.000Z",
  "note": "زمان با بیمار هماهنگ شد"
}
```

قواعد:

- نقش و شناسه منشی، فعال و لغونشده بودن رزرو، آینده بودن زمان و ظرفیت مشاور کنترل شود.
- منشی اجازه تغییر رزروی را که بررسی حضور آن نهایی شده ندارد.
- زمان جدید باید با زمان فعلی متفاوت باشد.
- عملیات به‌صورت transaction انجام شود: تغییر `reservationAt`، ثبت audit تغییر و ساخت اعلان باید یکپارچه باشند.
- پاسخ، DTO به‌روز رزرو را برگرداند.

## اعلان مشاور

پس از تغییر موفق، یک اعلان پایدار برای `consultantUserId` رزرو ساخته و در صورت داشتن push token، Web Push نیز ارسال شود:

- عنوان: `زمان رزرو توسط منشی تغییر کرد`
- متن: نام بیمار و تاریخ/ساعت جدید
- داده: `type: SecretaryReservationTimeChanged`، `reservationId` و مسیر داشبورد رزروهای مشاور
- اعلان باید حتی در صورت ناموفق بودن Web Push در inbox/notification store باقی بماند.

## API تایید توسط مشاور

`POST /Reservation/ConfirmSecretaryTimeChange`

```json
{
  "reservationId": 123,
  "consultantProfileId": 45
}
```

قواعد:

- مالکیت رزرو توسط مشاور و وجود درخواست `PendingConsultantConfirmation` کنترل شود.
- درخواست تکراری idempotent باشد یا خطای business واضح برگرداند.
- زمان تایید و شناسه مشاور ثبت و وضعیت درخواست `Confirmed` شود.

## فیلدهای DTO رزرو

هر دو endpoint فهرست `SecretaryReservations` و `GetConsultantReservations` باید casing استاندارد camelCase و فیلدهای زیر را برگردانند:

| فیلد | نوع | توضیح |
| --- | --- | --- |
| `isWaitingForConsultantTimeConfirmation` | boolean | تغییر زمان منشی هنوز توسط مشاور تایید نشده است |
| `secretaryTimeChangeNote` | string/null | توضیح منشی برای مشاور |
| `secretaryChangedReservationAt` | datetime/null | زمان ثبت تغییر توسط منشی |

## مدل و migration

یک جدول audit مانند `ReservationTimeChanges` پیشنهاد می‌شود با ستون‌های `Id`، `ReservationId`، `PreviousReservationAt`، `NewReservationAt`، `ChangedBySecretaryUserId`، `Note`، `Status`، `CreatedAt`، `ConfirmedAt` و `ConfirmedByConsultantProfileId`. روی درخواست pending هر رزرو unique filtered index ایجاد شود.

فیلدها و endpoint قدیمی `ReviewSecretaryReservation` و دکمه/command «تایید زمان فعلی» نباید بازگردانده شوند. دسترسی منشی به `CompletePatientProfile` نیز همچنان حذف‌شده است و گردش کار تایید حضور (`ReviewAttendance`) مستقل باقی می‌ماند.
