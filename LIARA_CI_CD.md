# CI/CD فرانت‌اند با GitHub Actions و Liara

Workflow `Frontend CI/CD - Liara` برای Pull Requestها و push به `stage` و `production` اجرا می‌شود. CI با Node.js 22 وابستگی‌ها را نصب می‌کند، بررسی SEO و build Angular را با configuration متناظر اجرا می‌کند و پس از موفقیت همان commit را با CLI رسمی Liara به اپ SSR منتشر می‌کند.

## تنظیمات GitHub Environment

برای Environmentهای `stage` و `production` این موارد را بساز:

- Secret `LIARA_API_TOKEN`: توکن API لیارا
- Variable `LIARA_FRONTEND_APP`: نام اپ فرانت‌اند لیارا

## تنظیمات اپ Liara

اپ Angular SSR باید Node.js 22، پورت `3000` و start command موجود در `package.json` (`node dist/demo/server/server.mjs`) را اجرا کند. دامنه و API از فایل‌های زیر انتخاب می‌شوند:

- `stage`: `src/environments/environment.stage.ts`
- `production`: `src/environments/environment.prod.ts`

پس از deploy، مسیر `GET /healthz` و اتصال SignalR را بررسی کن.

## تفاوت CI و CD

CI یعنی نصب، بررسی و build خودکار؛ CD یعنی deploy خودکار build تأییدشده به Liara. اجرای production فقط از push به branch `production` انجام می‌شود.
