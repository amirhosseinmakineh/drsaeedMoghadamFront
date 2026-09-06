import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { finalize, forkJoin } from "rxjs";
import { AuthService } from "../../../../../core/auth/auth.service";
import { ToastService } from "../../../../../core/toast/toast.service";
import { EmptyStateComponent, LoadingComponent } from "../../../../../shared/base";
import { PatientReferralDashboard, PatientReferralStatus, PagedReferrals, ReferralQuery, REFERRAL_STATUS_LABELS } from "../../../models/patient-referral.models";
import { PatientReferralApiService } from "../../../services/patient-referral-api.service";
import { ReferralCardComponent } from "../../../shared/referral-card/referral-card.component";
import { CreateReferralFormComponent } from "../../components/create-referral-form/create-referral-form.component";
import { PatientWalletCardComponent } from "../../components/patient-wallet-card/patient-wallet-card.component";
@Component({selector:"app-patient-referral-dashboard",standalone:true,imports:[CommonModule,FormsModule,RouterLink,LoadingComponent,EmptyStateComponent,ReferralCardComponent,CreateReferralFormComponent,PatientWalletCardComponent],changeDetection:ChangeDetectionStrategy.OnPush,templateUrl:"./patient-referral-dashboard.component.html",styleUrl:"../../../patient-referrals.scss"})
export class PatientReferralDashboardComponent implements OnInit { dashboard:PatientReferralDashboard|null=null; list:PagedReferrals|null=null; loading=true; error=false; query:ReferralQuery={page:1,pageSize:6,status:null,search:""}; readonly statuses=Object.entries(REFERRAL_STATUS_LABELS).map(([value,label])=>({value:+value,label})); constructor(private api:PatientReferralApiService,public auth:AuthService,private router:Router,private toast:ToastService,private cdr:ChangeDetectorRef){} ngOnInit(){this.loadAll()} loadAll(){this.loading=true;this.error=false;forkJoin({dashboard:this.api.patientDashboard(),list:this.api.patientReferrals(this.query)}).pipe(finalize(()=>{this.loading=false;this.cdr.markForCheck()})).subscribe({next:r=>{this.dashboard=r.dashboard;this.list=r.list},error:()=>{this.error=true;this.toast.error("دریافت اطلاعات داشبورد انجام نشد.")}})} loadList(){this.api.patientReferrals(this.query).subscribe({next:r=>{this.list=r;this.cdr.markForCheck()},error:()=>this.toast.error("دریافت تاریخچه معرفی‌ها انجام نشد.")})} filter(){this.query.page=1;this.loadList()} page(p:number){if(p<1||p>(this.list?.totalPages||1))return;this.query.page=p;this.loadList()} logout(){this.auth.logout();this.router.navigateByUrl("/")} }
