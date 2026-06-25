import { NgFor } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { FEATURED_DENTAL_SERVICES, LanguageCode, pickText } from '../../models/clinic.model';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [NgFor, RouterLink, FaIconComponent],
  template: `
    <section class="page-section page-hero">
      <div class="section-heading">
        <h1>{{ language() === 'fa' ? 'خدمات دندان‌پزشکی دکتر سعید مقدم' : 'Dental services by Dr. Saeed Moghaddam' }}</h1>
        <p>{{ language() === 'fa'
          ? 'در این صفحه مسیرهای اصلی درمان، زیبایی و پیشگیری دندان‌پزشکی را می‌بینید و برای هر درمان توضیح دقیق، مراحل، مراقبت‌ها و سوالات پرتکرار در دسترس است.'
          : 'This page presents the main restorative, cosmetic and preventive dental care paths with focused explanations, steps, aftercare and common questions for each treatment.' }}</p>
      </div>
    </section>

    <section class="page-section">
      <div class="service-grid">
        <article class="service-card" *ngFor="let service of services" [style.--accent]="service.accent">
          <img
            [src]="service.image.src"
            [attr.srcset]="service.image.srcset"
            [attr.sizes]="service.image.sizes"
            [width]="service.image.width"
            [height]="service.image.height"
            [alt]="pickText(service.title, language())"
            loading="lazy"
            decoding="async"
            fetchpriority="low"
          />
          <span class="icon-bubble"><app-fa-icon [name]="service.icon"></app-fa-icon></span>
          <h3>{{ pickText(service.title, language()) }}</h3>
          <b>{{ pickText(service.subtitle, language()) }}</b>
          <p>{{ pickText(service.summary, language()) }}</p>
          <a [routerLink]="['/services', service.id]">
            {{ language() === 'fa' ? 'مشاهده ' + pickText(service.title, language()) : 'View ' + pickText(service.title, language()) }}
            <app-fa-icon name="arrowLeft"></app-fa-icon>
          </a>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .page-hero {
      padding-top: 140px;
    }

    .page-hero h1 {
      margin: 0 0 16px;
      font-size: clamp(1.7rem, 3vw, 2.8rem);
    }

    @media (max-width: 820px) {
      .page-hero {
        padding-top: 112px;
      }
    }
  `]
})
export class ServicesComponent {
  language = signal<LanguageCode>('fa');
  services = FEATURED_DENTAL_SERVICES;
  protected readonly pickText = pickText;

  constructor(private title: Title, private meta: Meta) {
    this.updateSeo();
  }

  setLanguage(language: LanguageCode): void {
    this.language.set(language);
    this.updateSeo();
  }

  private updateSeo(): void {
    const isFa = this.language() === 'fa';
    this.title.setTitle(isFa ? 'خدمات دندان‌پزشکی | کلینیک دندان‌پزشکی دکتر سعید مقدم' : 'Dental services | Dr. Saeed Moghaddam Dental Clinic');
    this.meta.updateTag({
      name: 'description',
      content: isFa
        ? 'معرفی درمان‌های دندان‌پزشکی در کلینیک دندان‌پزشکی دکتر سعید مقدم؛ ایمپلنت، لمینت، کامپوزیت، ارتودنسی، بلیچینگ، درمان ریشه، کودکان و درمان لثه.'
        : 'Complete dental service list including implants, veneers, composite, orthodontics, whitening, root canal, pediatric care and gum treatment.'
    });
  }
}
