import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  NgZone,
  OnDestroy,
  OnInit,
  computed,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, ParamMap, Router, RouterLink } from "@angular/router";
import { Subscription, catchError, finalize, firstValueFrom, map, of, switchMap } from "rxjs";
import { AuthService, RegisterRequest } from "../../core/auth/auth.service";
import {
  CompletePatientProfileRequest,
  ConsultantDashboardService,
  ConsultantDashboardStatus,
  ConsultantLead,
  ConsultantPatientProfile,
  ConsultantReservation,
  CreateReservationRequest,
  SubmitLeadCallReportRequest,
  UpdateReservationRequest,
} from "../../core/consultant/consultant-dashboard.service";
import { PushNotificationService } from "../../core/push/push-notification.service";
import {
  playRealtimeLeadAlertSound,
  primeRealtimeLeadAlertAudio,
} from "../../core/push/lead-alert-sound";
import { NotificationService } from "../../core/push/notification.service";
import { ToastService } from "../../core/toast/toast.service";
import { BaseDialogComponent } from "../../shared/base/base-dialog/base-dialog.component";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { ConsultantReservationsPanelComponent } from "./consultant-reservations-panel.component";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { bindDashboardMobileSidebar } from "../../shared/dashboard/dashboard-mobile-sidebar";
import { bindDashboardRouteHistory } from "../../shared/dashboard/dashboard-route-history";
import { DASHBOARD_MOBILE_LAYOUT_STYLES } from "../../shared/dashboard/dashboard-mobile-layout.styles";
import {
  LeadAssignmentState as LEAD_STATE,
  LeadAssignmentType as LEAD_TYPE,
  canConsultantGoOnline,
  isConsultantOnlineBlockedByTime,
  isConsultantWorkingHours,
  leadAssignmentStateLabel,
  leadAssignmentTypeLabel,
  resolveLeadAssignmentState,
  resolveLeadAssignmentType,
} from "../../core/lead/lead-enums";
import { RealtimeLeadAlertService } from "../../core/lead/realtime-lead-alert.service";
import {
  AttendanceConfirmationStatus,
  readAttendanceStatus,
} from "../../core/reservation/reservation-attendance";

const REALTIME_CALL_WINDOW_MS = 20 * 60 * 1000;
const REALTIME_CALL_WINDOW_MINUTES = 20;
const PENDING_REPORT_PATCH_TTL_MS = 60_000;

const CALL_RESULT_BY_NAME: Record<string, number> = {
  contacted: 1,
  converted: 2,
  rejected: 3,
  noanswer: 4,
  wrongnumber: 5,
  needfollowup: 6,
  busy: 7,
  patienthungup: 8,
};

const CALL_RESULT_DEFAULT_DESCRIPTIONS: Record<number, string> = {
  1: "تماس برقرار شد",
  2: "تبدیل به بیمار",
  3: "رد شد",
  4: "پاسخ نداد",
  5: "شماره اشتباه بود",
  6: "نیاز به پیگیری دارد",
  7: "اشغال",
  8: "قطع تماس توسط بیمار",
};

interface ConsultantProfileForm {
  nationalityCode: string;
  address: string;
}

interface LeadReportForm {
  callResult: number;
  reportDescription: string;
  patientCity: string;
  patientRegion: string;
  attendanceProbabilityPercent: number | null | "";
  secondaryPhoneNumber: string;
}

interface ReservationForm {
  reservationDate: Date | null;
  reservationTime: string;
  secondaryPhoneNumber: string;
  description: string;
  patientCity: string;
  patientRegion: string;
  attendanceProbabilityPercent: number;
  attendancePrediction: string;
}

interface PatientProfileForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  gender: number;
}

interface AddPatientLeadForm {
  userName: string;
  phoneNumber: string;
  patientCity: string;
  patientRegion: string;
  secondaryPhoneNumber: string;
  reportDescription: string;
}

interface ConsultantStatusUpdate {
  isAvailable: boolean | null;
  isOnline: boolean | null;
  canGoOnline: boolean | null;
  onlineStatusBlockReason: string | null | undefined;
}

type ConsultantDashboardSection =
  | "overview"
  | "profile"
  | "leads"
  | "report-edits"
  | "patients"
  | "patient-profiles"
  | "reservations";

type ReportDialogMode = "create" | "edit";
type ReservationDialogMode = "create" | "edit";

interface ConsultantDashboardLink {
  id: ConsultantDashboardSection;
  label: string;
  icon: string;
}

@Component({
  selector: "app-consultant-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BaseDialogComponent,
    BaseDatepickerComponent,
    FaIconComponent,
    ConsultantReservationsPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./consultant-dashboard.component.html",
  styles: [
    `
      .dashboard-layout {
        display: grid;
        grid-template-columns: 300px minmax(0, 1fr);
        gap: 18px;
        width: min(1180px, calc(100% - 36px));
        margin: 0 auto;
        padding: 36px 0 86px;
      }
      .dashboard-sidebar,
      .dashboard-hero,
      .profile-lock-card,
      .status-card,
      .lead-panel,
      .reservation-panel,
      .consultant-panel {
        border: 1px solid var(--line);
        background: var(--surface);
        box-shadow: var(--shadow);
      }
      .dashboard-sidebar {
        position: sticky;
        top: 18px;
        display: grid;
        align-content: start;
        gap: 18px;
        min-height: calc(100vh - 72px);
        padding: 20px;
        border-radius: 34px;
      }
      .dashboard-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        color: var(--text);
        font-weight: 950;
      }
      .dashboard-user-card {
        display: grid;
        gap: 12px;
        padding: 18px;
        border: 1px solid var(--line);
        border-radius: 28px;
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--brand) 12%, transparent),
          color-mix(in srgb, var(--surface-muted) 84%, transparent)
        );
      }
      .avatar {
        display: grid;
        place-items: center;
        width: 62px;
        height: 62px;
        border-radius: 24px;
        background: color-mix(in srgb, var(--brand) 18%, transparent);
        color: var(--brand);
        font-size: 1.45rem;
      }
      .dashboard-user-card small {
        display: block;
        color: var(--muted);
        font-weight: 900;
      }
      .dashboard-user-card h1 {
        margin: 4px 0;
        font-size: 1.35rem;
      }
      .dashboard-user-card b {
        color: var(--brand);
      }
      .dashboard-nav {
        display: grid;
        gap: 10px;
      }
      .dashboard-nav button {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        border: 0;
        padding: 12px 14px;
        border-radius: 18px;
        background: var(--surface-muted);
        color: var(--muted);
        font: inherit;
        font-weight: 900;
        text-align: start;
      }
      .dashboard-nav button.active {
        color: var(--text);
        background: color-mix(in srgb, var(--brand) 16%, var(--surface-muted));
      }
      .logout-btn {
        width: 100%;
        margin-top: auto;
      }
      .dashboard-content {
        display: grid;
        align-content: start;
        gap: 18px;
      }
      .consultant-shell {
        display: grid;
        gap: 18px;
      }
      .dashboard-hero {
        padding: clamp(24px, 4vw, 42px);
        border-radius: 36px;
        background:
          radial-gradient(
            circle at 10% 0,
            color-mix(in srgb, var(--brand-2) 24%, transparent),
            transparent 36%
          ),
          linear-gradient(
            135deg,
            color-mix(in srgb, var(--surface) 88%, transparent),
            var(--cream)
          );
      }
      .dashboard-hero span,
      .panel-heading span {
        display: inline-flex;
        margin-bottom: 12px;
        padding: 6px 14px;
        border-radius: 999px;
        background: color-mix(in srgb, var(--brand) 18%, transparent);
        color: var(--brand);
        font-weight: 950;
      }
      .dashboard-hero h2 {
        margin: 0 0 10px;
        font-size: clamp(1.65rem, 4vw, 2.45rem);
      }
      .dashboard-hero p {
        max-width: 720px;
        margin: 0;
      }
      .feedback {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin: 0;
        padding: 12px 14px;
        border-radius: 20px;
        font-weight: 950;
      }
      .feedback-text {
        flex: 1;
        line-height: 1.6;
      }
      .feedback-dismiss {
        flex: 0 0 auto;
        display: grid;
        place-items: center;
        width: 30px;
        height: 30px;
        margin: 0;
        padding: 0;
        border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
        border-radius: 999px;
        background: color-mix(in srgb, var(--surface) 72%, transparent);
        color: inherit;
        font-size: 1.25rem;
        line-height: 1;
        cursor: pointer;
      }
      .feedback-dismiss span {
        display: block;
        margin-top: -2px;
      }
      .feedback-dismiss:hover {
        background: color-mix(in srgb, var(--text) 10%, var(--surface));
      }
      .feedback.success {
        background: color-mix(in srgb, #22c55e 16%, var(--surface));
        color: #166534;
      }
      .feedback.error {
        background: color-mix(in srgb, var(--danger) 12%, var(--surface));
        color: #991b1b;
      }
      .feedback.info {
        background: color-mix(in srgb, var(--brand) 12%, var(--surface));
        color: var(--text);
      }
      .consultant-overview {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 14px;
      }
      .consultant-overview button {
        display: grid;
        gap: 12px;
        text-align: start;
        border: 1px solid var(--line);
        border-radius: 30px;
        padding: 22px;
        background: color-mix(in srgb, var(--surface) 86%, transparent);
        color: var(--text);
        box-shadow: 0 18px 54px rgba(0, 0, 0, 0.18);
      }
      .consultant-overview span {
        display: grid;
        place-items: center;
        width: 52px;
        height: 52px;
        border-radius: 20px;
        background: color-mix(in srgb, var(--brand) 16%, transparent);
        color: var(--brand);
        font-size: 1.25rem;
      }
      .consultant-overview strong {
        font-size: 1.1rem;
      }
      .consultant-overview small {
        color: var(--muted);
        font-weight: 900;
        line-height: 1.8;
      }
      .profile-lock-card,
      .status-card,
      .lead-panel,
      .reservation-panel,
      .consultant-panel {
        display: grid;
        gap: 16px;
        padding: 18px;
        border-radius: 30px;
      }
      .lock-icon {
        display: grid;
        place-items: center;
        width: 58px;
        height: 58px;
        border-radius: 22px;
        background: color-mix(in srgb, var(--brand) 16%, transparent);
        color: var(--brand);
        font-size: 1.35rem;
      }
      .profile-lock-card h2,
      .panel-heading h2,
      .locked-panel h2 {
        margin: 0;
        font-size: 1.35rem;
      }
      .profile-lock-card p,
      .panel-heading p,
      .locked-panel p {
        margin: 0;
        color: var(--muted);
      }
      .locked-panel {
        grid-template-columns: auto minmax(0, 1fr) auto;
        align-items: center;
      }
      .profile-form,
      .dialog-form {
        display: grid;
        gap: 14px;
      }
      .patient-profile-form {
        gap: 16px;
      }
      .form-section {
        display: grid;
        gap: 12px;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 22px;
        background: color-mix(in srgb, var(--surface-muted) 44%, transparent);
      }
      .form-section h3 {
        margin: 0;
        color: var(--text);
        font-size: 1rem;
      }
      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      label {
        display: grid;
        gap: 8px;
        color: var(--muted);
        font-weight: 950;
      }
      input[readonly] {
        opacity: 0.78;
        background: color-mix(in srgb, var(--surface-muted) 72%, transparent);
      }
      .primary-action,
      .secondary-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 48px;
        border: 0;
        border-radius: 18px;
        padding: 12px 16px;
        font: inherit;
        font-weight: 950;
      }
      .primary-action {
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #1b1712;
      }
      .secondary-action {
        border: 1px solid var(--line);
        background: var(--surface-muted);
        color: var(--text);
      }
      .secondary-action.danger {
        background: color-mix(in srgb, var(--danger) 10%, var(--surface-muted));
        color: #991b1b;
      }
      .primary-action:disabled,
      .secondary-action:disabled {
        cursor: not-allowed;
        opacity: 0.55;
      }
      .push-environment-hint {
        margin: 0.75rem 0 0;
        padding: 0.75rem 0.9rem;
        border-radius: 0.75rem;
        background: rgba(255, 193, 7, 0.12);
        color: #8a6d1d;
        font-size: 0.85rem;
        line-height: 1.6;
      }
      .push-setup-banner {
        margin: 0 0 0.9rem;
        padding: 0.9rem 1rem;
        border-radius: 0.9rem;
        border: 1px solid color-mix(in srgb, var(--accent) 35%, var(--line));
        background: color-mix(in srgb, var(--accent) 10%, var(--surface));
        display: grid;
        gap: 0.75rem;
      }
      .push-setup-banner strong {
        display: block;
        font-size: 0.95rem;
      }
      .push-setup-banner p {
        margin: 0;
        color: var(--text-muted);
        font-size: 0.85rem;
        line-height: 1.7;
      }
      .full {
        width: 100%;
      }
      .compact {
        min-height: 40px;
        border-radius: 999px;
        padding: 9px 13px;
        font-size: 0.86rem;
      }
      .status-summary {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }
      .status-summary div {
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 22px;
        background: color-mix(in srgb, var(--surface-muted) 70%, transparent);
      }
      .status-summary span {
        display: block;
        color: var(--muted);
        font-size: 0.82rem;
        font-weight: 900;
      }
      .status-summary strong {
        display: block;
        color: var(--text);
        font-size: 1.05rem;
      }
      .status-summary .good {
        color: #166534;
      }
      .status-summary .bad {
        color: #991b1b;
      }
      .action-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        isolation: isolate;
      }
      .action-grid > button {
        position: relative;
        z-index: 0;
        min-width: 0;
        background-clip: padding-box;
        transform: translateZ(0);
        backface-visibility: hidden;
        -webkit-font-smoothing: antialiased;
      }
      .panel-heading {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .panel-heading-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-end;
      }
      .lead-filters {
        display: grid;
        grid-template-columns: 1fr 1fr auto;
        gap: 10px;
        align-items: end;
      }
      .lead-filters.patient-filters {
        grid-template-columns: 1fr auto;
      }
      .lead-filters.report-edit-filters {
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr) minmax(0, 0.8fr) auto;
      }
      .loading-copy,
      .empty-copy {
        margin: 0;
        padding: 18px;
        border: 1px dashed var(--line);
        border-radius: 22px;
        color: var(--muted);
        text-align: center;
        font-weight: 900;
      }
      .loading-state {
        display: grid;
        justify-items: center;
        gap: 12px;
        padding: 24px 16px;
        border: 1px solid var(--line);
        border-radius: 22px;
        background: var(--surface-soft);
      }
      .loading-state .loading-copy {
        border: 0;
        padding: 0;
        background: transparent;
      }
      .loading-spinner {
        width: 30px;
        height: 30px;
        border: 3px solid color-mix(in srgb, var(--brand) 24%, transparent);
        border-top-color: var(--brand);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      .lead-list {
        display: grid;
        gap: 12px;
      }
      .lead-card {
        display: grid;
        gap: 12px;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: color-mix(in srgb, var(--surface-muted) 56%, transparent);
      }
      .lead-card.realtime {
        border-color: color-mix(in srgb, var(--brand) 44%, var(--line));
      }
      .lead-card.highlighted {
        border-color: color-mix(in srgb, var(--brand) 70%, var(--line));
        box-shadow: 0 0 0 3px
          color-mix(in srgb, var(--brand) 24%, transparent);
        animation: lead-highlight-pulse 1.2s ease-in-out 3;
      }
      @keyframes lead-highlight-pulse {
        0%,
        100% {
          box-shadow: 0 0 0 3px
            color-mix(in srgb, var(--brand) 24%, transparent);
        }
        50% {
          box-shadow: 0 0 0 6px
            color-mix(in srgb, var(--brand) 36%, transparent);
        }
      }
      .lead-card.expired {
        opacity: 0.72;
      }
      .follow-up-row {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 16px;
        background: color-mix(in srgb, var(--warn) 10%, transparent);
        color: var(--text);
        font-weight: 800;
      }
      .lead-card header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
      }
      .lead-card h3 {
        margin: 0;
        font-size: 1.1rem;
      }
      .lead-card header span {
        color: var(--brand);
        font-weight: 950;
        font-size: 0.82rem;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 30px;
        border-radius: 999px;
        padding: 5px 10px;
        font-size: 0.8rem;
        font-weight: 950;
      }
      .badge.info {
        background: color-mix(in srgb, var(--brand) 16%, transparent);
        color: var(--brand);
      }
      .badge.muted {
        background: color-mix(in srgb, var(--muted) 14%, var(--surface));
        color: var(--muted);
      }
      .lead-badges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
      }
      .badge.success {
        background: color-mix(in srgb, #22c55e 16%, var(--surface));
        color: #166534;
      }
      .badge.warn {
        background: color-mix(in srgb, #f59e0b 16%, var(--surface));
        color: #92400e;
      }
      .badge.danger {
        background: color-mix(in srgb, var(--danger) 12%, var(--surface));
        color: #991b1b;
      }
      .timer-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 18px;
        background: color-mix(in srgb, var(--brand) 10%, transparent);
        color: var(--brand);
        font-weight: 950;
      }
      .timer-row.danger {
        background: color-mix(in srgb, var(--danger) 12%, var(--surface));
        color: #991b1b;
      }
      .timer-countdown {
        cursor: pointer;
        user-select: none;
      }
      .lead-actions {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 10px;
      }
      .call-action {
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        min-height: 52px;
        border-radius: 20px;
        padding: 8px 12px;
        background: color-mix(in srgb, #16a34a 14%, var(--surface));
        color: #14532d;
        font-weight: 950;
      }
      .call-action small,
      .call-action b {
        display: block;
      }
      .call-action small {
        color: var(--muted);
        font-size: 0.76rem;
      }
      .call-action b {
        direction: ltr;
        text-align: right;
        font-size: 1rem;
      }
      .call-icon {
        display: grid;
        place-items: center;
        flex: 0 0 38px;
        width: 38px;
        height: 38px;
        border-radius: 15px;
        background: color-mix(in srgb, #22c55e 22%, transparent);
        font-size: 1.1rem;
      }
      .call-action.disabled {
        pointer-events: none;
        opacity: 0.5;
      }
      .pager {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      .pager button {
        border: 1px solid var(--line);
        border-radius: 999px;
        padding: 9px 16px;
        background: var(--surface-muted);
        color: var(--text);
        font: inherit;
        font-weight: 950;
      }
      .pager button:disabled {
        opacity: 0.45;
        cursor: not-allowed;
      }
      .pager span {
        color: var(--muted);
        font-weight: 950;
      }
      .reservation-list {
        display: grid;
        gap: 10px;
      }
      .reservation-list article {
        display: grid;
        gap: 3px;
        padding: 12px;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: var(--surface-soft);
      }
      .reservation-list strong {
        color: var(--text);
      }
      .reservation-list span,
      .reservation-list time {
        color: var(--muted);
        font-weight: 900;
      }
      .dialog-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      @media (max-width: 980px) {
        .consultant-overview {
          grid-template-columns: 1fr;
        }
        .lead-filters {
          grid-template-columns: 1fr 1fr auto;
        }
        .locked-panel {
          grid-template-columns: 1fr;
        }
        .dashboard-hero,
        .profile-lock-card,
        .status-card,
        .lead-panel,
        .reservation-panel,
        .consultant-panel {
          border-radius: 24px;
          padding: 14px;
          background: var(--surface);
          box-shadow: 0 8px 22px rgba(93, 64, 32, 0.06);
          contain: paint;
          overflow: hidden;
        }
        .status-summary div,
        .lead-card,
        .reservation-list article,
        .form-section {
          background: var(--surface-muted);
        }
        .status-summary,
        .action-grid,
        .lead-filters,
        .lead-actions,
        .two-col {
          grid-template-columns: 1fr;
        }
        .primary-action,
        .secondary-action,
        .call-action {
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        .panel-heading {
          display: grid;
        }
        .dialog-actions {
          grid-template-columns: 1fr 1fr;
        }
      }
      @media (max-width: 560px) {
        .form-section {
          padding: 12px;
          border-radius: 18px;
        }
        .dialog-actions {
          grid-template-columns: 1fr;
        }
      }
    `,
    DASHBOARD_MOBILE_LAYOUT_STYLES,
  ],
})
export class ConsultantDashboardComponent implements OnInit, OnDestroy {
  readonly user = this.auth.user;
  activeSection: ConsultantDashboardSection = "overview";
  mobileSidebarOpen = false;

