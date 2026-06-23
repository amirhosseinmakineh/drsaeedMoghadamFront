import { NgFor } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { DENTAL_SERVICES, DentalService, LanguageCode, pickText } from '../../models/clinic.model';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [NgFor, RouterLink, FaIconComponent],
  template: `
    <article>
      <section class="page-section detail-hero" [style.--accent]="service.accent">
        <div>
          <p class="eyebrow">
            <a routerLink="/services">{{ language() === 'fa' ? 'خدمات' : 'Services' }}</a>
            / {{ pickText(service.title, language()) }}
          </p>
          <h1>{{ pickText(service.title, language()) }}</h1>
          <h2>{{ pickText(service.subtitle, language()) }}</h2>
          <p>{{ pickText(service.summary, language()) }}</p>
          <div class="hero-actions">
            <button class="primary-btn" type="button" (click)="openAuth()">
              <app-fa-icon name="user"></app-fa-icon>
              {{ language() === 'fa' ? 'ورود / عضویت برای پیگیری' : 'Sign in / Join to follow up' }}
            </button>
            <a class="secondary-btn" routerLink="/contact">
              <app-fa-icon name="phone"></app-fa-icon>
              {{ language() === 'fa' ? 'درخواست تماس مشاور' : 'Request consultant call' }}
            </a>
          </div>
        </div>
        <div class="detail-media">
          <img [src]="service.image" [alt]="pickText(service.title, language())" loading="eager" />
          <span class="media-badge"><app-fa-icon [name]="service.icon"></app-fa-icon>{{ pickText(service.duration, language()) }}</span>
        </div>
      </section>

      <section class="page-section intro-panel">
        <div class="section-heading">
          <p class="eyebrow">{{ language() === 'fa' ? 'معرفی کامل خدمت' : 'Complete service overview' }}</p>
          <h2>{{ language() === 'fa' ? 'این درمان چه ارزشی برای کاربر ایجاد می‌کند؟' : 'What value does this treatment create for the user?' }}</h2>
        </div>
        <p class="long-text">{{ pickText(service.longIntro, language()) }}</p>
      </section>

      <section class="page-section">
        <div class="info-grid three">
          <article class="info-card">
            <span class="icon-bubble"><app-fa-icon name="clock"></app-fa-icon></span>
            <h3>{{ language() === 'fa' ? 'مدت درمان' : 'Treatment time' }}</h3>
            <p>{{ pickText(service.duration, language()) }}</p>
          </article>
          <article class="info-card">
            <span class="icon-bubble"><app-fa-icon name="shield"></app-fa-icon></span>
            <h3>{{ language() === 'fa' ? 'هزینه' : 'Cost' }}</h3>
            <p>{{ pickText(service.cost, language()) }}</p>
          </article>
          <article class="info-card">
            <span class="icon-bubble"><app-fa-icon name="sparkle"></app-fa-icon></span>
            <h3>{{ language() === 'fa' ? 'هدف نتیجه' : 'Result goal' }}</h3>
            <p>{{ language() === 'fa' ? 'نتیجه سالم، طبیعی و هماهنگ با صورت؛ نه تصمیم عجولانه یا تبلیغاتی.' : 'A healthy, natural result that fits the face; not a rushed or advertising-led decision.' }}</p>
          </article>
        </div>
      </section>

      <section class="page-section two-column">
        <div>
          <div class="section-heading">
            <p class="eyebrow">{{ language() === 'fa' ? 'مناسب برای' : 'Ideal for' }}</p>
            <h2>{{ language() === 'fa' ? 'چه کسانی از این خدمت سود می‌برند؟' : 'Who benefits from this service?' }}</h2>
          </div>
          <ul class="check-list">
            <li *ngFor="let item of service.idealFor"><app-fa-icon name="check"></app-fa-icon>{{ pickText(item, language()) }}</li>
          </ul>
        </div>
        <div class="glass-card">
          <span class="icon-bubble"><app-fa-icon name="phone"></app-fa-icon></span>
          <h3>{{ language() === 'fa' ? 'شماره خود را برای راهنمایی بگذارید' : 'Leave your number for guidance' }}</h3>
          <p>{{ language() === 'fa' ? 'اگر مطمئن نیستید این درمان برای شما مناسب است، از صفحه تماس درخواست تماس مشاور ثبت کنید.' : 'If you are unsure whether this treatment suits you, request a consultant call from the contact page.' }}</p>
          <a class="secondary-btn" routerLink="/contact">{{ language() === 'fa' ? 'رفتن به تماس با ما' : 'Go to contact' }}</a>
        </div>
      </section>

      <section class="page-section">
        <div class="section-heading center">
          <p class="eyebrow">{{ language() === 'fa' ? 'مزایا' : 'Benefits' }}</p>
          <h2>{{ language() === 'fa' ? 'مزایای اصلی این درمان' : 'Key benefits of this treatment' }}</h2>
        </div>
        <div class="benefit-grid">
          <article class="glass-card" *ngFor="let item of service.benefits">
            <span class="icon-bubble"><app-fa-icon name="check"></app-fa-icon></span>
            <h3>{{ pickText(item, language()) }}</h3>
          </article>
        </div>
      </section>

      <section class="page-section journey-section">
        <div class="section-heading">
          <p class="eyebrow">{{ language() === 'fa' ? 'مسیر درمان' : 'Care journey' }}</p>
          <h2>{{ language() === 'fa' ? 'مراحل درمان به زبان ساده' : 'Treatment steps in simple language' }}</h2>
        </div>
        <div class="timeline">
          <article *ngFor="let step of service.steps">
            <span>{{ step.step }}</span>
            <div>
              <h3>{{ pickText(step.title, language()) }}</h3>
              <p>{{ pickText(step.description, language()) }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="page-section user-value-section">
        <div class="section-heading">
          <p class="eyebrow">{{ language() === 'fa' ? 'سود مستقیم برای کاربر' : 'Direct user value' }}</p>
          <h2>{{ language() === 'fa' ? 'این صفحه چه کمکی به تصمیم شما می‌کند؟' : 'How does this page help your decision?' }}</h2>
        </div>
        <div class="info-grid three">
          <article class="info-card" *ngFor="let item of service.userValue">
            <span class="icon-bubble"><app-fa-icon name="star"></app-fa-icon></span>
            <p>{{ pickText(item, language()) }}</p>
          </article>
        </div>
      </section>

      <section class="page-section care-panel">
        <div>
          <p class="eyebrow">{{ language() === 'fa' ? 'مراقبت' : 'Aftercare' }}</p>
          <h2>{{ language() === 'fa' ? 'مراقبت‌های مهم بعد از درمان' : 'Important aftercare points' }}</h2>
        </div>
        <ul class="check-list">
          <li *ngFor="let item of service.care"><app-fa-icon name="shield"></app-fa-icon>{{ pickText(item, language()) }}</li>
        </ul>
      </section>

      <section class="page-section before-after">
        <div>
          <p class="eyebrow">{{ language() === 'fa' ? 'اسلایدر نتیجه' : 'Result slider' }}</p>
          <h2>{{ language() === 'fa' ? 'نمای قبل و بعد به صورت گرافیکی و سبک' : 'Lightweight graphic before and after view' }}</h2>
          <p>{{ language() === 'fa' ? 'به جای تصاویر سنگین، از قاب گرافیکی سبک استفاده شده تا سرعت و تجربه موبایل بهتر بماند.' : 'Instead of heavy images, a lightweight graphic frame keeps speed and mobile experience smooth.' }}</p>
        </div>
        <div class="result-frame">
          <div class="before">{{ language() === 'fa' ? 'قبل' : 'Before' }}</div>
          <div class="after">{{ language() === 'fa' ? 'بعد' : 'After' }}</div>
          <span></span>
        </div>
      </section>

      <section class="page-section faq-section">
        <div class="section-heading">
          <p class="eyebrow">FAQ</p>
          <h2>{{ language() === 'fa' ? 'سوالات پرتکرار' : 'Frequently asked questions' }}</h2>
        </div>
        <div class="faq-list">
          <details *ngFor="let item of service.faqs">
            <summary>{{ pickText(item.question, language()) }}</summary>
            <p>{{ pickText(item.answer, language()) }}</p>
          </details>
        </div>
      </section>

      <section class="page-section">
        <div class="section-heading">
          <p class="eyebrow">{{ language() === 'fa' ? 'خدمات مرتبط' : 'Related services' }}</p>
          <h2>{{ language() === 'fa' ? 'مسیرهای درمانی نزدیک به این خدمت' : 'Care paths related to this service' }}</h2>
        </div>
        <div class="related-rail">
          <a class="service-card" *ngFor="let item of relatedServices" [routerLink]="['/services', item.id]" [style.--accent]="item.accent">
            <span class="icon-bubble"><app-fa-icon [name]="item.icon"></app-fa-icon></span>
            <h3>{{ pickText(item.title, language()) }}</h3>
            <p>{{ pickText(item.summary, language()) }}</p>
          </a>
        </div>
      </section>

      <section class="page-section final-cta">
        <h2>{{ language() === 'fa' ? 'برای پیگیری این خدمت وارد شوید یا عضو شوید' : 'Sign in or join to follow this service' }}</h2>
        <p>{{ language() === 'fa' ? 'رزرو نوبت آنلاین نداریم؛ دکمه اصلی برای ورود/عضویت و مسیر جایگزین برای تماس مستقیم است.' : 'There is no online appointment booking; the main action is sign in/join with direct contact as the next path.' }}</p>
        <button class="primary-btn" type="button" (click)="openAuth()">
          <app-fa-icon name="user"></app-fa-icon>
          {{ language() === 'fa' ? 'ورود / عضویت' : 'Sign in / Join' }}
        </button>
      </section>
    </article>
  `,
  styles: [`
    .detail-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(330px,.82fr);gap:36px;align-items:center;min-height:620px;padding-top:130px}.detail-hero h1{margin:10px 0 8px;font-size:clamp(2rem,4.4vw,3.7rem)}.detail-hero h2{margin:0 0 14px;color:var(--brand);font-size:clamp(1.15rem,2vw,1.65rem)}.hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.detail-media{position:relative}.detail-media img{width:100%;height:430px;object-fit:cover;border-radius:42px;box-shadow:var(--shadow);animation:mediaFloat 6s ease-in-out infinite alternate}.detail-media::before{content:'';position:absolute;inset:-18px;border:2px dashed color-mix(in srgb,var(--gold) 48%,transparent);border-radius:54px;transform:rotate(3deg);z-index:-1}.media-badge{position:absolute;inset:auto 22px 22px auto;display:inline-flex;align-items:center;gap:8px;padding:12px 15px;border-radius:999px;background:color-mix(in srgb,var(--surface) 82%,transparent);box-shadow:0 16px 40px rgba(0,0,0,.14);font-weight:950;color:var(--text);backdrop-filter:blur(16px)}.intro-panel{padding:38px;border:1px solid var(--line);border-radius:42px;background:color-mix(in srgb,var(--surface) 82%,transparent);box-shadow:var(--shadow)}.long-text{max-width:none;font-size:1.03rem}.three{grid-template-columns:repeat(3,minmax(0,1fr))}.two-column,.care-panel,.before-after{display:grid;grid-template-columns:minmax(0,1fr) minmax(310px,.9fr);gap:26px;align-items:center}.check-list{display:grid;gap:12px;margin:0;padding:0;list-style:none}.check-list li{display:flex;align-items:flex-start;gap:10px;padding:14px 16px;border:1px solid var(--line);border-radius:20px;background:color-mix(in srgb,var(--surface) 76%,transparent);font-weight:800}.check-list app-fa-icon{color:var(--brand);margin-top:5px}.timeline{display:grid;gap:14px}.timeline article{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start;padding:18px;border:1px solid var(--line);border-radius:28px;background:color-mix(in srgb,var(--surface) 82%,transparent)}.timeline article>span{display:grid;place-items:center;width:48px;height:48px;border-radius:18px;background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#fff;font-weight:950}.timeline h3{margin:0 0 4px}.timeline p{margin:0}.care-panel,.before-after,.final-cta{padding:36px;border:1px solid var(--line);border-radius:42px;background:radial-gradient(circle at 10% 0,color-mix(in srgb,var(--gold) 22%,transparent),transparent 48%),color-mix(in srgb,var(--surface) 82%,transparent);box-shadow:var(--shadow)}.result-frame{position:relative;display:grid;grid-template-columns:1fr 1fr;min-height:300px;overflow:hidden;border:1px solid var(--line);border-radius:38px;background:var(--surface)}.result-frame div{display:grid;place-items:center;font-size:1.65rem;font-weight:950}.result-frame .before{background:linear-gradient(135deg,var(--surface-muted),var(--surface));color:var(--muted)}.result-frame .after{background:linear-gradient(135deg,color-mix(in srgb,var(--gold) 26%,var(--surface)),color-mix(in srgb,var(--surface-soft) 68%,var(--surface)));color:var(--text)}.result-frame span{position:absolute;top:0;bottom:0;left:50%;width:4px;background:#fff;box-shadow:0 0 0 999px rgba(255,255,255,.02);animation:handleMove 3.2s ease-in-out infinite alternate}.related-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(280px,360px);gap:16px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x mandatory}.related-rail .service-card{scroll-snap-align:start}.final-cta{text-align:center}.final-cta h2{font-size:clamp(1.75rem,3vw,2.9rem);margin:0 0 12px}@keyframes mediaFloat{to{transform:translateY(-14px) scale(1.01)}}@keyframes handleMove{from{left:42%}to{left:58%}}@media(max-width:900px){.detail-hero,.two-column,.care-panel,.before-after{grid-template-columns:1fr}.detail-hero{min-height:auto;padding-top:112px}.detail-media{order:-1}.detail-media img{height:320px}.three{grid-template-columns:1fr}.intro-panel,.care-panel,.before-after,.final-cta{padding:24px;border-radius:32px}}
  `]
})
export class ServiceDetailComponent {
  language = signal<LanguageCode>('fa');
  service: DentalService;
  relatedServices: DentalService[];
  protected readonly pickText = pickText;

  constructor(route: ActivatedRoute, private title: Title, private meta: Meta) {
    const serviceId = route.snapshot.paramMap.get('id') ?? DENTAL_SERVICES[0].id;
    this.service = DENTAL_SERVICES.find(item => item.id === serviceId) ?? DENTAL_SERVICES[0];
    this.relatedServices = DENTAL_SERVICES.filter(item => this.service.relatedIds.includes(item.id));
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
    this.title.setTitle(pickText(this.service.seo.title, this.language()));
    this.meta.updateTag({ name: 'description', content: pickText(this.service.seo.description, this.language()) });
    this.meta.updateTag({ property: 'og:title', content: pickText(this.service.seo.title, this.language()) });
    this.meta.updateTag({ property: 'og:description', content: pickText(this.service.seo.description, this.language()) });
  }
}
