 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,


  DestroyRef,



  computed,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { catchError, finalize, firstValueFrom, map, of, retry, switchMap } from "rxjs";













import {
  playRealtimeLeadAlertSound,
  primeRealtimeLeadAlertAudio,
} from "../../core/push/lead-alert-sound";


import { BaseDialogComponent } from "../../shared/base/base-dialog/base-dialog.component";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { ConsultantReservationsPanelComponent } from "./consultant-reservations-panel.component";
import { SecretaryFollowUpsListComponent } from "./secretary-follow-ups-list.component";
import { ConsultantWalletComponent } from "./consultant-wallet.component";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import { createCoalescedMarkForCheck } from "../../shared/change-detection/coalesce-mark-for-check";
import { bindDashboardMobileSidebar } from "../../shared/dashboard/dashboard-mobile-sidebar";
import { bindDashboardRouteHistory } from "../../shared/dashboard/dashboard-route-history";
import {
  combineIranDateAndTime,
  formatIranDateTime,
  formatReservationTime,
  nowInIran,
  nowInIranMs,
  toIranDateInputValue,
  toIranTimeInputValue,
} from "../../utils/iran-datetime.util";
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

import { DENTAL_SERVICE_OPTIONS, dentalServicesOf } from "../../core/reservation/dental-services";
import { validatePatientCount } from "../../core/reservation/reservation.model";
import { canConsultantEditReservation } from "../../core/reservation/reservation-attendance";
const REALTIME_CALL_WINDOW_MS = 20 * 60 * 1000;
const REALTIME_CALL_WINDOW_MINUTES = 20;
const PENDING_REPORT_PATCH_TTL_MS = 60000;

const CALL_RESULT_BY_NAME = {
  contacted: 1,
  converted: 2,
  rejected: 3,
  noanswer: 4,
  wrongnumber: 5,
  needfollowup: 6,
  busy: 7,
  patienthungup: 8,
};

const CALL_RESULT_DEFAULT_DESCRIPTIONS = {
  1: "تماس برقرار شد",
  2: "تبدیل به بیمار",
  3: "رد شد",
  4: "پاسخ نداد",
  5: "شماره اشتباه بود",
  6: "نیاز به پیگیری دارد",
  7: "اشغال",
  8: "قطع تماس توسط بیمار",
};








































































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
    SecretaryFollowUpsListComponent,
    ConsultantWalletComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./consultant-dashboard.component.html",
  styleUrl: "./consultant-dashboard.component.scss",
})
export class ConsultantDashboardComponent  {
   __init() {this.user = this.auth.user}
  __init2() {this.activeSection = "overview"}
  __init3() {this.mobileSidebarOpen = false}

   __init4() {this.dashboardLinks = [
    { id: "overview", label: "نمای کلی", icon: "dashboard" },
    { id: "profile", label: "پروفایل", icon: "shield" },
    { id: "leads", label: "لیدها", icon: "clipboard" },
    { id: "report-edits", label: "ویرایش گزارش", icon: "edit" },
    { id: "patients", label: "بیماران", icon: "doctor" },
    { id: "patient-profiles", label: "پرونده‌ها", icon: "clipboard" },
    { id: "reservations", label: "رزروها", icon: "calendar" },
    { id: "secretary-follow-ups", label: "پیگیری‌های منشی", icon: "clipboard" },
    { id: "wallet", label: "کیف پول من", icon: "wallet" },
  ]}

   __init5() {this.displayName = computed(() => {
    const user = this.user();
    const name = [_optionalChain([user, 'optionalAccess', _10 => _10.firstName]), _optionalChain([user, 'optionalAccess', _11 => _11.lastName])]
      .filter(Boolean)
      .join(" ")
      .trim();
    return name || "مشاور";
  })}
   __init6() {this.roleLabel = computed(() => {
    const user = this.user();
    return user ? this.auth.roleLabel(user.role, "fa") : "مشاور";
  })}

  __init7() {this.profileForm = {
    nationalityCode: "",
    address: "",
  }}
  __init8() {this.profileSaving = false}
  __init9() {this.profileId = null}

  __init10() {this.isAvailable = false}
  __init11() {this.isOnline = false}
  __init12() {this.availabilitySaving = false}
  __init13() {this.onlineSaving = false}
  __init14() {this.loggingOut = false}
  __init15() {this.testPushSaving = false}
  __init16() {this.enablePushSaving = false}
  __init17() {this.pushRegistrationReady = false}
  __init18() {this.canGoOnlineFromStatus = false}
  __init19() {this.dashboardStatusLoaded = false}
  __init20() {this.todayReservationsCount = 0}
  __init21() {this.totalReservationsCount = 0}
  __init22() {this.totalReservedPatientsCount = 0}
  __init23() {this.todayCallsCount = 0}
  __init24() {this.dailyLimit = 0}
  __init25() {this.todayPickupCount = 0}
  __init26() {this.remainingDailyCapacity = 0}
  __init27() {this.onlineStatusBlockReason = null}
  __init28() {this.pendingReportCount = 0}
  __init29() {this.uncalledWithoutReportCount = 0}
  __init30() {this.isNewLeadBlocked = false}
  __init31() {this.shouldShowWorkloadNotification = false}
  __init32() {this.workloadNotificationMessage = null}
   __init33() {this.lastWorkloadNotificationMessage = null}

  __init34() {this.leads = []}
  __init35() {this.leadsLoading = false}
  __init36() {this.leadSearchText = ""}
  __init37() {this.leadNameFilter = ""}
  __init38() {this.leadPhoneFilter = ""}
  __init39() {this.leadCityFilter = ""}
  __init40() {this.leadStateFilter = null}
  __init41() {this.leadTypeFilter = null}
  __init42() {this.leadFromDate = null}
  __init43() {this.leadToDate = null}
   __init44() {this.leadFromDatePickerLabel = { fa: "از تاریخ", en: "From date" }}
   __init45() {this.leadToDatePickerLabel = { fa: "تا تاریخ", en: "To date" }}
  __init46() {this.leadPageNumber = 1}
  __init47() {this.leadPageSize = 10}
  __init48() {this.leadTotalPages = 1}
  __init49() {this.leadTotalCount = 0}
  __init50() {this.highlightedLeadAssignmentId = null}

  __init51() {this.reportEditLeads = []}
  __init52() {this.reportEditLeadsLoading = false}
  __init53() {this.reportEditSearchTerm = ""}
  __init54() {this.reportEditPhoneFilter = ""}
  __init55() {this.reportEditStateFilter = null}
  __init56() {this.reportEditFromDate = null}
  __init57() {this.reportEditToDate = null}
   __init58() {this.reportEditFromDatePickerLabel = { fa: "از تاریخ", en: "From date" }}
   __init59() {this.reportEditToDatePickerLabel = { fa: "تا تاریخ", en: "To date" }}
  __init60() {this.reportEditPageNumber = 1}
  __init61() {this.reportEditPageSize = 25}
  __init62() {this.reportEditTotalPages = 1}
  __init63() {this.reportEditTotalCount = 0}
   __init64() {this.reportEditRequestId = 0}
  
   __init65() {this.leadSearchDebounceId = null}

  __init66() {this.patientLeads = []}
  __init67() {this.patientLeadsLoading = false}
  __init68() {this.patientSearchTerm = ""}
  __init69() {this.patientPageNumber = 1}
  __init70() {this.patientPageSize = 10}
  __init71() {this.patientTotalPages = 1}
  __init72() {this.patientTotalCount = 0}
   __init73() {this.patientLeadRequestId = 0}

  __init74() {this.patientProfiles = []}
  __init75() {this.patientProfilesLoading = false}
  __init76() {this.patientProfileFromDate = null}
  __init77() {this.patientProfileToDate = null}
  __init78() {this.patientProfilePageNumber = 1}
  __init79() {this.patientProfilePageSize = 10}
  __init80() {this.patientProfileTotalPages = 1}
  __init81() {this.patientProfileTotalCount = 0}
   __init82() {this.patientProfileRequestId = 0}

  __init83() {this.reportDialogOpen = false}
  __init84() {this.reportDialogMode = "create"}
  __init85() {this.reportSaving = false}
  __init86() {this.selectedLead = null}
  __init87() {this.reportForm = this.emptyLeadReportForm()}
   __init88() {this.reportEditOriginalSecondaryPhone = null}

  __init89() {this.closeLeadDialogOpen = false}
  __init90() {this.closeLeadSaving = false}
  __init91() {this.selectedLeadToClose = null}
  __init92() {this.closeLeadReason = 1}
  __init93() {this.closeLeadDescription = ""}
   __init94() {this.closeLeadReasons = [
    { value: 1, label: "عدم تمایل بیمار" },
    { value: 2, label: "درخواست عدم تماس مجدد" },
    { value: 3, label: "عدم پاسخ پس از پیگیری" },
    { value: 4, label: "اطلاعات لید نامعتبر است" },
    { value: 5, label: "سایر" },
  ]}

  __init95() {this.reservationDialogOpen = false}
  __init96() {this.reservationDialogMode = "create"}
  __init97() {this.reservationSaving = false}
  __init98() {this.selectedReservationLead = null}
  __init99() {this.selectedEditReservation = null}
   __init100() {this.editReservationOriginalAt = null}
  __init101() {this.reservationForm = {
    reservationDate: null,
    reservationTime: "",
    patientCount: 1,
    secondaryPhoneNumber: "",
    description: "",
    patientCity: "",
    patientRegion: "",
    attendanceProbabilityPercent: 8,
    attendancePrediction: "",
    dentalServices: [],
  }}
  __init102() {this.reservations = []}
  __init103() {this.reservationsLoading = false}
   __init104() {this.reservationDatePickerLabel = {
    fa: "تاریخ رزرو",
    en: "Reservation date",
  }}

  __init105() {this.patientProfileDialogOpen = false}
  __init106() {this.patientProfileSaving = false}
  __init107() {this.patientProfileRequired = false}
  __init108() {this.selectedPatientProfileReservation = null}
  __init109() {this.patientProfileForm = this.emptyPatientProfileForm()}

  __init110() {this.addPatientLeadDialogOpen = false}
  __init111() {this.addPatientLeadSaving = false}
  __init112() {this.addPatientLeadForm = this.emptyAddPatientLeadForm()}

  __init113() {this.feedbackMessage = ""}
  __init114() {this.feedbackType = "success"}

   __init115() {this.currentTime = Date.now()}
   __init116() {this.timerId = null}
   __init117() {this.pollId = null}
   __init118() {this.autoAbsenceId = null}
   __init119() {this.autoAbsenceRunning = false}
    __init120() {this.expiringLeadIds = new Set()}
    __init121() {this.reportedLeadIds = new Set()}
    __init122() {this.reservedLeadIds = new Set()}
    __init123() {this.reportingLeadIds = new Set()}
    __init124() {this.pendingReportPatches = new Map


()}
    __init125() {this.timerExpiredReportPromptedLeadIds = new Set()}
    __init126() {this.expirationRetryAfter = new Map()}
   __init127() {this.feedbackAutoDismissTimer = null}
   __init128() {this.pendingReservationOpenTimer = null}
   __init129() {this.suppressLeadCardActionsUntil = 0}
   __init130() {this.leadStatusRefreshRequestId = 0}
   __init131() {this.timerStarts = {}}
    __init132() {this.stoppedTimerLeadIds = new Set()}
    __init133() {this.phoneRevealedLeadIds = new Set()}
   __init134() {this.leadRequestId = 0}
   __init135() {this.reservationRequestId = 0}
   __init136() {this.visibleLeadLoadingRequestId = 0}
   __init137() {this.leadLoadSubscription = null}
   __init138() {this.newLeadsRequestInFlight = false}
   __init139() {this.pendingNewLeadsLoad = false}
   __init140() {this.pendingNewLeadsLoadIsQuiet = true}
    __init141() {this.pendingNewLeadsLoadCallbacks = []}
   __init142() {this.reservationLoadSubscription = null}
   __init143() {this.dashboardStatusSubscription = null}
   __init144() {this.routeQueryParamsSubscription = null}
   __init145() {this.destroyed = false}
   __init146() {this.pollIntervalMs = 30000}
   __init147() {this.routeParamsInitialized = false}
  
   __init148() {this.ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR}
    __init149() {this.onPushStateSync = () => {
    void this.syncPushRegistrationState();
    if (
      this.isProfileReady() &&
      (typeof document === "undefined" || document.visibilityState === "visible")
    ) {
      this.loadDashboardStatus();
    }
  }}

  get usedCapacityPercent() {
    return this.dailyLimit > 0
      ? Math.min(
          100,
          Math.round((this.todayPickupCount / this.dailyLimit) * 100),
        )
      : 100;
  }

