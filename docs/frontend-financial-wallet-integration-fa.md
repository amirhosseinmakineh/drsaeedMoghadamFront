# راهنمای اتصال فرانت‌اند به هسته مالی و کیف پول

این سند قرارداد موردنیاز فرانت‌اند برای اتصال به قابلیت‌های فعلی **Financial Core** را مشخص می‌کند. محدوده این اتصال فقط شامل کیف پول و تراکنش‌های مالی است و شامل پرداخت بیمار، پورسانت مشاور، حقوق، چک یا تسویه‌حساب نمی‌شود.

## ۱. محدوده و قواعد کسب‌وکار

- هر کیف پول متعلق به یک `User` است.
- ایجاد کیف پول ممکن است تنبل (Lazy) باشد؛ بنابراین در فهرست کاربران ادمین ممکن است `walletId` برابر `null` باشد.
- فقط ادمین مجاز به شارژ یا برداشت از کیف پول کاربران است.
- همه کاربران احراز هویت‌شده فقط می‌توانند کیف پول خود را از endpoint اختصاصی `me` ببینند.
- هر تغییر موجودی باید یک تراکنش مالی قابل رهگیری ایجاد کند.
- مقدار `amount` در API عدد صحیح و بر حسب **تومان** است. جداکننده هزارگان فقط جزئی از نمایش UI است و نباید در payload ارسال شود.

## ۲. ماتریس دسترسی نقش‌ها

| قابلیت | Admin | Secretary | Consultant | Normal User |
|---|:---:|:---:|:---:|:---:|
| مشاهده کیف پول خود | ✅ | ✅ | ✅ | ✅ |
| مشاهده فهرست کیف پول کاربران | ✅ | ❌ | ❌ | ❌ |
| مشاهده کیف پول کاربر دیگر | ✅ | ❌ | ❌ | ❌ |
| شارژ کیف پول | ✅ | ❌ | ❌ | ❌ |
| برداشت از کیف پول | ✅ | ❌ | ❌ | ❌ |
| مشاهده تراکنش‌های کیف پول خود | ✅ | ✅ | ✅ | ✅ |
| مشاهده تراکنش‌های کاربران | ✅ | ❌ | ❌ | ❌ |

مخفی کردن دکمه‌ها در UI به‌تنهایی کنترل امنیتی نیست. Backend باید مالکیت کیف پول و نقش کاربر را در تمام درخواست‌ها دوباره بررسی کند.

## ۳. قرارداد عمومی API

آدرس پایه در پروژه از `environment.apiBaseUrl` خوانده می‌شود و در محیط فعلی شامل `/api` است. تمام endpointهای این سند به توکن JWT نیاز دارند:

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

پاسخ‌های موفق ممکن است مستقیماً DTO یا در envelope استاندارد زیر باشند؛ سرویس فرانت باید هر دو حالت را normalize کند:

```json
{
  "isSuccess": true,
  "message": "عملیات با موفقیت انجام شد",
  "data": {}
}
```

## ۴. مدل‌ها و enumها

مقادیر enum باید به‌صورت عددی از Backend دریافت شوند. فرانت نباید ترتیب یا مقدار جدیدی به این enumها اضافه کند.

```ts
export enum TransactionType {
  WalletDeposit = 1,
  WalletWithdrawal = 2,
}

export enum TransactionDirection {
  Credit = 1,
  Debit = 2,
}

export enum FinancialTransactionStatus {
  Completed = 1,
  Cancelled = 2,
  Reversed = 3,
}
```

نگاشت نمایشی فارسی:

| مقدار | عنوان فارسی |
|---|---|
| `WalletDeposit` / `1` | شارژ کیف پول |
| `WalletWithdrawal` / `2` | برداشت از کیف پول |
| `Credit` / `1` | بستانکار (`+`) |
| `Debit` / `2` | بدهکار (`−`) |
| `Completed` / `1` | تکمیل شده |
| `Cancelled` / `2` | لغو شده |
| `Reversed` / `3` | برگشت داده شده |

### interfaceهای پیشنهادی

```ts
export interface WalletDto {
  walletId: string | null;
  userId: string;
  userFullName: string;
  roleName: "Admin" | "Secretary" | "Consultant" | "NormalUser";
  balance: number;
  isActive: boolean;
  createdAt: string | null;
}

export interface WalletTransactionDto {
  id: string;
  transactionNumber: string;
  walletId: string;
  type: TransactionType;
  direction: TransactionDirection;
  amount: number;
  status: FinancialTransactionStatus;
  description: string | null;
  createdByName: string | null;
  createdAt: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminWalletListQuery {
  search?: string;
  roleName?: "Admin" | "Secretary" | "Consultant" | "NormalUser";
  pageNumber: number;
  pageSize: number;
}

export interface WalletOperationRequest {
  amount: number;
  description?: string;
}
```

## ۵. فهرست کیف پول‌ها برای ادمین

```http
GET /api/wallet?search=&roleName=&pageNumber=1&pageSize=20
```

پارامترها:

