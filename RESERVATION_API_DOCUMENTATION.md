# مستند جامع API رزرو برای فرانت‌اند

این سند قرارداد APIهای رزرو (`Reservation`) را برای پیاده‌سازی فرانت‌اند توضیح می‌دهد و مبنای سینک فرم‌ها، payloadها و response mapping فرانت است.

> خطای `500 Internal Server Error` یعنی درخواست به بک‌اند رسیده ولی بک‌اند هنگام اجرای منطق یا دسترسی به دیتابیس exception داده است. فرانت باید payload و query را مطابق این سند بفرستد؛ اگر باز هم `500` دریافت شد، لاگ سرور/دیتابیس باید بررسی شود.

## Base URL

```text
https://drsaeedback.drmoghadam.runflare.run
```

همه آدرس‌ها نسبت به base URL بالا هستند.

## فرمت تاریخ و زمان

تمام تاریخ‌ها `DateTime` هستند و فرانت باید ISO 8601 بفرستد، مثل:

```text
2026-06-27T10:30:00.000Z
```

برای `POST /api/Reservation` مقدار `reservationAt` حتما باید در آینده باشد.

## ساختار پاسخ‌ها

Commandها مثل `POST /api/Reservation` معمولا Result wrapper دارند:

```json
{ "isSuccess": true, "message": "...", "data": {} }
```

Queryها مثل `GET /api/Reservation/GetConsultantReservations` آبجکت صفحه‌بندی‌شده و `GET /api/Reservation/DueConfirmations` آرایه مستقیم برمی‌گردانند.

## 1. ثبت رزرو

```http
POST /api/Reservation
```

Headers:

```http
Content-Type: application/json
Accept: application/json
```

Request body کامل:

```json
{
  "leadAssignmentId": 123,
  "consultantProfileId": 43,
  "reservationAt": "2026-06-27T10:30:00.000Z",
  "patientCity": "تهران",
  "attendanceProbabilityPercent": 80,
  "attendancePrediction": "بیمار گفت در تاریخ و ساعت رزرو شده در مطب حاضر می‌شود.",
  "description": "توضیح اختیاری"
}
```

فیلدهای `patientCity` و `attendancePrediction` اجباری هستند و `attendanceProbabilityPercent` باید بین `0` تا `100` باشد.

## 2. دریافت رزروهای مشاور

```http
GET /api/Reservation/GetConsultantReservations?consultantProfileId=43&from=2026-06-27T00:00:00.000Z&to=2026-06-27T23:59:59.999Z&includeCanceled=false&pageNumber=1&pageSize=5
```

Response نمونه:

```json
{
  "items": [
    {
      "id": 25,
      "leadAssignmentId": 123,
      "consultantProfileId": 43,
      "patientUserId": null,
      "requiresPatientProfile": true,
      "reservationAt": "2026-06-27T10:30:00",
      "patientName": "علی احمدی",
      "patientPhoneNumber": "09120000000",
      "patientCity": "تهران",
      "attendanceProbabilityPercent": 80,
      "attendancePrediction": "بیمار گفت در تاریخ و ساعت رزرو شده در مطب حاضر می‌شود.",
      "attendanceConfirmationStatus": 1,
      "consultantAttendanceConfirmedAt": null,
      "consultantSaysPatientAttended": null,
      "consultantAttendanceNote": null,
      "secretaryReviewedAt": null,
      "secretaryUserId": null,
      "secretaryApprovedConsultantConfirmation": null,
      "secretaryReviewNote": null,
      "isAttendanceScoreApplied": false,
      "attendanceScoreValue": null,
      "attendanceScoreAppliedAt": null,
      "isDueForConsultantConfirmation": false,
      "description": "توضیح اختیاری",
      "isCanceled": false
    }
  ],
  "totalCount": 1,
  "pageNumber": 1,
  "pageSize": 5,
  "totalPages": 1
}
```

## 3. دریافت رزروهای موعددار برای تایید حضور مشاور

```http
GET /api/Reservation/DueConfirmations?consultantProfileId=43
```

این endpoint آرایه رزروهایی را می‌دهد که زمانشان رسیده، لغو نشده‌اند و وضعیتشان `PendingConsultantConfirmation` است. تا خالی شدن این لیست، فرانت باید لید لحظه‌ای را قفل کند.

## 4. تایید حضور بیمار توسط مشاور

```http
POST /api/Reservation/ConfirmAttendance
```

```json
{
  "reservationId": 25,
  "consultantProfileId": 43,
  "patientAttended": true,
  "note": "بیمار در مطب حاضر شد."
}
```

## 5. بررسی تایید حضور توسط منشی

```http
POST /api/Reservation/ReviewAttendance
```

```json
{
  "reservationId": 25,
  "secretaryUserId": "00000000-0000-0000-0000-000000000000",
  "approved": true,
  "note": "با حضور بیمار در مطب تطبیق داده شد."
}
```

## 6. تکمیل پرونده بیمار برای رزرو

```http
POST /api/Reservation/CompletePatientProfile
```

اگر `requiresPatientProfile=true` باشد، فرانت باید امکان تکمیل پرونده را برای همان `reservationId` نمایش دهد.

## 7. وضعیت‌های تایید حضور

| عدد | نام | معنی |
| --- | --- | --- |
| `1` | `PendingConsultantConfirmation` | منتظر تایید مشاور |
| `2` | `ConsultantConfirmedPresent` | مشاور گفته بیمار آمده است |
| `3` | `ConsultantConfirmedAbsent` | مشاور گفته بیمار نیامده است |
| `4` | `SecretaryApproved` | منشی ادعای مشاور را تایید کرده |
| `5` | `SecretaryRejected` | منشی ادعای مشاور را رد کرده |
