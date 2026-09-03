import { CommonModule, DatePipe, DecimalPipe } from "@angular/common";
import { Component, Input } from "@angular/core";
import { PatientReferral } from "../../models/patient-referral.models";
import { ReferralStatusBadgeComponent } from "../referral-status-badge/referral-status-badge.component";
import { ReferralTimelineComponent } from "../referral-timeline/referral-timeline.component";
@Component({selector:"app-referral-card",standalone:true,imports:[CommonModule,DatePipe,DecimalPipe,ReferralStatusBadgeComponent,ReferralTimelineComponent],templateUrl:"./referral-card.component.html",styleUrl:"./referral-card.component.scss"})
export class ReferralCardComponent { @Input({required:true}) referral!:PatientReferral; @Input() showReferrer=false; @Input() showTimeline=false; }