  readonly dashboardLinks: ConsultantDashboardLink[] = [
    { id: "overview", label: "نمای کلی", icon: "dashboard" },
    { id: "profile", label: "پروفایل", icon: "shield" },
    { id: "leads", label: "لیدها", icon: "clipboard" },
    { id: "report-edits", label: "ویرایش گزارش", icon: "edit" },
    { id: "patients", label: "بیماران", icon: "doctor" },
    { id: "patient-profiles", label: "پرونده‌ها", icon: "clipboard" },
    { id: "reservations", label: "رزروها", icon: "calendar" },
  ];

  readonly displayName = computed(() => {
    const user = this.user();
    const name = [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || "مشاور";
  });
  readonly roleLabel = computed(() => {
    const user = this.user();
    return user ? this.auth.roleLabel(user.role, "fa") : "مشاور";
  });

  profileForm: ConsultantProfileForm = {
    nationalityCode: "",
    address: "",
  };
  profileSaving = false;
  profileId: number | null = null;

  isAvailable = false;
  isOnline = false;
  availabilitySaving = false;
  onlineSaving = false;
  testPushSaving = false;
  enablePushSaving = false;
  pushRegistrationReady = false;
  canGoOnlineFromStatus = false;
  dashboardStatusLoaded = false;
  onlineStatusBlockReason: string | null = null;

  leads: ConsultantLead[] = [];
  leadsLoading = false;
  leadStateFilter: number | null = null;
  leadTypeFilter: number | null = null;
  leadFromDate: Date | null = null;
  leadToDate: Date | null = null;
  readonly leadFromDatePickerLabel = { fa: "از تاریخ", en: "From date" };
  readonly leadToDatePickerLabel = { fa: "تا تاریخ", en: "To date" };
  leadPageNumber = 1;
  leadPageSize = 10;
  leadTotalPages = 1;
  leadTotalCount = 0;
  highlightedLeadAssignmentId: number | null = null;

  reportEditLeads: ConsultantLead[] = [];
  reportEditLeadsLoading = false;
  reportEditSearchTerm = "";
  reportEditStateFilter: number | null = null;
  reportEditTypeFilter: number | null = null;
  reportEditPageNumber = 1;
  reportEditPageSize = 25;
  reportEditTotalPages = 1;
  reportEditTotalCount = 0;
  private reportEditRequestId = 0;
  private reportEditLoadSubscription?: Subscription;

  patientLeads: ConsultantLead[] = [];
  patientLeadsLoading = false;
  patientStateFilter: number | null = null;
  patientPageNumber = 1;
  patientPageSize = 10;
  patientTotalPages = 1;
  patientTotalCount = 0;
  private patientLeadRequestId = 0;

  patientProfiles: ConsultantPatientProfile[] = [];
  patientProfilesLoading = false;
  patientProfileFromDate: Date | null = null;
  patientProfileToDate: Date | null = null;
  patientProfilePageNumber = 1;
  patientProfilePageSize = 10;
  patientProfileTotalPages = 1;
  patientProfileTotalCount = 0;
  private patientProfileRequestId = 0;

  reportDialogOpen = false;
  reportDialogMode: ReportDialogMode = "create";
  reportSaving = false;
  selectedLead: ConsultantLead | null = null;
  reportForm: LeadReportForm = this.emptyLeadReportForm();
  private reportEditOriginalSecondaryPhone: string | null = null;

  reservationDialogOpen = false;
  reservationDialogMode: ReservationDialogMode = "create";
  reservationSaving = false;
  selectedReservationLead: ConsultantLead | null = null;
  selectedEditReservation: ConsultantReservation | null = null;
  private editReservationOriginalAt: string | null = null;
  reservationForm: ReservationForm = {
    reservationDate: null,
    reservationTime: "",
    secondaryPhoneNumber: "",
    description: "",
    patientCity: "",
    patientRegion: "",
    attendanceProbabilityPercent: 80,
    attendancePrediction: "",
  };
  reservations: ConsultantReservation[] = [];
  reservationsLoading = false;
  readonly reservationDatePickerLabel = {
    fa: "تاریخ رزرو",
    en: "Reservation date",
  };

  patientProfileDialogOpen = false;
  patientProfileSaving = false;
  patientProfileRequired = false;
  selectedPatientProfileReservation: ConsultantReservation | null = null;
  patientProfileForm: PatientProfileForm = this.emptyPatientProfileForm();

  addPatientLeadDialogOpen = false;
  addPatientLeadSaving = false;
  addPatientLeadForm: AddPatientLeadForm = this.emptyAddPatientLeadForm();

  feedbackMessage = "";
  feedbackType: "success" | "error" | "info" = "success";

  private currentTime = Date.now();
  private timerId: ReturnType<typeof setInterval> | null = null;
  private pollId: ReturnType<typeof setInterval> | null = null;
  private autoAbsenceId: ReturnType<typeof setInterval> | null = null;
  private autoAbsenceRunning = false;
  private readonly expiringLeadIds = new Set<number>();
  private readonly reportedLeadIds = new Set<number>();
  private readonly reservedLeadIds = new Set<number>();
  private readonly reportingLeadIds = new Set<number>();
  private readonly pendingReportPatches = new Map<
    number,
    { patch: Partial<ConsultantLead>; savedAt: number }
  >();
  private readonly timerExpiredReportPromptedLeadIds = new Set<number>();
  private readonly expirationRetryAfter = new Map<number, number>();
  private feedbackAutoDismissTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingReservationOpenTimer: ReturnType<typeof setTimeout> | null = null;
  private suppressLeadCardActionsUntil = 0;
  private leadStatusRefreshRequestId = 0;
  private timerStarts: Record<string, number> = {};
  private readonly stoppedTimerLeadIds = new Set<number>();
  private readonly phoneRevealedLeadIds = new Set<number>();
  private leadRequestId = 0;
  private reservationRequestId = 0;
  private visibleLeadLoadingRequestId = 0;
  private leadLoadSubscription: Subscription | null = null;
  private reservationLoadSubscription: Subscription | null = null;
  private dashboardStatusSubscription: Subscription | null = null;
  private routeQueryParamsSubscription: Subscription | null = null;
  private destroyed = false;
  private pollIntervalMs = 30000;
  private routeParamsInitialized = false;
  private readonly markViewDirty: () => void;
  readonly ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR;
  private readonly onPushStateSync = (): void => {
    void this.syncPushRegistrationState();
  };

  get browserNotificationPermission(): NotificationPermission | "unsupported" {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  }

  get pushEnvironmentHint(): string | null {
    return this.notifications.getEnvironmentHint();
  }

  get shouldShowPushSetupBanner(): boolean {
    if (!this.isProfileReady()) return false;
    if (this.pushRegistrationReady) return false;
    if (this.notifications.getEnvironmentIssue()) return false;
    return this.browserNotificationPermission !== "denied";
  }

  private readonly pushMessageListener = (event: Event): void => {
    const detail = (
      event as CustomEvent<{
        title?: string;
        body?: string;
        data?: Record<string, string>;
      }>
    ).detail;
    if (!detail) return;

    const pushType = detail.data?.["type"];
    if (pushType === "RealtimeLead") {
      return;
    }

    if (pushType === "test_push") {
      void this.showLeadNotification(
        detail.title || "تست نوتیفیکیشن",
        detail.body ||
          "اگر این پیام را می‌بینید، Web Push روی دستگاه شما فعال است.",
      );
      return;
    }

    if (detail.body) this.showFeedback(detail.body, "success");
  };

  private readonly leadPickedUpListener = (event: Event): void => {
    const detail = (event as CustomEvent<{
      leadId?: number;
      callDeadlineAt?: string | null;
    }>).detail;
    const leadId = detail?.leadId;
    if (!leadId || !this.isProfileReady()) return;

    this.isOnline = false;
    this.realtimeLeadAlerts.stopPolling();
    this.configurePollTimer();
    this.resetRealtimeLeadTimer(leadId, detail?.callDeadlineAt);
    this.activeSection = "leads";
    this.syncSectionQueryParam("leads");
    this.leadTypeFilter = LEAD_TYPE.RealTime;
    this.highlightedLeadAssignmentId = leadId;
    this.refreshDashboard();
    this.loadLeads();
    this.markViewDirty();
    this.scrollToHighlightedLead();
  };

  private readonly destroyRef = inject(DestroyRef);
  private readonly mobileSidebar = bindDashboardMobileSidebar(
    this,
    () => this.markViewDirty(),
    this.destroyRef,
  );

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private consultantApi: ConsultantDashboardService,
    private pushNotifications: PushNotificationService,
    private notifications: NotificationService,
    private realtimeLeadAlerts: RealtimeLeadAlertService,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    this.markViewDirty = createCoalescedMarkForCheck(this.cdr, () => this.destroyed);
    bindDashboardRouteHistory(
      this.router,
      this.route,
      (params) => this.applyLeadRouteParams(params),
      this.destroyRef,
    );
  }

  get visibleDashboardLinks(): ConsultantDashboardLink[] {
    if (!this.isProfileReady()) {
      return [];
    }

    return this.dashboardLinks.filter((item) => item.id !== "profile");
  }

  trackDashboardLink(
    _: number,
    item: ConsultantDashboardLink,
  ): ConsultantDashboardSection {
    return item.id;
  }

