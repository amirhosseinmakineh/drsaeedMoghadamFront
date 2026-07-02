# مستند فرانت: داشبورد منشی

این سند توضیح می‌دهد داشبورد منشی در فرانت‌اند دقیقاً چه کاری انجام می‌دهد، از کجا باز می‌شود، به چه APIهایی وصل است و چرا ممکن است بعد از لاگین به نظر برسد «داشبورد منشی وجود ندارد».

## خلاصه

داشبورد منشی یک صفحه اختصاصی در مسیر زیر است:

```text
/dashboard/secretary
```

منشی در این داشبورد سه کار اصلی انجام می‌دهد:

1. **تکمیل پروفایل خود** (کد ملی + آدرس)
2. **مشاهده رزروهای کلینیک** و در صورت نیاز **تشکیل پرونده بیمار**
3. **بررسی و تایید/رد ادعای حضور بیمار** که مشاور ثبت کرده است

---

## مسیر ورود به داشبورد

| مرحله | رفتار |
| --- | --- |
| لاگین موفق | کاربر به `/dashboard/secretary` هدایت می‌شود |
| کلیک روی «ورود به داشبورد» در هدر | لینک به `/dashboard/secretary` |
| باز کردن `/dashboard` | به‌صورت خودکار به داشبورد نقش کاربر ریدایرکت می‌شود |
| لینک قدیمی `/secretary/reservation-attendance-reviews` | به `/dashboard/secretary?section=reviews` ریدایرکت می‌شود |

### نقش‌های پشتیبانی‌شده

فرانت نقش JWT را به یکی از این مقادیر نرمال می‌کند:

| مقدار JWT / API | نقش فرانت |
| --- | --- |
| `Secretary` / `secretary` / `منشی` | `secretary` |
| `Admin` | `admin` |
| `Consultant` | `consultant` |
| سایر مقادیر (مثل `NormalUser`, `Patient`) | `patient` |

اگر JWT نقش `Secretary` نداشته باشد، کاربر به‌اشتباه به داشبورد بیمار (`/dashboard/patient`) می‌رود و فقط سه کارت اطلاعاتی می‌بیند — نه داشبورد منشی.

---

## بخش‌های داشبورد

داشبورد منشی چهار بخش داخلی دارد (با سایدبار/ناوبری پایین موبایل):

### 1. نمای کلی (`overview`)

صفحه شروع بعد از تکمیل پروفایل. کارت‌های میانبر به «رزروها» و «تایید حضور» را نشان می‌دهد.

### 2. پروفایل (`profile`)

**قفل اصلی داشبورد.** تا وقتی پروفایل منشی کامل نشود، بخش‌های رزرو و تایید حضور قفل هستند.

فیلدهای الزامی:

- کد ملی (۱۰ رقم)
- آشرس (حداقل ۵ کاراکتر)

API:

```http
POST /api/Secretary
Authorization: Bearer <token>
```

```json
{
  "userId": "guid-منشی",
  "nationalityCode": "0012345678",
  "address": "آدرس کامل",
  "isCompleteProfile": true
}
```

شرط فعال شدن بخش‌های دیگر در فرانت:

- `userId` در JWT موجود باشد
- `isCompleteProfile !== false`

### 3. رزروها (`reservations`)

لیست همه رزروهای کلینیک با فیلتر وضعیت تایید حضور.

API:

```http
GET /api/Reservation/SecretaryReservations
Authorization: Bearer <token>
```

پارامترهای فیلتر:

| پارامتر | توضیح |
| --- | --- |
| `attendanceConfirmationStatus` | فیلتر وضعیت ۱ تا ۵ |
| `includeCanceled` | نمایش رزروهای لغوشده |
| `pageNumber` / `pageSize` | صفحه‌بندی |

اطلاعات نمایش‌داده‌شده برای هر رزرو:

- نام و شماره بیمار
- شهر بیمار
- نام مشاور
- زمان رزرو
- درصد احتمال حضور
- وضعیت تایید حضور

اگر `requiresPatientProfile=true` باشد، دیالوگ **تشکیل پرونده بیمار** باز می‌شود:

```http
POST /api/Reservation/CompletePatientProfile
```

### 4. تایید حضور (`reviews`)

صف رزروهایی که مشاور ادعای حضور/عدم حضور بیمار را ثبت کرده و منتظر بررسی منشی هستند.

API دریافت صف:

```http
GET /api/Reservation/SecretaryReservations?onlyWaitingForSecretaryReview=true
```

برای هر مورد منشی می‌بیند:

- اطلاعات بیمار و مشاور
- زمان رزرو
- ادعای مشاور (آمده / نیامده)
- یادداشت مشاور

منشی می‌تواند **تایید** یا **رد** کند:

```http
POST /api/Reservation/ReviewAttendance
```

```json
{
  "reservationId": 25,
  "secretaryUserId": "guid-منشی",
  "approved": true,
  "note": "با حضور بیمار در مطب تطبیق داده شد."
}
```

