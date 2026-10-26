 function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,






} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { finalize } from "rxjs";





import {
  downloadBlob,
  reportFileName,
} from "../../utils/file-download.util";
import {

  leadAssignmentStatePresentation,

} from "../../core/lead/lead-assignment-state";
import {

  TableComponent,
} from "../../shared/base/table/table.component";
import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";
import {
  ADMIN_LEAD_STATE_FILTER_OPTIONS,
  ADMIN_LEAD_TYPE_FILTER_OPTIONS,
  leadAssignmentStateLabel,
  leadAssignmentTypeLabel,
  resolveLeadAssignmentState,
  resolveLeadAssignmentType,
} from "../../core/lead/lead-enums";
import { formatIranDateTime } from "../../utils/iran-datetime.util";



@Component({
  selector: "app-admin-leads-table",
  standalone: true,
  imports: [CommonModule, FormsModule, TableComponent],
  templateUrl: "./admin-leads-table.component.html",
  styleUrl: "./admin-leads-table.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLeadsTableComponent  {
  Input() __init() {this.mode = "system"}
  Input() __init2() {this.profileId = null}
  Input() __init3() {this.title = "مدیریت درخواست‌های مشاوره"}
  Input() __init4() {this.description = "مشاهده و فیلتر درخواست‌های مشاوره بر اساس وضعیت و نوع تخصیص"}

  __init5() {this.items = []}
  __init6() {this.loading = false}
  __init7() {this.exporting = false}
  __init8() {this.feedback = ""}
  __init9() {this.phoneFilter = ""}
  __init10() {this.totalCount = 0}
  __init11() {this.totalPages = 1}
  __init12() {this.filters = {
    leadAssignmentState: null,
    leadAssignmentType: null,
    pageNumber: 1,
    pageSize: 10,
  }}
   __init13() {this.hasRequestedLoad = false}
   __init14() {this.loadRequestId = 0}
   __init15() {this.ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR}
   __init16() {this.stateFilterOptions = ADMIN_LEAD_STATE_FILTER_OPTIONS}
   __init17() {this.typeFilterOptions = ADMIN_LEAD_TYPE_FILTER_OPTIONS}

   __init18() {this.columns = [
    {key: "sourceType", label: "منشأ", value: row => _nullishCoalesce(({1: "یکتانت", 2: "کلینیک", 3: "شیت ادمین", 4: "وب‌سایت"} )[_nullishCoalesce(row.sourceType, () => ( 0))], () => ( "نامشخص"))},
    {key: "consultationServiceTitle", label: "خدمت موردنظر", value: row => _nullishCoalesce(row.consultationServiceTitle, () => ( "-"))},
    {key: "consultationNotes", label: "توضیحات درخواست", value: row => _nullishCoalesce(row.consultationNotes, () => ( "-"))},
    { key: "id", label: "شناسه", value: (row) => _nullishCoalesce(this.leadId(row), () => ( "-")) },
    {
      key: "userName",
      label: "نام مراجعه‌کننده",
      value: (row) => this.leadName(row),
    },
    {
      key: "phoneNumber",
      label: "موبایل",
      value: (row) => this.leadPhone(row),
    },
    {
      key: "createdAt",
      label: "تاریخ ثبت درخواست",
      value: (row) => this.formatDateTime(this.leadCreatedAt(row)),
    },
    {
      key: "contactedAt",
      label: "تاریخ تماس",
      value: (row) => this.formatDateTime(this.leadContactedAt(row)),
    },
    {
      key: "leadAssignmentState",
      label: "وضعیت",
      value: (row) => leadAssignmentStatePresentation(this.leadState(row)).label,
      badge: (row) =>
        leadAssignmentStatePresentation(this.leadState(row)).badge,
    },
    {
      key: "leadAssignmentType",
      label: "نوع",
      value: (row) => this.typeLabel(this.leadType(row)),
      badge: () => "info",
    },
  ]}

  constructor(
     adminApi,
     cdr,
  ) {;this.adminApi = adminApi;this.cdr = cdr;AdminLeadsTableComponent.prototype.__init.call(this);AdminLeadsTableComponent.prototype.__init2.call(this);AdminLeadsTableComponent.prototype.__init3.call(this);AdminLeadsTableComponent.prototype.__init4.call(this);AdminLeadsTableComponent.prototype.__init5.call(this);AdminLeadsTableComponent.prototype.__init6.call(this);AdminLeadsTableComponent.prototype.__init7.call(this);AdminLeadsTableComponent.prototype.__init8.call(this);AdminLeadsTableComponent.prototype.__init9.call(this);AdminLeadsTableComponent.prototype.__init10.call(this);AdminLeadsTableComponent.prototype.__init11.call(this);AdminLeadsTableComponent.prototype.__init12.call(this);AdminLeadsTableComponent.prototype.__init13.call(this);AdminLeadsTableComponent.prototype.__init14.call(this);AdminLeadsTableComponent.prototype.__init15.call(this);AdminLeadsTableComponent.prototype.__init16.call(this);AdminLeadsTableComponent.prototype.__init17.call(this);AdminLeadsTableComponent.prototype.__init18.call(this);}

  ngOnInit() {
    if (!this.hasRequestedLoad) this.load();
  }

  ngOnChanges(changes) {
    if (changes["profileId"] || changes["mode"]) {
      this.filters.pageNumber = 1;
      this.load();
    }
  }

  applyFilters() {
    this.filters.pageNumber = 1;
    this.load();
  }

  leadPhoneHref(row) {
    const phone = this.leadPhone(row);
    return phone && phone !== "-" ? `tel:${phone}` : null;
  }

  changePage(page) {
    this.filters.pageNumber = page;
    this.load();
  }

  exportLeadsReport() {
    if (this.exporting || this.mode !== "system") return;

    this.exporting = true;
    this.feedback = "";
    this.cdr.markForCheck();

    this.adminApi
      .exportLeadsReport()
      .pipe(
        finalize(() => {
          this.exporting = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (blob) => downloadBlob(blob, reportFileName("leads-report")),
        error: (error) => {
          this.feedback =
            error instanceof Error && error.message
              ? error.message
              : "خطا در دریافت گزارش. لطفاً دوباره تلاش کنید.";
          this.cdr.markForCheck();
        },
      });
  }

  load() {
    this.hasRequestedLoad = true;

    if (this.mode === "consultant" && !this.profileId) {
      this.items = [];
      this.totalCount = 0;
      this.totalPages = 1;
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    const requestId = ++this.loadRequestId;
    this.loading = true;
    this.feedback = "";
    this.cdr.markForCheck();

    const query = {
      ...this.filters,
      searchText: this.phoneFilter.trim() || undefined,
      profileId:
        this.mode === "consultant" ? (_nullishCoalesce(this.profileId, () => ( undefined))) : undefined,
    };

    const request =
      this.mode === "consultant"
        ? this.adminApi.getConsultantLeads(query)
        : this.adminApi.getSystemLeads(query);

    request
      .pipe(
        finalize(() => {
          if (requestId === this.loadRequestId) {
            this.loading = false;
            this.cdr.markForCheck();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.loadRequestId) return;
          this.items = _nullishCoalesce(response.items, () => ( []));
          this.totalCount = _nullishCoalesce(response.totalCount, () => ( this.items.length));
          this.totalPages = Math.max(
            1,
            response.totalPages ||
              Math.ceil(this.totalCount / this.filters.pageSize),
          );
          this.cdr.markForCheck();
        },
        error: (error) => {
          if (requestId === this.loadRequestId) {
            this.feedback = this.errorMessage(
              error,
              "دریافت درخواست‌های مشاوره انجام نشد",
            );
            this.cdr.markForCheck();
          }
        },
      });
  }

   leadName(row) {
    return (
      row.userName ||
      row.UserName ||
      row.fullName ||
      row.FullName ||
      [row.firstName, row.lastName].filter(Boolean).join(" ").trim() ||
      [row.FirstName, row.LastName].filter(Boolean).join(" ").trim() ||
      _optionalChain([row, 'access', _ => _.user, 'optionalAccess', _2 => _2.userName]) ||
      _optionalChain([row, 'access', _3 => _3.user, 'optionalAccess', _4 => _4.UserName]) ||
      _optionalChain([row, 'access', _5 => _5.user, 'optionalAccess', _6 => _6.fullName]) ||
      _optionalChain([row, 'access', _7 => _7.user, 'optionalAccess', _8 => _8.FullName]) ||
      _optionalChain([row, 'access', _9 => _9.user, 'optionalAccess', _10 => _10.name]) ||
      _optionalChain([row, 'access', _11 => _11.user, 'optionalAccess', _12 => _12.Name]) ||
      [_optionalChain([row, 'access', _13 => _13.user, 'optionalAccess', _14 => _14.firstName]), _optionalChain([row, 'access', _15 => _15.user, 'optionalAccess', _16 => _16.lastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [_optionalChain([row, 'access', _17 => _17.user, 'optionalAccess', _18 => _18.FirstName]), _optionalChain([row, 'access', _19 => _19.user, 'optionalAccess', _20 => _20.LastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      _optionalChain([row, 'access', _21 => _21.User, 'optionalAccess', _22 => _22.userName]) ||
      _optionalChain([row, 'access', _23 => _23.User, 'optionalAccess', _24 => _24.UserName]) ||
      _optionalChain([row, 'access', _25 => _25.User, 'optionalAccess', _26 => _26.fullName]) ||
      _optionalChain([row, 'access', _27 => _27.User, 'optionalAccess', _28 => _28.FullName]) ||
      _optionalChain([row, 'access', _29 => _29.User, 'optionalAccess', _30 => _30.name]) ||
      _optionalChain([row, 'access', _31 => _31.User, 'optionalAccess', _32 => _32.Name]) ||
      [_optionalChain([row, 'access', _33 => _33.User, 'optionalAccess', _34 => _34.firstName]), _optionalChain([row, 'access', _35 => _35.User, 'optionalAccess', _36 => _36.lastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [_optionalChain([row, 'access', _37 => _37.User, 'optionalAccess', _38 => _38.FirstName]), _optionalChain([row, 'access', _39 => _39.User, 'optionalAccess', _40 => _40.LastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      _optionalChain([row, 'access', _41 => _41.lead, 'optionalAccess', _42 => _42.fullName]) ||
      _optionalChain([row, 'access', _43 => _43.lead, 'optionalAccess', _44 => _44.FullName]) ||
      _optionalChain([row, 'access', _45 => _45.lead, 'optionalAccess', _46 => _46.name]) ||
      _optionalChain([row, 'access', _47 => _47.lead, 'optionalAccess', _48 => _48.Name]) ||
      [_optionalChain([row, 'access', _49 => _49.lead, 'optionalAccess', _50 => _50.firstName]), _optionalChain([row, 'access', _51 => _51.lead, 'optionalAccess', _52 => _52.lastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [_optionalChain([row, 'access', _53 => _53.lead, 'optionalAccess', _54 => _54.FirstName]), _optionalChain([row, 'access', _55 => _55.lead, 'optionalAccess', _56 => _56.LastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      _optionalChain([row, 'access', _57 => _57.Lead, 'optionalAccess', _58 => _58.fullName]) ||
      _optionalChain([row, 'access', _59 => _59.Lead, 'optionalAccess', _60 => _60.FullName]) ||
      _optionalChain([row, 'access', _61 => _61.Lead, 'optionalAccess', _62 => _62.name]) ||
      _optionalChain([row, 'access', _63 => _63.Lead, 'optionalAccess', _64 => _64.Name]) ||
      [_optionalChain([row, 'access', _65 => _65.Lead, 'optionalAccess', _66 => _66.firstName]), _optionalChain([row, 'access', _67 => _67.Lead, 'optionalAccess', _68 => _68.lastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      [_optionalChain([row, 'access', _69 => _69.Lead, 'optionalAccess', _70 => _70.FirstName]), _optionalChain([row, 'access', _71 => _71.Lead, 'optionalAccess', _72 => _72.LastName])]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      "بدون نام"
    );
  }

   leadPhone(row) {
    return (
      row.phoneNumber ||
      row.PhoneNumber ||
      row.mobile ||
      row.Mobile ||
      row.userPhoneNumber ||
      row.UserPhoneNumber ||
      row.leadPhoneNumber ||
      row.LeadPhoneNumber ||
      _optionalChain([row, 'access', _73 => _73.user, 'optionalAccess', _74 => _74.phoneNumber]) ||
      _optionalChain([row, 'access', _75 => _75.user, 'optionalAccess', _76 => _76.PhoneNumber]) ||
      _optionalChain([row, 'access', _77 => _77.user, 'optionalAccess', _78 => _78.mobile]) ||
      _optionalChain([row, 'access', _79 => _79.user, 'optionalAccess', _80 => _80.Mobile]) ||
      _optionalChain([row, 'access', _81 => _81.User, 'optionalAccess', _82 => _82.phoneNumber]) ||
      _optionalChain([row, 'access', _83 => _83.User, 'optionalAccess', _84 => _84.PhoneNumber]) ||
      _optionalChain([row, 'access', _85 => _85.User, 'optionalAccess', _86 => _86.mobile]) ||
      _optionalChain([row, 'access', _87 => _87.User, 'optionalAccess', _88 => _88.Mobile]) ||
      _optionalChain([row, 'access', _89 => _89.lead, 'optionalAccess', _90 => _90.phoneNumber]) ||
      _optionalChain([row, 'access', _91 => _91.lead, 'optionalAccess', _92 => _92.PhoneNumber]) ||
      _optionalChain([row, 'access', _93 => _93.lead, 'optionalAccess', _94 => _94.mobile]) ||
      _optionalChain([row, 'access', _95 => _95.lead, 'optionalAccess', _96 => _96.Mobile]) ||
      _optionalChain([row, 'access', _97 => _97.Lead, 'optionalAccess', _98 => _98.phoneNumber]) ||
      _optionalChain([row, 'access', _99 => _99.Lead, 'optionalAccess', _100 => _100.PhoneNumber]) ||
      _optionalChain([row, 'access', _101 => _101.Lead, 'optionalAccess', _102 => _102.mobile]) ||
      _optionalChain([row, 'access', _103 => _103.Lead, 'optionalAccess', _104 => _104.Mobile]) ||
      "-"
    );
  }

   leadState(row) {
    return resolveLeadAssignmentState(
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(row.leadAssignmentState, () => (
        row.LeadAssignmentState)), () => (
        row.state)), () => (
        row.State)), () => (
        row.status)), () => (
        row.Status)), () => (
        null)),
    );
  }

   leadType(row) {
    return resolveLeadAssignmentType(
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(row.leadAssignmentType, () => (
        row.LeadAssignmentType)), () => (
        row.assignmentType)), () => (
        row.AssignmentType)), () => (
        row.type)), () => (
        row.Type)), () => (
        null)),
    );
  }

   leadId(row) {
    return this.numberOrNull(
      _nullishCoalesce(_nullishCoalesce(_nullishCoalesce(_nullishCoalesce(row.id, () => ( row.Id)), () => ( row.leadAssignmentId)), () => ( row.LeadAssignmentId)), () => ( null)),
    );
  }

   numberOrNull(value) {
    if (value === null || value === undefined || value === "") return null;
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

   stateLabel(value) {
    return leadAssignmentStateLabel(value);
  }

   stateBadge(value) {
    if (value === 1 || value === 2) return "info";
    if (value === 5) return "success";
    if (value === 4 || value === 6) return "warn";
    return "danger";
  }

   typeLabel(value) {
    return leadAssignmentTypeLabel(value);
  }

   errorMessage(error, fallback) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

   leadCreatedAt(row) {
    return row.createdAt || row.CreatedAt || "";
  }

   leadContactedAt(row) {
    return row.contactedAt || row.ContactedAt || "";
  }

   formatDateTime(value) {
    return formatIranDateTime(value);
  }
}
