import { NgFor, NgIf } from "@angular/common";
import { signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import {
  BENEFIT_CARDS,
  DENTAL_SERVICES,
  FEATURED_DENTAL_SERVICES,
  GLOBAL_FAQS,
  HERO_SLIDES,


  STATS,
  WORK_SAMPLES,
  pickText,
} from "../../models/clinic.model";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";

import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";


@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    RouterLink,
    FaIconComponent,
  ],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {
  __init() {this.language = signal("fa")}
  __init2() {this.activeSlide = signal(0)}
  __init3() {this.activeWorkSample = signal(0)}
  __init4() {this.leadSent = signal(false)}
  __init5() {this.leadFeedback = signal("")}
  __init6() {this.leadFeedbackType = signal("success")}
  __init7() {this.services = DENTAL_SERVICES}
  __init8() {this.featuredServices = FEATURED_DENTAL_SERVICES}
  __init9() {this.heroSlides = HERO_SLIDES}
  __init10() {this.workSamples = WORK_SAMPLES}
  __init11() {this.benefits = BENEFIT_CARDS}
  __init12() {this.stats = STATS}
  __init13() {this.faqs = GLOBAL_FAQS}
  __init14() {this.lead = {
    fullName: "",
    phone: "",
    serviceId: DENTAL_SERVICES[0].id,
    message: "",
  }}

    __init15() {this.pickText = pickText}
   __init16() {this.ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR}

  constructor(
     toast,
     analytics,
  ) {;this.toast = toast;this.analytics = analytics;HomeComponent.prototype.__init.call(this);HomeComponent.prototype.__init2.call(this);HomeComponent.prototype.__init3.call(this);HomeComponent.prototype.__init4.call(this);HomeComponent.prototype.__init5.call(this);HomeComponent.prototype.__init6.call(this);HomeComponent.prototype.__init7.call(this);HomeComponent.prototype.__init8.call(this);HomeComponent.prototype.__init9.call(this);HomeComponent.prototype.__init10.call(this);HomeComponent.prototype.__init11.call(this);HomeComponent.prototype.__init12.call(this);HomeComponent.prototype.__init13.call(this);HomeComponent.prototype.__init14.call(this);HomeComponent.prototype.__init15.call(this);HomeComponent.prototype.__init16.call(this);}

  setLanguage(language) {
    this.language.set(language);
  }

  nextSlide(direction) {
    const next =
      (this.activeSlide() + direction + this.heroSlides.length) %
      this.heroSlides.length;
    this.activeSlide.set(next);
  }

  nextWorkSample(direction) {
    const next =
      (this.activeWorkSample() + direction + this.workSamples.length) %
      this.workSamples.length;
    this.activeWorkSample.set(next);
  }

  openAuth() {
    window.dispatchEvent(new CustomEvent("open-auth-dialog"));
  }

  submitLead() {
    const validationError = this.validateLeadForm();
    if (validationError) {
      this.analytics.track("consultation_form_submit", { service_name: this.lead.serviceId, cta_location: "home_form", result: "failure" });
      this.showLeadFeedback(validationError, "error");
      return;
    }

    this.leadSent.set(true);
    this.analytics.track("consultation_form_submit", { service_name: this.lead.serviceId, cta_location: "home_form", result: "success" });
    this.showLeadFeedback(
      this.language() === "fa"
        ? "درخواست تماس شما ثبت شد."
        : "Your call request has been recorded.",
      "success",
    );
  }

  validateLeadForm() {
    const isFa = this.language() === "fa";
    if (!this.lead.fullName.trim())
      return isFa ? "نام و نام خانوادگی الزامی است" : "Full name is required";
    if (this.lead.fullName.trim().length > 100)
      return isFa
        ? "نام نباید بیشتر از ۱۰۰ کاراکتر باشد"
        : "Full name must be at most 100 characters";
    if (!/^09\d{9}$/.test(this.lead.phone.trim()))
      return isFa ? "شماره تماس معتبر نیست" : "Phone number is invalid";
    if (!this.services.some((service) => service.id === this.lead.serviceId))
      return isFa ? "درمان مورد نظر معتبر نیست" : "Selected service is invalid";
    if (this.lead.message.trim().length > 1000)
      return isFa
        ? "توضیح کوتاه نباید بیشتر از ۱۰۰۰ کاراکتر باشد"
        : "Short note must be at most 1000 characters";
    return null;
  }

   showLeadFeedback(message, type) {
    this.leadFeedback.set(message);
    this.leadFeedbackType.set(type);
    if (type === "success") {
      this.toast.success(message);
      return;
    }
    this.toast.error(message);
  }

}
