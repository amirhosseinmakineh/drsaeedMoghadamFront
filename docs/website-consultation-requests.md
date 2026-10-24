# فرم واقعی درخواست مشاوره

مبنای تغییرات: `main`، کامیت `0b14a02c5868b2417464149ff487188d39fd4fa2` در ریپوی `drsaeedMoghadamFront`.

فرم نمایشی صفحه اصلی با کامپوننت مستقل `ConsultationRequestComponent` جایگزین شده است. نام، موبایل و یک تا ده خدمت از API واقعی لازم‌اند؛ توضیحات اختیاری است. تاریخ ترجیحی، ثبت‌نام و اطلاعات اضافی از این فرم حذف شده‌اند. محتوای معرفی خدمات سایت مستقل از این فرم باقی می‌ماند.

* دریافت خدمات فعال از `GET /api/consultation-requests/services`؛ شناسه یا نام خدمت در فرم Hardcode نشده است.
* ارسال واقعی به `POST /api/consultation-requests` با `Idempotency-Key`؛ پیام موفقیت فقط پس از `saved: true` نمایش داده می‌شود.
* اعتبارسنجی لحظه‌ای نام و موبایل، پشتیبانی ارقام فارسی/عربی و شماره +98، نمایش خطا، Loading، محافظت از چندبار کلیک و حفظ اطلاعات هنگام خطا.
* Retry همان اطلاعات با همان شناسه درخواست انجام می‌شود. پس از تغییر اطلاعات، شناسه جدید ایجاد می‌شود. پس از موفقیت دکمه تا تغییر اطلاعات غیرفعال می‌ماند.
* همه اطلاعات شخصی با interpolation استاندارد Angular و به‌صورت متن نمایش داده می‌شوند.
* پنل مشاور منشأ، خدمات، توضیحات مراجعه‌کننده و زمان درخواست را در کارت لید نمایش می‌دهد.
* جدول مدیریت، ستون‌های منشأ/خدمات/توضیحات و فیلتر Website/Yektanet/AdminSheet را در کنار فیلترهای قبلی دارد. مقدار Clinic قدیمی نیز حفظ شده است.
* تنظیمات URL و Secrets تغییر نکرده‌اند؛ ارتباط با API از مسیر `/api` فعلی است.

بک‌اند همراه این تغییر باید از برنچ `codex-lflotm` ریپوی `DentalClinicDashboaardBackend` ساخته شود؛ ساختار `main` قدیمی است. Migration و راهنمای کامل سمت بک در `docs/website-consultation-requests.md` همان ریپو آماده است. هیچ Merge، Deploy یا Migration روی Production انجام نشده است.

## اجرا و تست

```sh
npm ci
npm run build:local
npx playwright install chromium
```

تست `scripts/test-consultation-browser.mjs` به API تست واقعی نیاز دارد؛ API نمایشی ایجاد نمی‌کند. پروژه تست بک‌اند می‌تواند این اسکریپت را در جریان تست SQL/HTTP صدا بزند: متغیر `CLINIC_BROWSER_TEST_SCRIPT` را به مسیر مطلق این فایل تنظیم و تست بک را اجرا کنید. آن جریان، API واقعی را روی پورت محلی تصادفی اجرا و آدرس را با `CLINIC_TEST_API_URL` به مرورگر منتقل می‌کند. داده آزمایشگاهی فقط در دیتابیس تصادفی تست ایجاد و سپس حذف می‌شود.

در حالت اجرای مستقل، `CLINIC_TEST_API_URL` باید آدرس HTTP یک API محلی آماده با خدمت آزمایشی «خدمت تست یکپارچه» باشد. برای جلوگیری از ایجاد داده آزمایشی در سایت اصلی، اسکریپت فقط localhost/127.0.0.1 را می‌پذیرد. `CLINIC_CHROMIUM_EXECUTABLE` و `CLINIC_SCREENSHOT_DIR` اختیاری‌اند.

سناریوهای مرورگر شامل موبایل 390×844 و دسکتاپ 1440×1000، خدمات واقعی، اعتبارسنجی، قطع شبکه، حفظ ورودی‌ها، Loading، جلوگیری از چند ارسال، ثابت ماندن کلید Retry، ذخیره واقعی و نمایش لید تخصیص‌یافته در پنل مشاور با JWT آزمایشی معتبر است. هیچ Mock در کد فرم یا پنل اضافه نشده است.

## فایل‌های تغییرکرده

* `docs/website-consultation-requests.md`
* `package-lock.json`
* `package.json`
* `scripts/test-consultation-browser.mjs`
* `src/app/core/admin/admin-dashboard.service.ts`
* `src/app/core/consultant/consultant-dashboard.service.ts`
* `src/app/core/lead/lead-consultation.ts`
* `src/app/pages/admin-dashboard/admin-leads-table.component.html`
* `src/app/pages/admin-dashboard/admin-leads-table.component.ts`
* `src/app/pages/consultant-dashboard/consultant-dashboard.component.html`
* `src/app/pages/consultant-dashboard/consultant-dashboard.component.ts`
* `src/app/pages/home/home.component.html`
* `src/app/pages/home/home.component.ts`
* `src/app/shared/consultation-request/consultation-input.ts`
* `src/app/shared/consultation-request/consultation-request.component.html`
* `src/app/shared/consultation-request/consultation-request.component.scss`
* `src/app/shared/consultation-request/consultation-request.component.ts`
