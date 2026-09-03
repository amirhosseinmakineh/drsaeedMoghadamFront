import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { finalize, forkJoin } from "rxjs";
import { AuthService } from "../../../../../core/auth/auth.service";
import { ToastService } from "../../../../../core/toast/toast.service";
import {
  EmptyStateComponent,
  LoadingComponent,
} from "../../../../../shared/base";
import { FaIconComponent } from "../../../../../shared/ui/fa-icon/fa-icon.component";
import {
  PatientReferralDashboard,
  PagedReferrals,
  ReferralQuery,
  REFERRAL_STATUS_LABELS,
} from "../../../models/patient-referral.models";
import { PatientReferralApiService } from "../../../services/patient-referral-api.service";
import { ReferralCardComponent } from "../../../shared/referral-card/referral-card.component";
import { CreateReferralFormComponent } from "../../components/create-referral-form/create-referral-form.component";
import { PatientWalletCardComponent } from "../../components/patient-wallet-card/patient-wallet-card.component";

type PatientSection = "overview" | "create-referral" | "referral-history";

interface PatientNavigationItem {
  id: PatientSection;
  label: string;
  icon: string;
}

@Component({
  selector: "app-patient-referral-dashboard",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    LoadingComponent,
    EmptyStateComponent,
    FaIconComponent,
    ReferralCardComponent,
    CreateReferralFormComponent,
    PatientWalletCardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./patient-referral-dashboard.component.html",
  styleUrls: [
    "../../../patient-referrals.scss",
    "./patient-referral-dashboard.component.scss",
  ],
})
export class PatientReferralDashboardComponent implements OnInit {
  dashboard: PatientReferralDashboard | null = null;
  list: PagedReferrals | null = null;
  loading = true;
  error = false;
  mobileSidebarOpen = false;
  activeSection: PatientSection = "overview";

  query: ReferralQuery = {
    page: 1,
    pageSize: 6,
    status: null,
    search: "",
  };

  readonly navigationItems: PatientNavigationItem[] = [
    { id: "overview", label: "نمای کلی", icon: "dashboard" },
    { id: "create-referral", label: "معرفی بیمار", icon: "plus" },
    { id: "referral-history", label: "تاریخچه معرفی‌ها", icon: "list" },
  ];

  readonly statuses = Object.entries(REFERRAL_STATUS_LABELS).map(
    ([value, label]) => ({ value: +value, label }),
  );

  constructor(
    private api: PatientReferralApiService,
    public auth: AuthService,
    private router: Router,
    private toast: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loading = true;
    this.error = false;
    forkJoin({
      dashboard: this.api.patientDashboard(),
      list: this.api.patientReferrals(this.query),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (result) => {
          this.dashboard = result.dashboard;
          this.list = result.list;
        },
        error: () => {
          this.error = true;
          this.toast.error("دریافت اطلاعات داشبورد انجام نشد.");
        },
      });
  }

  loadList(): void {
    this.api.patientReferrals(this.query).subscribe({
      next: (result) => {
        this.list = result;
        this.cdr.markForCheck();
      },
      error: () => this.toast.error("دریافت تاریخچه معرفی‌ها انجام نشد."),
    });
  }

  filter(): void {
    this.query.page = 1;
    this.loadList();
  }

  page(page: number): void {
    if (page < 1 || page > (this.list?.totalPages || 1)) return;
    this.query.page = page;
    this.loadList();
  }

  navigateTo(section: PatientSection): void {
    this.activeSection = section;
    this.mobileSidebarOpen = false;
    document.getElementById(section)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.mobileSidebarOpen = false;
  }

  trackNavigationItem(_: number, item: PatientNavigationItem): string {
    return item.id;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl("/");
  }
}
