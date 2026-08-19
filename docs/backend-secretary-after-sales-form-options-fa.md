# تغییرات موردنیاز بک‌اند برای فرم خدمات پس از فروش منشی

فرانت‌اند دیگر شناسه خام بیمار یا مشاور را از منشی دریافت نمی‌کند. منشی فقط بیمار را انتخاب می‌کند و مشاور تخصیص‌یافته به همان بیمار باید همراه رکورد بیمار از بک‌اند برگردد. انتخاب دستی مشاور در فرم وجود ندارد تا بیمار برای مشاور اشتباه رزرو نشود.

## ۱. قرارداد فهرست بیماران و مشاور تخصیص‌یافته

فرانت در حال حاضر درخواست زیر را ارسال می‌کند:

```http
GET /api/LeadAssignment?pageNumber=1&pageSize=500
Authorization: Bearer <secretary-token>
```

منشی دارای permissionهای `CreateReservation` و `ViewPatients` باید فقط بیمارانی را ببیند که اجازه ایجاد رزرو برای آن‌ها را دارد. پاسخ هر آیتم باید علاوه بر اطلاعات بیمار، اطلاعات مشاور فعلی همان assignment را شامل شود:

```json
{
  "leadAssignmentId": 802,
  "fullName": "مریم احمدی",
  "phoneNumber": "09121112233",
  "consultantProfileId": 15,
  "consultantFullName": "علی رضایی",
  "consultantPhoneNumber": "09121234567"
}
```

`consultantProfileId` باید مشاور واقعی تخصیص‌یافته به همین `leadAssignmentId` باشد. فرانت این مقدار را پس از انتخاب بیمار به‌صورت خودکار در payload قرار می‌دهد و امکان تغییر دستی آن را به منشی نمی‌دهد. اگر assignment مشاور فعال ندارد، مقدار `consultantProfileId` باید `null` باشد؛ فرانت در این حالت ثبت رزرو را مسدود می‌کند.

برای سازگاری موقت، فرانت آبجکت تو‌در‌توی `consultant` با فیلدهای `profileId`، `fullName` و `phoneNumber` را نیز می‌خواند، اما پاسخ تخت بالا قرارداد پیشنهادی است.

### پیشنهاد برای دیتای زیاد

به‌جای برگرداندن همه رکوردها، endpoint باید از پارامتر `searchText` و pagination پشتیبانی کند. گزینه بهتر، endpoint محدود و اختصاصی زیر است:

```http
GET /api/Secretary/after-sales-patients?searchText=احمدی&pageNumber=1&pageSize=20
```

این endpoint باید فقط اطلاعات بیمار و مشاور تخصیص‌یافته بالا را برگرداند و از افشای اطلاعات غیرضروری لیدها جلوگیری کند. در صورت پیاده‌سازی مسیر اختصاصی، مسیر فرانت از `LeadAssignment` به endpoint جدید تغییر داده شود.

## ۲. ایجاد رزرو خدمات پس از فروش

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
- بک‌اند بررسی کند `consultantProfileId` دقیقاً مشاور فعلی `leadAssignmentId` است و مقدار دستکاری نشده است؛
- مشاور تخصیص‌یافته باید فعال باشد؛
- `reservationAt` باید در آینده باشد؛
- برای `reservationType = 2`، `description` خالی پذیرفته نشود تا نوع خدمت پس از فروش مشخص باشد؛
- اگر بیمار رزرو باز دارد، پاسخ `400` با پیام فارسی قابل نمایش برگردانده شود؛
- خطای عدم دسترسی با status code برابر `403` برگردد.

## ۳. CORS و پاسخ خطا

origin فرانت‌اند باید در CORS محیط توسعه و production مجاز باشد. همه endpointهای بالا در خطا بهتر است envelope یکسان زیر را برگردانند:

```json
{
  "isSuccess": false,
  "message": "متن خطای قابل نمایش به کاربر",
  "data": null
}
```

## چک‌لیست بک‌اند

- [ ] منشی دارای `ViewPatients` فقط بیماران مجاز را همراه مشاور فعلی آن‌ها دریافت می‌کند.
- [ ] پاسخ شامل `leadAssignmentId`، مشخصات بیمار و `consultantProfileId` و مشخصات مشاور است.
- [ ] بک‌اند تعلق `consultantProfileId` به `leadAssignmentId` را هنگام ثبت دوباره اعتبارسنجی می‌کند.
- [ ] ایجاد رزرو با `reservationType: 2` و توضیح خدمت پشتیبانی می‌شود.
- [ ] ورودی‌های بیمار، مشاور، زمان و توضیح خدمت در سرور اعتبارسنجی می‌شوند.
- [ ] پاسخ‌های `400` و `403` پیام فارسی قابل نمایش دارند.
- [ ] origin فرانت در تنظیمات CORS مجاز است.
