import { CommonModule, DatePipe, DecimalPipe } from "@angular/common";


import { ReferralStatusBadgeComponent } from "../referral-status-badge/referral-status-badge.component";
import { ReferralTimelineComponent } from "../referral-timeline/referral-timeline.component";
@Component({selector:"app-referral-card",standalone:true,imports:[CommonModule,DatePipe,DecimalPipe,ReferralStatusBadgeComponent,ReferralTimelineComponent],templateUrl:"./referral-card.component.html",styleUrl:"./referral-card.component.scss"})
export class ReferralCardComponent {constructor() { ReferralCardComponent.prototype.__init.call(this);ReferralCardComponent.prototype.__init2.call(this); } Input({required:true})  Input() __init() {this.showReferrer=false} Input() __init2() {this.showTimeline=false} }
