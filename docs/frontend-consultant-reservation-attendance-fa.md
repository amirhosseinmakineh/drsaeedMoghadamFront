# خلاصه فرانت: تایید حضور مشاور

این فایل خلاصه است. مستند کامل پیاده‌سازی:

**[frontend-reservation-attendance-workflow-fa.md](./frontend-reservation-attendance-workflow-fa.md)**

## نکات کلیدی

### سه تب رزرو مشاور

| تب | API |
| --- | --- |
| در انتظار تایید | `GET /Reservation/DueConfirmations` |
| همه | `GET /Reservation/GetConsultantReservations` |
| انجام‌شده | `onlySecretaryReviewed=true` |

### کامپوننت

`src/app/pages/consultant-dashboard/consultant-reservations-panel.component.ts`

### قفل لید لحظه‌ای

تا `DueConfirmations` خالی نشود، لید realtime در صفحه لیدها قفل می‌ماند.

### Polling

- تب pending: هر ۱۵ ثانیه
- سایر تب‌ها: هر ۳۰ ثانیه
