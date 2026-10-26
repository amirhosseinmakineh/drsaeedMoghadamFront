import { signal } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {

  DENTAL_SERVICES,

  pickText,
} from "../../models/clinic.model";
import { BaseDatepickerComponent } from "../../shared/base/base-datepicker/base-datepicker.component";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";

import { NG_MODEL_UPDATE_ON_BLUR } from "../../shared/forms/ng-model-options";


@Component({
  selector: "app-contact",
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, BaseDatepickerComponent, FaIconComponent],
  templateUrl: "./contact.component.html",
  styleUrl: "./contact.component.scss",
})
export class ContactComponent {
  __init() {this.language = signal("fa")}
  __init2() {this.sent = signal(false)}
  __init3() {this.feedback = signal("")}
  __init4() {this.feedbackType = signal("success")}
  __init5() {this.services = DENTAL_SERVICES}
  __init6() {this.form = {
    fullName: "",
    phone: "",
    serviceId: DENTAL_SERVICES[0].id,
    message: "",
  }}
    __init7() {this.pickText = pickText}
   __init8() {this.ngModelBlurOptions = NG_MODEL_UPDATE_ON_BLUR}
  __init9() {this.infoItems = [
    {
      icon: "phone",
      title: { fa: "تماس مشاور", en: "Consultant call" },
      text: {
        fa: "شماره خود را ثبت کنید تا برای راهنمایی اولیه تماس گرفته شود.",
        en: "Leave your number for an initial guidance call.",
      },
    },
    {
      icon: "location",
      title: { fa: "مراجعه حضوری", en: "In-person visit" },
      text: {
        fa: "مسیر مراجعه پس از هماهنگی با کلینیک اعلام می‌شود.",
        en: "Visit directions are shared after clinic coordination.",
      },
    },
    {
      icon: "clock",
      title: { fa: "ساعات پاسخگویی", en: "Response hours" },
      text: {
        fa: "شنبه تا پنجشنبه، ۹ تا ۲۰",
        en: "Saturday to Thursday, 9:00 to 20:00",
      },
    },
  ]}

  constructor(
     toast,
     analytics,
  ) {;this.toast = toast;this.analytics = analytics;ContactComponent.prototype.__init.call(this);ContactComponent.prototype.__init2.call(this);ContactComponent.prototype.__init3.call(this);ContactComponent.prototype.__init4.call(this);ContactComponent.prototype.__init5.call(this);ContactComponent.prototype.__init6.call(this);ContactComponent.prototype.__init7.call(this);ContactComponent.prototype.__init8.call(this);ContactComponent.prototype.__init9.call(this);}

  setLanguage(language) {
    this.language.set(language);
  }

  submit() {
    const validationError = this.validateContactForm();
    if (validationError) {
      this.analytics.track("consultation_form_submit", { service_name: this.form.serviceId, cta_location: "contact_form", result: "failure" });
      this.showFeedback(validationError, "error");
      return;
    }

    this.sent.set(true);
    this.analytics.track("consultation_form_submit", { service_name: this.form.serviceId, cta_location: "contact_form", result: "success" });
    this.showFeedback(
      this.language() === "fa"
        ? "درخواست شما ثبت شد."
        : "Your request has been recorded.",
      "success",
    );
  }

  validateContactForm() {
    const isFa = this.language() === "fa";
    if (!this.form.fullName.trim())
      return isFa ? "نام و نام خانوادگی الزامی است" : "Full name is required";
    if (this.form.fullName.trim().length > 100)
      return isFa
        ? "نام نباید بیشتر از ۱۰۰ کاراکتر باشد"
        : "Full name must be at most 100 characters";
    if (!/^09\d{9}$/.test(this.form.phone.trim()))
      return isFa ? "شماره موبایل معتبر نیست" : "Mobile number is invalid";
    if (!this.services.some((service) => service.id === this.form.serviceId))
      return isFa ? "درمان مورد نظر معتبر نیست" : "Selected service is invalid";
    if (this.form.message.trim().length > 1000)
      return isFa
        ? "پیام کوتاه نباید بیشتر از ۱۰۰۰ کاراکتر باشد"
        : "Short message must be at most 1000 characters";
    return null;
  }

   showFeedback(message, type) {
    this.feedback.set(message);
    this.feedbackType.set(type);
    if (type === "success") {
      this.toast.success(message);
      return;
    }
    this.toast.error(message);
  }

  openAuth() {
    window.dispatchEvent(new CustomEvent("open-auth-dialog"));
  }

}
