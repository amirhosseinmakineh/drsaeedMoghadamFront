# Consultant dashboard TypeScript recovery

## Reviewed sources

Frontend repair base: lower-case `stage`, `a9dc073cbe47ab0e4c96e1d71dd6ad8811a83744`.
Healthy TypeScript and lockfile reference: `87c4825f8bf2d04bb47f702667eff2c7ca7dd1bb`.
The source worktree had no uncommitted user edits. A separate worktree/feature branch preserves other checkouts; no reset/revert of stage was performed.

Backend main: `e80ebb3` (Website intake merge, PR #260). Backend codex-lflotm: `0bd548f` (latest work-day change). Sources were inspected directly, rather than reusing an earlier PR's contracts. Frontend Website merge `9ad9d2a` and PR #380 are preserved; this repair does not apply the separate unmerged #261/#381 implementation from the older conversation.

## Damage audit and recovery

The 49 changes in a9dc073 are additions of generated JavaScript; the broken TypeScript replacement occurred in its parent merge `7de8755`. Current stage has invalid UTF-8 in exactly these reviewed text files:

* `src/app/pages/consultant-dashboard/consultant-dashboard.component.ts`
* `package-lock.json`

The component and lockfile are restored from 87c4825. No other TypeScript file needed restoration. The component retains all 4,831 original lines and methods; its only functional delta from the reference is passing the already-known consultant profile ID to the reservation update service. The reservation child likewise changes only that call. A regression test compares every original method body/name with the repaired source, permitting exactly these call-site changes.

The a9dc073 commit added 49 generated JS siblings. The 87c4825 commit had already added another 126. All 175 source JS files have existing TS counterparts; no TypeScript source imports those JS files explicitly and the Angular build entrypoints are TS. Their transpiled output strips types/decorators and is not an alternative Angular implementation. Only these confirmed generated siblings are deleted. Public PWA scripts, service-worker scripts, Node build/test .mjs scripts, all healthy TS files and financial/referral/homepage changes are preserved.

The Git history does not record the exact external transpile invocation, so its origin is not asserted. The inspected tsconfig files do not configure output into src. Root TypeScript checks now use noEmit; Angular's app config explicitly allows its own output in the existing out-tsc directory. CLI typecheck always passes --noEmit. Source guards reject generated JS (including ignored files), invalid UTF-8 and parser errors; npm build and direct Angular CI jobs run the guard. Gitignore also excludes source JS/maps and out-tsc. A negative guard test confirmed that accidental JS fails the check.

The healthy reference lockfile is retained byte-for-byte, keeping Angular 20.3.33 and the original resolved dependencies. npm ci now succeeds. No dependency version range, secret, API base URL or connection string was changed.

## Backend contract audit

| Capability | Inspected contract | Repair |
| --- | --- | --- |
| Unreported assigned leads | GET /api/Consultant/GetNewLeads | Existing profile/search/name/phone/city/state/type/date/page filters retained; HasSubmittedReport is intentionally omitted on this endpoint. Backend AssignedAt descending, then Id descending order is preserved. Existing highlight behavior is retained. |
| Report/history/patient leads | GET /api/Consultant/GetLeads | Existing filters, report state, response envelope normalization and pagination preserved. |
| Source metadata | main adds SourceType, ConsultationServiceId, ConsultationServiceTitle, ConsultationNotes | Healthy merged Website HTML and fields retained; optional consultationServiceId is added to the TS interface. Yektanet=1, Clinic=2, AdminSheet=3, Website=4. Missing origin remains unknown; it is never guessed. |
| Reservation list | GET /api/Reservation/GetConsultantReservations | Current query fields and existing child views retained, including FromDate/ToDate, state, search and pagination. |
| Reservation edit in codex-lflotm | PUT /api/Reservation/ConsultantReservations/{id} | Original token-owned route remains preferred. |
| Reservation edit in main | PUT /api/Reservation with ReservationId and ConsultantProfileId in the command | Added fallback only for missing route/method (HTTP 404/405), supplying explicit existing IDs. No fallback/replay on HTTP 0/400/401/403/409/500 or IsSuccess=false. |
| Attendance/profile | POST /api/Reservation/ConfirmAttendance; /CompletePatientProfile; GET /DueConfirmations; /ConsultantPatientProfiles | Existing commands and forms retained. |
| Calls and reports | Consultant/RecordLeadCallInitiated, SubmitLeadCallReport, UpdateLeadCallReport, leads/{id}/close | Existing operations/validation retained. |
| Wallet | GET /api/consultant/wallet | Existing wallet child retained and browser-checked. |
| Follow-ups | GET /api/consultant/follow-ups | Existing secretary follow-up child retained and browser-checked. |

The backend branches are not currently equivalent. Website intake and source projections are in main; codex-lflotm lacks that merged feature. Its d9baf12/d11f89c changes add a filtered active-lead index, not a new frontend list contract. Its latest 0bd548f extends work end to 22:00, whereas inspected main and the healthy frontend reference use 21:00. This frontend repair does not silently merge backend branches or invent a work-hours endpoint. Existing working-hour/automatic-absence business is intentionally retained; reconcile that backend branch divergence before deploying a combined backend release.

No allocator, lead state, capacity limit, pickup policy, reservation validation policy, notification business or backend code has been changed. There is no mock data in application code.

## Actual validation and limits

* Restored-lockfile npm ci: passed.
* npm run typecheck (tsc --noEmit -p tsconfig.app.json): passed.
* npm run check:source: passed, 180 TS sources and zero JS files under src.
* Negative source-guard check: correctly fails on an accidentally emitted JS file.
* CLINIC_BACKEND_SOURCE=<backend-main-checkout> npm run test:consultant: 17/17 passed. Includes the reference method-preservation checks, actual frontend service/filter/pagination behavior, all three origin fields, backend-source audit, both observed reservation endpoints and mutation non-replay on business/network failures.
* Angular stage and production configurations are built with restored dependencies; build results are recorded with the PR. Existing three optional-chain/nullish template warnings in admin patient finance are outside this repair and are retained.
* npm run test:seo: passed, seven canonical sitemap URLs.
* Playwright desktop 1440x1000 and mobile 390x844: three origins, Website service/notes, ordering, lead pagination, report filtering, reservation rendering, wallet, secretary follow-ups and existing report/patient/profile navigation. Desktop also performs reservation editing through the observed main fallback and attendance confirmation.

Browser tests intercept HTTP with isolated DTO-shaped fixtures and freeze time to daytime. Service tests use an in-memory HTTP recorder. The actual production build/components run in Chromium, but no live backend database, real allocation, push subscription or production account is exercised. Backend contract-source checks are distinct from a live integration test. Do not describe these tests as a production end-to-end verification.

## Reproduction

```sh
npm ci
npm run check:source
npm run typecheck
CLINIC_BACKEND_SOURCE=<absolute-backend-main-path> npm run test:consultant
npx ng build demo --configuration stage
npm run test:seo
```

Without CLINIC_BACKEND_SOURCE, the sixteen frontend cases run; the optional seventeenth source-audit case is not reported as passed. The immutable healthy Git reference must be available; test CI checkouts fetch history.

For browser tests install Playwright/Chromium in a separate test dependency directory and set PLAYWRIGHT_MODULE to that playwright module path before `npm run test:consultant:browser`. CHROMIUM_EXECUTABLE can point to an existing headless Chromium. Test API calls are intercepted before navigation and no live backend is contacted. Test-only fixtures are confined to scripts; application src contains no fixture endpoint/data.

## Removed generated JavaScript inventory

* `src/app/app.config.js`
* `src/app/app.config.server.js`
* `src/app/app.routes.js`
* `src/app/app.routes.server.js`
* `src/app/auth/auth-dialog.component.js`
* `src/app/basemadual/actions/action-menu/action-menu.component.js`
* `src/app/basemadual/actions/base-button/base-button.component.js`
* `src/app/basemadual/actions/icon-button/icon-button.component.js`
* `src/app/basemadual/actions/segmented-control/segmented-control.component.js`
* `src/app/basemadual/cards/base-card/base-card.component.js`
* `src/app/basemadual/cards/info-card/info-card.component.js`
* `src/app/basemadual/cards/stat-card/stat-card.component.js`
* `src/app/basemadual/date/persian-date.models.js`
* `src/app/basemadual/date/persian-date.pipe.js`
* `src/app/basemadual/date/persian-date.pipe.spec.js`
* `src/app/basemadual/date/persian-date.service.js`
* `src/app/basemadual/date/persian-date.service.spec.js`
* `src/app/basemadual/feedback/badge/badge.component.js`
* `src/app/basemadual/feedback/empty-state/empty-state.component.js`
* `src/app/basemadual/feedback/error-state/error-state.component.js`
* `src/app/basemadual/feedback/loading/loading.component.js`
* `src/app/basemadual/feedback/skeleton/skeleton.component.js`
* `src/app/basemadual/filters/date-range-filter/date-range-filter.component.js`
* `src/app/basemadual/filters/filter-bar/filter-bar.component.js`
* `src/app/basemadual/filters/search-filter/search-filter.component.js`
* `src/app/basemadual/filters/select-filter/select-filter.component.js`
* `src/app/basemadual/forms/form-error/form-error.component.js`
* `src/app/basemadual/forms/form-field/form-field.component.js`
* `src/app/basemadual/forms/number-input/number-input.component.js`
* `src/app/basemadual/forms/persian-date-picker/persian-date-picker.component.js`
* `src/app/basemadual/forms/select-input/select-input.component.js`
* `src/app/basemadual/forms/text-input/text-input.component.js`
* `src/app/basemadual/forms/textarea-input/textarea-input.component.js`
* `src/app/basemadual/index.js`
* `src/app/basemadual/layout/content-container/content-container.component.js`
* `src/app/basemadual/layout/page-header/page-header.component.js`
* `src/app/basemadual/layout/page-shell/page-shell.component.js`
* `src/app/basemadual/layout/section/section.component.js`
* `src/app/basemadual/models/base-ui.models.js`
* `src/app/basemadual/overlays/confirm-dialog/confirm-dialog.component.js`
* `src/app/basemadual/overlays/drawer/drawer.component.js`
* `src/app/basemadual/overlays/modal/modal.component.js`
* `src/app/basemadual/responsive/breakpoints.js`
* `src/app/basemadual/responsive/responsive.helpers.js`
* `src/app/basemadual/responsive/responsive.helpers.spec.js`
* `src/app/basemadual/table/data-table/data-table.component.js`
* `src/app/basemadual/table/table-empty-state/table-empty-state.component.js`
* `src/app/basemadual/table/table-loading/table-loading.component.js`
* `src/app/basemadual/table/table-pagination/table-pagination.component.js`
* `src/app/core/admin/admin-dashboard.service.js`
* `src/app/core/auth/auth.guard.js`
* `src/app/core/auth/auth.service.js`
* `src/app/core/consultant/consultant-dashboard.service.js`
* `src/app/core/consultant/consultant-reward.service.js`
* `src/app/core/follow-up/follow-up.model.js`
* `src/app/core/follow-up/follow-up.service.js`
* `src/app/core/http/api-no-cache.interceptor.js`
* `src/app/core/lead/lead-alert-copy.js`
* `src/app/core/lead/lead-assignment-state.js`
* `src/app/core/lead/lead-enums.js`
* `src/app/core/lead/realtime-lead-alert.service.js`
* `src/app/core/lead/realtime-lead-pickup.service.js`
* `src/app/core/push/lead-alert-sound.js`
* `src/app/core/push/lead-alert.constants.js`
* `src/app/core/push/notification.service.js`
* `src/app/core/push/push-notification.service.js`
* `src/app/core/push/pwa-environment.js`
* `src/app/core/push/web-push-environment.js`
* `src/app/core/reservation/dental-services.js`
* `src/app/core/reservation/reservation-attendance.js`
* `src/app/core/reservation/reservation-sync.service.js`
* `src/app/core/reservation/reservation.model.js`
* `src/app/core/reservation/reservations-realtime.service.js`
* `src/app/core/secretary/secretary-dashboard.service.js`
* `src/app/core/seo/seo.config.js`
* `src/app/core/seo/seo.models.js`
* `src/app/core/toast/toast.service.js`
* `src/app/core/update/app-update.service.js`
* `src/app/features/admin/lead-assignment-settings/lead-assignment-settings.models.js`
* `src/app/features/admin/lead-assignment-settings/lead-assignment-settings.service.js`
* `src/app/features/patient-referrals/admin/pages/admin-patient-referrals/admin-patient-referrals.component.js`
* `src/app/features/patient-referrals/models/patient-referral.models.js`
* `src/app/features/patient-referrals/patient/components/create-referral-form/create-referral-form.component.js`
* `src/app/features/patient-referrals/patient/components/patient-wallet-card/patient-wallet-card.component.js`
* `src/app/features/patient-referrals/patient/pages/patient-referral-dashboard/patient-referral-dashboard.component.js`
* `src/app/features/patient-referrals/secretary/pages/secretary-patient-referrals/secretary-patient-referrals.component.js`
* `src/app/features/patient-referrals/services/patient-referral-api.service.js`
* `src/app/features/patient-referrals/shared/referral-card/referral-card.component.js`
* `src/app/features/patient-referrals/shared/referral-status-badge/referral-status-badge.component.js`
* `src/app/features/patient-referrals/shared/referral-timeline/referral-timeline.component.js`
* `src/app/features/secretary/account/components/secretary-account-shell/secretary-account-shell.component.js`
* `src/app/features/secretary/account/components/secretary-account-summary/secretary-account-summary.component.js`
* `src/app/features/secretary/account/components/secretary-transaction-details/secretary-transaction-details.component.js`
* `src/app/features/secretary/account/components/secretary-transaction-filters/secretary-transaction-filters.component.js`
* `src/app/features/secretary/account/components/secretary-transaction-form/secretary-transaction-form.component.js`
* `src/app/features/secretary/account/components/secretary-transaction-list/secretary-transaction-list.component.js`
* `src/app/features/secretary/account/constants/secretary-account.constants.js`
* `src/app/features/secretary/account/enums/financial-transaction-type.enum.js`
* `src/app/features/secretary/account/enums/payment-method.enum.js`
* `src/app/features/secretary/account/mappers/secretary-account.mapper.js`
* `src/app/features/secretary/account/models/secretary-account.models.js`
* `src/app/features/secretary/account/pages/secretary-account-page/secretary-account-page.component.js`
* `src/app/features/secretary/account/pages/secretary-account-transaction-details-page/secretary-account-transaction-details-page.component.js`
* `src/app/features/secretary/account/pages/secretary-expense-categories-page/secretary-expense-categories-page.component.js`
* `src/app/features/secretary/account/secretary-account.routes.js`
* `src/app/features/secretary/account/services/secretary-account.service.js`
* `src/app/features/secretary/account/utils/transaction-receipt.util.js`
* `src/app/features/secretary/patient-files/patient-file.models.js`
* `src/app/features/secretary/patient-files/patient-files-page.component.js`
* `src/app/features/secretary/patient-files/patient-files.service.js`
* `src/app/features/secretary/patient-finance/models/patient-finance.models.js`
* `src/app/features/secretary/patient-finance/pages/patient-finance-page/patient-finance-page.component.js`
* `src/app/features/secretary/patient-finance/services/patient-finance-api.service.js`
* `src/app/features/secretary/sales/models/secretary-sales.models.js`
* `src/app/features/secretary/sales/pages/create-secretary-sale/create-secretary-sale.component.js`
* `src/app/features/secretary/sales/pages/secretary-sales/secretary-sales.component.js`
* `src/app/features/secretary/sales/pages/secretary-wallet/secretary-wallet.component.js`
* `src/app/features/secretary/sales/services/secretary-sales.service.js`
* `src/app/models/clinic.model.js`
* `src/app/pages/about/about.component.js`
* `src/app/pages/admin-dashboard/admin-accounting-center.component.js`
* `src/app/pages/admin-dashboard/admin-accounting.models.js`
* `src/app/pages/admin-dashboard/admin-accounting.service.js`
* `src/app/pages/admin-dashboard/admin-attendance-table.component.js`
* `src/app/pages/admin-dashboard/admin-consultant-profile.component.js`
* `src/app/pages/admin-dashboard/admin-consultant-rewards.component.js`
* `src/app/pages/admin-dashboard/admin-daily-reservations-report.component.js`
* `src/app/pages/admin-dashboard/admin-lead-assignment-settings.component.js`
* `src/app/pages/admin-dashboard/admin-lead-call-reports.component.js`
* `src/app/pages/admin-dashboard/admin-lead-sheets.component.js`
* `src/app/pages/admin-dashboard/admin-leads-report.component.js`
* `src/app/pages/admin-dashboard/admin-leads-table.component.js`
* `src/app/pages/admin-dashboard/admin-patient-finance-report.component.js`
* `src/app/pages/admin-dashboard/admin-reservations-table.component.js`
* `src/app/pages/admin-dashboard/admin-secretary-sale-services.component.js`
* `src/app/pages/admin-dashboard/admin-secretary-sales-approval.component.js`
* `src/app/pages/consultant-dashboard/consultant-dashboard.component.js`
* `src/app/pages/consultant-dashboard/consultant-reservations-panel.component.js`
* `src/app/pages/consultant-dashboard/consultant-wallet.component.js`
* `src/app/pages/consultant-dashboard/secretary-follow-ups-list.component.js`
* `src/app/pages/contact/contact.component.js`
* `src/app/pages/dashboard/dashboard.component.js`
* `src/app/pages/home/home.component.js`
* `src/app/pages/not-found/not-found.component.js`
* `src/app/pages/secretary-dashboard/secretary-announcement-editor.component.js`
* `src/app/pages/secretary-dashboard/secretary-dashboard.component.js`
* `src/app/pages/secretary-dashboard/secretary-overview.component.js`
* `src/app/pages/secretary-dashboard/secretary-reservation-requests.component.js`
* `src/app/pages/secretary-dashboard/secretary-reservations.component.js`
* `src/app/pages/select-dashboard/select-dashboard.component.js`
* `src/app/pages/service-detail/service-detail.component.js`
* `src/app/pages/services/services.component.js`
* `src/app/shared/base/base-datepicker/base-datepicker.component.js`
* `src/app/shared/base/base-dialog/base-dialog.component.js`
* `src/app/shared/base/empty-state/empty-state.component.js`
* `src/app/shared/base/index.js`
* `src/app/shared/base/loading/loading.component.js`
* `src/app/shared/base/table/table.component.js`
* `src/app/shared/change-detection/coalesce-mark-for-check.js`
* `src/app/shared/dashboard/dashboard-mobile-sidebar.js`
* `src/app/shared/dashboard/dashboard-route-history.js`
* `src/app/shared/forms/ng-model-options.js`
* `src/app/shared/patient-finance/patient-finance-details.component.js`
* `src/app/shared/patient-finance/patient-finance-details.models.js`
* `src/app/shared/routing/service-path.js`
* `src/app/shared/ui/fa-icon/fa-icon.component.js`
* `src/app/shared/ui/toast-container/toast-container.component.js`
* `src/app/utils/file-download.util.js`
* `src/app/utils/iran-datetime.util.js`
* `src/environments/environment.js`
* `src/environments/environment.prod.js`
* `src/environments/environment.stage.js`
* `src/main.js`
* `src/main.server.js`
* `src/server.js`