  ngOnInit(): void {
    this.closeMobileSidebar();
    this.profileId = this.currentProfileId();
    this.timerStarts = this.readJson<Record<string, number>>(
      this.timerStorageKey(),
      {},
    );
    this.stoppedTimerLeadIds.clear();
    for (const leadAssignmentId of this.readJson<number[]>(
      this.stoppedTimerStorageKey(),
      [],
    )) {
      this.stoppedTimerLeadIds.add(leadAssignmentId);
    }
    this.phoneRevealedLeadIds.clear();
    for (const leadAssignmentId of this.readJson<number[]>(
      this.phoneRevealedStorageKey(),
      [],
    )) {
      this.phoneRevealedLeadIds.add(leadAssignmentId);
    }
    this.realtimeLeadAlerts.initialize();
    void this.syncPushRegistrationState();
    window.addEventListener("consultant-push-message", this.pushMessageListener);
    window.addEventListener("consultant-lead-picked-up", this.leadPickedUpListener);
    window.addEventListener("focus", this.onPushStateSync);
    document.addEventListener("visibilitychange", this.onPushStateSync);
    if (this.isProfileReady()) {
      void this.ensureLeadPushRegistration(false);
    }
    this.applyLeadRouteParams(this.route.snapshot.queryParamMap);
    this.routeQueryParamsSubscription = this.route.queryParamMap.subscribe(
      (params) => {
        this.applyLeadRouteParams(params);
        if (!this.routeParamsInitialized) {
          this.routeParamsInitialized = true;
          return;
        }
        if (this.isProfileReady() && params.get("section") === "leads") {
          this.loadLeads();
        }
      },
    );

    if (this.isProfileReady()) {
      this.refreshDashboard();
      this.startTimers();
      this.syncRealtimeLeadPolling();
      this.syncSectionQueryParam(this.activeSection);
    } else {
      this.activeSection = "profile";
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.realtimeLeadAlerts.stopPolling();
    if (this.feedbackAutoDismissTimer) clearTimeout(this.feedbackAutoDismissTimer);
    this.clearPendingReservationDialogOpen();
    if (this.timerId) clearInterval(this.timerId);
    if (this.pollId) clearInterval(this.pollId);
    if (this.autoAbsenceId) clearInterval(this.autoAbsenceId);
    this.leadLoadSubscription?.unsubscribe();
    this.reportEditLoadSubscription?.unsubscribe();
    this.reservationLoadSubscription?.unsubscribe();
    this.dashboardStatusSubscription?.unsubscribe();
    this.routeQueryParamsSubscription?.unsubscribe();
    window.removeEventListener(
      "consultant-push-message",
      this.pushMessageListener,
    );
    window.removeEventListener(
      "consultant-lead-picked-up",
      this.leadPickedUpListener,
    );
    window.removeEventListener("focus", this.onPushStateSync);
    document.removeEventListener("visibilitychange", this.onPushStateSync);
  }

  currentProfileId(): number | null {
    const user = this.user();
    return (
      this.profileId ?? user?.consultantProfileId ?? user?.profileId ?? null
    );
  }

  isProfileReady(): boolean {
    return this.auth.isRoleProfileComplete(this.user());
  }

  canGoOnline(): boolean {
    return canConsultantGoOnline();
  }

  private markAttendanceReadyForOnline(): void {
    this.isAvailable = true;
    this.dashboardStatusLoaded = true;
    if (this.onlineStatusBlockReason === "ابتدا حضور خود را ثبت کنید") {
      this.onlineStatusBlockReason = null;
    }
    this.markViewDirty();
  }

  setSection(section: ConsultantDashboardSection): void {
    const resolvedSection = this.resolveSection(section);
    if (resolvedSection === this.activeSection) {
      this.syncSectionQueryParam(resolvedSection);
      return;
    }

    this.activeSection = resolvedSection;
    this.syncSectionQueryParam(resolvedSection);
    this.closeMobileSidebar();
    this.markViewDirty();

    if (resolvedSection === "leads") {
      this.loadLeads();
    } else if (resolvedSection === "report-edits") {
      this.loadReportEditLeads();
      this.loadActiveReservationsForLeadActions();
    } else if (resolvedSection === "patients") {
      this.loadPatientLeads();
    } else if (resolvedSection === "patient-profiles") {
      this.loadPatientProfiles();
    } else if (
      resolvedSection === "reservations" &&
      !this.reservations.length &&
      !this.reservationsLoading
    ) {
      this.loadReservations();
    }
  }

  private resolveSection(
    section: ConsultantDashboardSection,
  ): ConsultantDashboardSection {
    if (section === "profile" && this.isProfileReady()) {
      return "overview";
    }

    if (
      (section === "overview" ||
        section === "leads" ||
        section === "report-edits" ||
        section === "patients" ||
        section === "patient-profiles" ||
        section === "reservations") &&
      !this.isProfileReady()
    ) {
      return "profile";
    }

    return section;
  }

  private syncSectionQueryParam(section: ConsultantDashboardSection): void {
    const querySection =
      section === "overview" || section === "profile" ? null : section;
    const currentSection = this.route.snapshot.queryParamMap.get("section");

    if ((currentSection ?? null) === querySection) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: querySection },
      queryParamsHandling: "merge",
      replaceUrl: false,
    });
  }

  private activateSectionFromRoute(
    section: ConsultantDashboardSection,
  ): void {
    const resolvedSection = this.resolveSection(section);
    if (resolvedSection === this.activeSection) return;

    this.activeSection = resolvedSection;
    this.closeMobileSidebar();
    this.markViewDirty();

    if (resolvedSection === "leads") {
      this.loadLeads();
    } else if (resolvedSection === "report-edits") {
      this.loadReportEditLeads();
      this.loadActiveReservationsForLeadActions();
    } else if (resolvedSection === "patients") {
      this.loadPatientLeads();
    } else if (resolvedSection === "patient-profiles") {
      this.loadPatientProfiles();
    } else if (
      resolvedSection === "reservations" &&
      !this.reservations.length &&
      !this.reservationsLoading
    ) {
      this.loadReservations();
    }
  }

  submitProfile(): void {
    const validationError = this.validateProfileForm();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    const userId = this.user()?.userId;
    const profileId = this.currentProfileId() ?? 0;
    if (!profileId && !userId) {
      this.showFeedback("شناسه کاربری یافت نشد. لطفاً دوباره وارد شوید", "error");
      return;
    }

    this.profileSaving = true;
    this.clearFeedback();

    this.consultantApi
      .completeProfile({
        profileId,
        userId,
        nationalityCode: this.profileForm.nationalityCode.trim(),
        address: this.profileForm.address.trim(),
        isCompleteProfile: true,
      })
      .pipe(
        finalize(() => {
          this.profileSaving = false;
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          const profileId =
            this.resolveProfileId(response.data) ??
            this.currentProfileId() ??
            0;
          if (profileId > 0) {
            this.profileId = profileId;
            this.auth.updateConsultantProfile(profileId, true);
            void this.pushNotifications.syncForCurrentProfile(profileId);
          }

          this.showFeedback(
            response.message || "پروفایل مشاور کامل شد",
            "success",
          );
          this.activeSection = "overview";
          this.refreshDashboard();
          this.startTimers();
        },
        error: (error) => {
          const message = this.errorMessage(error, "");
          if (this.isAlreadyCompleteProfileError(message)) {
            const profileId = this.currentProfileId();
            if (profileId) {
              this.profileId = profileId;
              this.auth.updateConsultantProfile(profileId, true);
              void this.pushNotifications.syncForCurrentProfile(profileId);
              this.showFeedback("پروفایل مشاور قبلاً تکمیل شده است", "success");
              this.activeSection = "overview";
              this.refreshDashboard();
              this.startTimers();
              return;
            }
          }

          this.showFeedback(
            this.errorMessage(error, "تکمیل پروفایل انجام نشد"),
            "error",
          );
        },
      });
  }

  setAvailability(isAvailable: boolean): void {
    const profileId = this.requireProfileId();
    if (!profileId) return;

    if (isAvailable && !this.isConsultantWorkingHours()) {
      this.showFeedback(
        "امکان ثبت حضور فقط بین ساعت ۹ صبح تا ۹ شب وجود دارد",
        "error",
      );
      return;
    }

    if (!isAvailable && this.isOnline) {
      this.availabilitySaving = true;
      this.clearFeedback();

      this.consultantApi
        .setOnlineStatus({ profileId, isOnline: false, isOffline: true })
        .pipe(
          switchMap((response) => {
            const status = this.applyConsultantStatusFrom(
              response,
              response.data,
            );
            if (status.isOnline === null) this.isOnline = false;
            return this.consultantApi.setAvailability({
              profileId,
              isAvailable: false,
            });
          }),
          finalize(() => {
            this.availabilitySaving = false;
            this.markViewDirty();
          }),
        )
        .subscribe({
          next: (response) => {
            const status = this.applyConsultantStatusFrom(
              response,
              response.data,
            );
            if (status.isAvailable === null) this.isAvailable = false;
            if (status.isOnline === null) this.isOnline = false;
            this.showFeedback(
              response.message || "عدم حضور شما ثبت شد",
              "success",
            );
            void this.pushNotifications.syncForCurrentProfile(profileId);
            this.configurePollTimer();
            this.refreshDashboard();
          },
          error: (error) =>
            this.showFeedback(
              this.errorMessage(error, "ثبت عدم حضور انجام نشد"),
              "error",
            ),
        });
      return;
    }

    this.availabilitySaving = true;
    this.clearFeedback();

    this.consultantApi
      .setAvailability({ profileId, isAvailable })
      .pipe(
        finalize(() => {
          this.availabilitySaving = false;
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          const status = this.applyConsultantStatusFrom(
            response,
            response.data,
          );
          this.isAvailable = status.isAvailable ?? isAvailable;
          if (!isAvailable && status.isOnline === null) this.isOnline = false;
          if (isAvailable) {
            this.markAttendanceReadyForOnline();
          }
          this.showFeedback(
            response.message ||
              (isAvailable ? "حضور شما ثبت شد" : "عدم حضور شما ثبت شد"),
            "success",
          );
          void this.pushNotifications.syncForCurrentProfile(profileId);
          this.configurePollTimer();
          this.refreshDashboard();
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "ثبت حضور انجام نشد"),
            "error",
          ),
      });
  }

  setOnlineStatus(isOnline: boolean): void {
    const profileId = this.requireProfileId();
    if (!profileId) return;

    if (!isOnline) {
      this.performSetOnlineStatus(profileId, false);
      return;
    }

    if (this.isConsultantOnlineBlockedByTime()) {
      this.showFeedback(
        "امکان آنلاین شدن بعد از ساعت ۹ شب وجود ندارد",
        "error",
      );
      return;
    }

    this.performSetOnlineStatus(profileId, true);
  }

  private performSetOnlineStatus(
    profileId: number,
    isOnline: boolean,
    options: { silent?: boolean } = {},
  ): void {
    this.onlineSaving = true;
    if (!options.silent) this.clearFeedback();

    this.consultantApi
      .setOnlineStatus({ profileId, isOnline, isOffline: !isOnline })
      .pipe(
        finalize(() => {
          this.onlineSaving = false;
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          const status = this.applyConsultantStatusFrom(
            response,
            response.data,
          );
          if (isOnline) {
            this.isOnline = true;
          } else if (status.isOnline === null) {
            this.isOnline = false;
          }
          if (isOnline && status.isAvailable === null) this.isAvailable = true;
          if (!options.silent) {
            this.showFeedback(
              response.message ||
                (isOnline ? "شما آنلاین شدید" : "شما آفلاین شدید"),
              "success",
            );
          }
          if (isOnline) {
            void this.ensureLeadPushRegistration(true);
          } else {
            this.realtimeLeadAlerts.stopPolling();
          }
          void this.pushNotifications.syncForCurrentProfile(profileId);
          this.syncRealtimeLeadPolling();
          this.configurePollTimer();
          if (!options.silent) {
            this.refreshDashboard();
          }
        },
        error: (error) => {
          if (!options.silent) {
            this.showFeedback(
              this.errorMessage(error, "تغییر وضعیت آنلاین انجام نشد"),
              "error",
            );
          }
        },
      });
  }

  private setConsultantOfflineQuiet(): void {
    const profileId = this.currentProfileId();
    if (!profileId || !this.isOnline) return;
    this.performSetOnlineStatus(profileId, false, { silent: true });
  }

  private forceConsultantOnlineAfterReportSubmit(
    profileId: number,
    attempt = 0,
  ): void {
    this.consultantApi
      .setOnlineStatus({ profileId, isOnline: true, isOffline: false })
      .subscribe({
        next: () => {
          this.isOnline = true;
          this.onlineStatusBlockReason = null;
          void this.ensureLeadPushRegistration(true);
          void this.pushNotifications.syncForCurrentProfile(profileId);
          this.syncRealtimeLeadPolling();
          this.configurePollTimer();
          this.markViewDirty();
        },
        error: () => {
          if (attempt < 2) {
            setTimeout(
              () =>
                this.forceConsultantOnlineAfterReportSubmit(profileId, attempt + 1),
              800,
            );
          }
        },
      });
  }

  private restoreOnlineAfterRequiredAction(
    options: {
      notifyWhenBlocked?: boolean;
      ignoreCanGoOnlineCheck?: boolean;
    } = {},
  ): void {
    const profileId = this.currentProfileId();
    if (!profileId || this.isOnline) return;

    if (this.isConsultantOnlineBlockedByTime()) {
      if (options.notifyWhenBlocked) {
        this.showFeedback(
          "امکان آنلاین شدن بعد از ساعت ۹ شب وجود ندارد",
          "info",
        );
      }
      return;
    }

    this.performSetOnlineStatus(profileId, true, { silent: true });
  }

  sendTestPushNotification(): void {
    const profileId = this.requireProfileId();
    if (!profileId) return;

    const environmentIssue = this.notifications.getEnvironmentIssue();
    if (environmentIssue) {
      this.showFeedback(environmentIssue, "error");
      return;
    }

    this.testPushSaving = true;
    this.clearFeedback();

    void this.pushNotifications
      .prepareTestPush(profileId)
      .then(async (prepared) => {
        if (!prepared.ok || !prepared.deviceToken) {
          throw new Error(prepared.message);
        }

        const response = await firstValueFrom(
          this.consultantApi.sendTestPushNotification({
            profileId,
            deviceToken: prepared.deviceToken,
          }),
        );
        await this.syncPushRegistrationState();
        const message =
          response.message ||
          "نوتیفیکیشن تست ارسال شد. اگر پیام سیستمی ندیدید، اجازه Notification را بررسی کنید.";
        void this.showLeadNotification("تست نوتیفیکیشن", message);
        this.showFeedback(message, "success");
      })
      .catch((error) => {
        this.showFeedback(
          this.errorMessage(error, "ارسال نوتیفیکیشن تست انجام نشد"),
          "error",
        );
      })
      .finally(() => {
        this.testPushSaving = false;
        this.markViewDirty();
      });
  }

  enablePushNotifications(): void {
    const profileId = this.requireProfileId();
    if (!profileId) return;

    primeRealtimeLeadAlertAudio();
    this.enablePushSaving = true;
    this.clearFeedback();

    void this.pushNotifications
      .enablePushForCurrentProfile(profileId)
      .then(async (result) => {
        await this.syncPushRegistrationState();
        const message = result.ok
          ? `${result.message} حالا «تست نوتیفیکیشن» را بزنید.`
          : result.message;
        this.showFeedback(message, result.ok ? "success" : "error");
      })
      .catch((error) => {
        this.showFeedback(
          this.errorMessage(error, "فعال‌سازی نوتیفیکیشن انجام نشد"),
          "error",
        );
      })
      .finally(() => {
        this.enablePushSaving = false;
        this.markViewDirty();
      });
  }

  refreshDashboard(): void {
    if (!this.isProfileReady()) return;
    this.loadDashboardStatus(() => {
      this.loadLeads();
      this.loadReservations();
    });
  }

  private refreshDashboardAfterReport(
    leadAssignmentId: number,
    afterLoad?: () => void,
  ): void {
    if (!this.isProfileReady()) {
      afterLoad?.();
      return;
    }

    this.loadDashboardStatus(() => {
      const profileId = this.currentProfileId();
      if (!profileId) {
        afterLoad?.();
        return;
      }

      let leadsLoaded = false;
      let leadStatusLoaded = false;
      const maybeFinish = () => {
        if (!leadsLoaded || !leadStatusLoaded) return;
        if (this.activeSection === "report-edits") {
          this.loadReportEditLeads();
        }
        afterLoad?.();
      };

      const leadStatusRequestId = ++this.leadStatusRefreshRequestId;
      this.consultantApi
        .getLeads({
          profileId,
          pageNumber: 1,
          pageSize: 100,
        })
        .pipe(finalize(() => this.markViewDirty()))
        .subscribe({
          next: (response) => {
            if (leadStatusRequestId !== this.leadStatusRefreshRequestId) return;
            this.applyConsultantStatusFrom(response.source, response.raw);
            const updatedLead = (response.items ?? []).find(
              (item) => this.leadId(item) === leadAssignmentId,
            );
            if (updatedLead) {
              this.mergeLeadFromBackend(updatedLead);
            }
            this.syncReportedLeadIdsFromLeads(this.leads);
            this.syncReservedLeadIdsFromLeads(this.leads);
            leadStatusLoaded = true;
            maybeFinish();
          },
          error: () => {
            if (leadStatusRequestId !== this.leadStatusRefreshRequestId) return;
            leadStatusLoaded = true;
            maybeFinish();
          },
        });

      const requestId = ++this.leadRequestId;
      this.consultantApi
        .getLeads({
          profileId,
          leadAssignmentState: this.effectiveLeadStateFilter(),
          leadAssignmentType: this.leadTypeFilter,
          pageNumber: this.leadPageNumber,
          pageSize: this.leadPageSize,
        })
        .pipe(finalize(() => this.markViewDirty()))
        .subscribe({
          next: (response) => {
            if (requestId !== this.leadRequestId) return;
            this.applyConsultantStatusFrom(response.source, response.raw);
            const items = (response.items ?? []).filter(
              (lead) => this.leadType(lead) !== LEAD_TYPE.ConsultantPatient,
            );
            this.commitLeadsFromApi(items);
            this.leadTotalCount = response.totalCount ?? this.leads.length;
            this.leadTotalPages = Math.max(
              1,
              response.totalPages ||
                Math.ceil(this.leadTotalCount / this.leadPageSize),
            );
            this.hydrateRealtimeTimers();
            leadsLoaded = true;
            maybeFinish();
          },
          error: () => {
            leadsLoaded = true;
            maybeFinish();
          },
        });
    });
  }

  setLeadFromDate(date: Date): void {
    this.leadFromDate = date;
    this.markViewDirty();
  }

  setLeadToDate(date: Date): void {
    this.leadToDate = date;
    this.markViewDirty();
  }

  applyLeadFilters(): void {
    const validationError = this.validateLeadDateFilters();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    this.leadPageNumber = 1;
    this.loadLeads();
  }

  private validateLeadDateFilters(): string | null {
    if (
      this.leadFromDate &&
      this.leadToDate &&
      this.startOfDay(this.leadFromDate).getTime() >
        this.startOfDay(this.leadToDate).getTime()
    ) {
      return "تاریخ شروع نباید بعد از تاریخ پایان باشد";
    }

    return null;
  }

  private applyLeadRouteParams(params: ParamMap): void {
    if (!this.isProfileReady()) {
      this.activeSection = "profile";
      return;
    }

    const section = params.get("section") as ConsultantDashboardSection | null;
    if (
      section &&
      [
        "overview",
        "profile",
        "leads",
        "report-edits",
        "patients",
        "patient-profiles",
        "reservations",
      ].includes(section)
    ) {
      this.activateSectionFromRoute(section);
    } else if (params.get("type")) {
      this.activateSectionFromRoute("leads");
    } else {
      this.activateSectionFromRoute("overview");
    }

    if (params.get("section") !== "leads" && !params.get("type")) return;

    const type = params.get("type");
    if (type === "realtime") {
      this.leadTypeFilter = LEAD_TYPE.RealTime;
      this.leadStateFilter = null;
    }

    const leadAssignmentId = params.get("leadAssignmentId");
    if (leadAssignmentId) {
      const parsedId = Number(leadAssignmentId);
      if (Number.isFinite(parsedId)) {
        this.highlightedLeadAssignmentId = parsedId;
      }
    }

    this.leadPageNumber = 1;
  }

  private scrollToHighlightedLead(): void {
    const targetId = this.highlightedLeadAssignmentId;
    if (!targetId) return;

    const inLeads = this.leads.some((lead) => this.leadId(lead) === targetId);
    const inPatients = this.patientLeads.some(
      (lead) => this.leadId(lead) === targetId,
    );
    if (!inLeads && !inPatients) return;

    const elementId = inPatients ? `patient-${targetId}` : `lead-${targetId}`;
    this.markViewDirty();
    setTimeout(() => {
      document
        .getElementById(elementId)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => {
        if (this.highlightedLeadAssignmentId === targetId) {
          this.highlightedLeadAssignmentId = null;
          this.markViewDirty();
        }
      }, 4000);
    }, 50);
  }

  private effectiveLeadStateFilter(): number | null {
    return this.leadStateFilter;
  }

  private reservationSecondaryPhoneForLead(
    leadAssignmentId: number,
  ): string {
    const reservation = this.reservationForLead(leadAssignmentId);
    if (!reservation) return "";

    return (
      reservation.secondaryPhoneNumber?.trim() ||
      reservation.SecondaryPhoneNumber?.trim() ||
      ""
    );
  }

  private reservationForLead(
    leadAssignmentId: number,
  ): ConsultantReservation | null {
    return (
      this.reservations.find((reservation) => {
        const id = this.numberOrNull(
          reservation.leadAssignmentId ?? reservation.LeadAssignmentId ?? null,
        );
        return id === leadAssignmentId;
      }) ?? null
    );
  }

  changeLeadPage(page: number): void {
    this.leadPageNumber = Math.min(
      Math.max(1, page),
      Math.max(1, this.leadTotalPages),
    );
    this.loadLeads();
  }

  applyPatientFilters(): void {
    this.patientPageNumber = 1;
    this.loadPatientLeads();
  }

  changePatientPage(page: number): void {
    this.patientPageNumber = Math.min(
      Math.max(1, page),
      Math.max(1, this.patientTotalPages),
    );
    this.loadPatientLeads();
  }

  loadPatientLeads(): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    const requestId = ++this.patientLeadRequestId;
    this.patientLeadsLoading = true;
    this.clearFeedback();

    this.consultantApi
      .getLeads({
        profileId,
        leadAssignmentState: this.patientStateFilter,
        leadAssignmentType: LEAD_TYPE.ConsultantPatient,
        pageNumber: this.patientPageNumber,
        pageSize: this.patientPageSize,
      })
      .pipe(
        finalize(() => {
          if (requestId === this.patientLeadRequestId) {
            this.patientLeadsLoading = false;
          }
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.patientLeadRequestId) return;
          this.patientLeads = response.items ?? [];
          this.syncReportedLeadIdsFromLeads(this.patientLeads);
          this.syncReservedLeadIdsFromLeads(this.patientLeads);
          this.patientTotalCount = response.totalCount ?? this.patientLeads.length;
          this.patientPageSize = response.pageSize || this.patientPageSize;
          this.patientTotalPages = Math.max(
            1,
            response.totalPages ||
              Math.ceil(this.patientTotalCount / this.patientPageSize),
          );
          this.patientPageNumber = Math.min(
            Math.max(1, response.pageNumber || this.patientPageNumber),
            this.patientTotalPages,
          );
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "دریافت بیماران انجام نشد"),
            "error",
          ),
      });
  }

  applyPatientProfileFilters(): void {
    this.patientProfilePageNumber = 1;
    this.loadPatientProfiles();
  }

  changePatientProfilePage(page: number): void {
    this.patientProfilePageNumber = Math.min(
      Math.max(1, page),
      Math.max(1, this.patientProfileTotalPages),
    );
    this.loadPatientProfiles();
  }

  loadPatientProfiles(): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    const requestId = ++this.patientProfileRequestId;
    this.patientProfilesLoading = true;
    this.clearFeedback();

    this.consultantApi
      .getConsultantPatientProfiles({
        consultantProfileId: profileId,
        from: this.formatFilterDate(this.patientProfileFromDate),
        to: this.formatFilterDate(this.patientProfileToDate),
        pageNumber: this.patientProfilePageNumber,
        pageSize: this.patientProfilePageSize,
      })
      .pipe(
        finalize(() => {
          if (requestId === this.patientProfileRequestId) {
            this.patientProfilesLoading = false;
          }
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.patientProfileRequestId) return;
          this.patientProfiles = response.items ?? [];
          this.patientProfileTotalCount =
            response.totalCount ?? this.patientProfiles.length;
          this.patientProfilePageSize =
            response.pageSize || this.patientProfilePageSize;
          this.patientProfileTotalPages = Math.max(
            1,
            response.totalPages ||
              Math.ceil(
                this.patientProfileTotalCount / this.patientProfilePageSize,
              ),
          );
          this.patientProfilePageNumber = Math.min(
            Math.max(1, response.pageNumber || this.patientProfilePageNumber),
            this.patientProfileTotalPages,
          );
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "دریافت پرونده‌های بیمار انجام نشد"),
            "error",
          ),
      });
  }

  patientProfileName(profile: ConsultantPatientProfile): string {
    return profile.patientName?.trim() || profile.PatientName?.trim() || "بدون نام";
  }

  patientProfilePhone(profile: ConsultantPatientProfile): string {
    return (
      profile.patientPhoneNumber?.trim() ||
      profile.PatientPhoneNumber?.trim() ||
      "-"
    );
  }

  patientProfileCreatedAt(profile: ConsultantPatientProfile): string {
    return profile.profileCreatedAt || profile.ProfileCreatedAt || "";
  }

  patientProfileReservationAt(profile: ConsultantPatientProfile): string {
    return profile.reservationAt || profile.ReservationAt || "";
  }

  private formatFilterDate(value: Date | null): string | undefined {
    if (!value) return undefined;
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  openAddPatientLeadDialog(): void {
    if (!this.isProfileReady()) {
      this.showFeedback("ابتدا پروفایل مشاور را تکمیل کنید", "info");
      this.setSection("profile");
      return;
    }

    this.addPatientLeadForm = this.emptyAddPatientLeadForm();
    this.addPatientLeadDialogOpen = true;
    this.markViewDirty();
  }

  closeAddPatientLeadDialog(): void {
    this.addPatientLeadDialogOpen = false;
    this.addPatientLeadSaving = false;
    this.addPatientLeadForm = this.emptyAddPatientLeadForm();
    this.markViewDirty();
  }

  submitAddPatientLead(): void {
    const profileId = this.requireProfileId();
    if (!profileId) return;

    const userName = this.addPatientLeadForm.userName.trim();
    const phoneNumber = this.addPatientLeadForm.phoneNumber.trim();
    const secondaryPhone = this.addPatientLeadForm.secondaryPhoneNumber.trim();

    if (!userName) {
      this.showFeedback("نام بیمار الزامی است", "error");
      return;
    }

    if (!/^09\d{9}$/.test(phoneNumber)) {
      this.showFeedback("شماره موبایل باید با 09 شروع شود و ۱۱ رقم باشد", "error");
      return;
    }

    if (secondaryPhone && !/^09\d{9}$/.test(secondaryPhone)) {
      this.showFeedback("شماره تماس دوم معتبر نیست", "error");
      return;
    }

    this.addPatientLeadSaving = true;
    this.clearFeedback();

    this.consultantApi
      .createConsultantPatientLead({
        consultantProfileId: profileId,
        userName,
        phoneNumber,
        ...(this.addPatientLeadForm.patientCity.trim()
          ? { patientCity: this.addPatientLeadForm.patientCity.trim() }
          : {}),
        ...(this.addPatientLeadForm.patientRegion.trim()
          ? { patientRegion: this.addPatientLeadForm.patientRegion.trim() }
          : {}),
        ...(secondaryPhone ? { secondaryPhoneNumber: secondaryPhone } : {}),
        ...(this.addPatientLeadForm.reportDescription.trim()
          ? { reportDescription: this.addPatientLeadForm.reportDescription.trim() }
          : {}),
      })
      .pipe(
        finalize(() => {
          this.addPatientLeadSaving = false;
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          const leadAssignmentId =
            response.data?.leadAssignmentId ??
            (response.data as { LeadAssignmentId?: number } | undefined)
              ?.LeadAssignmentId ??
            null;
          this.closeAddPatientLeadDialog();
          this.showFeedback("بیمار با موفقیت ثبت شد", "success");
          this.setSection("patients");
          this.highlightedLeadAssignmentId = leadAssignmentId;
          this.loadPatientLeads();
          if (leadAssignmentId) {
            setTimeout(() => this.scrollToHighlightedLead(), 250);
          }
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "ثبت بیمار / لید انجام نشد"),
            "error",
          ),
      });
  }

  openReportDialog(lead: ConsultantLead): void {
    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId || this.isReportDisabled(lead)) return;

    this.clearPendingReservationDialogOpen();
    this.reportDialogMode = "create";
    this.reportingLeadIds.add(leadAssignmentId);
    this.selectedLead = lead;
    this.reportEditOriginalSecondaryPhone = null;
    this.reportForm = this.emptyLeadReportForm(leadAssignmentId);
    this.reportDialogOpen = true;
    this.markViewDirty();
  }

  handleEditReportClick(event: Event, lead: ConsultantLead): void {
    event.preventDefault();
    event.stopPropagation();
    this.openEditReportDialog(lead);
  }

  openEditReportDialog(lead: ConsultantLead): void {
    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId || !this.isLeadReportEditable(lead)) return;

    this.clearPendingReservationDialogOpen();
    if (this.reservationDialogOpen) {
      this.closeReservationDialog();
    }
    this.reportDialogMode = "edit";
    this.selectedLead = lead;
    this.reportForm = this.leadReportFormFromLead(lead);
    this.reportEditOriginalSecondaryPhone =
      this.reportForm.secondaryPhoneNumber.trim() || null;
    this.reportDialogOpen = true;
    this.markViewDirty();
  }

  closeReportDialog(
    options: { releaseReportLock?: boolean; force?: boolean } = {},
  ): void {
    if (
      !options.force &&
      !this.isReportDialogClosable() &&
      (options.releaseReportLock ?? true)
    ) {
      return;
    }

    const releaseReportLock = options.releaseReportLock ?? true;
    const leadAssignmentId = this.selectedLead
      ? this.leadId(this.selectedLead)
      : null;
    const isConsultantPatientLead = this.selectedLead
      ? this.leadType(this.selectedLead) === LEAD_TYPE.ConsultantPatient
      : false;

    this.clearPendingReservationDialogOpen();
    this.reportDialogOpen = false;
    this.reportDialogMode = "create";
    this.reportSaving = false;
    this.selectedLead = null;
    this.reportEditOriginalSecondaryPhone = null;
    this.suppressLeadCardActionsUntil = Date.now() + 500;

    if (
      releaseReportLock &&
      leadAssignmentId &&
      !this.reportedLeadIds.has(leadAssignmentId)
    ) {
      this.reportingLeadIds.delete(leadAssignmentId);
      this.timerExpiredReportPromptedLeadIds.delete(leadAssignmentId);
    }
  }

  isReportDialogClosable(): boolean {
    return this.reportDialogMode === "edit";
  }

  submitLeadReport(): void {
    const validationError = this.validateLeadReportForm();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    const profileId = this.requireProfileId();
    const lead = this.selectedLead;
    const leadAssignmentId = lead ? this.leadId(lead) : null;
    if (!profileId || !lead || !leadAssignmentId) return;

    this.reportSaving = true;
    this.clearFeedback();

    const rawAttendanceProbability =
      this.reportForm.attendanceProbabilityPercent;
    const attendanceProbabilityPercent =
      rawAttendanceProbability === null ||
      rawAttendanceProbability === undefined ||
      rawAttendanceProbability === ""
        ? null
        : Number(rawAttendanceProbability);
    if (
      attendanceProbabilityPercent !== null &&
      (!Number.isFinite(attendanceProbabilityPercent) ||
        attendanceProbabilityPercent < 0 ||
        attendanceProbabilityPercent > 100)
    ) {
      this.showFeedback("درصد احتمال حضور باید بین ۰ تا ۱۰۰ باشد", "error");
      this.reportSaving = false;
      return;
    }

    const secondaryPhone = this.reportForm.secondaryPhoneNumber.trim();
    if (secondaryPhone && !/^09\d{9}$/.test(secondaryPhone)) {
      this.showFeedback("شماره تماس دوم بیمار معتبر نیست", "error");
      this.reportSaving = false;
      return;
    }

    const payload: SubmitLeadCallReportRequest = {
      leadAssignmentId,
      consultantProfileId: profileId,
      callResult: Number(this.reportForm.callResult),
      reportDescription: this.normalizedReportDescription(
        Number(this.reportForm.callResult),
      ),
      patientCity: this.reportForm.patientCity.trim(),
      patientRegion: this.reportForm.patientRegion.trim(),
      ...(attendanceProbabilityPercent === null
        ? {}
        : { attendanceProbabilityPercent }),
      ...(secondaryPhone ? { secondaryPhoneNumber: secondaryPhone } : {}),
    };

    const wasOffline = !this.isOnline;

    this.consultantApi
      .submitLeadCallReport(payload)
      .pipe(
        switchMap((response) => {
          if (wasOffline) {
            return of({ reportResponse: response, onlineResponse: null });
          }

          return this.consultantApi
            .setOnlineStatus({ profileId, isOnline: true, isOffline: false })
            .pipe(
              map((onlineResponse) => ({ reportResponse: response, onlineResponse })),
              catchError(() => of({ reportResponse: response, onlineResponse: null })),
            );
        }),
        finalize(() => {
          this.reportSaving = false;
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: ({ reportResponse: response, onlineResponse }) => {
          const data = response.data;
          const nextState =
            data?.leadAssignmentState ?? LEAD_STATE.Contacted;
          const callResult =
            data?.callResult ?? Number(this.reportForm.callResult);
          const reportSubmittedAt =
            data?.reportSubmittedAt ?? new Date().toISOString();
          const reportPatch = this.buildSubmittedReportPatch(
            callResult,
            nextState,
            reportSubmittedAt,
            {
              reportDescription: payload.reportDescription,
              patientCity: payload.patientCity,
              patientRegion: payload.patientRegion,
            },
          );

          this.rememberPendingReportPatch(leadAssignmentId, reportPatch);
          this.markLeadReported(leadAssignmentId, nextState, true);
          this.updateLeadInCollections(leadAssignmentId, reportPatch);
          this.releaseLeadReportSession(leadAssignmentId);
          this.applyConsultantStatusFrom(response, data);
          if (!wasOffline) {
            if (onlineResponse) {
              this.isOnline = true;
              this.onlineStatusBlockReason = null;
              void this.ensureLeadPushRegistration(true);
              void this.pushNotifications.syncForCurrentProfile(profileId);
              this.syncRealtimeLeadPolling();
              this.configurePollTimer();
            } else {
              this.forceConsultantOnlineAfterReportSubmit(profileId);
            }
          } else {
            this.isOnline = false;
            this.syncRealtimeLeadPolling();
            this.configurePollTimer();
          }
          this.reservationDialogOpen = false;
          this.selectedReservationLead = null;
          this.suppressLeadCardActionsUntil = Date.now() + 600;
          this.closeReportDialog({ releaseReportLock: true, force: true });
          this.showFeedback("گزارش ثبت شد", "success");
          this.markViewDirty();

          const shouldOpenReservation =
            this.readShouldOpenReservationPage(data) &&
            this.isSuccessfulCallResult(callResult);
          if (shouldOpenReservation) {
            const updatedLead =
              this.leads.find((item) => this.leadId(item) === leadAssignmentId) ??
              lead;
            this.scheduleReservationDialogOpen(
              updatedLead,
              secondaryPhone || undefined,
            );
          }

          this.refreshDashboardAfterReport(leadAssignmentId, () => {
            if (!wasOffline) {
              this.forceConsultantOnlineAfterReportSubmit(profileId);
            }
            if (this.activeSection === "patients") {
              this.loadPatientLeads();
            }
          });
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "ثبت گزارش تماس انجام نشد"),
            "error",
          ),
      });
  }

  submitEditedLeadReport(): void {
    const validationError = this.validateLeadReportForm();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    const profileId = this.requireProfileId();
    const lead = this.selectedLead;
    const leadAssignmentId = lead ? this.leadId(lead) : null;
    if (!profileId || !lead || !leadAssignmentId) return;

    this.reportSaving = true;
    this.clearFeedback();

    const rawAttendanceProbability = this.reportForm.attendanceProbabilityPercent;
    const attendanceProbabilityPercent =
      rawAttendanceProbability === null ||
      rawAttendanceProbability === undefined ||
      rawAttendanceProbability === ""
        ? null
        : Number(rawAttendanceProbability);
    if (
      attendanceProbabilityPercent !== null &&
      (!Number.isFinite(attendanceProbabilityPercent) ||
        attendanceProbabilityPercent < 0 ||
        attendanceProbabilityPercent > 100)
    ) {
      this.showFeedback("درصد احتمال حضور باید بین ۰ تا ۱۰۰ باشد", "error");
      this.reportSaving = false;
      return;
    }

    const secondaryPhone = this.reportForm.secondaryPhoneNumber.trim();
    if (secondaryPhone && !/^09\d{9}$/.test(secondaryPhone)) {
      this.showFeedback("شماره تماس دوم بیمار معتبر نیست", "error");
      this.reportSaving = false;
      return;
    }

    const originalSecondaryPhone = this.reportEditOriginalSecondaryPhone ?? "";
    const secondaryPhoneChanged = secondaryPhone !== originalSecondaryPhone;

    const payload = {
      leadAssignmentId,
      consultantProfileId: profileId,
      callResult: Number(this.reportForm.callResult),
      reportDescription: this.normalizedReportDescription(
        Number(this.reportForm.callResult),
      ),
      patientCity: this.reportForm.patientCity.trim(),
      patientRegion: this.reportForm.patientRegion.trim(),
      ...(attendanceProbabilityPercent === null
        ? {}
        : { attendanceProbabilityPercent }),
      ...(secondaryPhoneChanged && secondaryPhone
        ? { secondaryPhoneNumber: secondaryPhone }
        : {}),
    };

    this.consultantApi
      .updateLeadCallReport(payload)
      .pipe(
        finalize(() => {
          this.reportSaving = false;
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          const callResult =
            response.data?.callResult ?? Number(this.reportForm.callResult);
          const nextState =
            response.data?.leadAssignmentState ?? LEAD_STATE.Contacted;
          const reportSubmittedAt =
            response.data?.reportSubmittedAt ?? new Date().toISOString();
          const reportPatch = this.buildSubmittedReportPatch(
            callResult,
            nextState,
            reportSubmittedAt,
            {
              reportDescription: payload.reportDescription,
              patientCity: payload.patientCity,
              patientRegion: payload.patientRegion,
            },
          );

          this.rememberPendingReportPatch(leadAssignmentId, reportPatch);
          this.markLeadReported(leadAssignmentId, nextState, true);
          this.updateLeadInCollections(leadAssignmentId, reportPatch);
          this.releaseLeadReportSession(leadAssignmentId);
          this.applyConsultantStatusFrom(response, response.data);
          this.closeReportDialog({ releaseReportLock: true });
          this.showFeedback("گزارش ویرایش شد", "success");
          if (this.activeSection === "report-edits") {
            this.loadReportEditLeads();
          }
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "ویرایش گزارش تماس انجام نشد"),
            "error",
          ),
      });
  }

  private emptyLeadReportForm(leadAssignmentId?: number): LeadReportForm {
    return {
      callResult: 1,
      reportDescription: "",
      patientCity: "",
      patientRegion: "",
      attendanceProbabilityPercent: null,
      secondaryPhoneNumber: leadAssignmentId
        ? this.reservationSecondaryPhoneForLead(leadAssignmentId)
        : "",
    };
  }

  private leadReportFormFromLead(lead: ConsultantLead): LeadReportForm {
    const leadAssignmentId = this.leadId(lead);
    const attendanceProbability =
      lead.attendanceProbabilityPercent ??
      lead.AttendanceProbabilityPercent ??
      null;

    return {
      callResult: this.leadCallResult(lead) ?? 6,
      reportDescription:
        lead.reportDescription?.trim() || lead.ReportDescription?.trim() || "",
      patientCity: lead.patientCity?.trim() || lead.PatientCity?.trim() || "",
      patientRegion:
        lead.patientRegion?.trim() || lead.PatientRegion?.trim() || "",
      attendanceProbabilityPercent: attendanceProbability,
      secondaryPhoneNumber:
        lead.secondaryPhoneNumber?.trim() ||
        lead.SecondaryPhoneNumber?.trim() ||
        (leadAssignmentId
          ? this.reservationSecondaryPhoneForLead(leadAssignmentId)
          : ""),
    };
  }

  private recordCallInitiated(leadAssignmentId: number): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    this.consultantApi
      .recordLeadCallInitiated({
        leadAssignmentId,
        consultantProfileId: profileId,
      })
      .subscribe({
        next: (response) => {
          const initiatedAt =
            response.data?.callInitiatedAt ??
            (response.data as { CallInitiatedAt?: string } | undefined)
              ?.CallInitiatedAt ??
            new Date().toISOString();
          this.updateLeadInCollections(leadAssignmentId, {
            callInitiatedAt: initiatedAt,
            CallInitiatedAt: initiatedAt,
          });
        },
        error: () => {
          // local timer stop still keeps report actions enabled
        },
      });
  }

  private updateLeadInCollections(
    leadAssignmentId: number,
    patch: Partial<ConsultantLead>,
  ): void {
    this.leads = this.replaceLeadInCollection(
      this.leads,
      leadAssignmentId,
      patch,
    );
    this.reportEditLeads = this.replaceLeadInCollection(
      this.reportEditLeads,
      leadAssignmentId,
      patch,
    );
    this.patientLeads = this.replaceLeadInCollection(
      this.patientLeads,
      leadAssignmentId,
      patch,
    );
  }

  private normalizedReportDescription(callResult: number): string {
    return (
      this.reportForm.reportDescription.trim() ||
      CALL_RESULT_DEFAULT_DESCRIPTIONS[callResult] ||
      "گزارش تماس ثبت شد"
    );
  }

  private defaultAttendancePrediction(): string {
    return (
      this.reportForm.reportDescription.trim() ||
      "بیمار گفت در تاریخ و ساعت رزرو شده در مطب حاضر می‌شود."
    );
  }

  private normalizedAttendanceProbability(
    value: number | null | "" | undefined,
  ): number | null {
    if (value === null || value === undefined || value === "") return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  closeReservationDialog(): void {
    this.reservationDialogOpen = false;
    this.reservationSaving = false;
    this.reservationDialogMode = "create";
    this.selectedReservationLead = null;
    this.selectedEditReservation = null;
    this.editReservationOriginalAt = null;
    if (!this.patientProfileDialogOpen) {
      this.restoreOnlineAfterRequiredAction({ notifyWhenBlocked: false });
    }
  }

  isReservationEditMode(): boolean {
    return this.reservationDialogMode === "edit";
  }

  canEditReservation(reservation: ConsultantReservation): boolean {
    const status = readAttendanceStatus(
      reservation,
      "attendanceConfirmationStatus",
      "AttendanceConfirmationStatus",
    );
    return (
      status !== AttendanceConfirmationStatus.SecretaryApproved &&
      status !== AttendanceConfirmationStatus.SecretaryRejected &&
      !(reservation.isCanceled ?? reservation.IsCanceled)
    );
  }

  canEditReservationForLead(lead: ConsultantLead): boolean {
    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId || !this.leadHasActiveReservation(lead)) return false;

    const reservation = this.reservationForLead(leadAssignmentId);
    if (reservation) return this.canEditReservation(reservation);

    return this.readHasActiveReservationFromLead(lead);
  }

  reservationDisabledReason(lead: ConsultantLead): string | null {
    if (!this.isReservationDisabled(lead)) return null;
    if (!this.leadId(lead)) return "شناسه لید نامعتبر است";
    if (this.isLeadInReportProgress(lead)) return "گزارش در حال ثبت است";
    if (this.isLeadExpired(lead)) return "مهلت این لید تمام شده است";
    if (!this.isLeadReportSubmitted(lead)) return "ابتدا گزارش تماس را ثبت کنید";
    if (!this.isLeadEligibleForReservation(lead)) {
      return "رزرو فقط بعد از تماس موفق امکان‌پذیر است";
    }
    if (this.leadHasActiveReservation(lead)) {
      return "برای این لید قبلاً رزرو ثبت شده است";
    }
    return "امکان رزرو وجود ندارد";
  }

  setReservationDate(date: Date): void {
    this.reservationForm.reservationDate = date;
  }

  reservationId(reservation: ConsultantReservation): number | null {
    return this.numberOrNull(
      reservation.id ??
        reservation.Id ??
        reservation.reservationId ??
        reservation.ReservationId ??
        null,
    );
  }

  reservationPatientName(reservation: ConsultantReservation): string {
    return reservation.patientName || reservation.PatientName || "بدون نام";
  }

  reservationPatientPhone(reservation: ConsultantReservation): string {
    return (
      reservation.patientPhoneNumber || reservation.PatientPhoneNumber || "-"
    );
  }

  reservationDateTime(reservation: ConsultantReservation): string {
    return reservation.reservationAt || reservation.ReservationAt || "";
  }

  reservationPatientCity(reservation: ConsultantReservation): string {
    return reservation.patientCity || reservation.PatientCity || "شهر ثبت نشده";
  }

  reservationAttendanceProbability(
    reservation: ConsultantReservation,
  ): number | string {
    return (
      reservation.attendanceProbabilityPercent ??
      reservation.AttendanceProbabilityPercent ??
      "-"
    );
  }

  reservationAttendancePrediction(reservation: ConsultantReservation): string {
    return (
      reservation.attendancePrediction ||
      reservation.AttendancePrediction ||
      "ثبت نشده"
    );
  }

  reservationAttendanceStatusLabel(reservation: ConsultantReservation): string {
    switch (
      reservation.attendanceConfirmationStatus ??
      reservation.AttendanceConfirmationStatus
    ) {
      case 1:
        return "منتظر اعلام مشاور";
      case 2:
        return "مشاور: بیمار آمده";
      case 3:
        return "مشاور: بیمار نیامده";
      case 4:
        return "تایید نهایی منشی";
      case 5:
        return "رد شده توسط منشی";
      default:
        return "نامشخص";
    }
  }

  reservationStatusClass(reservation: ConsultantReservation): string {
    const status =
      reservation.attendanceConfirmationStatus ??
      reservation.AttendanceConfirmationStatus;
    if (status === 4) return "badge success";
    if (status === 5) return "badge danger";
    if (status === 2 || status === 3) return "badge warn";
    return "badge info";
  }

  submitReservation(): void {
    if (this.isReservationEditMode()) {
      this.submitReservationEdit();
      return;
    }

    const profileId = this.requireProfileId();
    const lead = this.selectedReservationLead;
    const leadAssignmentId = lead ? this.leadId(lead) : null;
    if (!profileId) {
      this.showFeedback("شناسه پروفایل مشاور یافت نشد", "error");
      return;
    }
    if (!leadAssignmentId) {
      this.showFeedback("لید انتخاب‌شده برای رزرو یافت نشد", "error");
      return;
    }

    const validationError = this.validateReservationForm();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    const reservationAt = this.selectedReservationDateTime();
    if (!reservationAt) {
      this.showFeedback("تاریخ و ساعت رزرو معتبر نیست", "error");
      return;
    }

    const payload: CreateReservationRequest = {
      leadAssignmentId,
      consultantProfileId: profileId,
      reservationAt: reservationAt.toISOString(),
      patientCity: this.reservationForm.patientCity.trim(),
      patientRegion: this.reservationForm.patientRegion.trim(),
      attendanceProbabilityPercent:
        this.reservationForm.attendanceProbabilityPercent,
      attendancePrediction: this.reservationForm.attendancePrediction.trim(),
      secondaryPhoneNumber:
        this.reservationForm.secondaryPhoneNumber.trim() || null,
      description: this.reservationForm.description.trim() || null,
    };

    this.reservationSaving = true;
    this.clearFeedback();

    this.consultantApi
      .createReservation(payload)
      .pipe(
        finalize(() => {
          this.reservationSaving = false;
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          const reservation =
            this.extractReservation(response.data) ??
            this.extractReservation(response);
          if (leadAssignmentId) this.reservedLeadIds.add(leadAssignmentId);
          this.reservationDialogOpen = false;
          this.selectedReservationLead = null;
          const shouldOpenPatientProfile =
            Boolean(reservation) &&
            (reservation?.requiresPatientProfile ??
              reservation?.RequiresPatientProfile) === true;
          this.showFeedback(
            response.message || "رزرو با موفقیت ثبت شد",
            "success",
          );
          this.loadReservations();

          if (shouldOpenPatientProfile && reservation) {
            this.openPatientProfileDialog(reservation);
          } else {
            this.restoreOnlineAfterRequiredAction({
              notifyWhenBlocked: false,
            });
          }
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "ثبت رزرو انجام نشد"),
            "error",
          ),
      });
  }

  private submitReservationEdit(): void {
    const profileId = this.requireProfileId();
    const reservation = this.selectedEditReservation;
    const reservationId = reservation ? this.reservationId(reservation) : null;
    if (!profileId) {
      this.showFeedback("شناسه پروفایل مشاور یافت نشد", "error");
      return;
    }
    if (!reservation || !reservationId) {
      this.showFeedback("رزرو انتخاب‌شده برای ویرایش یافت نشد", "error");
      return;
    }

    const validationError = this.validateReservationForm();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    const reservationAt = this.selectedReservationDateTime();
    if (!reservationAt) {
      this.showFeedback("تاریخ و ساعت رزرو معتبر نیست", "error");
      return;
    }

    const payload: UpdateReservationRequest = {
      reservationId,
      consultantProfileId: profileId,
      reservationAt: reservationAt.toISOString(),
      patientCity: this.reservationForm.patientCity.trim(),
      patientRegion: this.reservationForm.patientRegion.trim(),
      attendanceProbabilityPercent:
        this.reservationForm.attendanceProbabilityPercent,
      attendancePrediction: this.reservationForm.attendancePrediction.trim(),
      secondaryPhoneNumber:
        this.reservationForm.secondaryPhoneNumber.trim() || null,
      description: this.reservationForm.description.trim() || null,
    };

    this.reservationSaving = true;
    this.clearFeedback();

    this.consultantApi
      .updateReservation(payload)
      .pipe(
        finalize(() => {
          this.reservationSaving = false;
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          this.reservationDialogOpen = false;
          this.reservationDialogMode = "create";
          this.selectedReservationLead = null;
          this.selectedEditReservation = null;
          this.editReservationOriginalAt = null;
          this.showFeedback(
            response.message || "رزرو با موفقیت ویرایش شد",
            "success",
          );
          this.loadReservations();
          this.restoreOnlineAfterRequiredAction({ notifyWhenBlocked: false });
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "ویرایش رزرو انجام نشد"),
            "error",
          ),
      });
  }

  closePatientProfileDialog(): void {
    const wasRequired = this.patientProfileRequired;
    this.resetPatientProfileState();

    if (wasRequired) {
      this.showFeedback(
        "برای تکمیل رزرو، تشکیل پرونده بیمار الزامی است",
        "error",
      );
    }
  }

  submitPatientProfile(): void {
    const reservation = this.selectedPatientProfileReservation;
    const reservationId = reservation ? this.reservationId(reservation) : null;
    if (!reservation || !reservationId) {
      this.showFeedback("شناسه رزرو برای تشکیل پرونده یافت نشد", "error");
      return;
    }

    const validationError = this.validatePatientProfileForm();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    const payload = this.buildCompletePatientProfileRequest(reservationId);

    this.patientProfileSaving = true;
    this.clearFeedback();

    this.consultantApi
      .completePatientProfile(payload)
      .pipe(
        finalize(() => {
          this.patientProfileSaving = false;
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          this.resetPatientProfileState();
          this.showFeedback(
            response.message ||
              "ثبت‌نام بیمار و تشکیل پرونده رزرو با موفقیت انجام شد",
            "success",
          );
          this.restoreOnlineAfterRequiredAction({ notifyWhenBlocked: true });
          this.loadReservations();
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "تشکیل پرونده بیمار انجام نشد"),
            "error",
          ),
      });
  }

  handleCallClick(event: MouseEvent, lead: ConsultantLead): void {
    const leadAssignmentId = this.leadId(lead);
    if (
      leadAssignmentId &&
      this.leadType(lead) === LEAD_TYPE.RealTime &&
      this.isActiveRealtimeLead(lead) &&
      !this.isLeadReportSubmitted(lead) &&
      !this.isLeadPhoneRevealed(lead)
    ) {
      event.preventDefault();
      this.revealLeadPhone(lead);
      return;
    }

    if (this.isLeadPhoneDisabled(lead) || this.leadPhone(lead) === "-") {
      event.preventDefault();
      this.showFeedback("شماره این لید در حال حاضر فعال نیست", "error");
      return;
    }

    if (
      leadAssignmentId &&
      this.leadType(lead) === LEAD_TYPE.RealTime &&
      !this.isLeadReportSubmitted(lead)
    ) {
      if (!this.stoppedTimerLeadIds.has(leadAssignmentId)) {
        this.stopRealtimeTimer(leadAssignmentId);
      }

      const initiatedAt = lead.callInitiatedAt ?? lead.CallInitiatedAt;
      if (!initiatedAt) {
        this.recordCallInitiated(leadAssignmentId);
      }
    }
  }

  handleTimerClick(lead: ConsultantLead): void {
    const leadAssignmentId = this.leadId(lead);
    if (
      !leadAssignmentId ||
      this.leadType(lead) !== LEAD_TYPE.RealTime ||
      this.stoppedTimerLeadIds.has(leadAssignmentId) ||
      this.isLeadReportSubmitted(lead)
    ) {
      return;
    }

    this.stopRealtimeTimer(leadAssignmentId);
    this.recordCallInitiated(leadAssignmentId);
  }

  leadId(lead: ConsultantLead): number | null {
    const value =
      lead.id ?? lead.Id ?? lead.leadAssignmentId ?? lead.LeadAssignmentId;
    const numeric = this.numberOrNull(value);
    return numeric && numeric > 0 ? numeric : null;
  }

  leadName(lead: ConsultantLead): string {
    return (
      lead.userName ||
      lead.UserName ||
      lead.fullName ||
      lead.FullName ||
      [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim() ||
      [lead.FirstName, lead.LastName].filter(Boolean).join(" ").trim() ||
      lead.user?.userName ||
      lead.user?.UserName ||
      lead.user?.fullName ||
      lead.user?.FullName ||
      lead.user?.name ||
      lead.user?.Name ||
      [lead.user?.firstName, lead.user?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [lead.user?.FirstName, lead.user?.LastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      lead.User?.userName ||
      lead.User?.UserName ||
      lead.User?.fullName ||
      lead.User?.FullName ||
      lead.User?.name ||
      lead.User?.Name ||
      [lead.User?.firstName, lead.User?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [lead.User?.FirstName, lead.User?.LastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      lead.lead?.fullName ||
      lead.lead?.FullName ||
      lead.lead?.name ||
      lead.lead?.Name ||
      [lead.lead?.firstName, lead.lead?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [lead.lead?.FirstName, lead.lead?.LastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      lead.Lead?.fullName ||
      lead.Lead?.FullName ||
      lead.Lead?.name ||
      lead.Lead?.Name ||
      [lead.Lead?.firstName, lead.Lead?.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [lead.Lead?.FirstName, lead.Lead?.LastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "بدون نام"
    );
  }

  leadPhone(lead: ConsultantLead): string {
    return (
      lead.phoneNumber ||
      lead.PhoneNumber ||
      lead.mobile ||
      lead.Mobile ||
      lead.userPhoneNumber ||
      lead.UserPhoneNumber ||
      lead.leadPhoneNumber ||
      lead.LeadPhoneNumber ||
      lead.user?.phoneNumber ||
      lead.user?.PhoneNumber ||
      lead.user?.mobile ||
      lead.user?.Mobile ||
      lead.User?.phoneNumber ||
      lead.User?.PhoneNumber ||
      lead.User?.mobile ||
      lead.User?.Mobile ||
      lead.lead?.phoneNumber ||
      lead.lead?.PhoneNumber ||
      lead.lead?.mobile ||
      lead.lead?.Mobile ||
      lead.Lead?.phoneNumber ||
      lead.Lead?.PhoneNumber ||
      lead.Lead?.mobile ||
      lead.Lead?.Mobile ||
      "-"
    );
  }

  leadPhoneDisplay(lead: ConsultantLead): string {
    if (this.shouldMaskLeadPhone(lead)) {
      return "برای دیدن شماره ضربه بزنید";
    }

    return this.leadPhone(lead);
  }

  leadPhoneActionLabel(lead: ConsultantLead): string {
    return this.shouldMaskLeadPhone(lead) ? "نمایش شماره لید" : "تماس با لید";
  }

  leadPhoneHref(lead: ConsultantLead): string | null {
    if (this.isLeadPhoneDisabled(lead) || this.shouldMaskLeadPhone(lead)) {
      return null;
    }

    const phone = this.leadPhone(lead);
    return phone === "-" ? null : `tel:${phone}`;
  }

  isLeadPhoneRevealed(lead: ConsultantLead): boolean {
    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId) return true;
    if (this.leadType(lead) !== LEAD_TYPE.RealTime) return true;
    if (!this.isActiveRealtimeLead(lead) || this.isLeadReportSubmitted(lead)) {
      return true;
    }
    if (this.hasCallBeenInitiated(lead)) return true;

    return this.phoneRevealedLeadIds.has(leadAssignmentId);
  }

  private shouldMaskLeadPhone(lead: ConsultantLead): boolean {
    return (
      this.leadPhone(lead) !== "-" && !this.isLeadPhoneRevealed(lead)
    );
  }

  private revealLeadPhone(lead: ConsultantLead): void {
    const leadAssignmentId = this.leadId(lead);
    if (
      !leadAssignmentId ||
      this.leadType(lead) !== LEAD_TYPE.RealTime ||
      !this.isActiveRealtimeLead(lead) ||
      this.isLeadReportSubmitted(lead) ||
      this.isLeadPhoneRevealed(lead) ||
      this.leadPhone(lead) === "-"
    ) {
      return;
    }

    this.phoneRevealedLeadIds.add(leadAssignmentId);
    this.timerStarts[String(leadAssignmentId)] = Date.now();
    this.stoppedTimerLeadIds.delete(leadAssignmentId);
    this.timerExpiredReportPromptedLeadIds.delete(leadAssignmentId);
    this.writeJson(this.phoneRevealedStorageKey(), [...this.phoneRevealedLeadIds]);
    this.writeJson(this.timerStorageKey(), this.timerStarts);
    this.writeJson(
      this.stoppedTimerStorageKey(),
      [...this.stoppedTimerLeadIds],
    );
    this.currentTime = Date.now();
    this.markViewDirty();
  }

  leadState(lead: ConsultantLead): number | null {
    return resolveLeadAssignmentState(
      lead.leadAssignmentState ??
        lead.LeadAssignmentState ??
        lead.state ??
        lead.State ??
        lead.status ??
        lead.Status ??
        null,
    );
  }

  leadType(lead: ConsultantLead): number | null {
    return resolveLeadAssignmentType(
      lead.leadAssignmentType ??
        lead.LeadAssignmentType ??
        lead.assignmentType ??
        lead.AssignmentType ??
        lead.type ??
        lead.Type ??
        null,
    );
  }

  stateLabel(value: number | null): string {
    return leadAssignmentStateLabel(value);
  }

  leadTypeLabel(value: number | null): string {
    return leadAssignmentTypeLabel(value);
  }

  leadDisplayStatus(lead: ConsultantLead): string {
    if (this.isLeadInReportProgress(lead)) return "در حال ثبت گزارش";
    if (this.isLeadExpired(lead)) return "منقضی شده";
    if (this.shouldMaskLeadPhone(lead)) return "در انتظار نمایش شماره";
    if (this.isRealtimeTimedLead(lead)) return "در انتظار تماس";
    return this.stateLabel(this.leadState(lead));
  }

  leadDisplayBadgeClass(lead: ConsultantLead): string {
    if (this.isLeadInReportProgress(lead)) return "badge info";
    if (this.isLeadExpired(lead)) return "badge warn";
    if (this.isRealtimeTimedLead(lead)) return "badge info";
    return this.stateBadgeClass(this.leadState(lead));
  }

  stateBadgeClass(value: number | null): string {
    if (value === LEAD_STATE.New || value === LEAD_STATE.Assigned)
      return "badge info";
    if (value === LEAD_STATE.Converted) return "badge success";
    if (value === LEAD_STATE.Pending || value === LEAD_STATE.Expired)
      return "badge warn";
    return "badge danger";
  }

  isRealtimeTimedLead(lead: ConsultantLead): boolean {
    const leadAssignmentId = this.leadId(lead);
    if (leadAssignmentId && this.stoppedTimerLeadIds.has(leadAssignmentId)) {
      return false;
    }
    if (
      (leadAssignmentId && this.reportingLeadIds.has(leadAssignmentId)) ||
      this.isLeadReportSubmitted(lead)
    )
      return false;
    if (this.leadType(lead) !== LEAD_TYPE.RealTime) return false;
    if (!this.isLeadPhoneRevealed(lead)) return false;
    return this.isActiveRealtimeLead(lead);
  }

  leadRemainingMs(lead: ConsultantLead): number {
    if (!this.isRealtimeTimedLead(lead)) return Number.POSITIVE_INFINITY;
    return Math.max(0, this.leadDeadlineMs(lead) - this.currentTime);
  }

  realtimeCountdown(lead: ConsultantLead): string {
    if (this.isLeadExpired(lead)) return "منقضی";
    const totalSeconds = Math.ceil(this.leadRemainingMs(lead) / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  isLeadExpired(lead: ConsultantLead): boolean {
    if (this.isLeadReportSubmitted(lead)) return false;
    if (this.leadState(lead) === LEAD_STATE.Expired) return true;
    if (this.hasCallBeenInitiated(lead)) return false;
    return this.isRealtimeTimedLead(lead) && this.leadRemainingMs(lead) <= 0;
  }

  hasCallBeenInitiated(lead: ConsultantLead): boolean {
    const leadAssignmentId = this.leadId(lead);
    if (leadAssignmentId && this.stoppedTimerLeadIds.has(leadAssignmentId)) {
      return true;
    }

    const initiatedAt = lead.callInitiatedAt ?? lead.CallInitiatedAt;
    return Boolean(initiatedAt);
  }

  isLeadReportEditable(lead: ConsultantLead): boolean {
    if (!this.leadId(lead)) return false;
    return this.isLeadReportSubmitted(lead);
  }

  visibleReportEditLeads(): ConsultantLead[] {
    const term = this.reportEditSearchTerm.trim().toLowerCase();
    if (!term) return this.reportEditLeads;
    return this.reportEditLeads.filter((lead) =>
      this.reportEditLeadMatchesSearch(lead, term),
    );
  }

  applyReportEditFilters(): void {
    this.reportEditPageNumber = 1;
    this.loadReportEditLeads();
  }

  leadCallResult(lead: ConsultantLead): number | null {
    const raw: unknown = lead.callResult ?? lead.CallResult ?? null;
    if (typeof raw === "string") {
      const normalized = raw.trim().toLowerCase();
      if (CALL_RESULT_BY_NAME[normalized] !== undefined) {
        return CALL_RESULT_BY_NAME[normalized];
      }
    }

    return this.numberOrNull(raw);
  }

  callResultLabel(lead: ConsultantLead): string {
    const callResult = this.leadCallResult(lead);
    if (callResult === null) return "بدون گزارش";
    return CALL_RESULT_DEFAULT_DESCRIPTIONS[callResult] ?? "نامشخص";
  }

  leadReportDescription(lead: ConsultantLead): string {
    return (
      lead.reportDescription?.trim() ||
      lead.ReportDescription?.trim() ||
      "بدون توضیحات"
    );
  }

  changeReportEditPage(page: number): void {
    if (page < 1 || page > this.reportEditTotalPages) return;
    this.reportEditPageNumber = page;
    this.loadReportEditLeads();
  }

  isLeadPhoneDisabled(lead: ConsultantLead): boolean {
    if (this.isLeadInReportProgress(lead)) return true;
    if (this.leadPhone(lead) === "-") return true;
    if (this.expiringLeadIds.has(this.leadId(lead) ?? -1)) return true;
    if (this.shouldMaskLeadPhone(lead)) return false;
    if (
      this.leadType(lead) === LEAD_TYPE.RealTime &&
      this.isActiveRealtimeLead(lead) &&
      !this.isLeadReportSubmitted(lead)
    ) {
      return false;
    }
    return this.isLeadExpired(lead);
  }

  isReportDisabled(lead: ConsultantLead): boolean {
    const state = this.leadState(lead);
    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId) return true;
    if (this.isLeadReportSubmitted(lead)) return true;
    if (state === LEAD_STATE.Converted || state === LEAD_STATE.Rejected) {
      return true;
    }
    if (this.hasCallBeenInitiated(lead)) {
      return false;
    }
    if (state === LEAD_STATE.Expired) return true;
    if (
      this.leadType(lead) === LEAD_TYPE.RealTime &&
      this.isActiveRealtimeLead(lead)
    ) {
      return false;
    }
    return this.reportingLeadIds.has(leadAssignmentId);
  }

  isReservationDisabled(lead: ConsultantLead): boolean {
    return (
      !this.leadId(lead) ||
      this.isLeadInReportProgress(lead) ||
      this.isLeadExpired(lead) ||
      !this.isLeadReportSubmitted(lead) ||
      !this.isLeadEligibleForReservation(lead) ||
      this.leadHasActiveReservation(lead)
    );
  }

  leadHasActiveReservation(lead: ConsultantLead): boolean {
    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId) return false;
    if (this.readHasActiveReservationFromLead(lead)) return true;

    return this.reservedLeadIds.has(leadAssignmentId);
  }

  private readHasActiveReservationFromLead(lead: ConsultantLead): boolean {
    return Boolean(lead.hasActiveReservation ?? lead.HasActiveReservation ?? false);
  }

  private isLeadEligibleForReservation(lead: ConsultantLead): boolean {
    const callResult = this.leadCallResult(lead);
    if (callResult !== null && this.isSuccessfulCallResult(callResult)) {
      return true;
    }

    const state = this.leadState(lead);
    return (
      state === LEAD_STATE.Contacted || state === LEAD_STATE.Converted
    );
  }

  isLeadReportSubmitted(lead: ConsultantLead): boolean {
    const leadAssignmentId = this.leadId(lead);
    if (leadAssignmentId && this.reportedLeadIds.has(leadAssignmentId)) {
      return true;
    }
    return this.leadHasSubmittedReportFromBackend(lead);
  }

  private leadHasSubmittedReportFromBackend(lead: ConsultantLead): boolean {
    if (Boolean(lead.isReportSubmitted ?? lead.IsReportSubmitted)) return true;
    if (Boolean(lead.reportSubmittedAt ?? lead.ReportSubmittedAt)) return true;
    if (this.leadCallResult(lead) !== null) return true;

    const state = this.leadState(lead);
    return (
      state === LEAD_STATE.Contacted ||
      state === LEAD_STATE.Pending ||
      state === LEAD_STATE.Converted ||
      state === LEAD_STATE.Expired ||
      state === LEAD_STATE.Rejected
    );
  }

  private reportEditLeadMatchesSearch(
    lead: ConsultantLead,
    term: string,
  ): boolean {
    const haystack = [
      this.leadName(lead),
      this.leadPhone(lead),
      this.leadReportDescription(lead),
      this.callResultLabel(lead),
      this.stateLabel(this.leadState(lead)),
      this.leadTypeLabel(this.leadType(lead)),
      lead.patientCity,
      lead.PatientCity,
      lead.patientRegion,
      lead.PatientRegion,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(term);
  }

  private syncReportedLeadIdsFromLeads(leads: ConsultantLead[]): void {
    leads.forEach((lead) => {
      const leadAssignmentId = this.leadId(lead);
      if (!leadAssignmentId) return;

      if (this.leadHasSubmittedReportFromBackend(lead)) {
        this.reportedLeadIds.add(leadAssignmentId);
        this.reportingLeadIds.delete(leadAssignmentId);
        this.timerExpiredReportPromptedLeadIds.delete(leadAssignmentId);
        if (this.leadCallResult(lead) !== null) {
          this.pendingReportPatches.delete(leadAssignmentId);
        }
        return;
      }

      if (
        this.reportedLeadIds.has(leadAssignmentId) &&
        this.pendingReportPatches.has(leadAssignmentId)
      ) {
        return;
      }

      if (this.reportedLeadIds.has(leadAssignmentId)) {
        this.reportedLeadIds.delete(leadAssignmentId);
      }
    });
  }

  private syncReservedLeadIdsFromLeads(leads: ConsultantLead[]): void {
    leads.forEach((lead) => {
      const leadAssignmentId = this.leadId(lead);
      if (!leadAssignmentId) return;

      if (this.readHasActiveReservationFromLead(lead)) {
        this.reservedLeadIds.add(leadAssignmentId);
        return;
      }

      if (
        lead.hasActiveReservation === false ||
        lead.HasActiveReservation === false
      ) {
        this.reservedLeadIds.delete(leadAssignmentId);
      }
    });
  }

  private syncCallInitiatedFromLeads(leads: ConsultantLead[]): void {
    leads.forEach((lead) => {
      const leadAssignmentId = this.leadId(lead);
      if (!leadAssignmentId || !this.hasCallBeenInitiated(lead)) return;
      this.stoppedTimerLeadIds.add(leadAssignmentId);
      this.phoneRevealedLeadIds.add(leadAssignmentId);
    });
    this.writeJson(this.stoppedTimerStorageKey(), [...this.stoppedTimerLeadIds]);
    this.writeJson(this.phoneRevealedStorageKey(), [...this.phoneRevealedLeadIds]);
  }

  private syncReservedLeadIdsFromReservations(
    reservations: ConsultantReservation[],
  ): void {
    reservations.forEach((reservation) => {
      const leadAssignmentId =
        reservation.leadAssignmentId ?? reservation.LeadAssignmentId ?? null;
      const numeric = Number(leadAssignmentId);
      if (
        Number.isFinite(numeric) &&
        (reservation.isCanceled ?? reservation.IsCanceled) !== true
      ) {
        this.reservedLeadIds.add(numeric);
      }
    });
  }

  isLeadInReportProgress(lead: ConsultantLead): boolean {
    const leadAssignmentId = this.leadId(lead);
    return Boolean(
      leadAssignmentId && this.reportingLeadIds.has(leadAssignmentId),
    );
  }

  minReservationDateTime(): string {
    return this.toDateTimeLocalValue(this.minimumReservationDateTime());
  }

  minimumReservationDate(): Date {
    const date = this.minimumReservationDateTime();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  formatDateTime(value: string): string {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return value;
    return new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebar.toggleMobileSidebar();
  }

  closeMobileSidebar(): void {
    this.mobileSidebar.closeMobileSidebar();
  }

  logout(): void {
    this.pushNotifications.resetRegisteredTokenCache();
    this.auth.logout();
    this.router.navigateByUrl("/");
  }

  private loadDashboardStatus(afterLoad?: () => void): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    this.dashboardStatusSubscription?.unsubscribe();
    this.dashboardStatusSubscription = this.consultantApi
      .getDashboardStatus(profileId)
      .pipe(finalize(() => this.markViewDirty()))
      .subscribe({
        next: (status) => {
          this.applyDashboardStatus(status);
          afterLoad?.();
        },
        error: (error) => {
          this.showFeedback(
            this.errorMessage(error, "دریافت وضعیت داشبورد انجام نشد"),
            "error",
          );
          afterLoad?.();
        },
      });
  }

  private applyDashboardStatus(status: ConsultantDashboardStatus): void {
    this.profileId = status.profileId || this.profileId;
    this.isAvailable = status.isAvailable;
    this.isOnline = status.isOnline;
    this.canGoOnlineFromStatus = status.canGoOnline;
    this.dashboardStatusLoaded = true;
    this.onlineStatusBlockReason = status.onlineStatusBlockReason;
    this.applyConsultantStatusFrom(status.raw);
    this.configurePollTimer();
    this.syncRealtimeLeadPolling();
  }

  private loadLeads(quiet = false): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;
    if (quiet && this.leadLoadSubscription && !this.leadLoadSubscription.closed)
      return;

    const requestId = ++this.leadRequestId;
    this.leadLoadSubscription?.unsubscribe();

    if (!quiet) {
      this.visibleLeadLoadingRequestId = requestId;
      this.leadsLoading = true;
    }
    if (!quiet) this.clearFeedback();

    this.leadLoadSubscription = this.consultantApi
      .getLeads({
        profileId,
        leadAssignmentState: this.effectiveLeadStateFilter(),
        leadAssignmentType: this.leadTypeFilter,
        from: this.formatFilterDate(this.leadFromDate),
        to: this.formatFilterDate(this.leadToDate ?? this.leadFromDate),
        pageNumber: this.leadPageNumber,
        pageSize: this.leadPageSize,
      })
      .pipe(
        finalize(() => {
          if (!quiet && requestId === this.visibleLeadLoadingRequestId)
            this.leadsLoading = false;
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.leadRequestId) return;
          this.applyConsultantStatusFrom(response.source, response.raw);
          const items = (response.items ?? [])
            .filter((lead) => this.leadType(lead) !== LEAD_TYPE.ConsultantPatient);
          this.commitLeadsFromApi(items);
          this.leadTotalCount = response.totalCount ?? this.leads.length;
          this.leadPageSize = response.pageSize || this.leadPageSize;
          this.leadTotalPages = Math.max(
            1,
            response.totalPages ||
              Math.ceil(this.leadTotalCount / this.leadPageSize),
          );
          const normalizedPageNumber = Math.min(
            Math.max(1, response.pageNumber || this.leadPageNumber),
            this.leadTotalPages,
          );
          if (!quiet && this.leadPageNumber !== normalizedPageNumber) {
            this.leadPageNumber = normalizedPageNumber;
            if (!this.leads.length && this.leadTotalCount > 0) {
              this.loadLeads();
              return;
            }
          } else {
            this.leadPageNumber = normalizedPageNumber;
          }
          this.hydrateRealtimeTimers();
          this.expireDueRealtimeLeads();
          this.scrollToHighlightedLead();
        },
        error: (error) => {
          if (requestId !== this.leadRequestId) return;
          if (!quiet)
            this.showFeedback(
              this.errorMessage(error, "دریافت لیدها انجام نشد"),
              "error",
            );
        },
      });
  }

  loadReportEditLeads(): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    const requestId = ++this.reportEditRequestId;
    this.reportEditLoadSubscription?.unsubscribe();
    this.reportEditLeadsLoading = true;

    this.reportEditLoadSubscription = this.consultantApi
      .getLeads({
        profileId,
        hasSubmittedReport: true,
        ...(this.reportEditStateFilter !== null
          ? { leadAssignmentState: this.reportEditStateFilter }
          : {}),
        ...(this.reportEditTypeFilter !== null
          ? { leadAssignmentType: this.reportEditTypeFilter }
          : {}),
        pageNumber: this.reportEditPageNumber,
        pageSize: this.reportEditPageSize,
      })
      .pipe(
        finalize(() => {
          if (requestId === this.reportEditRequestId) {
            this.reportEditLeadsLoading = false;
          }
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.reportEditRequestId) return;
          const items = this.applyPendingReportPatches(response.items ?? []).filter(
            (lead) => this.isLeadReportEditable(lead),
          );
          this.reportEditLeads = items;
          this.syncReportedLeadIdsFromLeads(this.reportEditLeads);
          this.syncReservedLeadIdsFromLeads(this.reportEditLeads);
          this.syncCallInitiatedFromLeads(this.reportEditLeads);
          this.reportEditTotalCount = response.totalCount ?? this.reportEditLeads.length;
          this.reportEditPageSize = response.pageSize || this.reportEditPageSize;
          this.reportEditTotalPages = Math.max(
            1,
            response.totalPages ||
              Math.ceil(this.reportEditTotalCount / this.reportEditPageSize),
          );
          this.reportEditPageNumber = Math.min(
            Math.max(1, response.pageNumber || this.reportEditPageNumber),
            this.reportEditTotalPages,
          );
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "دریافت گزارش‌های قابل ویرایش انجام نشد"),
            "error",
          ),
      });
  }

  private loadReservations(): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    const requestId = ++this.reservationRequestId;
    this.reservationLoadSubscription?.unsubscribe();
    this.reservationsLoading = true;

    this.reservationLoadSubscription = this.consultantApi
      .getReservations({
        consultantProfileId: profileId,
        from: this.startOfTodayIso(),
        to: this.endOfTodayIso(),
        includeCanceled: false,
        pageNumber: 1,
        pageSize: 5,
      })
      .pipe(
        finalize(() => {
          if (requestId === this.reservationRequestId)
            this.reservationsLoading = false;
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.reservationRequestId) return;
          this.reservations = response.items ?? [];
          this.syncReservedLeadIdsFromReservations(this.reservations);
        },
        error: () => {
          if (requestId === this.reservationRequestId) this.reservations = [];
        },
      });
  }

  private loadActiveReservationsForLeadActions(): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    this.consultantApi
      .getReservations({
        consultantProfileId: profileId,
        includeCanceled: false,
        pageNumber: 1,
        pageSize: 100,
      })
      .subscribe({
        next: (response) => {
          const activeReservations = (response.items ?? []).filter(
            (reservation) =>
              (reservation.isCanceled ?? reservation.IsCanceled) !== true,
          );
          this.reservations = this.mergeReservationsById(
            this.reservations,
            activeReservations,
          );
          this.syncReservedLeadIdsFromReservations(activeReservations);
          this.markViewDirty();
        },
      });
  }

  private mergeReservationsById(
    current: ConsultantReservation[],
    incoming: ConsultantReservation[],
  ): ConsultantReservation[] {
    const merged = new Map<number, ConsultantReservation>();
    const add = (reservation: ConsultantReservation) => {
      const id = this.reservationId(reservation);
      if (!id) return;
      merged.set(id, reservation);
    };

    current.forEach(add);
    incoming.forEach(add);
    return [...merged.values()];
  }

  private startOfTodayIso(): string {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }

  private endOfTodayIso(): string {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date.toISOString();
  }

  private startTimers(): void {
    this.ngZone.runOutsideAngular(() => {
      if (!this.timerId) {
        this.timerId = setInterval(() => {
          if (!this.hasActiveRealtimeTimers()) return;
          this.ngZone.run(() => {
            this.currentTime = Date.now();
            this.expireDueRealtimeLeads();
            this.markViewDirty();
          });
        }, 1000);
      }

      this.configurePollTimer();

      if (!this.autoAbsenceId) {
        this.autoAbsenceId = setInterval(() => {
          if (!this.isProfileReady() || this.destroyed) return;
          this.ngZone.run(() => this.runDailyAutoAbsenceIfDue());
        }, 60000);
      }
    });

    this.runDailyAutoAbsenceIfDue();
  }

  private configurePollTimer(): void {
    const pushReady =
      this.pushRegistrationReady ||
      this.browserNotificationPermission === "granted";
    let desiredInterval = 30000;
    if (this.isProfileReady()) {
      if (this.isOnline) {
        desiredInterval = 10000;
      } else {
        desiredInterval = pushReady ? 30000 : 15000;
      }
    }

    if (this.pollId && desiredInterval === this.pollIntervalMs) return;

    if (this.pollId) {
      clearInterval(this.pollId);
      this.pollId = null;
    }

    this.pollIntervalMs = desiredInterval;
    this.ngZone.runOutsideAngular(() => {
      this.pollId = setInterval(() => {
        if (!this.isProfileReady() || this.destroyed) return;
        if (this.reportDialogOpen || this.reservationDialogOpen) return;
        this.ngZone.run(() => {
          this.loadLeads(true);
        });
      }, this.pollIntervalMs);
    });
  }

  private hasActiveRealtimeTimers(): boolean {
    return this.leads.some(
      (lead) =>
        this.isRealtimeTimedLead(lead) &&
        !this.isLeadReportSubmitted(lead) &&
        this.leadRemainingMs(lead) > 0,
    );
  }

  private hydrateRealtimeTimers(): void {
    const activeLeadIds = new Set<number>();
    let changed = false;
    const now = Date.now();

    this.leads.forEach((lead) => {
      if (this.leadType(lead) !== LEAD_TYPE.RealTime) return;
      if (!this.isActiveRealtimeLead(lead) || this.isLeadReportSubmitted(lead)) {
        return;
      }

      const leadAssignmentId = this.leadId(lead);
      if (!leadAssignmentId || this.stoppedTimerLeadIds.has(leadAssignmentId)) {
        return;
      }
      if (!this.isLeadPhoneRevealed(lead)) return;

      activeLeadIds.add(leadAssignmentId);
      const key = String(leadAssignmentId);

      if (!this.timerStarts[key]) {
        const assignedAt =
          (lead as ConsultantLead & { assignedAt?: string | null; AssignedAt?: string | null })
            .assignedAt ??
          (lead as ConsultantLead & { assignedAt?: string | null; AssignedAt?: string | null })
            .AssignedAt;
        const assignedAtMs = assignedAt ? new Date(assignedAt).getTime() : NaN;
        this.timerStarts[key] = Number.isFinite(assignedAtMs) ? assignedAtMs : now;
        changed = true;
      }
    });

    Object.keys(this.timerStarts).forEach((key) => {
      if (!activeLeadIds.has(Number(key))) {
        delete this.timerStarts[key];
        changed = true;
      }
    });

    if (changed) this.writeJson(this.timerStorageKey(), this.timerStarts);
  }

  private async ensureLeadPushRegistration(requestPermission = false): Promise<void> {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    if (requestPermission && this.browserNotificationPermission === "default") {
      const enabled = await this.pushNotifications.enablePushForCurrentProfile(
        profileId,
      );
      if (!enabled.ok && enabled.message) {
        this.toast.info(enabled.message);
      }
    } else {
      await this.pushNotifications.syncPushRegistrationIfReady(profileId);
    }

    await this.syncPushRegistrationState();
    this.maybePromptPushSetup();
    this.configurePollTimer();
    this.markViewDirty();
  }

  private maybePromptPushSetup(): void {
    if (!this.shouldShowPushSetupBanner) return;

    this.toast.info(
      "برای دریافت لید لحظه‌ای، دکمه «فعال‌سازی نوتیفیکیشن» را بزنید.",
    );
  }

  private syncRealtimeLeadPolling(): void {
    const profileId = this.currentProfileId();
    if (!profileId || !this.isOnline) {
      this.realtimeLeadAlerts.stopPolling();
      return;
    }
    this.realtimeLeadAlerts.startPolling(profileId);
  }

  private showLeadNotification(
    title: string,
    body: string,
    tag = "consultant-lead-alert",
    data?: Record<string, string>,
  ): void {
    void this.notifications.showLocalNotification(title, body, {
      tag,
      requireInteraction: title.includes("تست"),
      data,
    });
    this.toast.info(body);
    if (title.includes("لید")) {
      playRealtimeLeadAlertSound();
    }
  }

  private async syncPushRegistrationState(): Promise<void> {
    if (this.browserNotificationPermission !== "granted") {
      this.pushRegistrationReady = false;
      this.configurePollTimer();
      this.markViewDirty();
      return;
    }

    try {
      const subscription =
        await this.pushNotifications.getCurrentPushSubscription();
      if (!subscription) {
        this.pushRegistrationReady = false;
        this.configurePollTimer();
        this.markViewDirty();
        return;
      }

      const syncResult = await this.pushNotifications.syncForCurrentProfile(
        this.currentProfileId(),
      );
      this.pushRegistrationReady =
        syncResult.ok && this.pushNotifications.isBackendRegistrationReady();
    } catch {
      this.pushRegistrationReady = false;
    }

    this.configurePollTimer();
    this.markViewDirty();
  }

  private runDailyAutoAbsenceIfDue(): void {
    if (this.autoAbsenceRunning) return;

    const now = new Date();
    if (now.getHours() < 21) return;

    const storageKey = this.autoAbsenceStorageKey();
    const todayKey = this.dateStorageKey(now);
    if (this.readJson<string | null>(storageKey, null) === todayKey) return;

    const profileId = this.currentProfileId();
    if (!profileId) return;

    this.autoAbsenceRunning = true;
    const finish = () => {
      this.writeJson(storageKey, todayKey);
      this.autoAbsenceRunning = false;
      this.refreshDashboard();
      this.markViewDirty();
    };

    const setAbsent = () => {
      this.consultantApi
        .setAvailability({ profileId, isAvailable: false })
        .subscribe({
          next: () => {
            this.isAvailable = false;
            this.showLeadNotification(
              "عدم حضور خودکار ثبت شد",
              "سیستم ساعت ۲۱ عدم حضور امروز شما را ثبت کرد.",
            );
            finish();
          },
          error: () => {
            this.autoAbsenceRunning = false;
            this.markViewDirty();
          },
        });
    };

    if (this.isOnline) {
      this.consultantApi
        .setOnlineStatus({ profileId, isOnline: false, isOffline: true })
        .subscribe({
          next: () => {
            this.isOnline = false;
            setAbsent();
          },
          error: () => setAbsent(),
        });
      return;
    }

    setAbsent();
  }

  private autoAbsenceStorageKey(): string {
    return `consultant-auto-absence:${this.userKey()}`;
  }

  private dateStorageKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  }

  private isConsultantWorkingHours(date: Date = new Date()): boolean {
    return isConsultantWorkingHours(date);
  }

  private isConsultantOnlineBlockedByTime(date: Date = new Date()): boolean {
    return isConsultantOnlineBlockedByTime(date);
  }

  private expireDueRealtimeLeads(): void {
    this.leads.forEach((lead) => {
      const leadAssignmentId = this.leadId(lead);
      if (!leadAssignmentId || !this.shouldExpireLead(lead)) return;
      this.expireLead(leadAssignmentId);
    });
  }

  private shouldExpireLead(lead: ConsultantLead): boolean {
    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId || !this.isRealtimeTimedLead(lead)) return false;
    if (
      this.reportingLeadIds.has(leadAssignmentId) ||
      this.expiringLeadIds.has(leadAssignmentId)
    )
      return false;
    if (this.isLeadReportSubmitted(lead)) return false;
    if (this.hasCallBeenInitiated(lead)) return false;
    if (this.isLeadPhoneRevealed(lead)) return false;
    if (
      this.currentTime < (this.expirationRetryAfter.get(leadAssignmentId) ?? 0)
    )
      return false;

    const state = this.leadState(lead);
    if (
      [
        LEAD_STATE.Contacted,
        LEAD_STATE.Converted,
        LEAD_STATE.Expired,
        LEAD_STATE.Rejected,
      ].includes(state as 3 | 5 | 6 | 7)
    ) {
      return false;
    }

    return this.leadRemainingMs(lead) <= 0;
  }

  private expireLead(leadAssignmentId: number): void {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    this.expiringLeadIds.add(leadAssignmentId);

    this.consultantApi
      .expireLeadNoCall({ leadAssignmentId, consultantProfileId: profileId })
      .pipe(
        finalize(() => {
          this.expiringLeadIds.delete(leadAssignmentId);
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          const status = this.applyConsultantStatusFrom(
            response,
            response.data,
          );
          if (
            status.isOnline === null &&
            typeof response.data?.isConsultantOnline === "boolean"
          ) {
            this.isOnline = response.data.isConsultantOnline;
          }
          this.leads = this.leads.filter(
            (lead) => this.leadId(lead) !== leadAssignmentId,
          );
          this.showFeedback(
            response.message ||
              "مهلت تماس تمام شد. لید برای مشاور آنلاین دیگر ارسال شد",
            "info",
          );
          this.loadLeads(true);
        },
        error: (error) => {
          this.expirationRetryAfter.set(leadAssignmentId, Date.now() + 30000);
          this.showFeedback(
            this.errorMessage(error, "منقضی کردن لید انجام نشد"),
            "error",
          );
          this.loadLeads(true);
        },
      });
  }

  openReservationDialog(
    lead: ConsultantLead,
    secondaryPhoneNumber = "",
    options: { skipActionSuppress?: boolean } = {},
  ): void {
    this.clearPendingReservationDialogOpen();
    if (
      !options.skipActionSuppress &&
      Date.now() < this.suppressLeadCardActionsUntil
    ) {
      return;
    }

    const leadAssignmentId = this.leadId(lead);
    const minimumReservationAt = this.minimumReservationDateTime();
    const reservationSecondaryPhone =
      secondaryPhoneNumber.trim() ||
      (leadAssignmentId
        ? this.reservationSecondaryPhoneForLead(leadAssignmentId)
        : "");
    this.reservationDialogMode = "create";
    this.selectedEditReservation = null;
    this.editReservationOriginalAt = null;
    this.selectedReservationLead = lead;
    this.reservationForm = {
      reservationDate: minimumReservationAt,
      reservationTime: this.toTimeValue(minimumReservationAt),
      secondaryPhoneNumber: reservationSecondaryPhone,
      description: "",
      patientCity: this.reportForm.patientCity.trim(),
      patientRegion: this.reportForm.patientRegion.trim(),
      attendanceProbabilityPercent:
        this.normalizedAttendanceProbability(
          this.reportForm.attendanceProbabilityPercent,
        ) ?? 80,
      attendancePrediction: this.defaultAttendancePrediction(),
    };
    this.reservationDialogOpen = true;
  }

  openEditReservationDialog(lead: ConsultantLead): void {
    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId) return;

    const reservation = this.reservationForLead(leadAssignmentId);
    if (reservation) {
      this.openEditReservationDialogForReservation(lead, reservation);
      return;
    }

    const profileId = this.currentProfileId();
    if (!profileId) return;

    this.consultantApi
      .getReservations({
        consultantProfileId: profileId,
        includeCanceled: false,
        pageNumber: 1,
        pageSize: 100,
      })
      .subscribe({
        next: (response) => {
          this.reservations = response.items ?? [];
          this.syncReservedLeadIdsFromReservations(this.reservations);
          const loadedReservation = this.reservationForLead(leadAssignmentId);
          if (!loadedReservation || !this.canEditReservation(loadedReservation)) {
            this.showFeedback("رزرو قابل ویرایش برای این لید یافت نشد", "error");
            return;
          }
          this.openEditReservationDialogForReservation(lead, loadedReservation);
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "دریافت اطلاعات رزرو انجام نشد"),
            "error",
          ),
      });
  }

  private openEditReservationDialogForReservation(
    lead: ConsultantLead,
    reservation: ConsultantReservation,
  ): void {
    if (!this.canEditReservation(reservation)) return;

    const reservationAt = this.reservationDateTime(reservation);
    const date = reservationAt ? new Date(reservationAt) : new Date();

    this.reservationDialogMode = "edit";
    this.selectedReservationLead = lead;
    this.selectedEditReservation = reservation;
    this.editReservationOriginalAt = reservationAt || null;
    this.reservationForm = {
      reservationDate: Number.isFinite(date.getTime()) ? date : new Date(),
      reservationTime: this.toTimeValue(date),
      secondaryPhoneNumber:
        reservation.secondaryPhoneNumber ||
        reservation.SecondaryPhoneNumber ||
        "",
      description: reservation.description || reservation.Description || "",
      patientCity:
        this.reservationPatientCity(reservation) === "شهر ثبت نشده"
          ? ""
          : this.reservationPatientCity(reservation),
      patientRegion:
        reservation.patientRegion || reservation.PatientRegion || "",
      attendanceProbabilityPercent:
        Number(this.reservationAttendanceProbability(reservation)) || 80,
      attendancePrediction:
        this.reservationAttendancePrediction(reservation) ||
        this.defaultAttendancePrediction(),
    };
    this.reservationDialogOpen = true;
    this.markViewDirty();
  }

  private openPatientProfileDialog(reservation: ConsultantReservation): void {
    const names = this.splitReservationPatientName(
      this.reservationPatientName(reservation),
    );
    const phoneNumber = this.reservationPatientPhone(reservation);

    this.selectedPatientProfileReservation = reservation;
    this.patientProfileRequired = true;
    this.patientProfileForm = {
      ...this.emptyPatientProfileForm(),
      firstName: names.firstName,
      lastName: names.lastName,
      phoneNumber: phoneNumber === "-" ? "" : phoneNumber,
    };
    this.patientProfileDialogOpen = true;
  }

  private extractReservation(source: unknown): ConsultantReservation | null {
    if (!this.isRecord(source)) return null;

    if (this.reservationId(source as ConsultantReservation))
      return source as ConsultantReservation;

    for (const key of [
      "reservation",
      "Reservation",
      "data",
      "Data",
      "result",
      "Result",
      "value",
      "Value",
      "payload",
      "Payload",
    ]) {
      const nested = this.readValue(source, key);
      const reservation = this.extractReservation(nested);
      if (reservation) return reservation;
    }

    return null;
  }

  private resetPatientProfileState(): void {
    this.patientProfileDialogOpen = false;
    this.patientProfileSaving = false;
    this.patientProfileRequired = false;
    this.selectedPatientProfileReservation = null;
    this.patientProfileForm = this.emptyPatientProfileForm();
  }

  private markLeadReported(
    leadAssignmentId: number,
    nextState: number,
    isReportSubmitted = true,
  ): void {
    const updateLead = (lead: ConsultantLead): ConsultantLead => {
      if (this.leadId(lead) !== leadAssignmentId) return lead;

      return {
        ...lead,
        isReportSubmitted,
        IsReportSubmitted: isReportSubmitted,
        leadAssignmentState: nextState,
        LeadAssignmentState: nextState,
        state: nextState,
      };
    };

    this.leads = this.leads.map(updateLead);
    this.patientLeads = this.patientLeads.map(updateLead);
    this.reportEditLeads = this.reportEditLeads.map(updateLead);
  }

  private mergeLeadFromBackend(updatedLead: ConsultantLead): void {
    const leadAssignmentId = this.leadId(updatedLead);
    if (!leadAssignmentId) return;

    this.leads = this.replaceLeadInCollection(
      this.leads,
      leadAssignmentId,
      updatedLead,
    );
    this.patientLeads = this.replaceLeadInCollection(
      this.patientLeads,
      leadAssignmentId,
      updatedLead,
    );
    this.reportEditLeads = this.replaceLeadInCollection(
      this.reportEditLeads,
      leadAssignmentId,
      updatedLead,
    );
  }

  private replaceLeadInCollection(
    collection: ConsultantLead[],
    leadAssignmentId: number,
    updatedLead: ConsultantLead | Partial<ConsultantLead>,
  ): ConsultantLead[] {
    const index = collection.findIndex(
      (lead) => this.leadId(lead) === leadAssignmentId,
    );
    if (index === -1) return collection;

    return [
      ...collection.slice(0, index),
      this.mergeLeadUpdate(collection[index], updatedLead),
      ...collection.slice(index + 1),
    ];
  }

  private commitLeadsFromApi(items: ConsultantLead[]): void {
    this.leads = this.applyPendingReportPatches(items);
    this.syncReportedLeadIdsFromLeads(this.leads);
    this.syncReservedLeadIdsFromLeads(this.leads);
    this.syncCallInitiatedFromLeads(this.leads);
  }

  private rememberPendingReportPatch(
    leadAssignmentId: number,
    patch: Partial<ConsultantLead>,
  ): void {
    this.pendingReportPatches.set(leadAssignmentId, {
      patch,
      savedAt: Date.now(),
    });
    this.reportedLeadIds.add(leadAssignmentId);
    this.reportingLeadIds.delete(leadAssignmentId);
  }

  private buildSubmittedReportPatch(
    callResult: number,
    nextState: number,
    reportSubmittedAt: string,
    payload: {
      reportDescription: string;
      patientCity: string;
      patientRegion: string;
    },
  ): Partial<ConsultantLead> {
    return {
      callResult,
      CallResult: callResult,
      reportDescription: payload.reportDescription,
      ReportDescription: payload.reportDescription,
      patientCity: payload.patientCity,
      PatientCity: payload.patientCity,
      patientRegion: payload.patientRegion,
      PatientRegion: payload.patientRegion,
      isReportSubmitted: true,
      IsReportSubmitted: true,
      reportSubmittedAt,
      ReportSubmittedAt: reportSubmittedAt,
      leadAssignmentState: nextState,
      LeadAssignmentState: nextState,
      state: nextState,
    };
  }

  private prunePendingReportPatches(): void {
    const now = Date.now();
    for (const [leadAssignmentId, entry] of this.pendingReportPatches) {
      if (now - entry.savedAt > PENDING_REPORT_PATCH_TTL_MS) {
        this.pendingReportPatches.delete(leadAssignmentId);
      }
    }
  }

  private backendLeadHasReport(lead: ConsultantLead): boolean {
    if (Boolean(lead.isReportSubmitted ?? lead.IsReportSubmitted)) return true;
    if (Boolean(lead.reportSubmittedAt ?? lead.ReportSubmittedAt)) return true;
    return this.leadCallResult(lead) !== null;
  }

  private applyPendingReportPatches(leads: ConsultantLead[]): ConsultantLead[] {
    this.prunePendingReportPatches();
    if (!this.pendingReportPatches.size) return leads;

    return leads.map((lead) => {
      const leadAssignmentId = this.leadId(lead);
      if (!leadAssignmentId) return lead;

      const pending = this.pendingReportPatches.get(leadAssignmentId);
      if (!pending) return lead;

      if (this.backendLeadHasReport(lead) && this.leadCallResult(lead) !== null) {
        this.pendingReportPatches.delete(leadAssignmentId);
        return lead;
      }

      return this.mergeLeadUpdate(lead, pending.patch);
    });
  }

  private mergeLeadUpdate(
    existing: ConsultantLead,
    incoming: ConsultantLead | Partial<ConsultantLead>,
  ): ConsultantLead {
    const merged = { ...existing, ...incoming } as ConsultantLead;
    const leadAssignmentId = this.leadId(merged);
    if (!leadAssignmentId) return merged;

    const pending = this.pendingReportPatches.get(leadAssignmentId);
    if (pending && !this.backendLeadHasReport(incoming as ConsultantLead)) {
      return { ...merged, ...pending.patch } as ConsultantLead;
    }

    const incomingCallResult = this.leadCallResult(incoming as ConsultantLead);
    const existingCallResult = this.leadCallResult(existing);
    if (incomingCallResult === null && existingCallResult !== null) {
      return {
        ...merged,
        callResult: existingCallResult,
        CallResult: existingCallResult,
      };
    }

    return merged;
  }

  private selectedReservationDateTime(): Date | null {
    const date = this.reservationForm.reservationDate;
    const time = this.reservationForm.reservationTime;
    if (!date || !time) return null;

    const [hours, minutes] = time.split(":").map(Number);
    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      minutes,
    );
  }

  private isReservationTimeChanged(reservationAt: Date | null): boolean {
    if (!this.isReservationEditMode() || !this.editReservationOriginalAt) {
      return true;
    }

    if (!reservationAt || !Number.isFinite(reservationAt.getTime())) {
      return true;
    }

    const original = new Date(this.editReservationOriginalAt);
    if (!Number.isFinite(original.getTime())) return true;

    return original.getTime() !== reservationAt.getTime();
  }

  private minimumReservationDateTime(): Date {
    const date = new Date(Date.now() + 5 * 60 * 1000);
    date.setSeconds(0, 0);
    return date;
  }

  private toTimeValue(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private leadDeadlineMs(lead: ConsultantLead): number {
    const leadAssignmentId = this.leadId(lead);
    const localStart = leadAssignmentId
      ? this.timerStarts[String(leadAssignmentId)]
      : undefined;

    if (localStart !== undefined) {
      return localStart + REALTIME_CALL_WINDOW_MS;
    }

    return Date.now() + REALTIME_CALL_WINDOW_MS;
  }

  private resetRealtimeLeadTimer(
    leadAssignmentId: number,
    _callDeadlineAt?: string | null,
  ): void {
    delete this.timerStarts[String(leadAssignmentId)];
    this.phoneRevealedLeadIds.delete(leadAssignmentId);
    this.stoppedTimerLeadIds.delete(leadAssignmentId);
    this.timerExpiredReportPromptedLeadIds.delete(leadAssignmentId);
    this.writeJson(this.timerStorageKey(), this.timerStarts);
    this.writeJson(this.phoneRevealedStorageKey(), [...this.phoneRevealedLeadIds]);
    this.writeJson(
      this.stoppedTimerStorageKey(),
      [...this.stoppedTimerLeadIds],
    );
  }

  private releaseLeadReportSession(leadAssignmentId: number): void {
    this.reportingLeadIds.delete(leadAssignmentId);
    this.timerExpiredReportPromptedLeadIds.delete(leadAssignmentId);
    this.reportedLeadIds.add(leadAssignmentId);
    this.phoneRevealedLeadIds.delete(leadAssignmentId);
    this.stopRealtimeTimer(leadAssignmentId);
    this.writeJson(this.phoneRevealedStorageKey(), [...this.phoneRevealedLeadIds]);
  }

  private isActiveRealtimeLead(lead: ConsultantLead): boolean {
    const state = this.leadState(lead);
    return state === LEAD_STATE.New || state === LEAD_STATE.Assigned;
  }

  private stopRealtimeTimer(leadAssignmentId: number): void {
    if (this.stoppedTimerLeadIds.has(leadAssignmentId)) return;

    this.stoppedTimerLeadIds.add(leadAssignmentId);
    this.writeJson(
      this.stoppedTimerStorageKey(),
      [...this.stoppedTimerLeadIds],
    );
    this.markViewDirty();
  }

  private defaultPatientAvatarImageName(): string {
    return "default-patient-avatar.png";
  }

  validateLeadReportForm(): string | null {
    const callResult = Number(this.reportForm.callResult);
    if (![1, 2, 3, 4, 5, 6, 7, 8].includes(callResult))
      return "نتیجه تماس معتبر نیست";

    const description = this.reportForm.reportDescription.trim();
    if (description.length > 1000)
      return "توضیحات گزارش نباید بیشتر از ۱۰۰۰ کاراکتر باشد";

    if (!this.isSuccessfulCallResult(callResult)) {
      if (!description) return "توضیحات گزارش الزامی است";
      return null;
    }

    if (!this.reportForm.patientCity.trim())
      return "شهر بیمار الزامی است";
    if (!this.reportForm.patientRegion.trim())
      return "منطقه بیمار الزامی است";

    if (this.reportForm.patientCity.trim().length > 80)
      return "شهر بیمار نباید بیشتر از ۸۰ کاراکتر باشد";
    if (this.reportForm.patientRegion.trim().length > 80)
      return "منطقه بیمار نباید بیشتر از ۸۰ کاراکتر باشد";

    const secondaryPhone = this.reportForm.secondaryPhoneNumber.trim();
    if (secondaryPhone && !/^09\d{9}$/.test(secondaryPhone))
      return "شماره تماس دوم بیمار معتبر نیست";

    const rawAttendanceProbability =
      this.reportForm.attendanceProbabilityPercent;
    const attendanceProbabilityPercent =
      rawAttendanceProbability === null ||
      rawAttendanceProbability === undefined ||
      rawAttendanceProbability === ""
        ? null
        : Number(rawAttendanceProbability);
    if (
      attendanceProbabilityPercent !== null &&
      (!Number.isFinite(attendanceProbabilityPercent) ||
        attendanceProbabilityPercent < 0 ||
        attendanceProbabilityPercent > 100)
    )
      return "درصد احتمال حضور باید بین ۰ تا ۱۰۰ باشد";

    return null;
  }

  validateReservationForm(): string | null {
    if (!this.reservationForm.reservationDate) return "تاریخ رزرو الزامی است";
    if (!this.reservationForm.reservationTime) return "ساعت رزرو الزامی است";

    const reservationAt = this.selectedReservationDateTime();
    const reservationTimeChanged = this.isReservationTimeChanged(reservationAt);
    if (
      !reservationAt ||
      !Number.isFinite(reservationAt.getTime()) ||
      (reservationTimeChanged && reservationAt.getTime() <= Date.now())
    )
      return "زمان رزرو باید در آینده باشد";

    if (!this.reservationForm.patientCity.trim())
      return "شهر بیمار برای رزرو الزامی است";
    if (!this.reservationForm.patientRegion.trim())
      return "منطقه بیمار برای رزرو الزامی است";
    if (!this.reservationForm.attendancePrediction.trim())
      return "پیش‌بینی حضور برای رزرو الزامی است";
    if (
      !Number.isFinite(this.reservationForm.attendanceProbabilityPercent) ||
      this.reservationForm.attendanceProbabilityPercent < 0 ||
      this.reservationForm.attendanceProbabilityPercent > 100
    )
      return "درصد احتمال حضور باید بین ۰ تا ۱۰۰ باشد";

    const secondaryPhone = this.reservationForm.secondaryPhoneNumber.trim();
    if (secondaryPhone && !/^09\d{9}$/.test(secondaryPhone))
      return "شماره تماس دوم بیمار معتبر نیست";

    if (this.reservationForm.patientCity.trim().length > 80)
      return "شهر بیمار نباید بیشتر از ۸۰ کاراکتر باشد";
    if (this.reservationForm.patientRegion.trim().length > 80)
      return "منطقه بیمار نباید بیشتر از ۸۰ کاراکتر باشد";

    if (this.reservationForm.description.trim().length > 1000)
      return "توضیحات رزرو نباید بیشتر از ۱۰۰۰ کاراکتر باشد";

    return null;
  }

  private isSuccessfulCallResult(callResult: number): boolean {
    return callResult === 1 || callResult === 2;
  }

  private readShouldOpenReservationPage(source: unknown): boolean {
    return (
      this.readBoolean(
        source,
        "shouldOpenReservationPage",
        "ShouldOpenReservationPage",
      ) === true
    );
  }

  private clearPendingReservationDialogOpen(): void {
    if (!this.pendingReservationOpenTimer) return;
    clearTimeout(this.pendingReservationOpenTimer);
    this.pendingReservationOpenTimer = null;
  }

  private scheduleReservationDialogOpen(
    lead: ConsultantLead,
    secondaryPhoneNumber = "",
  ): void {
    this.clearPendingReservationDialogOpen();
    this.pendingReservationOpenTimer = setTimeout(() => {
      this.pendingReservationOpenTimer = null;
      this.openReservationDialog(lead, secondaryPhoneNumber, {
        skipActionSuppress: true,
      });
    }, 650);
  }

  validateProfileForm(): string | null {
    const code = this.profileForm.nationalityCode.trim();
    if (!/^\d{10}$/.test(code)) return "کد ملی باید ۱۰ رقم باشد";
    if (
      !this.profileForm.address.trim() ||
      this.profileForm.address.trim().length < 5
    )
      return "آدرس مشاور الزامی است";
    return null;
  }

  validatePatientProfileForm(): string | null {
    const firstName = this.patientProfileForm.firstName.trim();
    const lastName = this.patientProfileForm.lastName.trim();
    const phoneNumber = this.patientProfileForm.phoneNumber.trim();
    const expectedPhoneNumberValue = this.selectedPatientProfileReservation
      ? this.reservationPatientPhone(
          this.selectedPatientProfileReservation,
        ).trim()
      : phoneNumber;
    const expectedPhoneNumber =
      expectedPhoneNumberValue && expectedPhoneNumberValue !== "-"
        ? expectedPhoneNumberValue
        : phoneNumber;
    if (!firstName) return "نام بیمار الزامی است";
    if (firstName.length > 100)
      return "نام بیمار نباید بیشتر از ۱۰۰ کاراکتر باشد";
    if (!lastName) return "نام خانوادگی بیمار الزامی است";
    if (lastName.length > 100)
      return "نام خانوادگی بیمار نباید بیشتر از ۱۰۰ کاراکتر باشد";
    if (!/^09\d{9}$/.test(phoneNumber)) return "شماره موبایل بیمار معتبر نیست";
    if (phoneNumber !== expectedPhoneNumber)
      return "شماره موبایل بیمار باید با شماره لید رزرو شده یکسان باشد";
    if (!this.patientProfileForm.password) return "رمز عبور بیمار الزامی است";
    if (this.patientProfileForm.password.length < 6)
      return "رمز عبور باید حداقل ۶ کاراکتر باشد";
    if (this.patientProfileForm.password.length > 100)
      return "رمز عبور نباید بیشتر از ۱۰۰ کاراکتر باشد";
    if (![1, 2].includes(Number(this.patientProfileForm.gender)))
      return "جنسیت بیمار معتبر نیست";
    return null;
  }

  private buildCompletePatientProfileRequest(
    reservationId: number,
  ): CompletePatientProfileRequest {
    return {
      reservationId,
      firstName: this.patientProfileForm.firstName.trim(),
      lastName: this.patientProfileForm.lastName.trim(),
      phoneNumber: this.patientProfileForm.phoneNumber.trim(),
      passwordHash: this.patientProfileForm.password,
      avatarImageName: this.defaultPatientAvatarImageName(),
      gender: Number(this.patientProfileForm.gender),
      birthDate: new Date(2000, 0, 1).toISOString(),
    };
  }

  private emptyPatientProfileForm(): PatientProfileForm {
    return {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      password: "",
      gender: 1,
    };
  }

  private emptyAddPatientLeadForm(): AddPatientLeadForm {
    return {
      userName: "",
      phoneNumber: "",
      patientCity: "",
      patientRegion: "",
      secondaryPhoneNumber: "",
      reportDescription: "",
    };
  }

  private splitReservationPatientName(value: string | null | undefined): {
    firstName: string;
    lastName: string;
  } {
    const parts = (value ?? "").trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" "),
    };
  }

  private createYesterday(): Date {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return this.startOfDay(date);
  }

  private createRelativeYearDate(yearOffset: number): Date {
    const date = new Date();
    date.setFullYear(date.getFullYear() + yearOffset);
    return this.startOfDay(date);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private toDateInputValue(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  private resolveProfileId(data: unknown): number | null {
    if (typeof data === "number" && data > 0) return data;
    if (typeof data === "string") {
      const numeric = Number(data);
      return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
    }

    if (typeof data !== "object" || data === null) return null;

    const source = data as Record<string, unknown>;
    for (const key of ["profileId", "consultantProfileId", "id"]) {
      const value = source[key];
      const numeric =
        typeof value === "number"
          ? value
          : typeof value === "string"
            ? Number(value)
            : NaN;
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }

    return null;
  }

  private requireProfileId(): number | null {
    const profileId = this.currentProfileId();
    if (!profileId) {
      this.showFeedback("شناسه پروفایل مشاور یافت نشد", "error");
      return null;
    }

    return profileId;
  }

  private timerStorageKey(): string {
    return `consultant-lead-timers:${this.userKey()}`;
  }

  private stoppedTimerStorageKey(): string {
    return `consultant-lead-timers-stopped:${this.userKey()}`;
  }

  private phoneRevealedStorageKey(): string {
    return `consultant-lead-phone-revealed:${this.userKey()}`;
  }

  private userKey(): string {
    const user = this.user();
    return user?.userId || user?.phoneNumber || "current";
  }

  private toDateTimeLocalValue(date: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private readJson<T>(key: string, fallback: T): T {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) as T) : fallback;
    } catch {
      return fallback;
    }
  }

  private writeJson(key: string, value: unknown): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // The dashboard still works; only local timer persistence is skipped.
    }
  }

  private applyConsultantStatusFrom(
    ...sources: unknown[]
  ): ConsultantStatusUpdate {
    const update: ConsultantStatusUpdate = {
      isAvailable: null,
      isOnline: null,
      canGoOnline: null,
      onlineStatusBlockReason: undefined,
    };

    sources.forEach((source) =>
      this.collectConsultantStatus(source, update, 0),
    );

    if (update.isAvailable !== null) this.isAvailable = update.isAvailable;
    if (update.isOnline !== null) this.isOnline = update.isOnline;
    if (update.canGoOnline !== null) {
      this.canGoOnlineFromStatus = update.canGoOnline;
      this.dashboardStatusLoaded = true;
      if (update.canGoOnline) {
        this.onlineStatusBlockReason = null;
      }
    }
    if (update.onlineStatusBlockReason !== undefined) {
      this.onlineStatusBlockReason = update.onlineStatusBlockReason;
    }

    return update;
  }

  private collectConsultantStatus(
    source: unknown,
    update: ConsultantStatusUpdate,
    depth: number,
  ): void {
    if (depth > 2 || !this.isRecord(source)) return;

    update.isAvailable ??= this.readBoolean(
      source,
      "isAvailable",
      "IsAvailable",
      "available",
      "consultantIsAvailable",
    );
    update.isOnline ??= this.readBoolean(
      source,
      "isOnline",
      "IsOnline",
      "online",
      "consultantIsOnline",
      "isConsultantOnline",
      "IsConsultantOnline",
    );
    update.canGoOnline ??= this.readBoolean(source, "canGoOnline", "CanGoOnline");

    if (update.onlineStatusBlockReason === undefined) {
      const blockReason = this.readString(
        source,
        "onlineStatusBlockReason",
        "blockReason",
        "BlockReason",
      );
      if (blockReason !== null) {
        update.onlineStatusBlockReason = blockReason.trim() || null;
      }
    }

    if (update.isOnline === null) {
      const isOffline = this.readBoolean(
        source,
        "isOffline",
        "offline",
        "consultantIsOffline",
      );
      if (isOffline !== null) update.isOnline = !isOffline;
    }

    for (const key of [
      "data",
      "result",
      "value",
      "payload",
      "consultant",
      "profile",
      "status",
    ]) {
      const nested = this.readValue(source, key);
      if (nested && nested !== source)
        this.collectConsultantStatus(nested, update, depth + 1);
    }
  }

  private readBoolean(source: unknown, ...keys: string[]): boolean | null {
    if (!this.isRecord(source)) return null;

    for (const key of keys) {
      const value = this.readValue(source, key);
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "1", "yes"].includes(normalized)) return true;
        if (["false", "0", "no"].includes(normalized)) return false;
      }
    }

    return null;
  }

  private readString(source: unknown, ...keys: string[]): string | null {
    if (!this.isRecord(source)) return null;

    for (const key of keys) {
      const value = this.readValue(source, key);
      if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed || null;
      }
    }

    return null;
  }

  private numberOrNull(value: unknown): number | null {
    if (value === null || value === undefined || value === "") return null;
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private readValue(source: unknown, ...keys: string[]): unknown {
    if (!this.isRecord(source)) return undefined;

    for (const key of keys) {
      if (Object.prototype.hasOwnProperty.call(source, key)) return source[key];
    }

    const entries = Object.entries(source);
    for (const key of keys) {
      const match = entries.find(
        ([entryKey]) => entryKey.toLowerCase() === key.toLowerCase(),
      );
      if (match) return match[1];
    }

    return undefined;
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private showFeedback(
    message: string,
    type: "success" | "error" | "info",
  ): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
    if (this.feedbackAutoDismissTimer) {
      clearTimeout(this.feedbackAutoDismissTimer);
      this.feedbackAutoDismissTimer = null;
    }
    this.feedbackAutoDismissTimer = setTimeout(() => {
      this.feedbackAutoDismissTimer = null;
      this.clearFeedback();
    }, 3500);
    if (type === "success") {
      this.toast.success(message);
    } else if (type === "error") {
      this.toast.error(message);
    } else {
      this.toast.info(message);
    }
    this.markViewDirty();
  }

  clearFeedback(): void {
    if (this.feedbackAutoDismissTimer) {
      clearTimeout(this.feedbackAutoDismissTimer);
      this.feedbackAutoDismissTimer = null;
    }
    this.feedbackMessage = "";
  }

  private isAlreadyCompleteProfileError(message: string): boolean {
    const normalized = message.trim().toLowerCase();
    if (!normalized) return false;

    const markers = [
      "already",
      "complete",
      "completed",
      "تکمیل شده",
      "قبلا",
      "قبلاً",
      "از قبل",
      "پروفایل کامل",
      "کامل است",
    ];

    return markers.some((marker) => normalized.includes(marker));
  }

  private errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
