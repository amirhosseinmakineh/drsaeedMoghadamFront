import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AdminDashboardService } from "../../core/admin/admin-dashboard.service";
import { ToastService } from "../../core/toast/toast.service";
@Component({selector:"app-admin-lead-sheets",standalone:true,imports:[CommonModule,FormsModule],templateUrl:"./admin-lead-sheets.component.html",styleUrl:"./admin-lead-sheets.component.scss",changeDetection:ChangeDetectionStrategy.OnPush})
export class AdminLeadSheetsComponent {
 private readonly api=inject(AdminDashboardService); private readonly toast=inject(ToastService);
 sheetName=""; selectedSheetId:number|null=null; phoneNumber=""; firstName=""; lastName=""; createdSheet:any=null; saving=false;
 createSheet(){if(!this.sheetName.trim())return;this.saving=true;this.api.createAdminLeadSheet(this.sheetName).subscribe({next:s=>{this.createdSheet=s;this.selectedSheetId=s.id;this.sheetName="";this.toast.success("شیت لید با موفقیت ساخته شد");},error:()=>this.toast.error("ساخت شیت ناموفق بود"),complete:()=>this.saving=false});}
 addLead(){if(!this.selectedSheetId||!this.phoneNumber||!this.firstName||!this.lastName)return;this.api.addAdminSheetLead(this.selectedSheetId,{phoneNumber:this.phoneNumber,firstName:this.firstName,lastName:this.lastName}).subscribe({next:()=>{this.phoneNumber=this.firstName=this.lastName="";this.toast.success("لید به شیت اضافه شد");},error:()=>this.toast.error("ثبت لید ناموفق بود")});}
}
