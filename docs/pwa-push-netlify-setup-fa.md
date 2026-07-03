# راه‌اندازی Web Push (VAPID) برای PWA

## متغیرهای Netlify (Build)

| متغیر | توضیح |
|--------|--------|
| `WEBPUSH_VAPID_PUBLIC_KEY` | کلید عمومی VAPID |

```bash
npx web-push generate-vapid-keys
```

## متغیرهای بک‌اند (Runtime)

| متغیر | توضیح |
|--------|--------|
| `WEBPUSH_VAPID_PUBLIC_KEY` | کلید عمومی |
| `WEBPUSH_VAPID_PRIVATE_KEY` | کلید خصوصی |
| `WEBPUSH_VAPID_SUBJECT` | مثلاً `mailto:support@drmoghadam.com` |

## تست نوتیفیکیشن

1. PWA را روی گوشی نصب کنید
2. با اکانت مشاور login کنید
3. اجازه Notification بدهید
4. PWA را ببندید
5. در داشبورد مشاور «تست نوتیفیکیشن» بزنید