---

## فلو کاری کامل (مشاور → منشی)

```text
1. مشاور رزرو ثبت می‌کند
2. زمان رزرو می‌رسد
3. مشاور حضور بیمار را اعلام می‌کند (ConfirmAttendance)
4. رزرو وارد صف منشی می‌شود (isWaitingForSecretaryReview=true)
5. منشی در بخش «تایید حضور» بررسی می‌کند
6. منشی تایید یا رد نهایی می‌کند (ReviewAttendance)
```

### وضعیت‌های تایید حضور

| عدد | نام | معنی |
| --- | --- | --- |
| `1` | PendingConsultantConfirmation | منتظر اعلام مشاور |
| `2` | ConsultantConfirmedPresent | مشاور: بیمار آمده |
| `3` | ConsultantConfirmedAbsent | مشاور: بیمار نیامده |
| `4` | SecretaryApproved | منشی تایید نهایی کرده |
| `5` | SecretaryRejected | منشی رد نهایی کرده |

---

## فایل‌های مرتبط در فرانت

| فایل | نقش |
| --- | --- |
| `src/app/app.routes.ts` | تعریف مسیر `/dashboard/secretary` |
| `src/app/core/auth/auth.service.ts` | تشخیص نقش از JWT، `dashboardUrl()` |
| `src/app/core/auth/auth.guard.ts` | `authGuard`, `roleGuard`, `dashboardRedirectGuard` |
| `src/app/auth/auth-dialog.component.ts` | ریدایرکت بعد از لاگین |
| `src/app/pages/secretary-dashboard/secretary-dashboard.component.ts` | شِل اصلی داشبورد |
| `src/app/pages/secretary-dashboard/secretary-reservations.component.ts` | لیست رزروها |
| `src/app/pages/secretary-dashboard/secretary-reservation-attendance-reviews.component.ts` | صف تایید حضور |
| `src/app/core/secretary/secretary-dashboard.service.ts` | فراخوانی APIهای منشی |

---

## مشکلات رایج و علت آن‌ها

### 1. بعد از لاگین داشبورد منشی باز نمی‌شود

**علت احتمالی:** نقش JWT به‌درستی `Secretary` نیست و کاربر به `/dashboard/patient` می‌رود.

**راه‌حل:** در JWT بررسی کنید claim نقش برابر `Secretary` باشد. ادمین هنگام ساخت کاربر باید `roleName: "Secretary"` بزند.

### 2. داشبورد باز می‌شود ولی فقط فرم پروفایل می‌بینم

**علت:** این رفتار عمدی است. تا پروفایل منشی (کد ملی + آدرس) تکمیل نشود، بخش‌های رزرو و تایید حضور قفل هستند.

### 3. خطای «شناسه کاربر منشی در دسترس نیست»

**علت:** `userId` در JWT وجود ندارد.

**راه‌حل:** بک‌اند باید `userId` را در claimهای JWT قرار دهد.

### 4. لیست رزروها یا صف تایید خالی است

**علت‌های محتمل:**

- هنوز رزروی در سیستم نیست
- مشاور هنوز حضور بیمار را اعلام نکرده
- API سمت سرور دسترسی نقش `Secretary` را نداده (خطای 403)

### 5. `/dashboard` به جای داشبورد منشی، صفحه عمومی نشان می‌دهد

**علت:** قبلاً مسیر `/dashboard` بدون ریدایرکت نقش بود. اکنون با `dashboardRedirectGuard` به مسیر صحیح هدایت می‌شود.

---

## پارامترهای URL

| پارامتر | مقدار | بخش |
| --- | --- | --- |
| `section` | `overview` | نمای کلی |
| `section` | `profile` | پروفایل |
| `section` | `reservations` | رزروها |
| `section` | `reviews` | تایید حضور |

مثال:

```text
/dashboard/secretary?section=reviews
```

---

## تفاوت با داشبورد مشاور

| موضوع | مشاور | منشی |
| --- | --- | --- |
| مسیر | `/dashboard/consultant` | `/dashboard/secretary` |
| ثبت رزرو | بله | خیر |
| اعلام حضور بیمار | بله | خیر |
| تایید نهایی حضور | خیر | بله |
| تشکیل پرونده بیمار | بله (بعد از رزرو) | بله (اگر `requiresPatientProfile`) |
| مدیریت لید | بله | خیر |

---

## چک‌لیست تست دستی

1. با کاربر `Secretary` لاگین کنید → باید به `/dashboard/secretary` بروید
2. اگر پروفایل ناقص است → فرم کد ملی و آدرس نمایش داده شود
3. بعد از تکمیل پروفایل → منوی «رزروها» و «تایید حضور» فعال شود
4. در «رزروها» لیست رزروها لود شود
5. در «تایید حضور» فقط موارد `onlyWaitingForSecretaryReview=true` نمایش داده شوند
6. تایید/رد یک مورد → وضعیت به ۴ یا ۵ تغییر کند
