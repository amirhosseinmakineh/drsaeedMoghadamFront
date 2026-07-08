# قرارداد بک‌اند: لید آفلاین، پیگیری و assign لحظه‌ای

این سند تغییرات لازم در API/بک‌اند را مشخص می‌کند تا با رفتار جدید فرانت هم‌راستا شود.

## خلاصه قوانین بیزینس

| وضعیت | رفتار |
| --- | --- |
| لید آفلاین با `State=New/Assigned` و بدون گزارش | مشاور **نباید** آنلاین شود |
| لید آفلاین با گزارش ثبت‌شده (اشغال، پاسخ نداد، پیگیری، ...) | به `Pending` برود و **نباید** assign لحظه‌ای را بلاک کند |
| لید آفلاین با تماس موفق (`CallResult=1/2`) | `State=Contacted` بماند و assign لحظه‌ای آزاد شود |
| لید آفلاین با رد (`CallResult=3`) | `State=Rejected` و assign لحظه‌ای آزاد شود |
| لید لحظه‌ای در صف | به مشاور آنلاین بدون لید آفلاینِ بدون‌گزارش assign شود |

## ۱. `SubmitLeadCallReport`

بعد از ثبت گزارش، state باید بر اساس `CallResult` تنظیم شود:

```csharp
// شبه‌کد
switch (callResult)
{
    case CallResult.Connected:
    case CallResult.Converted:
        lead.LeadAssignmentState = LeadAssignmentState.Contacted;
        break;
    case CallResult.Rejected:
        lead.LeadAssignmentState = LeadAssignmentState.Rejected;
        break;
    default: // NoAnswer, Busy, WrongNumber, NeedsFollowUp, PatientHungUp
        lead.LeadAssignmentState = LeadAssignmentState.Pending;
        break;
}
lead.ContactedAt = UtcNow;
lead.IsReportSubmitted = true;
```

### نکته مهم

الان بک‌اند برای همه نتایج `State=Contacted(3)` می‌گذارد. این باعث می‌شود لید آفلاین «باز» بماند و سرویس assign لحظه‌ای مشاور را بلاک کند.

## ۲. `pendingOfflineLeadCount` در `GetDashboardStatus`

فقط لیدهایی شمرده شوند که:

- `AssignmentType = OfflineQueue`
- `LeadAssignmentState IN (New, Assigned)`
- `IsDeleted = 0`

**نباید** `Contacted` یا `Pending` شمرده شوند.

```sql
SELECT COUNT(*)
FROM LeadAssignments
WHERE ConsultantProfileId = @profileId
  AND IsDeleted = 0
  AND AssignmentType = 2
  AND LeadAssignmentState IN (1, 2);
```

## ۳. `SetOnlineOfflineConsultant` / `canGoOnline`

قبل از `IsOnline = true`:

- اگر `pendingOfflineLeadCount > 0` → `400` با پیام:
  - `تا ثبت گزارش همه لیدهای آفلاین، امکان آنلاین شدن وجود ندارد.`
- اگر مشاور همین الان آنلاین است و لید آفلاین بدون گزارش جدید گرفت → خودکار آفلاین شود.

## ۴. سرویس assign لحظه‌ای

مشاور واجد شرایط دریافت لید realtime فقط وقتی است که:

- `IsOnline = 1`
- `IsAvailable = 1`
- `IsCompleteProfile = 1`
- داخل ساعت کاری
- `pendingOfflineLeadCount = 0` (فقط New/Assigned)
- بدون `DueConfirmations` باز
- بدون لید realtime فعال دیگر (در صورت وجود این قانون)

لیدهای `Pending` آفلاین **نباید** eligibility را بلاک کنند.

## ۵. SQL اصلاح داده‌های فعلی (یک‌بار)

```sql
-- لید آفلاین گزارش‌خورده با نتیجه غیرموفق → پیگیری
UPDATE LeadAssignments
SET LeadAssignmentState = 4  -- Pending
WHERE IsDeleted = 0
  AND AssignmentType = 2
  AND LeadAssignmentState = 3
  AND ContactedAt IS NOT NULL
  AND CallResult IN (3, 4, 5, 6, 7, 8);

-- لید آفلاین گزارش‌خورده با تماس موفق → همان Contacted بماند
-- CallResult IN (1, 2) → نیازی به تغییر نیست
```

## ۶. تست پذیرش

1. مشاور ۳ لید آفلاین `Assigned` دارد → دکمه آنلاین غیرفعال
2. گزارش هر ۳ لید با «اشغال/پاسخ نداد/پیگیری» → state=`Pending`، آنلاین مجاز
3. مشاور آنلاین می‌شود → لید realtime از صف assign می‌شود (`ConsultantProfileId` پر می‌شود)
4. در UI مشاور، لید آفلاین پیگیری با برچسب «پیگیری — اشغال» نمایش داده می‌شود
5. لید آفلاین `Assigned` بدون گزارش → مشاور آنلاین نمی‌شود حتی اگر API دستی صدا زده شود

## تغییرات فرانت (این PR)

- شمارش لید آفلاین بدون گزارش فقط از `State=New/Assigned`
- بلاک و قطع خودکار آنلاین اگر لید بدون گزارش مانده باشد
- نمایش وضعیت «پیگیری — {نتیجه تماس}» برای لیدهای آفلاین follow-up
- فیلتر وضعیت «پیگیری» در لیست لیدها
