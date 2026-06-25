import { Component, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ContactFormModel, DENTAL_SERVICES, LanguageCode, pickText } from '../../models/clinic.model';
import { BaseDatepickerComponent } from '../../shared/base/base-datepicker/base-datepicker.component';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, BaseDatepickerComponent, FaIconComponent],
  template: `
    <section class="page-section contact-hero">
      <div class="section-heading">
        <h1>{{ language() === 'fa' ? 'برای مشاوره انسانی، شماره خود را بگذارید یا مستقیم تماس بگیرید' : 'For human guidance, leave your number or call directly' }}</h1>
        <p>{{ language() === 'fa'
          ? 'برای راهنمایی درباره ایمپلنت، طراحی لبخند، درد دندان، درمان ریشه یا لثه، شماره خود را ثبت کنید تا مسیر مناسب مراجعه با شما هماهنگ شود.'
          : 'For guidance on implants, smile design, tooth pain, root canal or gum care, leave your number so the suitable visit path can be coordinated.' }}</p>
      </div>
      <div class="contact-actions">
        <a class="primary-btn" href="#contact-request"><app-fa-icon name="phone"></app-fa-icon>{{ language() === 'fa' ? 'ثبت درخواست تماس' : 'Request a call' }}</a>
        <button class="secondary-btn" type="button" (click)="openAuth()"><app-fa-icon name="user"></app-fa-icon>{{ language() === 'fa' ? 'ورود / عضویت' : 'Sign in / Join' }}</button>
      </div>
    </section>

    <section class="page-section contact-layout">
      <aside class="info-panel">
        <article *ngFor="let item of infoItems">
          <span class="icon-bubble"><app-fa-icon [name]="item.icon"></app-fa-icon></span>
          <div>
            <h3>{{ item.title[language()] }}</h3>
            <p>{{ item.text[language()] }}</p>
          </div>
        </article>
        <div class="map-card">
          <app-fa-icon name="location"></app-fa-icon>
          <strong>{{ language() === 'fa' ? 'هماهنگی مسیر مراجعه' : 'Visit coordination' }}</strong>
          <span>{{ language() === 'fa' ? 'پس از ثبت درخواست، اطلاعات لازم برای مراجعه و راهنمای مسیر توسط کلینیک اعلام می‌شود.' : 'After submitting a request, the clinic shares visit details and directions.' }}</span>
        </div>
      </aside>

      <form id="contact-request" class="contact-form" (ngSubmit)="submit()">
        <h2>{{ language() === 'fa' ? 'فرم درخواست تماس مشاور' : 'Consultant call request form' }}</h2>
        <label>
          {{ language() === 'fa' ? 'نام و نام خانوادگی' : 'Full name' }}
          <input [(ngModel)]="form.fullName" name="contactFullName" required autocomplete="name" />
        </label>
        <label>
          {{ language() === 'fa' ? 'شماره موبایل' : 'Mobile number' }}
          <input [(ngModel)]="form.phone" name="contactPhone" required inputmode="tel" autocomplete="tel" />
        </label>
        <label>
          {{ language() === 'fa' ? 'درمان مورد نظر' : 'Service of interest' }}
          <select [(ngModel)]="form.serviceId" name="contactService">
            <option *ngFor="let service of services" [value]="service.id">{{ pickText(service.title, language()) }}</option>
          </select>
        </label>
        <app-base-datepicker [language]="language()" [selectedDate]="form.preferredDate" (dateChange)="form.preferredDate = $event"></app-base-datepicker>
        <label>
          {{ language() === 'fa' ? 'پیام کوتاه' : 'Short message' }}
          <textarea [(ngModel)]="form.message" name="contactMessage" rows="4"></textarea>
        </label>
        <button class="primary-btn" type="submit"><app-fa-icon name="phone"></app-fa-icon>{{ language() === 'fa' ? 'ثبت درخواست تماس' : 'Submit call request' }}</button>
        <p *ngIf="sent()" class="success-message">
          {{ language() === 'fa' ? 'درخواست شما ثبت شد. مشاور کلینیک برای راهنمایی با شما تماس می‌گیرد.' : 'Your request has been recorded. A clinic consultant will call you for guidance.' }}
        </p>
      </form>
    </section>
  `,
  styles: [`
    .contact-hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 22px;
      align-items: end;
      padding-top: 140px;
    }

    .contact-hero h1 {
      margin: 0 0 16px;
      font-size: clamp(2rem, 3.8vw, 3.55rem);
    }

    .contact-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .contact-layout {
      display: grid;
      grid-template-columns: minmax(290px, .8fr) minmax(0, 1.2fr);
      gap: 24px;
    }

    .info-panel,
    .contact-form {
      display: grid;
      gap: 14px;
    }

    .info-panel article,
    .map-card,
    .contact-form {
      padding: 22px;
      border: 1px solid var(--line);
      border-radius: 30px;
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    .info-panel article {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 14px;
    }

    .info-panel h3,
    .info-panel p {
      margin: 0;
    }

    .map-card {
      display: grid;
      place-items: center;
      min-height: 230px;
      color: var(--muted);
      text-align: center;
    }

    .map-card app-fa-icon {
      color: var(--brand);
      font-size: 3rem;
    }

    .map-card strong {
      color: var(--text);
    }

    .contact-form label {
      display: grid;
      gap: 8px;
      color: var(--muted);
      font-weight: 900;
    }

    .success-message {
      margin: 0;
      padding: 12px 14px;
      border-radius: 18px;
      background: color-mix(in srgb, #22c55e 14%, var(--surface));
      color: var(--text);
      font-weight: 800;
    }

    @media (max-width: 860px) {
      .contact-hero,
      .contact-layout {
        grid-template-columns: 1fr;
      }

      .contact-hero {
        padding-top: 112px;
      }
    }
  `]
})
export class ContactComponent {
  language = signal<LanguageCode>('fa');
  sent = signal(false);
  services = DENTAL_SERVICES;
  form: ContactFormModel = {
    fullName: '',
    phone: '',
    serviceId: DENTAL_SERVICES[0].id,
    message: ''
  };
  protected readonly pickText = pickText;
  infoItems = [
    { icon: 'phone', title: { fa: 'تماس مشاور', en: 'Consultant call' }, text: { fa: 'شماره خود را ثبت کنید تا برای راهنمایی اولیه تماس گرفته شود.', en: 'Leave your number for an initial guidance call.' } },
    { icon: 'location', title: { fa: 'مراجعه حضوری', en: 'In-person visit' }, text: { fa: 'مسیر مراجعه پس از هماهنگی با کلینیک اعلام می‌شود.', en: 'Visit directions are shared after clinic coordination.' } },
    { icon: 'clock', title: { fa: 'ساعات پاسخگویی', en: 'Response hours' }, text: { fa: 'شنبه تا پنجشنبه، ۹ تا ۲۰', en: 'Saturday to Thursday, 9:00 to 20:00' } }
  ];

  constructor(private title: Title, private meta: Meta) {
    this.updateSeo();
  }

  setLanguage(language: LanguageCode): void {
    this.language.set(language);
    this.updateSeo();
  }

  submit(): void {
    if (!this.form.fullName || !this.form.phone) return;
    this.sent.set(true);
  }

  openAuth(): void {
    window.dispatchEvent(new CustomEvent('open-auth-dialog'));
  }

  private updateSeo(): void {
    const isFa = this.language() === 'fa';
    this.title.setTitle(isFa ? 'تماس با ما | کلینیک دندان‌پزشکی دکتر سعید مقدم' : 'Contact us | Dr. Saeed Moghaddam Dental Clinic');
    this.meta.updateTag({
      name: 'description',
      content: isFa
        ? 'فرم درخواست تماس مشاور، ساعات پاسخگویی و راهنمای هماهنگی مراجعه کلینیک دندان‌پزشکی دکتر سعید مقدم.'
        : 'Consultant call request form, response hours and visit coordination guidance for Dr. Saeed Moghaddam Dental Clinic.'
    });
  }
}
