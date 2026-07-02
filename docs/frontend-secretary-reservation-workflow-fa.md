# خلاصه فرانت: گردش کار رزرو منشی

این فایل خلاصه است. مستند کامل پیاده‌سازی:

**[frontend-reservation-attendance-workflow-fa.md](./frontend-reservation-attendance-workflow-fa.md)**

## نکات کلیدی

### سه تب منشی

| تب | Query |
| --- | --- |
| صف بررسی | `onlyWaitingForSecretaryReview=true&onlyDue=true` |
| همه | `searchText` + فیلتر وضعیت |
| انجام‌شده | `attendanceConfirmationStatus=4` یا `5` |

### امتیاز

| اقدام منشی | امتیاز |
| --- | --- |
| `approved=true` | +۱۰ |
| `approved=false` | -۱۰ |

### کامپوننت

`src/app/pages/secretary-dashboard/secretary-reservations.component.ts`

### Polling

- صف بررسی: هر ۱۵ ثانیه
- سایر تب‌ها: هر ۳۰ ثانیه
