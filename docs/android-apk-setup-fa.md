# Android Studio و APK

این برنچ از `stage` (حرف کوچک) ساخته شده است.

## ساخت و اجرای محلی

Node.js 22، JDK 21 و Android Studio همراه Android SDK را نصب کنید. در ریشه پروژه:

```powershell
npm install
npm run android:init
npm run android:open
```

بعد از اولین اجرا، برای اعمال تغییرات فرانت:

```powershell
npm run android:build
```

پوشه `android` با دستور `android:init` تولید می‌شود. این پوشه باید کنار `node_modules` باشد؛ باز کردن پوشه Android به‌تنهایی از یک فایل ZIP بدون `node_modules` باعث خطای `Failed to resolve: project :capacitor-android` می‌شود.

## دانلود APK

از Actions > Android Debug APK > آخرین اجرای موفق، فایل `clinic-android-debug-apk` را دریافت کنید. خروجی Debug برای تست است و هنوز همه قابلیت‌های بومی مانند Push نیازمند تست و تکمیل‌اند.