| پارامتر | نوع | توضیح |
|---|---|---|
| `search` | `string?` | جستجو در نام، نام خانوادگی یا شماره موبایل کاربر |
| `roleName` | `string?` | فیلتر نقش |
| `pageNumber` | `number` | شماره صفحه؛ حداقل ۱ |
| `pageSize` | `number` | تعداد رکورد در صفحه |

نمونه پاسخ:

```json
{
  "isSuccess": true,
  "data": {
    "items": [
      {
        "walletId": "af737c8a-2943-4e26-b15c-7a9c23c3663a",
        "userId": "c5707601-73ea-42c6-8ed8-a5d41b46522f",
        "userFullName": "علی احمدی",
        "roleName": "Consultant",
        "balance": 12000000,
        "isActive": true,
        "createdAt": "2026-08-09T08:30:00Z"
      },
      {
        "walletId": null,
        "userId": "2bcff229-e8e5-43f5-bccc-276a5b57b65f",
        "userFullName": "مریم محمدی",
        "roleName": "NormalUser",
        "balance": 0,
        "isActive": false,
        "createdAt": null
      }
    ],
    "totalCount": 2,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

### رفتار `walletId = null`

- کاربر در فهرست باقی می‌ماند و موجودی او صفر نمایش داده می‌شود.
- UI نباید برای مشاهده تاریخچه، endpoint کیف پول را با مقدار `null` فراخوانی کند.
- دکمه‌های شارژ و برداشت همچنان بر اساس `userId` کار می‌کنند؛ Backend هنگام اولین شارژ می‌تواند کیف پول را ایجاد کند.
- برداشت برای کاربری که کیف پول ندارد باید غیرفعال باشد یا خطای ۴۰۰ Backend به پیام «موجودی کافی نیست» تبدیل شود.

## ۶. انتخاب کاربر و تاریخچه کیف پول

پس از انتخاب یک کاربر توسط ادمین:

```http
GET /api/wallet/{userId}
GET /api/wallet/{userId}/transactions?pageNumber=1&pageSize=20
```

درخواست اول اطلاعات جاری کیف پول را برمی‌گرداند. درخواست دوم باید تاریخچه را صفحه‌بندی کند. با تغییر صفحه، فقط درخواست تاریخچه تکرار شود و اطلاعات کاربر و موجودی در بالای صفحه ثابت بماند.

```json
{
  "isSuccess": true,
  "data": {
    "items": [
      {
        "id": "93041",
        "transactionNumber": "WT-1405-00093041",
        "walletId": "af737c8a-2943-4e26-b15c-7a9c23c3663a",
        "type": 1,
        "direction": 1,
        "amount": 5000000,
        "status": 1,
        "description": "اصلاح موجودی مرداد",
        "createdByName": "مدیر سیستم",
        "createdAt": "2026-08-09T09:10:00Z"
      }
    ],
    "totalCount": 1,
    "pageNumber": 1,
    "pageSize": 20,
    "totalPages": 1
  }
}
```

## ۷. کیف پول کاربر جاری

```http
GET /api/wallet/me
```

این endpoint تنها مسیر مجاز برای نمایش کیف پول شخصی Admin، Secretary، Consultant و Normal User است. شناسه کاربر نباید از route، فرم یا local storage گرفته و به API ارسال شود؛ Backend باید کاربر را از claim توکن تشخیص دهد.

الزامات UI:

1. تا زمان پاسخ، skeleton یا loading نمایش داده شود.
2. موجودی با جداکننده هزارگان و واحد تومان نمایش داده شود.
3. نوع، جهت، وضعیت و تاریخ تراکنش‌ها به فارسی نمایش داده شوند.
4. در پاسخ ۴۰۴، کارت کیف پول برای Normal User مخفی شود؛ برای نقش‌های سازمانی یک empty state بدون دکمه عملیات نمایش داده شود.
5. برای Secretary، Consultant و Normal User هیچ دکمه شارژ یا برداشت render نشود.

## ۸. شارژ کیف پول

```http
POST /api/wallet/{userId}/deposit
```

```json
{
  "amount": 5000000,
  "description": "اصلاح موجودی مرداد"
}
```

- `amount` اجباری، عدد صحیح و بزرگ‌تر از صفر است.
- فرانت باید کاراکترهای غیرعددی را حذف و جداکننده هزارگان را پیش از ارسال پاک کند.
- در زمان ارسال، دکمه تأیید غیرفعال شود تا عملیات تکراری ثبت نشود.
- پس از موفقیت، modal بسته شود، پیام موفقیت نمایش داده شود و موجودی و تاریخچه از API دوباره دریافت شوند؛ اتکا به جمع محلی برای مقدار نهایی مجاز نیست.

## ۹. برداشت از کیف پول

```http
POST /api/wallet/{userId}/withdraw
```

بدنه درخواست و قواعد اعتبارسنجی مشابه Deposit است. علاوه بر آن:

- مبلغ نباید از موجودی نمایش‌داده‌شده بیشتر باشد؛ این کنترل برای UX است و جای کنترل Backend را نمی‌گیرد.
- در خطای موجودی ناکافی، modal باز بماند و پیام کنار فیلد مبلغ نمایش داده شود.
- پس از موفقیت، موجودی و تاریخچه باید مجدداً از API دریافت شوند.

## ۱۰. ProblemDetails و مدیریت خطا

خطاهای HTTP بر اساس RFC 7807 برگردانده می‌شوند:

```json
{
  "type": "https://httpstatuses.com/409",
  "title": "Wallet operation conflict",
  "status": 409,
  "detail": "Wallet balance changed. Reload and try again.",
  "traceId": "00-..."
}
```

| Status | رفتار پیشنهادی فرانت |
|---|---|
| `400` | نمایش خطای validation یا «مبلغ معتبر نیست / موجودی کافی نیست» کنار فرم |
| `401` | پاک کردن session و هدایت به ورود |
| `403` | نمایش «دسترسی انجام این عملیات را ندارید» و حذف کنترل‌های ادمین |
| `404` | نمایش «کاربر یا کیف پول پیدا نشد»؛ برای `/me` از قواعد empty state استفاده شود |
| `409` | نمایش conflict، دریافت مجدد موجودی و درخواست تأیید دوباره از کاربر |
| `500` | نمایش پیام عمومی و ثبت `traceId` برای پیگیری؛ جزئیات فنی به کاربر نمایش داده نشود |

اولویت متن خطا: `detail`، سپس `title`، سپس `message` و در نهایت پیام عمومی فارسی.

## ۱۱. نمونه سرویس Angular

```ts
@Injectable({ providedIn: "root" })
export class WalletService {
  private readonly baseUrl = `${environment.apiBaseUrl}/wallet`;

