import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { LanguageCode, pickText, text } from '../../models/clinic.model';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgFor, RouterLink, FaIconComponent],
  template: `
    <section class="page-section about-hero">
      <div class="section-heading">
        <h1>{{ language() === 'fa' ? 'کلینیکی برای درمان شفاف، زیبایی طبیعی و آرامش بیمار' : 'A clinic for transparent care, natural beauty and patient calm' }}</h1>
        <p>{{ language() === 'fa'
          ? 'کلینیک دندان‌پزشکی دکتر سعید مقدم با رویکرد محافظه‌کارانه، طراحی لبخند طبیعی و ارتباط انسانی با بیمار شکل گرفته است.'
          : 'Dr. Saeed Moghaddam Dental Clinic is built around conservative dentistry, natural smile design and human patient communication.' }}</p>
        <button class="primary-btn" type="button" (click)="openAuth()">
          <app-fa-icon name="user"></app-fa-icon>
          {{ language() === 'fa' ? 'ورود / عضویت' : 'Sign in / Join' }}
        </button>
      </div>
      <div class="doctor-card">
        <span class="icon-bubble"><app-fa-icon name="doctor"></app-fa-icon></span>
        <h2>{{ language() === 'fa' ? 'دکتر سعید مقدم' : 'Dr. Saeed Moghaddam' }}</h2>
        <p>{{ language() === 'fa' ? 'دندان‌پزشکی زیبایی، ایمپلنت، ترمیمی و درمان‌های دقیق محافظه‌کارانه' : 'Cosmetic dentistry, implants, restorative and precise conservative care' }}</p>
      </div>
    </section>

    <section class="page-section">
      <div class="benefit-grid">
        <article class="glass-card" *ngFor="let item of values">
          <span class="icon-bubble"><app-fa-icon [name]="item.icon"></app-fa-icon></span>
          <h3>{{ pickText(item.title, language()) }}</h3>
          <p>{{ pickText(item.text, language()) }}</p>
        </article>
      </div>
    </section>

    <section class="page-section story-panel">
      <div>
        <h2>{{ language() === 'fa' ? 'تصمیم درمانی فقط بعد از فهم نیاز واقعی بیمار گرفته می‌شود' : 'Treatment decisions come after understanding the patient’s real need' }}</h2>
      </div>
      <p>{{ language() === 'fa'
        ? 'در هر درمان، ابتدا سلامت لثه، دندان‌ها، عادت‌های بهداشتی، انتظار زیبایی، محدودیت‌های مالی و سبک زندگی بررسی می‌شود. سپس گزینه‌ها با زبان ساده توضیح داده می‌شوند تا بیمار بداند چرا یک مسیر پیشنهاد شده و چه مراقبت‌هایی برای ماندگاری نتیجه لازم است.'
        : 'For every treatment, gum health, teeth, hygiene habits, aesthetic expectations, financial limits and lifestyle are reviewed first. Options are then explained in simple language so the patient understands why a path is suggested and what care is needed for lasting results.' }}</p>
      <a class="secondary-btn" routerLink="/services">{{ language() === 'fa' ? 'مشاهده خدمات' : 'View services' }}</a>
    </section>
  `,
  styles: [`
    .about-hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(300px, .55fr);
      gap: 28px;
      align-items: center;
      padding-top: 140px;
    }

    .about-hero h1 {
      margin: 0 0 16px;
      font-size: clamp(2rem, 3.8vw, 3.55rem);
    }

    .doctor-card {
      padding: 30px;
      border: 1px solid var(--line);
      border-radius: 42px;
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    .doctor-card .icon-bubble {
      width: 76px;
      height: 76px;
      font-size: 2.2rem;
    }

    .story-panel {
      display: grid;
      grid-template-columns: minmax(0, .75fr) minmax(0, 1fr);
      gap: 26px;
      align-items: center;
      padding: 38px;
      border: 1px solid var(--line);
      border-radius: 42px;
      background: color-mix(in srgb, var(--surface) 82%, transparent);
      box-shadow: var(--shadow);
    }

    @media (max-width: 820px) {
      .about-hero,
      .story-panel {
        grid-template-columns: 1fr;
        padding-top: 112px;
      }

      .story-panel {
        padding: 24px;
      }
    }
  `]
})
export class AboutComponent {
  language = signal<LanguageCode>('fa');
  protected readonly pickText = pickText;
  values = [
    { icon: 'shield', title: text('صداقت درمانی', 'Clinical honesty'), text: text('اگر درمانی برای بیمار مناسب نباشد، به همان شفافیت توضیح داده می‌شود.', 'If a treatment is not suitable, it is explained with the same clarity.') },
    { icon: 'sparkle', title: text('زیبایی طبیعی', 'Natural aesthetics'), text: text('هدف، لبخندی هماهنگ با چهره است؛ نه نتیجه اغراق‌آمیز و مصنوعی.', 'The goal is a smile that fits the face, not an exaggerated artificial result.') },
    { icon: 'tooth', title: text('مسیر روشن درمان', 'Clear care path'), text: text('از مشاهده خدمات تا ثبت درخواست تماس مشاور، مسیر باید ساده، دقیق و متناسب با نیاز دندان‌پزشکی بیمار باشد.', 'From viewing services to submitting a consultant call request, the path should be simple, precise and aligned with the patient’s dental need.') },
    { icon: 'heart', title: text('آرامش بیمار', 'Patient calm'), text: text('توضیح مرحله‌ها و کنترل اضطراب بخش مهمی از درمان است.', 'Explaining steps and managing anxiety is an important part of care.') }
  ];

  constructor(private title: Title, private meta: Meta) {
    this.updateSeo();
  }

  setLanguage(language: LanguageCode): void {
    this.language.set(language);
    this.updateSeo();
  }

  openAuth(): void {
    window.dispatchEvent(new CustomEvent('open-auth-dialog'));
  }

  private updateSeo(): void {
    const isFa = this.language() === 'fa';
    this.title.setTitle(isFa ? 'درباره ما | کلینیک دندان‌پزشکی دکتر سعید مقدم' : 'About us | Dr. Saeed Moghaddam Dental Clinic');
    this.meta.updateTag({
      name: 'description',
      content: isFa
        ? 'معرفی کلینیک دندان‌پزشکی دکتر سعید مقدم، ارزش‌ها، رویکرد درمانی و تمرکز بر زیبایی طبیعی و آرامش بیمار.'
        : 'About Dr. Saeed Moghaddam Dental Clinic, values, care philosophy and focus on natural aesthetics and patient calm.'
    });
  }
}
