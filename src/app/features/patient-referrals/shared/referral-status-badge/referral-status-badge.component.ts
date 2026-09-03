import { Component, Input } from "@angular/core";
import { PatientReferralStatus, REFERRAL_STATUS_LABELS } from "../../models/patient-referral.models";
@Component({ selector: "app-referral-status-badge", standalone: true, template: `<span class="badge s{{status}}">{{ label }}</span>`, styles: [`
.badge{display:inline-flex;padding:.35rem .65rem;border-radius:999px;font-size:.78rem;font-weight:700;background:#eef2ff;color:#3730a3}.s2{background:#e0f2fe;color:#075985}.s3{background:#fef3c7;color:#92400e}.s4{background:#dcfce7;color:#166534}.s5{background:#fee2e2;color:#991b1b}`] })
export class ReferralStatusBadgeComponent { @Input({required:true}) status!: PatientReferralStatus; get label(){ return REFERRAL_STATUS_LABELS[this.status] ?? "نامشخص"; } }
