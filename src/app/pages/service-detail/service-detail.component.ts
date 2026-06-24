import { NgFor } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { DENTAL_SERVICES, DentalService, LanguageCode, LocalizedText, pickText } from '../../models/clinic.model';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

interface ResultVisual {
  before: string;
  after: string;
  beforeAlt: LocalizedText;
  afterAlt: LocalizedText;
}

const resultImage = (id: string): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=620&q=45`;

const RESULT_VISUALS: Record<string, ResultVisual> = {
  implant: {
    before: resultImage('photo-1588776814546-1ffcf47267a5'),
    after: resultImage('photo-1606811841689-23dfddce3e95'),
    beforeAlt: { fa: 'بررسی ناحیه بی‌دندانی پیش از ایمپلنت', en: 'Missing-tooth area assessment before implant treatment' },
    afterAlt: { fa: 'بازسازی لبخند پس از درمان ایمپلنت', en: 'Smile restoration after implant treatment' }
  },
  laminate: {
    before: resultImage('photo-1609840114035-3c981b782dfe'),
    after: resultImage('photo-1606811971618-4486d14f3f99'),
    beforeAlt: { fa: 'بررسی رنگ و فرم دندان‌ها پیش از لمینت', en: 'Tooth shade and shape review before veneers' },
    afterAlt: { fa: 'هماهنگی فرم و رنگ پس از لمینت سرامیکی', en: 'Shape and shade harmony after porcelain veneers' }
  },
  composite: {
    before: resultImage('photo-1600170311833-c2cf5280ce49'),
    after: resultImage('photo-1606811971618-4486d14f3f99'),
    beforeAlt: { fa: 'ارزیابی فاصله و فرم دندان پیش از کامپوزیت', en: 'Gap and tooth-shape assessment before composite veneers' },
    afterAlt: { fa: 'اصلاح فرم دندان با کامپوزیت ونیر', en: 'Tooth-shape correction with composite veneers' }
  },
  orthodontics: {
    before: resultImage('photo-1609840114035-3c981b782dfe'),
    after: resultImage('photo-1629909615184-74f495363b67'),
    beforeAlt: { fa: 'بررسی نامرتبی دندان‌ها پیش از ارتودنسی', en: 'Crowding assessment before orthodontics' },
    afterAlt: { fa: 'نظم بهتر دندان‌ها پس از درمان ارتودنسی', en: 'Improved alignment after orthodontic treatment' }
  },
  whitening: {
    before: resultImage('photo-1588776814546-1ffcf47267a5'),
    after: resultImage('photo-1606811971618-4486d14f3f99'),
    beforeAlt: { fa: 'ثبت رنگ پایه دندان پیش از بلیچینگ', en: 'Baseline tooth shade before whitening' },
    afterAlt: { fa: 'روشن‌تر شدن کنترل‌شده دندان پس از بلیچینگ', en: 'Controlled tooth brightening after whitening' }
  },
  'root-canal': {
    before: resultImage('photo-1606811841689-23dfddce3e95'),
    after: resultImage('photo-1606811971618-4486d14f3f99'),
    beforeAlt: { fa: 'تشخیص درد و عفونت پیش از درمان ریشه', en: 'Pain and infection diagnosis before root canal therapy' },
    afterAlt: { fa: 'حفظ دندان پس از درمان ریشه و ترمیم', en: 'Tooth preservation after root canal therapy and restoration' }
  },
  pediatric: {
    before: resultImage('photo-1629909613654-28e377c37b09'),
    after: resultImage('photo-1606811971618-4486d14f3f99'),
    beforeAlt: { fa: 'معاینه آرام کودک پیش از درمان دندان‌پزشکی', en: 'Calm child exam before pediatric dental care' },
    afterAlt: { fa: 'پیگیری سلامت دندان کودک پس از درمان یا پیشگیری', en: 'Child dental health follow-up after care or prevention' }
  },
  'gum-treatment': {
    before: resultImage('photo-1629909615184-74f495363b67'),
    after: resultImage('photo-1606811971618-4486d14f3f99'),
    beforeAlt: { fa: 'بررسی التهاب و خونریزی لثه پیش از درمان', en: 'Gum inflammation and bleeding assessment before treatment' },
    afterAlt: { fa: 'کنترل التهاب لثه پس از پاک‌سازی و مراقبت', en: 'Controlled gum inflammation after cleaning and care' }
  }
};

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [NgFor, RouterLink, FaIconComponent],
  template: `
    <article>
      <section class="page-section detail-hero" [style.--accent]="service.accent">
        <div>
          <h1>{{ pickText(service.title, language()) }}</h1>
          <h2>{{ pickText(service.subtitle, language()) }}</h2>
          <p>{{ pickText(service.summary, language()) }}</p>
          <div class="hero-actions">
            <a class="primary-btn" routerLink="/contact">
              <app-fa-icon name="phone"></app-fa-icon>
              {{ language() === 'fa' ? 'ثبت درخواست مشاوره' : 'Request consultation' }}
            </a>
            <a class="secondary-btn" routerLink="/contact">
              <app-fa-icon name="phone"></app-fa-icon>
              {{ language() === 'fa' ? 'تماس با ما' : 'Contact us' }}
            </a>
          </div>
        </div>
        <div class="detail-media">
          <img [src]="service.image" [alt]="pickText(service.title, language())" loading="eager" />
        </div>
      </section>

      <section class="page-section intro-panel">
        <div class="section-heading">
          <h2>{{ language() === 'fa' ? pickText(service.title, language()) + ' چگونه برنامه‌ریزی می‌شود؟' : 'How is ' + pickText(service.title, language()) + ' planned?' }}</h2>
        </div>
        <p class="long-text">{{ pickText(service.longIntro, language()) }}</p>
      </section>

      <section class="page-section">
        <div class="section-heading center">
          <h2>{{ language() === 'fa' ? 'زمان، هزینه و هدف درمان' : 'Time, cost and treatment goal' }}</h2>
        </div>
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
            <p>{{ resultGoal() }}</p>
          </article>
        </div>
      </section>

      <section class="page-section two-column">
        <div>
          <div class="section-heading">
            <h2>{{ language() === 'fa' ? pickText(service.title, language()) + ' برای چه شرایطی بررسی می‌شود؟' : 'When is ' + pickText(service.title, language()) + ' considered?' }}</h2>
          </div>
          <ul class="check-list">
            <li *ngFor="let item of service.idealFor"><app-fa-icon name="check"></app-fa-icon>{{ pickText(item, language()) }}</li>
          </ul>
        </div>
        <div class="glass-card">
          <span class="icon-bubble"><app-fa-icon name="phone"></app-fa-icon></span>
          <h3>{{ language() === 'fa' ? 'مشاوره قبل از تصمیم' : 'Consult before deciding' }}</h3>
          <p>{{ language() === 'fa' ? 'اگر مطمئن نیستید این درمان برای شرایط دهان و دندان شما مناسب است، درخواست مشاوره ثبت کنید تا مسیر مراجعه دقیق‌تر شود.' : 'If you are unsure whether this treatment matches your oral condition, request a consultation so the visit path is clearer.' }}</p>
          <a class="secondary-btn" routerLink="/contact">{{ language() === 'fa' ? 'ثبت درخواست مشاوره' : 'Request consultation' }}</a>
        </div>
      </section>

      <section class="page-section">
        <div class="section-heading center">
          <h2>{{ language() === 'fa' ? 'مزایای واقعی ' + pickText(service.title, language()) : 'Real benefits of ' + pickText(service.title, language()) }}</h2>
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
          <h2>{{ language() === 'fa' ? 'مراحل استاندارد ' + pickText(service.title, language()) : 'Standard steps for ' + pickText(service.title, language()) }}</h2>
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

      <section class="page-section care-panel">
        <div>
          <h2>{{ language() === 'fa' ? 'مراقبت‌های استاندارد بعد از ' + pickText(service.title, language()) : 'Standard aftercare after ' + pickText(service.title, language()) }}</h2>
        </div>
        <ul class="check-list">
          <li *ngFor="let item of service.care"><app-fa-icon name="shield"></app-fa-icon>{{ pickText(item, language()) }}</li>
        </ul>
      </section>

      <section class="page-section before-after">
        <div>
          <h2>{{ language() === 'fa' ? 'نمای تصویری قبل و بعد ' + pickText(service.title, language()) : 'Before and after visual for ' + pickText(service.title, language()) }}</h2>
          <p>{{ language() === 'fa' ? 'این تصاویر نمونه برای توضیح روند تغییر درمانی استفاده می‌شوند؛ نتیجه واقعی هر بیمار پس از معاینه، عکس و طرح درمان مشخص می‌شود.' : 'These sample visuals explain the treatment change; each patient result is defined after examination, imaging and treatment planning.' }}</p>
        </div>
        <div class="result-frame">
          <figure class="before">
            <img [src]="resultVisual().before" [alt]="pickText(resultVisual().beforeAlt, language())" loading="lazy" />
            <figcaption>{{ language() === 'fa' ? 'قبل' : 'Before' }}</figcaption>
          </figure>
          <figure class="after">
            <img [src]="resultVisual().after" [alt]="pickText(resultVisual().afterAlt, language())" loading="lazy" />
            <figcaption>{{ language() === 'fa' ? 'بعد' : 'After' }}</figcaption>
          </figure>
          <span></span>
        </div>
      </section>

      <section class="page-section faq-section">
        <div class="section-heading">
          <h2>{{ language() === 'fa' ? 'سوالات پرتکرار درباره ' + pickText(service.title, language()) : 'Frequently asked questions about ' + pickText(service.title, language()) }}</h2>
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
          <h2>{{ language() === 'fa' ? 'درمان‌های مرتبط با ' + pickText(service.title, language()) : 'Care paths related to ' + pickText(service.title, language()) }}</h2>
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
        <h2>{{ language() === 'fa' ? 'بررسی ' + pickText(service.title, language()) + ' در کلینیک دندان‌پزشکی دکتر سعید مقدم' : 'Review ' + pickText(service.title, language()) + ' at Dr. Saeed Moghaddam Dental Clinic' }}</h2>
        <p>{{ language() === 'fa' ? 'برای هماهنگی مراجعه، سوال اولیه یا بررسی مناسب بودن این درمان، از مسیر تماس با کلینیک اقدام کنید.' : 'For visit coordination, initial questions or checking whether this treatment is suitable, contact the clinic.' }}</p>
        <div class="hero-actions centered">
          <a class="primary-btn" routerLink="/contact"><app-fa-icon name="phone"></app-fa-icon>{{ language() === 'fa' ? 'ثبت درخواست مشاوره' : 'Request consultation' }}</a>
          <a class="secondary-btn" routerLink="/contact">{{ language() === 'fa' ? 'تماس با ما' : 'Contact us' }}</a>
        </div>
      </section>
    </article>
  `,
  styles: [`
    .detail-hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(330px,.82fr);gap:36px;align-items:center;min-height:610px;padding-top:132px}.detail-hero h1{margin:10px 0 8px;font-size:clamp(1.75rem,3.3vw,3rem)}.detail-hero h2{margin:0 0 14px;color:var(--brand);font-size:clamp(1rem,1.6vw,1.35rem)}.hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.hero-actions.centered{justify-content:center}.detail-media{position:relative}.detail-media img{width:100%;height:440px;object-fit:cover;border-radius:40px;box-shadow:var(--shadow);animation:mediaFloat 6s ease-in-out infinite alternate}.detail-media::before{content:'';position:absolute;inset:-18px;border:2px dashed color-mix(in srgb,var(--accent) 48%,transparent);border-radius:50px;transform:rotate(3deg);z-index:-1}.intro-panel{padding:36px;border:1px solid var(--line);border-radius:36px;background:color-mix(in srgb,var(--surface) 82%,transparent);box-shadow:var(--shadow)}.long-text{max-width:none;font-size:1rem}.three{grid-template-columns:repeat(3,minmax(0,1fr))}.two-column,.care-panel,.before-after{display:grid;grid-template-columns:minmax(0,1fr) minmax(310px,.9fr);gap:26px;align-items:center}.check-list{display:grid;gap:12px;margin:0;padding:0;list-style:none}.check-list li{display:flex;align-items:flex-start;gap:10px;padding:14px 16px;border:1px solid var(--line);border-radius:20px;background:color-mix(in srgb,var(--surface) 78%,transparent);font-weight:800}.check-list app-fa-icon{color:var(--brand);margin-top:5px}.timeline{display:grid;gap:14px}.timeline article{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start;padding:18px;border:1px solid var(--line);border-radius:26px;background:color-mix(in srgb,var(--surface) 82%,transparent)}.timeline article>span{display:grid;place-items:center;width:44px;height:44px;border-radius:16px;background:linear-gradient(135deg,var(--brand),var(--brand-2));color:#fff;font-weight:950}.timeline h3{margin:0 0 4px;font-size:1.05rem}.timeline p{margin:0}.care-panel,.before-after,.final-cta{padding:34px;border:1px solid var(--line);border-radius:36px;background:radial-gradient(circle at 10% 0,color-mix(in srgb,var(--brand) 12%,transparent),transparent 48%),color-mix(in srgb,var(--surface) 82%,transparent);box-shadow:var(--shadow)}.result-frame{position:relative;display:grid;grid-template-columns:1fr 1fr;min-height:320px;overflow:hidden;border:1px solid var(--line);border-radius:34px;background:var(--surface)}.result-frame figure{position:relative;display:grid;margin:0;min-height:320px;overflow:hidden}.result-frame img{width:100%;height:100%;object-fit:cover;filter:saturate(.9)}.result-frame figcaption{position:absolute;inset:auto 14px 14px auto;padding:8px 12px;border-radius:999px;background:rgba(17,16,14,.72);color:#fff;font-size:.9rem;font-weight:950;backdrop-filter:blur(12px)}.result-frame .before img{filter:saturate(.55) brightness(.75)}.result-frame span{position:absolute;top:0;bottom:0;left:50%;width:3px;background:#fff;box-shadow:0 0 0 999px rgba(255,255,255,.02);animation:handleMove 3.2s ease-in-out infinite alternate}.related-rail{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(280px,360px);gap:16px;overflow-x:auto;padding-bottom:10px;scroll-snap-type:x mandatory}.related-rail .service-card{scroll-snap-align:start}.final-cta{text-align:center}.final-cta h2{font-size:clamp(1.35rem,2.3vw,2.25rem);margin:0 0 12px}@keyframes mediaFloat{to{transform:translateY(-10px) scale(1.005)}}@keyframes handleMove{from{left:44%}to{left:56%}}@media(max-width:900px){.detail-hero,.two-column,.care-panel,.before-after{grid-template-columns:1fr}.detail-hero{min-height:auto;padding-top:112px}.detail-media{order:-1}.detail-media img{height:320px}.three{grid-template-columns:1fr}.intro-panel,.care-panel,.before-after,.final-cta{padding:24px;border-radius:30px}.result-frame,.result-frame figure{min-height:240px}}
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

  resultVisual(): ResultVisual {
    return RESULT_VISUALS[this.service.id] ?? RESULT_VISUALS['implant'];
  }

  resultGoal(): string {
    const goals: Record<string, LocalizedText> = {
      implant: {
        fa: 'بازگرداندن توان جویدن و پر کردن جای خالی دندان با طرحی پایدار، قابل نگهداری و هماهنگ با لثه و لبخند.',
        en: 'Restoring chewing ability and replacing the missing tooth with a stable, maintainable plan that fits the gum and smile.'
      },
      laminate: {
        fa: 'اصلاح رنگ، فرم و تناسب دندان‌های جلو با حداقل تراش لازم و نتیجه‌ای طبیعی، تمیز و قابل نگهداری.',
        en: 'Improving front-tooth shade, form and proportion with the least needed preparation and a natural, maintainable result.'
      },
      composite: {
        fa: 'اصلاح محافظه‌کارانه فرم، فاصله یا لب‌پریدگی دندان با پولیش دقیق و توضیح روشن درباره مراقبت و رنگ‌پذیری.',
        en: 'Conservative correction of shape, gaps or chips with precise polishing and clear guidance on care and staining limits.'
      },
      orthodontics: {
        fa: 'حرکت کنترل‌شده دندان‌ها برای نظم بهتر، تماس‌های سالم‌تر و حفظ نتیجه با نگهدارنده پس از درمان.',
        en: 'Controlled tooth movement for better alignment, healthier contacts and result stability with retention after treatment.'
      },
      whitening: {
        fa: 'روشن‌تر شدن کنترل‌شده رنگ دندان طبیعی بدون تغییر رنگ ترمیم‌ها، با مدیریت حساسیت و انتظار واقع‌بینانه.',
        en: 'Controlled brightening of natural teeth without changing restorations, with sensitivity control and realistic expectations.'
      },
      'root-canal': {
        fa: 'حذف عفونت داخل دندان، کاهش درد و حفظ دندان طبیعی با ترمیم نهایی مناسب برای جلوگیری از شکستگی.',
        en: 'Removing infection inside the tooth, reducing pain and saving the natural tooth with a proper final restoration.'
      },
      pediatric: {
        fa: 'درمان یا پیشگیری بدون ایجاد ترس، حفظ دندان‌های شیری تا زمان مناسب و آموزش کاربردی به والدین.',
        en: 'Care or prevention without creating fear, preserving baby teeth until the right time and giving practical parent guidance.'
      },
      'gum-treatment': {
        fa: 'کاهش التهاب و خونریزی، کنترل پلاک و جرم زیر لثه و ساختن پایه سالم برای دندان طبیعی، ایمپلنت و درمان زیبایی.',
        en: 'Reducing inflammation and bleeding, controlling plaque and deep calculus and building a healthy base for teeth, implants and cosmetic care.'
      }
    };

    return pickText(goals[this.service.id] ?? goals['implant'], this.language());
  }

  private updateSeo(): void {
    this.title.setTitle(pickText(this.service.seo.title, this.language()));
    this.meta.updateTag({ name: 'description', content: pickText(this.service.seo.description, this.language()) });
    this.meta.updateTag({ property: 'og:title', content: pickText(this.service.seo.title, this.language()) });
    this.meta.updateTag({ property: 'og:description', content: pickText(this.service.seo.description, this.language()) });
  }
}