  constructor(private readonly http: HttpClient) {}

  getAdminWallets(query: AdminWalletListQuery) {
    return this.http.get<ApiEnvelope<PagedResult<WalletDto>>>(this.baseUrl, {
      params: { ...query },
    });
  }

  getMyWallet() {
    return this.http.get<ApiEnvelope<WalletDto>>(`${this.baseUrl}/me`);
  }

  getUserWallet(userId: string) {
    return this.http.get<ApiEnvelope<WalletDto>>(`${this.baseUrl}/${userId}`);
  }

  getUserTransactions(userId: string, pageNumber = 1, pageSize = 20) {
    return this.http.get<ApiEnvelope<PagedResult<WalletTransactionDto>>>(
      `${this.baseUrl}/${userId}/transactions`,
      { params: { pageNumber, pageSize } },
    );
  }

  deposit(userId: string, body: WalletOperationRequest) {
    return this.http.post<ApiEnvelope<WalletDto>>(
      `${this.baseUrl}/${userId}/deposit`,
      body,
    );
  }

  withdraw(userId: string, body: WalletOperationRequest) {
    return this.http.post<ApiEnvelope<WalletDto>>(
      `${this.baseUrl}/${userId}/withdraw`,
      body,
    );
  }
}
```

ارسال Authorization ترجیحاً در interceptor مشترک انجام شود تا سرویس‌های دامنه مجبور به ساخت دستی header نباشند.

## ۱۲. سناریوی پیاده‌سازی نهایی

### پنل Admin

1. ورود به بخش «امور مالی ← کیف پول کاربران».
2. دریافت صفحه اول فهرست با `pageNumber=1` و `pageSize=20`.
3. اعمال جستجو و فیلتر نقش با بازگرداندن `pageNumber` به ۱.
4. انتخاب کاربر و دریافت هم‌زمان جزئیات کیف پول و صفحه اول تاریخچه.
5. نمایش Deposit و Withdrawal فقط برای Admin.
6. پس از عملیات موفق، دریافت مجدد جزئیات، تاریخچه و ردیف فهرست.

### داشبورد Secretary

1. فراخوانی فقط `GET /api/wallet/me`.
2. نمایش موجودی و لینک تاریخچه شخصی.
3. عدم نمایش مدیریت، شارژ و برداشت.

### داشبورد Consultant

1. فراخوانی فقط `GET /api/wallet/me`.
2. نمایش کارت «مالی من» و لینک مشاهده جزئیات.
3. عدم نمایش کیف پول دیگران یا هرگونه عملیات مالی.

### داشبورد Normal User

1. فراخوانی فقط `GET /api/wallet/me`.
2. نمایش کارت کیف پول در صورت وجود.
3. مخفی کردن بخش مالی در پاسخ ۴۰۴.

## ۱۳. چک‌لیست تحویل

- [ ] تمام routeها با guard مناسب محافظت شده‌اند.
- [ ] Secretary، Consultant و Normal User تنها از `/wallet/me` استفاده می‌کنند.
- [ ] فهرست Admin جستجو، فیلتر نقش و pagination سمت سرور دارد.
- [ ] `walletId = null` بدون خطای runtime نمایش داده می‌شود.
- [ ] مبلغ ارسالی عدد صحیح مثبت و بدون جداکننده است.
- [ ] پس از Deposit/Withdrawal داده‌ها از سرور refresh می‌شوند.
- [ ] enumهای عددی به برچسب فارسی نگاشت شده‌اند.
- [ ] همه حالت‌های loading، empty، error و success طراحی شده‌اند.
- [ ] هیچ قابلیت Payment، Commission، Payroll یا Cheque در این محدوده اضافه نشده است.
