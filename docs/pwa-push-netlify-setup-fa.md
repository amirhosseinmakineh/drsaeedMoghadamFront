# راه‌اندازی Push Notification لید لحظه‌ای در Netlify

این سند مراحل ست کردن متغیرهای Firebase برای build تولیدی PWA را توضیح می‌دهد. بدون این مقادیر، FCM token گرفته نمی‌شود و اعلان پس‌زمینه روی گوشی مشاور نمایش داده نمی‌شود.

## پیش‌نیاز

1. پروژه Firebase با Cloud Messaging فعال
2. اپ Web در Firebase Console ثبت شده باشد
3. کلید VAPID (Web Push certificates) ساخته شده باشد

## متغیرهای محیطی Netlify

در **Netlify → Site configuration → Environment variables** این کلیدها را با scope **Build** (و در صورت نیاز Deploy) اضافه کنید:

| متغیر | منبع |
|--------|------|
| `FIREBASE_API_KEY` | Firebase Console → Project settings → Your apps → Web |
| `FIREBASE_AUTH_DOMAIN` | همان صفحه |
| `FIREBASE_PROJECT_ID` | همان صفحه |
| `FIREBASE_STORAGE_BUCKET` | همان صفحه |
| `FIREBASE_MESSAGING_SENDER_ID` | همان صفحه |
| `FIREBASE_APP_ID` | همان صفحه |
| `FIREBASE_VAPID_KEY` | Firebase Console → Cloud Messaging → Web Push certificates → Key pair |
| `API_BASE_URL` | اختیاری؛ پیش‌فرض: `https://drsaeedback.drmoghadam.runflare.run/api` |

فایل `netlify.toml` مقدار `REQUIRE_FIREBASE_CONFIG=true` را برای build ست می‌کند تا در صورت نبودن این متغیرها، deploy با خطا متوقف شود.

## جریان build

```
npm run build
  → scripts/generate-firebase-config.mjs   # از env می‌خواند
  → public/firebase-config.js              # برای SW و index.html
  → src/environments/environment.prod.ts   # برای Angular
  → ng build --configuration production
  → scripts/validate-firebase-config.mjs   # تأیید خروجی
```

## تست محلی با Firebase

```bash
cp .env.example .env.local
# مقادیر Firebase را در .env.local پر کنید
export $(grep -v '^#' .env.local | xargs)
npm run generate:firebase
npm run build:local   # بدون الزام Firebase در CI
```

## تأیید deploy

بعد از deploy موفق:

1. در مرورگر مشاور، `https://<site>/firebase-config.js` را باز کنید — `projectId` نباید خالی باشد.
2. در داشبورد مشاور آنلاین شوید و اجازه Notification بدهید.
3. در Network، درخواست `POST .../Consultant/RegisterPushToken` با `deviceToken` غیرخالی را بررسی کنید.

## عیب‌یابی

| علامت | علت محتمل |
|--------|-----------|
| Build Netlify fail با «Missing: FIREBASE_*» | متغیرها در Netlify ست نشده‌اند |
| `RegisterPushToken` با token خالی | `firebase-config.js` در production خالی است — redeploy با env |
| اعلان foreground کار می‌کند ولی background نه | SW scope یا VAPID اشتباه؛ Service Worker را unregister و دوباره تست کنید |
| PWA قدیمی config خالی دارد | `ngsw-config.json` برای `firebase-config.js` از freshness استفاده می‌کند؛ یک بار hard refresh |
