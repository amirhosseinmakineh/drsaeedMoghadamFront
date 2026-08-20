# تغییر موردنیاز بک‌اند: گزارش همه رزروها در پنل ادمین

## هدف

در بخش «رزروهای روزانه» پنل ادمین گزینه‌ای برای نمایش و دانلود **همه رزروها بدون هیچ فیلتری** اضافه شده است. بک‌اند باید پارامتر جدید `includeAll` را در هر دو endpoint گزارش پشتیبانی کند.

## قرارداد API

### نمایش گزارش

```http
GET /api/admin/reports/daily-reservations?includeAll=true
Authorization: Bearer <token>
```

### دریافت فایل CSV

```http
GET /api/admin/reports/daily-reservations/export?includeAll=true
Authorization: Bearer <token>
```

## رفتار مورد انتظار

- پارامتر `includeAll` از نوع boolean، اختیاری و مقدار پیش‌فرض آن `false` باشد.
- وقتی `includeAll=true` است، تمام رزروها برگردانده شوند و فیلترهای `date`، `consultantProfileId` و `requestStatus` نادیده گرفته شوند؛ حتی اگر کلاینت آن‌ها را نیز ارسال کرده باشد.
- endpoint خروجی CSV دقیقاً همان منطق endpoint نمایش را اجرا کند و همه رکوردها را در فایل قرار دهد.
- ساختار پاسخ نمایش با پاسخ فعلی `daily-reservations` یکسان بماند. مقادیر `summary` باید بر اساس کل رزروها محاسبه شوند و `items` شامل کل رزروها باشد.
- وقتی `includeAll` ارسال نشده یا `false` است، رفتار فعلی بدون تغییر باقی بماند و `date` مانند قبل اعمال شود.
- ترتیب رکوردها مشخص و پایدار باشد؛ پیشنهاد می‌شود ابتدا جدیدترین `createdAt` نمایش داده شود.
- سطح دسترسی ادمین و هدر Authorization فعلی بدون تغییر حفظ شوند.

## نمونه پاسخ

```json
{
  "date": "",
  "datePersian": null,
  "generatedAt": "2026-08-20T10:00:00Z",
  "generatedAtPersian": "۱۴۰۵/۰۵/۲۹ ۱۳:۳۰",
  "summary": {
    "total": 1250,
    "active": 900,
    "canceled": 350,
    "pendingSecretaryReview": 120,
    "confirmed": 700,
    "rescheduled": 80,
    "rejected": 50,
    "uniqueConsultants": 18
  },
  "items": []
}
```

> آرایه `items` در پاسخ واقعی باید شامل همه رزروها و با همان DTO فعلی باشد؛ در نمونه فقط برای کوتاه‌بودن خالی نمایش داده شده است.

## معیار پذیرش

1. درخواست نمایش با `includeAll=true` بدون `date` با پاسخ موفق برگردد.
2. هیچ فیلتر تاریخ، مشاور یا وضعیت روی نتیجه این درخواست اعمال نشود.
3. تعداد `summary.total` با تعداد کل رزروهای مجاز برای ادمین برابر باشد.
4. فایل CSV با `includeAll=true` شامل همان مجموعه رکوردهای پاسخ نمایش باشد.
5. درخواست‌های قدیمی دارای `date` و بدون `includeAll` مانند قبل کار کنند.
