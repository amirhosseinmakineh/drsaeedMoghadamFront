# تغییرات موردنیاز بک‌اند برای فرم خدمات پس از فروش منشی

فرانت‌اند دیگر شناسه خام بیمار یا مشاور را از منشی دریافت نمی‌کند. فرم هنگام باز شدن، فهرست بیماران و مشاوران را دریافت می‌کند و منشی آن‌ها را با نام و شماره تماس انتخاب می‌کند. برای کارکرد کامل این فرم، دسترسی‌ها و قراردادهای زیر در بک‌اند لازم است.

## ۱. دسترسی منشی به فهرست مشاوران

فرانت در حال حاضر درخواست زیر را ارسال می‌کند:

```http
GET /api/Consultant/GetConsultants?pageNumber=1&pageSize=500
Authorization: Bearer <secretary-token>
```

کاربر منشی دارای permission با نام `CreateReservation` باید بتواند این endpoint را فراخوانی کند. پاسخ هر آیتم حداقل باید شامل این فیلدها باشد:

```json
{
  "profileId": 15,
  "firstName": "علی",
  "lastName": "رضایی",
  "phoneNumber": "09121234567"
}
```

`profileId` همان مقداری است که هنگام ایجاد رزرو در `consultantProfileId` ارسال می‌شود. مشاوران غیرفعال یا حذف‌شده نباید در این فهرست قرار بگیرند.

## ۲. دسترسی منشی به فهرست بیماران

فرانت در حال حاضر درخواست زیر را ارسال می‌کند:

```http
GET /api/LeadAssignment?pageNumber=1&pageSize=500
Authorization: Bearer <secretary-token>
```

منشی دارای permissionهای `CreateReservation` و `ViewPatients` باید فقط بیماران/لیدهایی را ببیند که اجازه ایجاد رزرو برای آن‌ها را دارد. پاسخ هر آیتم حداقل باید شامل این فیلدها باشد:

```json
{
  "leadAssignmentId": 802,
  "fullName": "مریم احمدی",
  "phoneNumber": "09121112233"
}
```

اگر نام و شماره در آبجکت تو‌در‌توی `user` یا `lead` قرار داشته باشند، فرانت نسخه فعلی آن‌ها را نیز می‌خواند؛ با این حال قرارداد تخت بالا پیشنهاد می‌شود. `leadAssignmentId` همان مقدار payload ایجاد رزرو است.

### پیشنهاد برای دیتای زیاد

به‌جای برگرداندن همه رکوردها، بهتر است هر دو endpoint از پارامتر `searchText` و pagination پشتیبانی کنند. گزینه بهتر، endpoint محدود و اختصاصی زیر است:

```http
GET /api/Secretary/reservation-form-options?patientSearch=احمدی&consultantSearch=رضایی&pageSize=20
```

این endpoint باید فقط فیلدهای نمایشی بالا را برگرداند و از افشای اطلاعات غیرضروری لیدها جلوگیری کند. در صورت پیاده‌سازی این endpoint، مسیرهای فرانت باید به endpoint تجمیعی جدید تغییر داده شوند.

## ۳. ایجاد رزرو خدمات پس از فروش

```http
POST /api/Reservation
Authorization: Bearer <secretary-token>
Content-Type: application/json
```

نمونه payload واقعی فرم:

```json
{
  "leadAssignmentId": 802,
  "consultantProfileId": 15,
  "reservationAt": "2026-08-25T10:30:00.000Z",
  "description": "خدمت: بررسی و تنظیم روکش\nبیمار هنگام جویدن احساس درد دارد.",
  "reservationType": 2
}
```

قواعد موردنیاز:

- endpoint برای منشی به permission با نام `CreateReservation` نیاز دارد؛
- اعتبار `leadAssignmentId` و `consultantProfileId` در بک‌اند بررسی شود؛
- مشاور انتخاب‌شده باید فعال باشد؛
- `reservationAt` باید در آینده باشد؛
- برای `reservationType = 2`، `description` خالی پذیرفته نشود تا نوع خدمت پس از فروش مشخص باشد؛
- اگر بیمار رزرو باز دارد، پاسخ `400` با پیام فارسی قابل نمایش برگردانده شود؛
- خطای عدم دسترسی با status code برابر `403` برگردد.

## ۴. CORS و پاسخ خطا

origin فرانت‌اند باید در CORS محیط توسعه و production مجاز باشد. همه endpointهای بالا در خطا بهتر است envelope یکسان زیر را برگردانند:

```json
{
  "isSuccess": false,
  "message": "متن خطای قابل نمایش به کاربر",
  "data": null
}
```

## چک‌لیست بک‌اند

- [ ] منشی دارای `CreateReservation` فهرست مشاوران فعال را دریافت می‌کند.
- [ ] منشی دارای `ViewPatients` فقط بیماران مجاز را دریافت می‌کند.
- [ ] پاسخ‌ها شامل شناسه داخلی لازم، نام کامل و شماره تماس هستند.
- [ ] ایجاد رزرو با `reservationType: 2` و توضیح خدمت پشتیبانی می‌شود.
- [ ] ورودی‌های بیمار، مشاور، زمان و توضیح خدمت در سرور اعتبارسنجی می‌شوند.
- [ ] پاسخ‌های `400` و `403` پیام فارسی قابل نمایش دارند.
- [ ] origin فرانت در تنظیمات CORS مجاز است.