  get browserNotificationPermission() {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "unsupported";
    }
    return Notification.permission;
  }

  get pushEnvironmentHint() {
    return this.notifications.getEnvironmentHint();
  }

  get shouldShowPushSetupBanner() {
    if (!this.isProfileReady()) return false;
    if (this.pushRegistrationReady) return false;
    if (this.notifications.getEnvironmentIssue()) return false;
    return this.browserNotificationPermission !== "denied";
  }

    __init150() {this.pushMessageListener = (event) => {
    const detail = (
      event 




    ).detail;
    if (!detail) return;

    const pushType = _optionalChain([detail, 'access', _12 => _12.data, 'optionalAccess', _13 => _13["type"]]);
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

    if ([
      "ReservationSecretaryNoAnswer",
      "ReservationSecretaryConfirmed",
      "ReservationSecretaryCancelled",
    ].includes(_nullishCoalesce(pushType, () => ( "")))) {
      if (detail.body) this.showFeedback(`🔔 ${detail.body}`, "info");
      return;
    }

    if (detail.body) this.showFeedback(detail.body, "success");
  }}

    __init151() {this.leadPickedUpListener = (event) => {
    const detail = (event 


).detail;
    const leadId = _optionalChain([detail, 'optionalAccess', _14 => _14.leadId]);
    if (!leadId || !this.isProfileReady()) return;

    this.isOnline = false;
    this.realtimeLeadAlerts.stopPolling();
    this.configurePollTimer();
    this.resetRealtimeLeadTimer(leadId, _optionalChain([detail, 'optionalAccess', _15 => _15.callDeadlineAt]));
    this.activeSection = "leads";
    this.syncSectionQueryParam("leads");
    this.leadTypeFilter = LEAD_TYPE.RealTime;
    this.leadStateFilter = null;
    this.leadFromDate = null;
    this.leadToDate = null;
    this.leadPageNumber = 1;
    this.highlightedLeadAssignmentId = leadId;
    this.refreshDashboard();
    this.loadLeads();
    this.markViewDirty();
    this.scrollToHighlightedLead();
  }}

    __init152() {this.workloadBlockedListener = (event) => {
    const message = _optionalChain([(event ), 'access', _16 => _16.detail, 'optionalAccess', _17 => _17.message]);
    if (message) this.showFeedback(message, "error");
    this.setSection("leads");
    this.refreshDashboard();
  }}

    __init153() {this.destroyRef = inject(DestroyRef)}
    __init154() {this.mobileSidebar = bindDashboardMobileSidebar(
    this,
    () => this.markViewDirty(),
    this.destroyRef,
  )}

  constructor(
     auth,
     router,
     route,
     consultantApi,
     pushNotifications,
     notifications,
     realtimeLeadAlerts,
     toast,
     cdr,
     ngZone,
  ) {;this.auth = auth;this.router = router;this.route = route;this.consultantApi = consultantApi;this.pushNotifications = pushNotifications;this.notifications = notifications;this.realtimeLeadAlerts = realtimeLeadAlerts;this.toast = toast;this.cdr = cdr;this.ngZone = ngZone;ConsultantDashboardComponent.prototype.__init.call(this);ConsultantDashboardComponent.prototype.__init2.call(this);ConsultantDashboardComponent.prototype.__init3.call(this);ConsultantDashboardComponent.prototype.__init4.call(this);ConsultantDashboardComponent.prototype.__init5.call(this);ConsultantDashboardComponent.prototype.__init6.call(this);ConsultantDashboardComponent.prototype.__init7.call(this);ConsultantDashboardComponent.prototype.__init8.call(this);ConsultantDashboardComponent.prototype.__init9.call(this);ConsultantDashboardComponent.prototype.__init10.call(this);ConsultantDashboardComponent.prototype.__init11.call(this);ConsultantDashboardComponent.prototype.__init12.call(this);ConsultantDashboardComponent.prototype.__init13.call(this);ConsultantDashboardComponent.prototype.__init14.call(this);ConsultantDashboardComponent.prototype.__init15.call(this);ConsultantDashboardComponent.prototype.__init16.call(this);ConsultantDashboardComponent.prototype.__init17.call(this);ConsultantDashboardComponent.prototype.__init18.call(this);ConsultantDashboardComponent.prototype.__init19.call(this);ConsultantDashboardComponent.prototype.__init20.call(this);ConsultantDashboardComponent.prototype.__init21.call(this);ConsultantDashboardComponent.prototype.__init22.call(this);ConsultantDashboardComponent.prototype.__init23.call(this);ConsultantDashboardComponent.prototype.__init24.call(this);ConsultantDashboardComponent.prototype.__init25.call(this);ConsultantDashboardComponent.prototype.__init26.call(this);ConsultantDashboardComponent.prototype.__init27.call(this);ConsultantDashboardComponent.prototype.__init28.call(this);ConsultantDashboardComponent.prototype.__init29.call(this);ConsultantDashboardComponent.prototype.__init30.call(this);ConsultantDashboardComponent.prototype.__init31.call(this);ConsultantDashboardComponent.prototype.__init32.call(this);ConsultantDashboardComponent.prototype.__init33.call(this);ConsultantDashboardComponent.prototype.__init34.call(this);ConsultantDashboardComponent.prototype.__init35.call(this);ConsultantDashboardComponent.prototype.__init36.call(this);ConsultantDashboardComponent.prototype.__init37.call(this);ConsultantDashboardComponent.prototype.__init38.call(this);ConsultantDashboardComponent.prototype.__init39.call(this);ConsultantDashboardComponent.prototype.__init40.call(this);ConsultantDashboardComponent.prototype.__init41.call(this);ConsultantDashboardComponent.prototype.__init42.call(this);ConsultantDashboardComponent.prototype.__init43.call(this);ConsultantDashboardComponent.prototype.__init44.call(this);ConsultantDashboardComponent.prototype.__init45.call(this);ConsultantDashboardComponent.prototype.__init46.call(this);ConsultantDashboardComponent.prototype.__init47.call(this);ConsultantDashboardComponent.prototype.__init48.call(this);ConsultantDashboardComponent.prototype.__init49.call(this);ConsultantDashboardComponent.prototype.__init50.call(this);ConsultantDashboardComponent.prototype.__init51.call(this);ConsultantDashboardComponent.prototype.__init52.call(this);ConsultantDashboardComponent.prototype.__init53.call(this);ConsultantDashboardComponent.prototype.__init54.call(this);ConsultantDashboardComponent.prototype.__init55.call(this);ConsultantDashboardComponent.prototype.__init56.call(this);ConsultantDashboardComponent.prototype.__init57.call(this);ConsultantDashboardComponent.prototype.__init58.call(this);ConsultantDashboardComponent.prototype.__init59.call(this);ConsultantDashboardComponent.prototype.__init60.call(this);ConsultantDashboardComponent.prototype.__init61.call(this);ConsultantDashboardComponent.prototype.__init62.call(this);ConsultantDashboardComponent.prototype.__init63.call(this);ConsultantDashboardComponent.prototype.__init64.call(this);ConsultantDashboardComponent.prototype.__init65.call(this);ConsultantDashboardComponent.prototype.__init66.call(this);ConsultantDashboardComponent.prototype.__init67.call(this);ConsultantDashboardComponent.prototype.__init68.call(this);ConsultantDashboardComponent.prototype.__init69.call(this);ConsultantDashboardComponent.prototype.__init70.call(this);ConsultantDashboardComponent.prototype.__init71.call(this);ConsultantDashboardComponent.prototype.__init72.call(this);ConsultantDashboardComponent.prototype.__init73.call(this);ConsultantDashboardComponent.prototype.__init74.call(this);ConsultantDashboardComponent.prototype.__init75.call(this);ConsultantDashboardComponent.prototype.__init76.call(this);ConsultantDashboardComponent.prototype.__init77.call(this);ConsultantDashboardComponent.prototype.__init78.call(this);ConsultantDashboardComponent.prototype.__init79.call(this);ConsultantDashboardComponent.prototype.__init80.call(this);ConsultantDashboardComponent.prototype.__init81.call(this);ConsultantDashboardComponent.prototype.__init82.call(this);ConsultantDashboardComponent.prototype.__init83.call(this);ConsultantDashboardComponent.prototype.__init84.call(this);ConsultantDashboardComponent.prototype.__init85.call(this);ConsultantDashboardComponent.prototype.__init86.call(this);ConsultantDashboardComponent.prototype.__init87.call(this);ConsultantDashboardComponent.prototype.__init88.call(this);ConsultantDashboardComponent.prototype.__init89.call(this);ConsultantDashboardComponent.prototype.__init90.call(this);ConsultantDashboardComponent.prototype.__init91.call(this);ConsultantDashboardComponent.prototype.__init92.call(this);ConsultantDashboardComponent.prototype.__init93.call(this);ConsultantDashboardComponent.prototype.__init94.call(this);ConsultantDashboardComponent.prototype.__init95.call(this);ConsultantDashboardComponent.prototype.__init96.call(this);ConsultantDashboardComponent.prototype.__init97.call(this);ConsultantDashboardComponent.prototype.__init98.call(this);ConsultantDashboardComponent.prototype.__init99.call(this);ConsultantDashboardComponent.prototype.__init100.call(this);ConsultantDashboardComponent.prototype.__init101.call(this);ConsultantDashboardComponent.prototype.__init102.call(this);ConsultantDashboardComponent.prototype.__init103.call(this);ConsultantDashboardComponent.prototype.__init104.call(this);ConsultantDashboardComponent.prototype.__init105.call(this);ConsultantDashboardComponent.prototype.__init106.call(this);ConsultantDashboardComponent.prototype.__init107.call(this);ConsultantDashboardComponent.prototype.__init108.call(this);ConsultantDashboardComponent.prototype.__init109.call(this);ConsultantDashboardComponent.prototype.__init110.call(this);ConsultantDashboardComponent.prototype.__init111.call(this);ConsultantDashboardComponent.prototype.__init112.call(this);ConsultantDashboardComponent.prototype.__init113.call(this);ConsultantDashboardComponent.prototype.__init114.call(this);ConsultantDashboardComponent.prototype.__init115.call(this);ConsultantDashboardComponent.prototype.__init116.call(this);ConsultantDashboardComponent.prototype.__init117.call(this);ConsultantDashboardComponent.prototype.__init118.call(this);ConsultantDashboardComponent.prototype.__init119.call(this);ConsultantDashboardComponent.prototype.__init120.call(this);ConsultantDashboardComponent.prototype.__init121.call(this);ConsultantDashboardComponent.prototype.__init122.call(this);ConsultantDashboardComponent.prototype.__init123.call(this);ConsultantDashboardComponent.prototype.__init124.call(this);ConsultantDashboardComponent.prototype.__init125.call(this);ConsultantDashboardComponent.prototype.__init126.call(this);ConsultantDashboardComponent.prototype.__init127.call(this);ConsultantDashboardComponent.prototype.__init128.call(this);ConsultantDashboardComponent.prototype.__init129.call(this);ConsultantDashboardComponent.prototype.__init130.call(this);ConsultantDashboardComponent.prototype.__init131.call(this);ConsultantDashboardComponent.prototype.__init132.call(this);ConsultantDashboardComponent.prototype.__init133.call(this);ConsultantDashboardComponent.prototype.__init134.call(this);ConsultantDashboardComponent.prototype.__init135.call(this);ConsultantDashboardComponent.prototype.__init136.call(this);ConsultantDashboardComponent.prototype.__init137.call(this);ConsultantDashboardComponent.prototype.__init138.call(this);ConsultantDashboardComponent.prototype.__init139.call(this);ConsultantDashboardComponent.prototype.__init140.call(this);ConsultantDashboardComponent.prototype.__init141.call(this);ConsultantDashboardComponent.prototype.__init142.call(this);ConsultantDashboardComponent.prototype.__init143.call(this);ConsultantDashboardComponent.prototype.__init144.call(this);ConsultantDashboardComponent.prototype.__init145.call(this);ConsultantDashboardComponent.prototype.__init146.call(this);ConsultantDashboardComponent.prototype.__init147.call(this);ConsultantDashboardComponent.prototype.__init148.call(this);ConsultantDashboardComponent.prototype.__init149.call(this);ConsultantDashboardComponent.prototype.__init150.call(this);ConsultantDashboardComponent.prototype.__init151.call(this);ConsultantDashboardComponent.prototype.__init152.call(this);ConsultantDashboardComponent.prototype.__init153.call(this);ConsultantDashboardComponent.prototype.__init154.call(this);ConsultantDashboardComponent.prototype.__init155.call(this);
    this.markViewDirty = createCoalescedMarkForCheck(this.cdr, () => this.destroyed);
    bindDashboardRouteHistory(
      this.router,
      this.route,
      (params) => this.applyLeadRouteParams(params),
      this.destroyRef,
    );
  }

  get visibleDashboardLinks() {
    if (!this.isProfileReady()) {
      return [];
    }

    return this.dashboardLinks.filter((item) => item.id !== "profile");
  }

  get mobileDashboardLinks() {
    const primarySections = [
      "overview",
      "leads",
      "patients",
      "reservations",
      "wallet",
    ];
    return primarySections
      .map((section) => this.visibleDashboardLinks.find((item) => item.id === section))
      .filter((item) => Boolean(item));
  }

  trackDashboardLink(
    _,
    item,
  ) {
    return item.id;
  }

  ngOnInit() {
    this.closeMobileSidebar();
    const initialSection = this.route.snapshot.data["initialSection"] ;
    if (initialSection) {
      this.activeSection = initialSection;
    }
    this.profileId = this.currentProfileId();
    this.timerStarts = this.readJson(
      this.timerStorageKey(),
      {},
    );
    this.stoppedTimerLeadIds.clear();
    for (const leadAssignmentId of this.readJson(
      this.stoppedTimerStorageKey(),
      [],
    )) {
      this.stoppedTimerLeadIds.add(leadAssignmentId);
    }
    this.phoneRevealedLeadIds.clear();
    for (const leadAssignmentId of this.readJson(
      this.phoneRevealedStorageKey(),
      [],
    )) {
      this.phoneRevealedLeadIds.add(leadAssignmentId);
    }
    this.realtimeLeadAlerts.initialize();
    void this.syncPushRegistrationState();
    window.addEventListener("consultant-push-message", this.pushMessageListener);
    window.addEventListener("consultant-lead-picked-up", this.leadPickedUpListener);
    window.addEventListener("consultant-workload-blocked", this.workloadBlockedListener);
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

  ngOnDestroy() {
    this.destroyed = true;
    this.realtimeLeadAlerts.stopPolling();
    if (this.feedbackAutoDismissTimer) clearTimeout(this.feedbackAutoDismissTimer);
    this.clearPendingReservationDialogOpen();
    if (this.timerId) clearInterval(this.timerId);
    if (this.pollId) clearInterval(this.pollId);
    if (this.autoAbsenceId) clearInterval(this.autoAbsenceId);
    if (this.leadSearchDebounceId) clearTimeout(this.leadSearchDebounceId);
    _optionalChain([this, 'access', _18 => _18.leadLoadSubscription, 'optionalAccess', _19 => _19.unsubscribe, 'call', _20 => _20()]);
    _optionalChain([this, 'access', _21 => _21.reportEditLoadSubscription, 'optionalAccess', _22 => _22.unsubscribe, 'call', _23 => _23()]);
    _optionalChain([this, 'access', _24 => _24.reservationLoadSubscription, 'optionalAccess', _25 => _25.unsubscribe, 'call', _26 => _26()]);
    _optionalChain([this, 'access', _27 => _27.dashboardStatusSubscription, 'optionalAccess', _28 => _28.unsubscribe, 'call', _29 => _29()]);
    _optionalChain([this, 'access', _30 => _30.routeQueryParamsSubscription, 'optionalAccess', _31 => _31.unsubscribe, 'call', _32 => _32()]);
    window.removeEventListener(
      "consultant-push-message",
      this.pushMessageListener,
    );
    window.removeEventListener(
      "consultant-lead-picked-up",
      this.leadPickedUpListener,
    );
    window.removeEventListener(
      "consultant-workload-blocked",
      this.workloadBlockedListener,
    );
    window.removeEventListener("focus", this.onPushStateSync);
    document.removeEventListener("visibilitychange", this.onPushStateSync);
  }

  currentProfileId() {
    const user = this.user();
    return (
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(this.profileId, () => ( _optionalChain([user, 'optionalAccess', _33 => _33.consultantProfileId]))), () => ( _optionalChain([user, 'optionalAccess', _34 => _34.profileId]))), () => ( null))
    );
  }

  isProfileReady() {
    return this.auth.isRoleProfileComplete(this.user());
  }

  canGoOnline() {
    return (
      this.isAvailable &&
      canConsultantGoOnline() &&
      !this.isNewLeadBlocked &&
      (!this.dashboardStatusLoaded || this.canGoOnlineFromStatus)
    );
  }

   markAttendanceReadyForOnline() {
    this.isAvailable = true;
    this.dashboardStatusLoaded = true;
    if (this.onlineStatusBlockReason === "ابتدا حضور خود را ثبت کنید") {
      this.onlineStatusBlockReason = null;
    }
    this.markViewDirty();
  }

  setSection(section) {
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

   resolveSection(
    section,
  ) {
    if (section === "profile" && this.isProfileReady()) {
      return "overview";
    }

    if (
      (section === "overview" ||
        section === "leads" ||
        section === "report-edits" ||
        section === "patients" ||
        section === "patient-profiles" ||
        section === "secretary-follow-ups" ||
        section === "reservations" ||
        section === "wallet") &&
      !this.isProfileReady()
    ) {
      return "profile";
    }

    return section;
  }

   syncSectionQueryParam(section) {
    const querySection =
      section === "overview" || section === "profile" ? null : section;
    const currentSection = this.route.snapshot.queryParamMap.get("section");

    if ((_nullishCoalesce(currentSection, () => ( null))) === querySection) return;

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { section: querySection },
      queryParamsHandling: "merge",
      replaceUrl: false,
    });
  }

   activateSectionFromRoute(
    section,
  ) {
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

  submitProfile() {
    const validationError = this.validateProfileForm();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    const userId = _optionalChain([this, 'access', _35 => _35.user, 'call', _36 => _36(), 'optionalAccess', _37 => _37.userId]);
    const profileId = _nullishCoalesce(this.currentProfileId(), () => ( 0));
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
            _nullishCoalesce(_nullishCoalesce(this.resolveProfileId(response.data), () => (
            this.currentProfileId())), () => (
            0));
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

  setAvailability(isAvailable) {
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
          this.isAvailable = _nullishCoalesce(status.isAvailable, () => ( isAvailable));
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

  setOnlineStatus(isOnline) {
    const profileId = this.requireProfileId();
    if (!profileId) return;

    if (!isOnline) {
      this.performSetOnlineStatus(profileId, false);
      return;
    }

    if (!this.isAvailable) {
      this.showFeedback("ابتدا حضور خود را ثبت کنید", "error");
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

   performSetOnlineStatus(
    profileId,
    isOnline,
    options = {},
  ) {
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
          // The API can accept the command while still returning an authoritative
          // offline status (for example when the pending-lead/report validation
          // blocks this online attempt). Never overwrite that status locally.
          const onlineWasRejected = isOnline && status.isOnline === false;
          if (isOnline && status.isOnline === null) {
            this.isOnline = true;
          } else if (status.isOnline === null) {
            this.isOnline = false;
          }
          if (isOnline && !onlineWasRejected && status.isAvailable === null) {
            this.isAvailable = true;
          }
          if (!options.silent) {
            const message =
              response.message ||
              (isOnline ? "شما آنلاین شدید" : "شما آفلاین شدید");
            if (isOnline) {
              this.showOnlineAttemptToast(message, onlineWasRejected);
            } else {
              this.showFeedback(message, "success");
            }
          }
          if (isOnline && !onlineWasRejected) {
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
          // A failed online command must never leave the toggle in an optimistic
          // online state. The backend message is surfaced as the immediate UI
          // toast; push notifications continue through the existing channel.
          if (isOnline) this.isOnline = false;
          if (!options.silent) {
            const message = this.errorMessage(
              error,
              "تغییر وضعیت آنلاین انجام نشد",
            );
            if (isOnline) {
              this.showOnlineAttemptToast(message, true);
              this.setSection("leads");
              this.refreshDashboard();
            } else {
              this.showFeedback(message, "error");
            }
          }
        },
      });
  }

   setConsultantOfflineQuiet() {
    const profileId = this.currentProfileId();
    if (!profileId || !this.isOnline) return;
    this.performSetOnlineStatus(profileId, false, { silent: true });
  }

   showOnlineAttemptToast(message, rejected) {
    if (rejected) {
      this.toast.action(
        message,
        { label: "مشاهده لیدها", handler: () => this.setSection("leads") },
        "error",
        null,
      );
      return;
    }

    this.toast.success(message);
  }

   forceConsultantOnlineAfterReportSubmit(
    profileId,
    attempt = 0,
  ) {
    if (this.loggingOut || this.destroyed) return;
    this.consultantApi
      .setOnlineStatus({ profileId, isOnline: true, isOffline: false })
      .subscribe({
        next: () => {
          if (this.loggingOut || this.destroyed) return;
          this.isOnline = true;
          this.onlineStatusBlockReason = null;
          void this.ensureLeadPushRegistration(true);
          void this.pushNotifications.syncForCurrentProfile(profileId);
          this.syncRealtimeLeadPolling();
          this.configurePollTimer();
          this.markViewDirty();
        },
        error: () => {
          if (attempt < 2 && !this.loggingOut && !this.destroyed) {
            setTimeout(
              () =>
                this.forceConsultantOnlineAfterReportSubmit(profileId, attempt + 1),
              800,
            );
          }
        },
      });
  }

   restoreOnlineAfterRequiredAction(
    options


 = {},
  ) {
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

  sendTestPushNotification() {
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

  enablePushNotifications() {
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

  refreshDashboard() {
    if (!this.isProfileReady()) return;
    this.loadDashboardStatus(() => {
      this.loadLeads();
      this.loadReservations();
    });
  }

   refreshDashboardAfterReport(
    leadAssignmentId,
    afterLoad,
  ) {
    if (!this.isProfileReady()) {
      _optionalChain([afterLoad, 'optionalCall', _38 => _38()]);
      return;
    }

    this.loadDashboardStatus(() => {
      const profileId = this.currentProfileId();
      if (!profileId) {
        _optionalChain([afterLoad, 'optionalCall', _39 => _39()]);
        return;
      }

      let leadsLoaded = false;
      let leadStatusLoaded = false;
      const maybeFinish = () => {
        if (!leadsLoaded || !leadStatusLoaded) return;
        if (this.activeSection === "report-edits") {
          this.loadReportEditLeads();
        }
        _optionalChain([afterLoad, 'optionalCall', _40 => _40()]);
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
            const updatedLead = (_nullishCoalesce(response.items, () => ( []))).find(
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

      this.loadLeads(false, () => {
        leadsLoaded = true;
        maybeFinish();
      });
    });
  }

  setLeadFromDate(date) {
    this.leadFromDate = date;
    this.markViewDirty();
    this.onLeadFilterChange(true);
  }

  setLeadToDate(date) {
    this.leadToDate = date;
    this.markViewDirty();
    this.onLeadFilterChange(true);
  }

  clearLeadDateFilters() {
    this.leadFromDate = null;
    this.leadToDate = null;
    this.onLeadFilterChange(true);
  }

  leadDateFilterLabel() {
    if (this.leadFromDate && this.leadToDate) return "بازه تاریخ انتخاب شده";
    if (this.leadFromDate || this.leadToDate) return "یک تاریخ انتخاب شده";
    return "فیلتر تاریخ";
  }

  applyLeadFilters() {
    const validationError = this.validateLeadDateFilters();
    if (validationError) {
      this.showFeedback(validationError, "error");
      return;
    }

    this.leadPageNumber = 1;
    this.loadLeads();
  }

  onLeadFilterChange(immediate = false) {
    if (this.leadSearchDebounceId) clearTimeout(this.leadSearchDebounceId);
    if (immediate) {
      this.applyLeadFilters();
      return;
    }
    this.leadSearchDebounceId = setTimeout(() => {
      this.applyLeadFilters();
    }, 400);
  }

   trimmedFilter(value) {
    return value.trim() || undefined;
  }

   validateLeadDateFilters() {
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

   applyLeadRouteParams(params) {
    if (!this.isProfileReady()) {
      this.activeSection = "profile";
      return;
    }

    const section = params.get("section") ;
    if (
      section &&
      [
        "overview",
        "profile",
        "leads",
        "report-edits",
        "patients",
        "patient-profiles",
        "secretary-follow-ups",
        "reservations",
        "wallet",
      ].includes(section)
    ) {
      this.activateSectionFromRoute(section);
    } else if (params.get("type")) {
      this.activateSectionFromRoute("leads");
    } else {
      const initialSection = this.route.snapshot.data["initialSection"] ;
      this.activateSectionFromRoute(_nullishCoalesce(initialSection, () => ( "overview")));
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

   scrollToHighlightedLead() {
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
      _optionalChain([document
, 'access', _41 => _41.getElementById, 'call', _42 => _42(elementId)
, 'optionalAccess', _43 => _43.scrollIntoView, 'call', _44 => _44({ behavior: "smooth", block: "start" })]);
      setTimeout(() => {
        if (this.highlightedLeadAssignmentId === targetId) {
          this.highlightedLeadAssignmentId = null;
          this.markViewDirty();
        }
      }, 4000);
    }, 50);
  }

   effectiveLeadStateFilter() {
    return this.leadStateFilter;
  }

   reservationSecondaryPhoneForLead(
    leadAssignmentId,
  ) {
    const reservation = this.reservationForLead(leadAssignmentId);
    if (!reservation) return "";

    return (
      _optionalChain([reservation, 'access', _45 => _45.secondaryPhoneNumber, 'optionalAccess', _46 => _46.trim, 'call', _47 => _47()]) ||
      _optionalChain([reservation, 'access', _48 => _48.SecondaryPhoneNumber, 'optionalAccess', _49 => _49.trim, 'call', _50 => _50()]) ||
      ""
    );
  }

   reservationForLead(
    leadAssignmentId,
  ) {
    return (
      _nullishCoalesce(this.reservations.find((reservation) => {
        const id = this.numberOrNull(
          _nullishCoalesce(_nullishCoalesce(reservation.leadAssignmentId, () => ( reservation.LeadAssignmentId)), () => ( null)),
        );
        return id === leadAssignmentId;
      }), () => ( null))
    );
  }

  changeLeadPage(page) {
    this.leadPageNumber = Math.min(
      Math.max(1, page),
      Math.max(1, this.leadTotalPages),
    );
    this.loadLeads();
  }

  applyPatientFilters() {
    this.patientPageNumber = 1;
    this.loadPatientLeads();
  }

  changePatientPage(page) {
    this.patientPageNumber = Math.min(
      Math.max(1, page),
      Math.max(1, this.patientTotalPages),
    );
    this.loadPatientLeads();
  }

  loadPatientLeads() {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    const requestId = ++this.patientLeadRequestId;
    this.patientLeadsLoading = true;
    this.clearFeedback();

    this.consultantApi
      .getLeads({
        profileId,
        ...(this.patientSearchTerm.trim()
          ? { searchText: this.patientSearchTerm.trim() }
          : {}),
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
          this.patientLeads = _nullishCoalesce(response.items, () => ( []));
          this.syncReportedLeadIdsFromLeads(this.patientLeads);
          this.syncReservedLeadIdsFromLeads(this.patientLeads);
          this.patientTotalCount = _nullishCoalesce(response.totalCount, () => ( this.patientLeads.length));
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

  applyPatientProfileFilters() {
    this.patientProfilePageNumber = 1;
    this.loadPatientProfiles();
  }

  changePatientProfilePage(page) {
    this.patientProfilePageNumber = Math.min(
      Math.max(1, page),
      Math.max(1, this.patientProfileTotalPages),
    );
    this.loadPatientProfiles();
  }

  loadPatientProfiles() {
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
          this.patientProfiles = _nullishCoalesce(response.items, () => ( []));
          this.patientProfileTotalCount =
            _nullishCoalesce(response.totalCount, () => ( this.patientProfiles.length));
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

  patientProfileName(profile) {
    return _optionalChain([profile, 'access', _51 => _51.patientName, 'optionalAccess', _52 => _52.trim, 'call', _53 => _53()]) || _optionalChain([profile, 'access', _54 => _54.PatientName, 'optionalAccess', _55 => _55.trim, 'call', _56 => _56()]) || "بدون نام";
  }

  patientProfilePhone(profile) {
    return (
      _optionalChain([profile, 'access', _57 => _57.patientPhoneNumber, 'optionalAccess', _58 => _58.trim, 'call', _59 => _59()]) ||
      _optionalChain([profile, 'access', _60 => _60.PatientPhoneNumber, 'optionalAccess', _61 => _61.trim, 'call', _62 => _62()]) ||
      "-"
    );
  }

  patientProfileCreatedAt(profile) {
    return profile.profileCreatedAt || profile.ProfileCreatedAt || "";
  }

  patientProfileReservationAt(profile) {
    return profile.reservationAt || profile.ReservationAt || "";
  }

   formatFilterDate(value) {
    if (!value) return undefined;
    return toIranDateInputValue(value);
  }

  openAddPatientLeadDialog() {
    if (!this.isProfileReady()) {
      this.showFeedback("ابتدا پروفایل مشاور را تکمیل کنید", "info");
      this.setSection("profile");
      return;
    }

    this.addPatientLeadForm = this.emptyAddPatientLeadForm();
    this.addPatientLeadDialogOpen = true;
    this.markViewDirty();
  }

  closeAddPatientLeadDialog() {
    this.addPatientLeadDialogOpen = false;
    this.addPatientLeadSaving = false;
    this.addPatientLeadForm = this.emptyAddPatientLeadForm();
    this.markViewDirty();
  }

  submitAddPatientLead() {
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
            _nullishCoalesce(_nullishCoalesce(_optionalChain([response, 'access', _63 => _63.data, 'optionalAccess', _64 => _64.leadAssignmentId]), () => (
            _optionalChain([(response.data )
, 'optionalAccess', _65 => _65.LeadAssignmentId]))), () => (
            null));
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

  openReportDialog(lead) {
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

  handleEditReportClick(event, lead) {
    event.preventDefault();
    event.stopPropagation();
    this.openEditReportDialog(lead);
  }

  openEditReportDialog(lead) {
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

  openCloseLeadDialog(lead) {
    if (!this.leadId(lead) || this.leadHasActiveReservation(lead)) return;
    this.selectedLeadToClose = lead;
    this.closeLeadReason = 1;
    this.closeLeadDescription = "";
    this.closeLeadDialogOpen = true;
    this.markViewDirty();
  }

  closeCloseLeadDialog() {
    if (this.closeLeadSaving) return;
    this.closeLeadDialogOpen = false;
    this.selectedLeadToClose = null;
    this.markViewDirty();
  }

  submitCloseLead() {
    const leadId = this.selectedLeadToClose
      ? this.leadId(this.selectedLeadToClose)
      : null;
    const description = this.closeLeadDescription.trim();
    if (!leadId || this.closeLeadSaving) return;
    if (this.closeLeadReason === 5 && !description) {
      this.showFeedback("برای گزینه سایر، توضیح را وارد کنید", "error");
      return;
    }

    this.closeLeadSaving = true;
    this.markViewDirty();
    this.consultantApi
      .closeLead(leadId, {
        reason: this.closeLeadReason,
        description: description || null,
      })
      .pipe(
        finalize(() => {
          this.closeLeadSaving = false;
          this.markViewDirty();
        }),
      )
      .subscribe({
        next: (response) => {
          this.leads = this.leads.filter((lead) => this.leadId(lead) !== leadId);
          this.reportEditLeads = this.reportEditLeads.filter(
            (lead) => this.leadId(lead) !== leadId,
          );
          this.patientLeads = this.patientLeads.filter(
            (lead) => this.leadId(lead) !== leadId,
          );
          this.closeLeadDialogOpen = false;
          this.selectedLeadToClose = null;
          this.showFeedback(response.message || "پیگیری این لید بسته شد", "success");
          this.loadLeads();
          this.loadReportEditLeads();
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "بستن پیگیری انجام نشد"),
            "error",
          ),
      });
  }

  closeReportDialog(
    options = {},
  ) {
    if (
      !options.force &&
      !this.isReportDialogClosable() &&
      (_nullishCoalesce(options.releaseReportLock, () => ( true)))
    ) {
      return;
    }

    const releaseReportLock = _nullishCoalesce(options.releaseReportLock, () => ( true));
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
    this.markViewDirty();

    if (
      releaseReportLock &&
      leadAssignmentId &&
      !this.reportedLeadIds.has(leadAssignmentId)
    ) {
      this.reportingLeadIds.delete(leadAssignmentId);
      this.timerExpiredReportPromptedLeadIds.delete(leadAssignmentId);
    }
  }

  isReportDialogClosable() {
    return true;
  }

  submitLeadReport() {
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
        attendanceProbabilityPercent > 10)
    ) {
      this.showFeedback("احتمال حضور باید بین ۰ تا ۱۰ باشد", "error");
      this.reportSaving = false;
      return;
    }

    const secondaryPhone = this.reportForm.secondaryPhoneNumber.trim();
    if (secondaryPhone && !/^09\d{9}$/.test(secondaryPhone)) {
      this.showFeedback("شماره تماس دوم بیمار معتبر نیست", "error");
      this.reportSaving = false;
      return;
    }

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
            _nullishCoalesce(_optionalChain([data, 'optionalAccess', _66 => _66.leadAssignmentState]), () => ( LEAD_STATE.Contacted));
          const callResult =
            _nullishCoalesce(_optionalChain([data, 'optionalAccess', _67 => _67.callResult]), () => ( Number(this.reportForm.callResult)));
          const reportSubmittedAt =
            _nullishCoalesce(_optionalChain([data, 'optionalAccess', _68 => _68.reportSubmittedAt]), () => ( new Date().toISOString()));
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
              _nullishCoalesce(this.leads.find((item) => this.leadId(item) === leadAssignmentId), () => (
              lead));
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

  submitEditedLeadReport() {
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
        attendanceProbabilityPercent > 10)
    ) {
      this.showFeedback("احتمال حضور باید بین ۰ تا ۱۰ باشد", "error");
      this.reportSaving = false;
      return;
    }

    const secondaryPhone = this.reportForm.secondaryPhoneNumber.trim();
    if (secondaryPhone && !/^09\d{9}$/.test(secondaryPhone)) {
      this.showFeedback("شماره تماس دوم بیمار معتبر نیست", "error");
      this.reportSaving = false;
      return;
    }

    const originalSecondaryPhone = _nullishCoalesce(this.reportEditOriginalSecondaryPhone, () => ( ""));
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
            _nullishCoalesce(_optionalChain([response, 'access', _69 => _69.data, 'optionalAccess', _70 => _70.callResult]), () => ( Number(this.reportForm.callResult)));
          const nextState =
            _nullishCoalesce(_optionalChain([response, 'access', _71 => _71.data, 'optionalAccess', _72 => _72.leadAssignmentState]), () => ( LEAD_STATE.Contacted));
          const reportSubmittedAt =
            _nullishCoalesce(_optionalChain([response, 'access', _73 => _73.data, 'optionalAccess', _74 => _74.reportSubmittedAt]), () => ( new Date().toISOString()));
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
          this.closeReportDialog({ releaseReportLock: true, force: true });
          this.showFeedback("گزارش ویرایش شد", "success");
          if (this.activeSection === "report-edits") {
            this.loadReportEditLeads();
          }
          this.loadDashboardStatus();
        },
        error: (error) =>
          this.showFeedback(
            this.errorMessage(error, "ویرایش گزارش تماس انجام نشد"),
            "error",
          ),
      });
  }

   emptyLeadReportForm(leadAssignmentId) {
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

   leadReportFormFromLead(lead) {
    const leadAssignmentId = this.leadId(lead);
    const attendanceProbability =
      _nullishCoalesce(_nullishCoalesce(lead.attendanceProbabilityPercent, () => (
      lead.AttendanceProbabilityPercent)), () => (
      null));

    return {
      callResult: _nullishCoalesce(this.leadCallResult(lead), () => ( 6)),
      reportDescription:
        _optionalChain([lead, 'access', _75 => _75.reportDescription, 'optionalAccess', _76 => _76.trim, 'call', _77 => _77()]) || _optionalChain([lead, 'access', _78 => _78.ReportDescription, 'optionalAccess', _79 => _79.trim, 'call', _80 => _80()]) || "",
      patientCity: _optionalChain([lead, 'access', _81 => _81.patientCity, 'optionalAccess', _82 => _82.trim, 'call', _83 => _83()]) || _optionalChain([lead, 'access', _84 => _84.PatientCity, 'optionalAccess', _85 => _85.trim, 'call', _86 => _86()]) || "",
      patientRegion:
        _optionalChain([lead, 'access', _87 => _87.patientRegion, 'optionalAccess', _88 => _88.trim, 'call', _89 => _89()]) || _optionalChain([lead, 'access', _90 => _90.PatientRegion, 'optionalAccess', _91 => _91.trim, 'call', _92 => _92()]) || "",
      attendanceProbabilityPercent: attendanceProbability,
      secondaryPhoneNumber:
        _optionalChain([lead, 'access', _93 => _93.secondaryPhoneNumber, 'optionalAccess', _94 => _94.trim, 'call', _95 => _95()]) ||
        _optionalChain([lead, 'access', _96 => _96.SecondaryPhoneNumber, 'optionalAccess', _97 => _97.trim, 'call', _98 => _98()]) ||
        (leadAssignmentId
          ? this.reservationSecondaryPhoneForLead(leadAssignmentId)
          : ""),
    };
  }

   recordCallInitiated(leadAssignmentId) {
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
            _nullishCoalesce(_nullishCoalesce(_optionalChain([response, 'access', _99 => _99.data, 'optionalAccess', _100 => _100.callInitiatedAt]), () => (
            _optionalChain([(response.data )
, 'optionalAccess', _101 => _101.CallInitiatedAt]))), () => (
            new Date().toISOString()));
          this.updateLeadInCollections(leadAssignmentId, {
            callInitiatedAt: initiatedAt,
            CallInitiatedAt: initiatedAt,
          });
          this.loadDashboardStatus();
        },
        error: () => {
          // local timer stop still keeps report actions enabled
        },
      });
  }

   updateLeadInCollections(
    leadAssignmentId,
    patch,
  ) {
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

   normalizedReportDescription(callResult) {
    return (
      this.reportForm.reportDescription.trim() ||
      CALL_RESULT_DEFAULT_DESCRIPTIONS[callResult] ||
      "گزارش تماس ثبت شد"
    );
  }

   defaultAttendancePrediction() {
    return (
      this.reportForm.reportDescription.trim() ||
      "بیمار گفت در تاریخ و ساعت رزرو شده در مطب حاضر می‌شود."
    );
  }

   normalizedAttendanceProbability(
    value,
  ) {
    if (value === null || value === undefined || value === "") return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  closeReservationDialog() {
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

  isReservationEditMode() {
    return this.reservationDialogMode === "edit";
  }

  canEditReservation(reservation) {
    return canConsultantEditReservation(reservation);
  }

  canEditReservationForLead(lead) {
    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId || !this.leadHasActiveReservation(lead)) return false;

    const reservation = this.reservationForLead(leadAssignmentId);
    if (reservation) return this.canEditReservation(reservation);

    return this.readHasActiveReservationFromLead(lead);
  }

  reservationDisabledReason(lead) {
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

  setReservationDate(date) {
    this.reservationForm.reservationDate = date;
  }

  reservationId(reservation) {
    return this.numberOrNull(
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(reservation.id, () => (
        reservation.Id)), () => (
        reservation.reservationId)), () => (
        reservation.ReservationId)), () => (
        null)),
    );
  }

  reservationPatientName(reservation) {
    return reservation.patientName || reservation.PatientName || "بدون نام";
  }

  reservationPatientPhone(reservation) {
    return (
      reservation.patientPhoneNumber || reservation.PatientPhoneNumber || "-"
    );
  }

  reservationPatientCount(reservation) {
    return _nullishCoalesce(_nullishCoalesce(reservation.patientCount, () => ( reservation.PatientCount)), () => ( 1));
  }

  reservationDateTime(reservation) {
    return reservation.reservationAt || reservation.ReservationAt || "";
  }

  reservationPatientCity(reservation) {
    return reservation.patientCity || reservation.PatientCity || "شهر ثبت نشده";
  }

  reservationAttendanceProbability(
    reservation,
  ) {
    return (
      _nullishCoalesce(_nullishCoalesce(reservation.attendanceProbabilityPercent, () => (
      reservation.AttendanceProbabilityPercent)), () => (
      "-"))
    );
  }

  reservationAttendancePrediction(reservation) {
    return (
      reservation.attendancePrediction ||
      reservation.AttendancePrediction ||
      "ثبت نشده"
    );
  }

   __init155() {this.dentalServiceOptions = DENTAL_SERVICE_OPTIONS}

  toggleDentalService(service, checked) {
    const selected = new Set(this.reservationForm.dentalServices);
    checked ? selected.add(service) : selected.delete(service);
    this.reservationForm.dentalServices = [...selected];
  }

  reservationAttendanceStatusLabel(reservation) {
    switch (
      _nullishCoalesce(reservation.attendanceConfirmationStatus, () => (
      reservation.AttendanceConfirmationStatus))
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

  reservationStatusClass(reservation) {
    const status =
      _nullishCoalesce(reservation.attendanceConfirmationStatus, () => (
      reservation.AttendanceConfirmationStatus));
    if (status === 4) return "badge success";
    if (status === 5) return "badge danger";
    if (status === 2 || status === 3) return "badge warn";
    return "badge info";
  }

  submitReservation() {
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

    const payload = {
      leadAssignmentId,
      consultantProfileId: profileId,
      reservationAt: reservationAt.toISOString(),
      patientCount: this.reservationForm.patientCount,
      patientCity: this.reservationForm.patientCity.trim(),
      patientRegion: this.reservationForm.patientRegion.trim(),
      attendanceProbabilityPercent:
        this.reservationForm.attendanceProbabilityPercent,
      attendancePrediction: this.reservationForm.attendancePrediction.trim(),
      secondaryPhoneNumber:
        this.reservationForm.secondaryPhoneNumber.trim() || null,
      description: this.reservationForm.description.trim() || null,
      dentalServices: this.reservationForm.dentalServices,
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
            _nullishCoalesce(this.extractReservation(response.data), () => (
            this.extractReservation(response)));
          if (leadAssignmentId) {
            this.reservedLeadIds.add(leadAssignmentId);
            this.updateLeadInCollections(leadAssignmentId, {
              hasActiveReservation: true,
              HasActiveReservation: true,
            });
          }
          this.reservationDialogOpen = false;
          this.selectedReservationLead = null;
          const shouldOpenPatientProfile =
            Boolean(reservation) &&
            (_nullishCoalesce(_optionalChain([reservation, 'optionalAccess', _102 => _102.requiresPatientProfile]), () => (
              _optionalChain([reservation, 'optionalAccess', _103 => _103.RequiresPatientProfile])))) === true;
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

   submitReservationEdit() {
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

    const payload = {
      reservationAt: reservationAt.toISOString(),
      patientCount: this.reservationForm.patientCount,
      patientCity: this.reservationForm.patientCity.trim(),
      patientRegion: this.reservationForm.patientRegion.trim(),
      attendanceProbabilityPercent:
        this.reservationForm.attendanceProbabilityPercent,
      attendancePrediction: this.reservationForm.attendancePrediction.trim(),
      secondaryPhoneNumber:
        this.reservationForm.secondaryPhoneNumber.trim() || null,
      description: this.reservationForm.description.trim() || null,
      dentalServices: this.reservationForm.dentalServices,
    };

    this.reservationSaving = true;
    this.clearFeedback();

    this.consultantApi
      .updateReservation(reservationId, payload)
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

  closePatientProfileDialog() {
    const wasRequired = this.patientProfileRequired;
    this.resetPatientProfileState();

    if (wasRequired) {
      this.showFeedback(
        "برای تکمیل رزرو، تشکیل پرونده بیمار الزامی است",
        "error",
      );
    }
  }

  submitPatientProfile() {
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

  handleCallClick(event, lead) {
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

      const initiatedAt = _nullishCoalesce(lead.callInitiatedAt, () => ( lead.CallInitiatedAt));
      if (!initiatedAt) {
        this.recordCallInitiated(leadAssignmentId);
      }
    }
  }

  handleTimerClick(lead) {
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

  leadId(lead) {
    const value =
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(lead.leadAssignmentId, () => ( lead.LeadAssignmentId)), () => ( lead.id)), () => ( lead.Id));
    const numeric = this.numberOrNull(value);
    return numeric && numeric > 0 ? numeric : null;
  }

  leadName(lead) {
    return (
      lead.userName ||
      lead.UserName ||
      lead.fullName ||
      lead.FullName ||
      [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim() ||
      [lead.FirstName, lead.LastName].filter(Boolean).join(" ").trim() ||
      _optionalChain([lead, 'access', _104 => _104.user, 'optionalAccess', _105 => _105.userName]) ||
      _optionalChain([lead, 'access', _106 => _106.user, 'optionalAccess', _107 => _107.UserName]) ||
      _optionalChain([lead, 'access', _108 => _108.user, 'optionalAccess', _109 => _109.fullName]) ||
      _optionalChain([lead, 'access', _110 => _110.user, 'optionalAccess', _111 => _111.FullName]) ||
      _optionalChain([lead, 'access', _112 => _112.user, 'optionalAccess', _113 => _113.name]) ||
      _optionalChain([lead, 'access', _114 => _114.user, 'optionalAccess', _115 => _115.Name]) ||
      [_optionalChain([lead, 'access', _116 => _116.user, 'optionalAccess', _117 => _117.firstName]), _optionalChain([lead, 'access', _118 => _118.user, 'optionalAccess', _119 => _119.lastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [_optionalChain([lead, 'access', _120 => _120.user, 'optionalAccess', _121 => _121.FirstName]), _optionalChain([lead, 'access', _122 => _122.user, 'optionalAccess', _123 => _123.LastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      _optionalChain([lead, 'access', _124 => _124.User, 'optionalAccess', _125 => _125.userName]) ||
      _optionalChain([lead, 'access', _126 => _126.User, 'optionalAccess', _127 => _127.UserName]) ||
      _optionalChain([lead, 'access', _128 => _128.User, 'optionalAccess', _129 => _129.fullName]) ||
      _optionalChain([lead, 'access', _130 => _130.User, 'optionalAccess', _131 => _131.FullName]) ||
      _optionalChain([lead, 'access', _132 => _132.User, 'optionalAccess', _133 => _133.name]) ||
      _optionalChain([lead, 'access', _134 => _134.User, 'optionalAccess', _135 => _135.Name]) ||
      [_optionalChain([lead, 'access', _136 => _136.User, 'optionalAccess', _137 => _137.firstName]), _optionalChain([lead, 'access', _138 => _138.User, 'optionalAccess', _139 => _139.lastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [_optionalChain([lead, 'access', _140 => _140.User, 'optionalAccess', _141 => _141.FirstName]), _optionalChain([lead, 'access', _142 => _142.User, 'optionalAccess', _143 => _143.LastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      _optionalChain([lead, 'access', _144 => _144.lead, 'optionalAccess', _145 => _145.fullName]) ||
      _optionalChain([lead, 'access', _146 => _146.lead, 'optionalAccess', _147 => _147.FullName]) ||
      _optionalChain([lead, 'access', _148 => _148.lead, 'optionalAccess', _149 => _149.name]) ||
      _optionalChain([lead, 'access', _150 => _150.lead, 'optionalAccess', _151 => _151.Name]) ||
      [_optionalChain([lead, 'access', _152 => _152.lead, 'optionalAccess', _153 => _153.firstName]), _optionalChain([lead, 'access', _154 => _154.lead, 'optionalAccess', _155 => _155.lastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [_optionalChain([lead, 'access', _156 => _156.lead, 'optionalAccess', _157 => _157.FirstName]), _optionalChain([lead, 'access', _158 => _158.lead, 'optionalAccess', _159 => _159.LastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      _optionalChain([lead, 'access', _160 => _160.Lead, 'optionalAccess', _161 => _161.fullName]) ||
      _optionalChain([lead, 'access', _162 => _162.Lead, 'optionalAccess', _163 => _163.FullName]) ||
      _optionalChain([lead, 'access', _164 => _164.Lead, 'optionalAccess', _165 => _165.name]) ||
      _optionalChain([lead, 'access', _166 => _166.Lead, 'optionalAccess', _167 => _167.Name]) ||
      [_optionalChain([lead, 'access', _168 => _168.Lead, 'optionalAccess', _169 => _169.firstName]), _optionalChain([lead, 'access', _170 => _170.Lead, 'optionalAccess', _171 => _171.lastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [_optionalChain([lead, 'access', _172 => _172.Lead, 'optionalAccess', _173 => _173.FirstName]), _optionalChain([lead, 'access', _174 => _174.Lead, 'optionalAccess', _175 => _175.LastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "بدون نام"
    );
  }

  leadPhone(lead) {
    return (
      lead.phoneNumber ||
      lead.PhoneNumber ||
      lead.mobile ||
      lead.Mobile ||
      lead.userPhoneNumber ||
      lead.UserPhoneNumber ||
      lead.leadPhoneNumber ||
      lead.LeadPhoneNumber ||
      _optionalChain([lead, 'access', _176 => _176.user, 'optionalAccess', _177 => _177.phoneNumber]) ||
      _optionalChain([lead, 'access', _178 => _178.user, 'optionalAccess', _179 => _179.PhoneNumber]) ||
      _optionalChain([lead, 'access', _180 => _180.user, 'optionalAccess', _181 => _181.mobile]) ||
      _optionalChain([lead, 'access', _182 => _182.user, 'optionalAccess', _183 => _183.Mobile]) ||
      _optionalChain([lead, 'access', _184 => _184.User, 'optionalAccess', _185 => _185.phoneNumber]) ||
      _optionalChain([lead, 'access', _186 => _186.User, 'optionalAccess', _187 => _187.PhoneNumber]) ||
      _optionalChain([lead, 'access', _188 => _188.User, 'optionalAccess', _189 => _189.mobile]) ||
      _optionalChain([lead, 'access', _190 => _190.User, 'optionalAccess', _191 => _191.Mobile]) ||
      _optionalChain([lead, 'access', _192 => _192.lead, 'optionalAccess', _193 => _193.phoneNumber]) ||
      _optionalChain([lead, 'access', _194 => _194.lead, 'optionalAccess', _195 => _195.PhoneNumber]) ||
      _optionalChain([lead, 'access', _196 => _196.lead, 'optionalAccess', _197 => _197.mobile]) ||
      _optionalChain([lead, 'access', _198 => _198.lead, 'optionalAccess', _199 => _199.Mobile]) ||
      _optionalChain([lead, 'access', _200 => _200.Lead, 'optionalAccess', _201 => _201.phoneNumber]) ||
      _optionalChain([lead, 'access', _202 => _202.Lead, 'optionalAccess', _203 => _203.PhoneNumber]) ||
      _optionalChain([lead, 'access', _204 => _204.Lead, 'optionalAccess', _205 => _205.mobile]) ||
      _optionalChain([lead, 'access', _206 => _206.Lead, 'optionalAccess', _207 => _207.Mobile]) ||
      "-"
    );
  }

  leadPhoneDisplay(lead) {
    if (this.shouldMaskLeadPhone(lead)) {
      return "برای دیدن شماره ضربه بزنید";
    }

    return this.leadPhone(lead);
  }

  leadPhoneActionLabel(lead) {
    return this.shouldMaskLeadPhone(lead) ? "نمایش شماره لید" : "تماس با لید";
  }

  leadPhoneHref(lead) {
    if (this.isLeadPhoneDisabled(lead) || this.shouldMaskLeadPhone(lead)) {
      return null;
    }

    const phone = this.leadPhone(lead);
    return phone === "-" ? null : `tel:${phone}`;
  }

  isLeadPhoneRevealed(lead) {
    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId) return true;
    if (this.leadType(lead) !== LEAD_TYPE.RealTime) return true;
    if (!this.isActiveRealtimeLead(lead) || this.isLeadReportSubmitted(lead)) {
      return true;
    }
    if (this.hasCallBeenInitiated(lead)) return true;

    return this.phoneRevealedLeadIds.has(leadAssignmentId);
  }

   shouldMaskLeadPhone(lead) {
    return (
      this.leadPhone(lead) !== "-" && !this.isLeadPhoneRevealed(lead)
    );
  }

   revealLeadPhone(lead) {
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

  leadState(lead) {
    return resolveLeadAssignmentState(
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(lead.leadAssignmentState, () => (
        lead.LeadAssignmentState)), () => (
        lead.state)), () => (
        lead.State)), () => (
        lead.status)), () => (
        lead.Status)), () => (
        null)),
    );
  }

  leadType(lead) {
    return resolveLeadAssignmentType(
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(lead.leadAssignmentType, () => (
        lead.LeadAssignmentType)), () => (
        lead.assignmentType)), () => (
        lead.AssignmentType)), () => (
        lead.type)), () => (
        lead.Type)), () => (
        null)),
    );
  }

  stateLabel(value) {
    return leadAssignmentStateLabel(value);
  }

  leadTypeLabel(value) {
    return leadAssignmentTypeLabel(value);
  }

  leadDisplayStatus(lead) {
    if (this.isLeadInReportProgress(lead)) return "در حال ثبت گزارش";
    if (this.isLeadExpired(lead)) return "منقضی شده";
    if (this.shouldMaskLeadPhone(lead)) return "در انتظار نمایش شماره";
    if (this.isRealtimeTimedLead(lead)) return "در انتظار تماس";
    return this.stateLabel(this.leadState(lead));
  }

  leadDisplayBadgeClass(lead) {
    if (this.isLeadInReportProgress(lead)) return "badge info";
    if (this.isLeadExpired(lead)) return "badge warn";
    if (this.isRealtimeTimedLead(lead)) return "badge info";
    return this.stateBadgeClass(this.leadState(lead));
  }

  stateBadgeClass(value) {
    if (value === LEAD_STATE.New || value === LEAD_STATE.Assigned)
      return "badge info";
    if (value === LEAD_STATE.Converted) return "badge success";
    if (value === LEAD_STATE.Pending || value === LEAD_STATE.Expired)
      return "badge warn";
    return "badge danger";
  }

  isRealtimeTimedLead(lead) {
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

  leadRemainingMs(lead) {
    if (!this.isRealtimeTimedLead(lead)) return Number.POSITIVE_INFINITY;
    return Math.max(0, this.leadDeadlineMs(lead) - this.currentTime);
  }

  realtimeCountdown(lead) {
    if (this.isLeadExpired(lead)) return "منقضی";
    const totalSeconds = Math.ceil(this.leadRemainingMs(lead) / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  isLeadExpired(lead) {
    if (this.isLeadReportSubmitted(lead)) return false;
    if (this.leadState(lead) === LEAD_STATE.Expired) return true;
    if (this.hasCallBeenInitiated(lead)) return false;
    return this.isRealtimeTimedLead(lead) && this.leadRemainingMs(lead) <= 0;
  }

  hasCallBeenInitiated(lead) {
    const leadAssignmentId = this.leadId(lead);
    if (leadAssignmentId && this.stoppedTimerLeadIds.has(leadAssignmentId)) {
      return true;
    }

    const initiatedAt = _nullishCoalesce(lead.callInitiatedAt, () => ( lead.CallInitiatedAt));
    return Boolean(initiatedAt);
  }

  isLeadReportEditable(lead) {
    if (!this.leadId(lead)) return false;
    return this.isLeadReportSubmitted(lead);
  }

  visibleReportEditLeads() {
    return this.reportEditLeads;
  }

  applyReportEditFilters() {
    if (
      this.reportEditFromDate &&
      this.reportEditToDate &&
      this.startOfDay(this.reportEditFromDate).getTime() >
        this.startOfDay(this.reportEditToDate).getTime()
    ) {
      this.showFeedback("تاریخ شروع نباید بعد از تاریخ پایان باشد", "error");
      return;
    }
    this.reportEditPageNumber = 1;
    this.loadReportEditLeads();
  }

  setReportEditFromDate(date) {
    this.reportEditFromDate = date;
    this.markViewDirty();
  }

  setReportEditToDate(date) {
    this.reportEditToDate = date;
    this.markViewDirty();
  }

  clearReportEditDateFilters() {
    this.reportEditFromDate = null;
    this.reportEditToDate = null;
    this.markViewDirty();
  }

  reportEditDateFilterLabel() {
    if (this.reportEditFromDate && this.reportEditToDate)
      return "بازه تاریخ انتخاب شده";
    if (this.reportEditFromDate || this.reportEditToDate)
      return "یک تاریخ انتخاب شده";
    return "فیلتر تاریخ";
  }

  leadCallResult(lead) {
    const raw = _nullishCoalesce(_nullishCoalesce(lead.callResult, () => ( lead.CallResult)), () => ( null));
    if (typeof raw === "string") {
      const normalized = raw.trim().toLowerCase();
      if (CALL_RESULT_BY_NAME[normalized] !== undefined) {
        return CALL_RESULT_BY_NAME[normalized];
      }
    }

    return this.numberOrNull(raw);
  }

  callResultLabel(lead) {
    const callResult = this.leadCallResult(lead);
    if (callResult === null) return "بدون گزارش";
    return _nullishCoalesce(CALL_RESULT_DEFAULT_DESCRIPTIONS[callResult], () => ( "نامشخص"));
  }

  leadReportDescription(lead) {
    return (
      _optionalChain([lead, 'access', _208 => _208.reportDescription, 'optionalAccess', _209 => _209.trim, 'call', _210 => _210()]) ||
      _optionalChain([lead, 'access', _211 => _211.ReportDescription, 'optionalAccess', _212 => _212.trim, 'call', _213 => _213()]) ||
      "بدون توضیحات"
    );
  }

  changeReportEditPage(page) {
    if (page < 1 || page > this.reportEditTotalPages) return;
    this.reportEditPageNumber = page;
    this.loadReportEditLeads();
  }

  isLeadPhoneDisabled(lead) {
    if (this.isLeadInReportProgress(lead)) return true;
    if (this.leadPhone(lead) === "-") return true;
    if (this.expiringLeadIds.has(_nullishCoalesce(this.leadId(lead), () => ( -1)))) return true;
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

  isReportDisabled(lead) {
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

  isReservationDisabled(lead) {
    return (
      !this.leadId(lead) ||
      this.isLeadInReportProgress(lead) ||
      this.isLeadExpired(lead) ||
      !this.isLeadReportSubmitted(lead) ||
      !this.isLeadEligibleForReservation(lead) ||
      this.leadHasActiveReservation(lead)
    );
  }

  leadHasActiveReservation(lead) {
    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId) return false;
    if (this.readHasActiveReservationFromLead(lead)) return true;

    return this.reservedLeadIds.has(leadAssignmentId);
  }

   readHasActiveReservationFromLead(lead) {
    return Boolean(_nullishCoalesce(_nullishCoalesce(lead.hasActiveReservation, () => ( lead.HasActiveReservation)), () => ( false)));
  }

   isLeadEligibleForReservation(lead) {
    const callResult = this.leadCallResult(lead);
    if (callResult !== null && this.isSuccessfulCallResult(callResult)) {
      return true;
    }

    const state = this.leadState(lead);
    return (
      state === LEAD_STATE.Contacted || state === LEAD_STATE.Converted
    );
  }

  isLeadReportSubmitted(lead) {
    const leadAssignmentId = this.leadId(lead);
    if (leadAssignmentId && this.reportedLeadIds.has(leadAssignmentId)) {
      return true;
    }
    return this.leadHasSubmittedReportFromBackend(lead);
  }

   leadHasSubmittedReportFromBackend(lead) {
    if (Boolean(_nullishCoalesce(lead.isReportSubmitted, () => ( lead.IsReportSubmitted)))) return true;
    if (Boolean(_nullishCoalesce(lead.reportSubmittedAt, () => ( lead.ReportSubmittedAt)))) return true;
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

   syncReportedLeadIdsFromLeads(leads) {
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

   syncReservedLeadIdsFromLeads(leads) {
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

   syncCallInitiatedFromLeads(leads) {
    leads.forEach((lead) => {
      const leadAssignmentId = this.leadId(lead);
      if (!leadAssignmentId || !this.hasCallBeenInitiated(lead)) return;
      this.stoppedTimerLeadIds.add(leadAssignmentId);
      this.phoneRevealedLeadIds.add(leadAssignmentId);
    });
    this.writeJson(this.stoppedTimerStorageKey(), [...this.stoppedTimerLeadIds]);
    this.writeJson(this.phoneRevealedStorageKey(), [...this.phoneRevealedLeadIds]);
  }

   syncReservedLeadIdsFromReservations(
    reservations,
  ) {
    reservations.forEach((reservation) => {
      const leadAssignmentId =
        _nullishCoalesce(_nullishCoalesce(reservation.leadAssignmentId, () => ( reservation.LeadAssignmentId)), () => ( null));
      const numeric = Number(leadAssignmentId);
      if (
        Number.isFinite(numeric) &&
        (_nullishCoalesce(reservation.isCanceled, () => ( reservation.IsCanceled))) !== true
      ) {
        this.reservedLeadIds.add(numeric);
      }
    });
  }

  isLeadInReportProgress(lead) {
    const leadAssignmentId = this.leadId(lead);
    return Boolean(
      leadAssignmentId && this.reportingLeadIds.has(leadAssignmentId),
    );
  }

  minReservationDateTime() {
    return this.toDateTimeLocalValue(this.minimumReservationDateTime());
  }

  minimumReservationDate() {
    const date = this.minimumReservationDateTime();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  formatDateTime(value) {
    return formatIranDateTime(value);
  }

  formatAppointmentTime(value) {
    return formatReservationTime(value);
  }

  leadContactedAt(lead) {
    return lead.contactedAt || lead.ContactedAt || "";
  }

  toggleMobileSidebar() {
    this.mobileSidebar.toggleMobileSidebar();
  }

  closeMobileSidebar() {
    this.mobileSidebar.closeMobileSidebar();
  }

  logout() {
    if (this.loggingOut) return;

    const profileId = this.currentProfileId();
    this.pushNotifications.resetRegisteredTokenCache();
    this.realtimeLeadAlerts.stopPolling();

    const finishLogout = () => {
      this.isOnline = false;
      this.auth.logout();
      void this.router.navigateByUrl("/");
    };

    if (!profileId) {
      finishLogout();
      return;
    }

    this.loggingOut = true;
    this.consultantApi
      .setOnlineStatus({ profileId, isOnline: false, isOffline: true })
      .pipe(retry({ count: 2, delay: 500 }), finalize(finishLogout))
      .subscribe({ error: () => undefined });
  }

   loadDashboardStatus(afterLoad) {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    _optionalChain([this, 'access', _214 => _214.dashboardStatusSubscription, 'optionalAccess', _215 => _215.unsubscribe, 'call', _216 => _216()]);
    this.dashboardStatusSubscription = this.consultantApi
      .getDashboardStatus(profileId)
      .pipe(finalize(() => this.markViewDirty()))
      .subscribe({
        next: (status) => {
          this.applyDashboardStatus(status);
          _optionalChain([afterLoad, 'optionalCall', _217 => _217()]);
        },
        error: (error) => {
          this.showFeedback(
            this.errorMessage(error, "دریافت وضعیت داشبورد انجام نشد"),
            "error",
          );
          _optionalChain([afterLoad, 'optionalCall', _218 => _218()]);
        },
      });
  }

   applyDashboardStatus(status) {
    this.profileId = status.profileId || this.profileId;
    this.isAvailable = status.isAvailable;
    this.isOnline = status.isOnline;
    this.canGoOnlineFromStatus = status.canGoOnline;
    this.todayReservationsCount = _nullishCoalesce(status.todayReservationsCount, () => ( 0));
    this.totalReservationsCount = _nullishCoalesce(status.totalReservationsCount, () => ( 0));
    this.totalReservedPatientsCount = _nullishCoalesce(status.totalReservedPatientsCount, () => ( 0));
    this.todayCallsCount = _nullishCoalesce(status.todayCallsCount, () => ( 0));
    this.dailyLimit = _nullishCoalesce(status.dailyLimit, () => ( 0));
    this.todayPickupCount = _nullishCoalesce(status.todayPickupCount, () => ( 0));
    this.remainingDailyCapacity = Math.max(
      0,
      _nullishCoalesce(status.remainingDailyCapacity, () => ( 0)),
    );
    this.dashboardStatusLoaded = true;
    this.onlineStatusBlockReason = status.onlineStatusBlockReason;
    this.pendingReportCount = status.pendingReportCount;
    this.uncalledWithoutReportCount = status.uncalledWithoutReportCount;
    this.isNewLeadBlocked = status.isNewLeadBlocked;
    this.shouldShowWorkloadNotification =
      status.shouldShowWorkloadNotification;
    this.workloadNotificationMessage = status.workloadNotificationMessage;
    if (
      status.shouldShowWorkloadNotification &&
      status.workloadNotificationMessage &&
      status.workloadNotificationMessage !== this.lastWorkloadNotificationMessage
    ) {
      this.lastWorkloadNotificationMessage = status.workloadNotificationMessage;
      this.toast.action(
        status.workloadNotificationMessage,
        { label: "مشاهده شماره‌ها", handler: () => this.setSection("leads") },
        "error",
        null,
      );
    } else if (!status.shouldShowWorkloadNotification) {
      this.lastWorkloadNotificationMessage = null;
    }
    this.applyConsultantStatusFrom(status.raw);
    this.configurePollTimer();
    this.syncRealtimeLeadPolling();
  }

   loadLeads(quiet = false, afterLoad) {
    const profileId = this.currentProfileId();
    if (!profileId || this.destroyed) {
      _optionalChain([afterLoad, 'optionalCall', _219 => _219()]);
      return;
    }

    if (this.newLeadsRequestInFlight) {
      this.pendingNewLeadsLoad = true;
      // Any visible refresh upgrades the queued quiet polling refresh.
      this.pendingNewLeadsLoadIsQuiet =
        this.pendingNewLeadsLoadIsQuiet && quiet;
      if (afterLoad) this.pendingNewLeadsLoadCallbacks.push(afterLoad);
      return;
    }

    const requestId = ++this.leadRequestId;
    this.newLeadsRequestInFlight = true;

    if (!quiet) {
      this.visibleLeadLoadingRequestId = requestId;
      this.leadsLoading = true;
    }
    if (!quiet) this.clearFeedback();

    this.leadLoadSubscription = this.consultantApi
      .getNewLeads({
        profileId,
        searchText: this.trimmedFilter(this.leadSearchText),
        userName: this.trimmedFilter(this.leadNameFilter),
        phoneNumber: this.trimmedFilter(this.leadPhoneFilter),
        patientCity: this.trimmedFilter(this.leadCityFilter),
        leadAssignmentState: this.effectiveLeadStateFilter(),
        leadAssignmentType: this.leadTypeFilter,
        from: this.formatFilterDate(this.leadFromDate),
        to: this.formatFilterDate(_nullishCoalesce(this.leadToDate, () => ( this.leadFromDate))),
        pageNumber: this.leadPageNumber,
        pageSize: this.leadPageSize,
      })
      .pipe(
        finalize(() => {
          this.newLeadsRequestInFlight = false;
          if (!quiet && requestId === this.visibleLeadLoadingRequestId)
            this.leadsLoading = false;
          this.markViewDirty();

          _optionalChain([afterLoad, 'optionalCall', _220 => _220()]);
          if (this.destroyed || !this.pendingNewLeadsLoad) return;

          const nextLoadIsQuiet = this.pendingNewLeadsLoadIsQuiet;
          const callbacks = this.pendingNewLeadsLoadCallbacks.splice(0);
          this.pendingNewLeadsLoad = false;
          this.pendingNewLeadsLoadIsQuiet = true;
          this.loadLeads(nextLoadIsQuiet, () => {
            callbacks.forEach((callback) => callback());
          });
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.leadRequestId) return;
          this.applyConsultantStatusFrom(response.source, response.raw);
          const items = (_nullishCoalesce(response.items, () => ( [])))
            .filter((lead) => this.leadType(lead) !== LEAD_TYPE.ConsultantPatient);
          this.commitLeadsFromApi(items);
          this.leadTotalCount = _nullishCoalesce(response.totalCount, () => ( this.leads.length));
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

  loadReportEditLeads() {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    const requestId = ++this.reportEditRequestId;
    _optionalChain([this, 'access', _221 => _221.reportEditLoadSubscription, 'optionalAccess', _222 => _222.unsubscribe, 'call', _223 => _223()]);
    this.reportEditLeadsLoading = true;

    this.reportEditLoadSubscription = this.consultantApi
      .getLeads({
        profileId,
        hasSubmittedReport: true,
        searchText: this.trimmedFilter(this.reportEditSearchTerm),
        phoneNumber: this.trimmedFilter(this.reportEditPhoneFilter),
        from: this.formatFilterDate(this.reportEditFromDate),
        to: this.formatFilterDate(
          _nullishCoalesce(this.reportEditToDate, () => ( this.reportEditFromDate)),
        ),
        ...(this.reportEditStateFilter !== null
          ? { leadAssignmentState: this.reportEditStateFilter }
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
          const items = this.applyPendingReportPatches(_nullishCoalesce(response.items, () => ( []))).filter(
            (lead) => this.isLeadReportEditable(lead),
          );
          this.reportEditLeads = items;
          this.syncReportedLeadIdsFromLeads(this.reportEditLeads);
          this.syncReservedLeadIdsFromLeads(this.reportEditLeads);
          this.syncCallInitiatedFromLeads(this.reportEditLeads);
          this.reportEditTotalCount = _nullishCoalesce(response.totalCount, () => ( this.reportEditLeads.length));
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

   loadReservations() {
    const profileId = this.currentProfileId();
    if (!profileId) return;

    const requestId = ++this.reservationRequestId;
    _optionalChain([this, 'access', _224 => _224.reservationLoadSubscription, 'optionalAccess', _225 => _225.unsubscribe, 'call', _226 => _226()]);
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
          this.reservations = _nullishCoalesce(response.items, () => ( []));
          this.syncReservedLeadIdsFromReservations(this.reservations);
        },
        error: () => {
          if (requestId === this.reservationRequestId) this.reservations = [];
        },
      });
  }

   loadActiveReservationsForLeadActions() {
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
          const activeReservations = (_nullishCoalesce(response.items, () => ( []))).filter(
            (reservation) =>
              (_nullishCoalesce(reservation.isCanceled, () => ( reservation.IsCanceled))) !== true,
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

   mergeReservationsById(
    current,
    incoming,
  ) {
    const merged = new Map();
    const add = (reservation) => {
      const id = this.reservationId(reservation);
      if (!id) return;
      merged.set(id, reservation);
    };

    current.forEach(add);
    incoming.forEach(add);
    return [...merged.values()];
  }

   startOfTodayIso() {
    return `${toIranDateInputValue(nowInIran())}T00:00:00+03:30`;
  }

   endOfTodayIso() {
    return `${toIranDateInputValue(nowInIran())}T23:59:59.999+03:30`;
  }

   startTimers() {
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

   configurePollTimer() {
    const desiredInterval = 120000;

    if (this.pollId && desiredInterval === this.pollIntervalMs) return;

    if (this.pollId) {
      clearInterval(this.pollId);
      this.pollId = null;
    }

    this.pollIntervalMs = desiredInterval;
    this.ngZone.runOutsideAngular(() => {
      this.pollId = setInterval(() => {
        if (!this.isProfileReady() || this.destroyed) return;
        if (document.visibilityState === "hidden") return;
        if (this.newLeadsRequestInFlight) return;
        if (this.reportDialogOpen || this.reservationDialogOpen) return;
        this.ngZone.run(() => {
          this.loadLeads(true);
        });
      }, this.pollIntervalMs);
    });
  }

   hasActiveRealtimeTimers() {
    return this.leads.some(
      (lead) =>
        this.isRealtimeTimedLead(lead) &&
        !this.isLeadReportSubmitted(lead) &&
        this.leadRemainingMs(lead) > 0,
    );
  }

   hydrateRealtimeTimers() {
    const activeLeadIds = new Set();
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
          _nullishCoalesce((lead )
            .assignedAt, () => (
          (lead )
            .AssignedAt));
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

   async ensureLeadPushRegistration(requestPermission = false) {
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

   maybePromptPushSetup() {
    if (!this.shouldShowPushSetupBanner) return;

    this.toast.info(
      "برای دریافت لید لحظه‌ای، دکمه «فعال‌سازی نوتیفیکیشن» را بزنید.",
    );
  }

   syncRealtimeLeadPolling() {
    const profileId = this.currentProfileId();
    if (!profileId || !this.isOnline) {
      this.realtimeLeadAlerts.stopPolling();
      return;
    }
    this.realtimeLeadAlerts.startPolling(profileId);
  }

   showLeadNotification(
    title,
    body,
    tag = "consultant-lead-alert",
    data,
  ) {
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

   async syncPushRegistrationState() {
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
    } catch (e) {
      this.pushRegistrationReady = false;
    }

    this.configurePollTimer();
    this.markViewDirty();
  }

   runDailyAutoAbsenceIfDue() {
    if (this.autoAbsenceRunning) return;

    const now = new Date();
    if (now.getHours() < 21) return;

    const storageKey = this.autoAbsenceStorageKey();
    const todayKey = this.dateStorageKey(now);
    if (this.readJson(storageKey, null) === todayKey) return;

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

   autoAbsenceStorageKey() {
    return `consultant-auto-absence:${this.userKey()}`;
  }

   dateStorageKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;
  }

   isConsultantWorkingHours(date = new Date()) {
    return isConsultantWorkingHours(date);
  }

   isConsultantOnlineBlockedByTime(date = new Date()) {
    return isConsultantOnlineBlockedByTime(date);
  }

   expireDueRealtimeLeads() {
    this.leads.forEach((lead) => {
      const leadAssignmentId = this.leadId(lead);
      if (!leadAssignmentId || !this.shouldExpireLead(lead)) return;
      this.expireLead(leadAssignmentId);
    });
  }

   shouldExpireLead(lead) {
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
      this.currentTime < (_nullishCoalesce(this.expirationRetryAfter.get(leadAssignmentId), () => ( 0)))
    )
      return false;

    const state = this.leadState(lead);
    if (
      [
        LEAD_STATE.Contacted,
        LEAD_STATE.Converted,
        LEAD_STATE.Expired,
        LEAD_STATE.Rejected,
      ].includes(state )
    ) {
      return false;
    }

    return this.leadRemainingMs(lead) <= 0;
  }

   expireLead(leadAssignmentId) {
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
            typeof _optionalChain([response, 'access', _227 => _227.data, 'optionalAccess', _228 => _228.isConsultantOnline]) === "boolean"
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
    lead,
    secondaryPhoneNumber = "",
    options = {},
  ) {
    this.clearPendingReservationDialogOpen();
    if (
      !options.skipActionSuppress &&
      Date.now() < this.suppressLeadCardActionsUntil
    ) {
      return;
    }

    const leadAssignmentId = this.leadId(lead);
    if (!leadAssignmentId || this.isReservationDisabled(lead)) {
      this.showFeedback(
        _nullishCoalesce(this.reservationDisabledReason(lead), () => ( "امکان رزرو وجود ندارد")),
        "error",
      );
      return;
    }
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
      patientCount: 1,
      secondaryPhoneNumber: reservationSecondaryPhone,
      description: "",
      patientCity: this.reportForm.patientCity.trim(),
      patientRegion: this.reportForm.patientRegion.trim(),
      attendanceProbabilityPercent:
        _nullishCoalesce(this.normalizedAttendanceProbability(
          this.reportForm.attendanceProbabilityPercent,
        ), () => ( 80)),
      attendancePrediction: this.defaultAttendancePrediction(),
      dentalServices: [],
    };
    this.reservationDialogOpen = true;
  }

  openEditReservationDialog(lead) {
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
          this.reservations = _nullishCoalesce(response.items, () => ( []));
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

   openEditReservationDialogForReservation(
    lead,
    reservation,
  ) {
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
      patientCount: this.reservationPatientCount(reservation),
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
        Number(
          _nullishCoalesce(_nullishCoalesce(reservation.attendanceProbabilityPercent, () => (
            reservation.AttendanceProbabilityPercent)), () => (
            8)),
        ),
      dentalServices: dentalServicesOf(reservation),
      attendancePrediction:
        this.reservationAttendancePrediction(reservation) ||
        this.defaultAttendancePrediction(),
    };
    this.reservationDialogOpen = true;
    this.markViewDirty();
  }

   openPatientProfileDialog(reservation) {
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

   extractReservation(source) {
    if (!this.isRecord(source)) return null;

    if (this.reservationId(source ))
      return source ;

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

   resetPatientProfileState() {
    this.patientProfileDialogOpen = false;
    this.patientProfileSaving = false;
    this.patientProfileRequired = false;
    this.selectedPatientProfileReservation = null;
    this.patientProfileForm = this.emptyPatientProfileForm();
  }

   markLeadReported(
    leadAssignmentId,
    nextState,
    isReportSubmitted = true,
  ) {
    const updateLead = (lead) => {
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

   mergeLeadFromBackend(updatedLead) {
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

   replaceLeadInCollection(
    collection,
    leadAssignmentId,
    updatedLead,
  ) {
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

   commitLeadsFromApi(items) {
    const patchedItems = this.applyPendingReportPatches(items);
    const highlightedId = this.highlightedLeadAssignmentId;
    this.leads = highlightedId
      ? [...patchedItems].sort((left, right) => {
          const leftIsHighlighted = this.leadId(left) === highlightedId;
          const rightIsHighlighted = this.leadId(right) === highlightedId;
          return Number(rightIsHighlighted) - Number(leftIsHighlighted);
        })
      : patchedItems;
    this.syncReportedLeadIdsFromLeads(this.leads);
    this.syncReservedLeadIdsFromLeads(this.leads);
    this.syncCallInitiatedFromLeads(this.leads);
  }

   rememberPendingReportPatch(
    leadAssignmentId,
    patch,
  ) {
    this.pendingReportPatches.set(leadAssignmentId, {
      patch,
      savedAt: Date.now(),
    });
    this.reportedLeadIds.add(leadAssignmentId);
    this.reportingLeadIds.delete(leadAssignmentId);
  }

   buildSubmittedReportPatch(
    callResult,
    nextState,
    reportSubmittedAt,
    payload



,
  ) {
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

   prunePendingReportPatches() {
    const now = Date.now();
    for (const [leadAssignmentId, entry] of this.pendingReportPatches) {
      if (now - entry.savedAt > PENDING_REPORT_PATCH_TTL_MS) {
        this.pendingReportPatches.delete(leadAssignmentId);
      }
    }
  }

   backendLeadHasReport(lead) {
    if (Boolean(_nullishCoalesce(lead.isReportSubmitted, () => ( lead.IsReportSubmitted)))) return true;
    if (Boolean(_nullishCoalesce(lead.reportSubmittedAt, () => ( lead.ReportSubmittedAt)))) return true;
    return this.leadCallResult(lead) !== null;
  }

   applyPendingReportPatches(leads) {
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

   mergeLeadUpdate(
    existing,
    incoming,
  ) {
    const merged = { ...existing, ...incoming } ;
    const leadAssignmentId = this.leadId(merged);
    if (!leadAssignmentId) return merged;

    const pending = this.pendingReportPatches.get(leadAssignmentId);
    if (pending && !this.backendLeadHasReport(incoming )) {
      return { ...merged, ...pending.patch } ;
    }

    const incomingCallResult = this.leadCallResult(incoming );
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

   selectedReservationDateTime() {
    const date = this.reservationForm.reservationDate;
    const time = this.reservationForm.reservationTime;
    if (!date || !time) return null;

    return combineIranDateAndTime(date, time);
  }

   isReservationTimeChanged(reservationAt) {
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

   minimumReservationDateTime() {
    const date = new Date(nowInIranMs() + 5 * 60 * 1000);
    date.setSeconds(0, 0);
    return date;
  }

   toTimeValue(date) {
    return toIranTimeInputValue(date);
  }

   leadDeadlineMs(lead) {
    const leadAssignmentId = this.leadId(lead);
    const localStart = leadAssignmentId
      ? this.timerStarts[String(leadAssignmentId)]
      : undefined;

    if (localStart !== undefined) {
      return localStart + REALTIME_CALL_WINDOW_MS;
    }

    return Date.now() + REALTIME_CALL_WINDOW_MS;
  }

   resetRealtimeLeadTimer(
    leadAssignmentId,
    _callDeadlineAt,
  ) {
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

   releaseLeadReportSession(leadAssignmentId) {
    this.reportingLeadIds.delete(leadAssignmentId);
    this.timerExpiredReportPromptedLeadIds.delete(leadAssignmentId);
    this.reportedLeadIds.add(leadAssignmentId);
    this.phoneRevealedLeadIds.delete(leadAssignmentId);
    this.stopRealtimeTimer(leadAssignmentId);
    this.writeJson(this.phoneRevealedStorageKey(), [...this.phoneRevealedLeadIds]);
  }

   isActiveRealtimeLead(lead) {
    const state = this.leadState(lead);
    return state === LEAD_STATE.New || state === LEAD_STATE.Assigned;
  }

   stopRealtimeTimer(leadAssignmentId) {
    if (this.stoppedTimerLeadIds.has(leadAssignmentId)) return;

    this.stoppedTimerLeadIds.add(leadAssignmentId);
    this.writeJson(
      this.stoppedTimerStorageKey(),
      [...this.stoppedTimerLeadIds],
    );
    this.markViewDirty();
  }

   defaultPatientAvatarImageName() {
    return "default-patient-avatar.png";
  }

  validateLeadReportForm() {
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
        attendanceProbabilityPercent > 10)
    )
      return "احتمال حضور باید بین ۰ تا ۱۰ باشد";

    return null;
  }

  validateReservationForm() {
    const patientCountError = validatePatientCount(this.reservationForm.patientCount);
    if (patientCountError) return patientCountError;
    if (!this.reservationForm.reservationDate) return "تاریخ رزرو الزامی است";
    if (!this.reservationForm.reservationTime) return "ساعت رزرو الزامی است";
    if (
      !Number.isInteger(Number(this.reservationForm.patientCount)) ||
      Number(this.reservationForm.patientCount) < 1 ||
      Number(this.reservationForm.patientCount) > 10
    )
      return "تعداد بیماران باید بین ۱ تا ۱۰ نفر باشد";
    if (!this.reservationForm.dentalServices.length)
      return "انتخاب حداقل یک خدمت معتبر الزامی است";

    const reservationAt = this.selectedReservationDateTime();
    const reservationTimeChanged = this.isReservationTimeChanged(reservationAt);
    if (!reservationAt || !Number.isFinite(reservationAt.getTime()))
      return "زمان رزرو معتبر نیست";
    if (
      this.isReservationEditMode() &&
      reservationTimeChanged &&
      reservationAt.getTime() <= Date.now()
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
      this.reservationForm.attendanceProbabilityPercent >
        (this.isReservationEditMode() ? 100 : 10)
    )
      return this.isReservationEditMode()
        ? "احتمال حضور باید بین ۰ تا ۱۰۰ باشد"
        : "احتمال حضور باید بین ۰ تا ۱۰ باشد";

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

   isSuccessfulCallResult(callResult) {
    return callResult === 1 || callResult === 2;
  }

   readShouldOpenReservationPage(source) {
    return (
      this.readBoolean(
        source,
        "shouldOpenReservationPage",
        "ShouldOpenReservationPage",
      ) === true
    );
  }

   clearPendingReservationDialogOpen() {
    if (!this.pendingReservationOpenTimer) return;
    clearTimeout(this.pendingReservationOpenTimer);
    this.pendingReservationOpenTimer = null;
  }

   scheduleReservationDialogOpen(
    lead,
    secondaryPhoneNumber = "",
  ) {
    this.clearPendingReservationDialogOpen();
    this.pendingReservationOpenTimer = setTimeout(() => {
      this.pendingReservationOpenTimer = null;
      this.openReservationDialog(lead, secondaryPhoneNumber, {
        skipActionSuppress: true,
      });
    }, 650);
  }

  validateProfileForm() {
    const code = this.profileForm.nationalityCode.trim();
    if (!/^\d{10}$/.test(code)) return "کد ملی باید ۱۰ رقم باشد";
    if (
      !this.profileForm.address.trim() ||
      this.profileForm.address.trim().length < 5
    )
      return "آدرس مشاور الزامی است";
    return null;
  }

  validatePatientProfileForm() {
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

   buildCompletePatientProfileRequest(
    reservationId,
  ) {
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

   emptyPatientProfileForm() {
    return {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      password: "",
      gender: 1,
    };
  }

   emptyAddPatientLeadForm() {
    return {
      userName: "",
      phoneNumber: "",
      patientCity: "",
      patientRegion: "",
      secondaryPhoneNumber: "",
      reportDescription: "",
    };
  }

   splitReservationPatientName(value)


 {
    const parts = (_nullishCoalesce(value, () => ( ""))).trim().split(/\s+/).filter(Boolean);
    return {
      firstName: _nullishCoalesce(parts[0], () => ( "")),
      lastName: parts.slice(1).join(" "),
    };
  }

   createYesterday() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return this.startOfDay(date);
  }

   createRelativeYearDate(yearOffset) {
    const date = new Date();
    date.setFullYear(date.getFullYear() + yearOffset);
    return this.startOfDay(date);
  }

   startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

   toDateInputValue(date) {
    return toIranDateInputValue(date);
  }

   resolveProfileId(data) {
    if (typeof data === "number" && data > 0) return data;
    if (typeof data === "string") {
      const numeric = Number(data);
      return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
    }

    if (typeof data !== "object" || data === null) return null;

    const source = data ;
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

   requireProfileId() {
    const profileId = this.currentProfileId();
    if (!profileId) {
      this.showFeedback("شناسه پروفایل مشاور یافت نشد", "error");
      return null;
    }

    return profileId;
  }

   timerStorageKey() {
    return `consultant-lead-timers:${this.userKey()}`;
  }

   stoppedTimerStorageKey() {
    return `consultant-lead-timers-stopped:${this.userKey()}`;
  }

   phoneRevealedStorageKey() {
    return `consultant-lead-phone-revealed:${this.userKey()}`;
  }

   userKey() {
    const user = this.user();
    return _optionalChain([user, 'optionalAccess', _229 => _229.userId]) || _optionalChain([user, 'optionalAccess', _230 => _230.phoneNumber]) || "current";
  }

   toDateTimeLocalValue(date) {
    const pad = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

   readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? (JSON.parse(value) ) : fallback;
    } catch (e2) {
      return fallback;
    }
  }

   writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e3) {
      // The dashboard still works; only local timer persistence is skipped.
    }
  }

   applyConsultantStatusFrom(
    ...sources
  ) {
    const update = {
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

   collectConsultantStatus(
    source,
    update,
    depth,
  ) {
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

   readBoolean(source, ...keys) {
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

   readString(source, ...keys) {
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

   numberOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

   readValue(source, ...keys) {
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

   isRecord(value) {
    return typeof value === "object" && value !== null;
  }

   showFeedback(
    message,
    type,
  ) {
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

  clearFeedback() {
    if (this.feedbackAutoDismissTimer) {
      clearTimeout(this.feedbackAutoDismissTimer);
      this.feedbackAutoDismissTimer = null;
    }
    this.feedbackMessage = "";
  }

   isAlreadyCompleteProfileError(message) {
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

   errorMessage(error, fallback) {
    return error instanceof Error && error.message ? error.message : fallback;
  }
}
