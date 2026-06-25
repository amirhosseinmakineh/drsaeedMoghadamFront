import { NgFor } from '@angular/common';
import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { ClinicImage, DENTAL_SERVICES, DentalService, LanguageCode, LocalizedText, pickText } from '../../models/clinic.model';
import { FaIconComponent } from '../../shared/ui/fa-icon/fa-icon.component';

interface ResultVisual {
  before: ClinicImage;
  after: ClinicImage;
  beforeAlt: LocalizedText;
  afterAlt: LocalizedText;
}

interface ServiceDetailCopy {
  introTitle: LocalizedText;
  fitTitle: LocalizedText;
  benefitsTitle: LocalizedText;
  stepsTitle: LocalizedText;
  aftercareTitle: LocalizedText;
  visualTitle: LocalizedText;
  relatedTitle: LocalizedText;
  finalCtaTitle: LocalizedText;
}

const resultImage = (id: string): ClinicImage => {
  const palettes = [
    ['#fff8ec', '#ead6bd', '#a8793f'],
    ['#fffaf2', '#f0dec0', '#b88a44'],
    ['#fff7ed', '#e8d3ad', '#8f9d74']
  ];
  const [bg, soft, accent] = palettes[[...id].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="620" height="320" viewBox="0 0 620 320" role="img">
      <rect width="620" height="320" rx="34" fill="${bg}"/>
      <circle cx="120" cy="70" r="110" fill="${soft}"/>
      <circle cx="520" cy="260" r="120" fill="${soft}" opacity=".72"/>
      <path d="M178 106c70-88 204-88 274 0 42 54 20 150-20 174-36 22-60-52-70-96-13 46-35 116-75 92-44-26-64-116-24-170z" fill="#fffdf8" stroke="${accent}" stroke-width="6"/>
      <path d="M190 230c66 42 176 42 242 0" fill="none" stroke="${accent}" stroke-width="8" stroke-linecap="round"/>
      <path d="M118 278h384" stroke="${accent}" stroke-width="3" stroke-linecap="round" opacity=".22"/>
    </svg>
  `.trim();

  return {
    src: `data:image/svg+xml,${encodeURIComponent(svg)}`,
    sizes: '(max-width: 900px) 50vw, 24vw',
    width: 620,
    height: 320
  };
};

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

const DETAIL_COPY: Record<string, ServiceDetailCopy> = {
  implant: {
    introTitle: { fa: 'برنامه‌ریزی ایمپلنت دندان چگونه انجام می‌شود؟', en: 'How is dental implant care planned?' },
    fitTitle: { fa: 'ایمپلنت دندان برای چه کسانی مناسب است؟', en: 'When are dental implants considered?' },
    benefitsTitle: { fa: 'مزایای ایمپلنت دندان', en: 'Real benefits of dental implants' },
    stepsTitle: { fa: 'مراحل کاشت ایمپلنت دندان', en: 'Standard steps for dental implants' },
    aftercareTitle: { fa: 'مراقبت‌های بعد از ایمپلنت دندان', en: 'Standard aftercare after dental implants' },
    visualTitle: { fa: 'نمونه تغییرات قبل و بعد از ایمپلنت', en: 'Before and after visual for dental implants' },
    relatedTitle: { fa: 'خدمات مرتبط با ایمپلنت دندان', en: 'Care paths related to dental implants' },
    finalCtaTitle: { fa: 'مشاوره ایمپلنت دندان در کلینیک دکتر سعید مقدم', en: 'Review dental implants at Dr. Saeed Moghaddam Dental Clinic' }
  },
  laminate: {
    introTitle: { fa: 'برنامه‌ریزی لمینت سرامیکی چگونه انجام می‌شود؟', en: 'How are porcelain veneers planned?' },
    fitTitle: { fa: 'لمینت سرامیکی برای چه لبخندی مناسب است؟', en: 'When are porcelain veneers considered?' },
    benefitsTitle: { fa: 'مزایای لمینت سرامیکی', en: 'Real benefits of porcelain veneers' },
    stepsTitle: { fa: 'مراحل انجام لمینت سرامیکی', en: 'Standard steps for porcelain veneers' },
    aftercareTitle: { fa: 'مراقبت‌های بعد از لمینت سرامیکی', en: 'Standard aftercare after porcelain veneers' },
    visualTitle: { fa: 'نمونه تغییرات قبل و بعد از لمینت', en: 'Before and after visual for porcelain veneers' },
    relatedTitle: { fa: 'خدمات مرتبط با لمینت سرامیکی', en: 'Care paths related to porcelain veneers' },
    finalCtaTitle: { fa: 'مشاوره لمینت سرامیکی در کلینیک دکتر سعید مقدم', en: 'Review porcelain veneers at Dr. Saeed Moghaddam Dental Clinic' }
  },
  composite: {
    introTitle: { fa: 'برنامه‌ریزی کامپوزیت ونیر چگونه انجام می‌شود؟', en: 'How are composite veneers planned?' },
    fitTitle: { fa: 'کامپوزیت ونیر چه زمانی انتخاب خوبی است؟', en: 'When are composite veneers considered?' },
    benefitsTitle: { fa: 'مزایای کامپوزیت ونیر', en: 'Real benefits of composite veneers' },
    stepsTitle: { fa: 'مراحل انجام کامپوزیت ونیر', en: 'Standard steps for composite veneers' },
    aftercareTitle: { fa: 'مراقبت‌های بعد از کامپوزیت ونیر', en: 'Standard aftercare after composite veneers' },
    visualTitle: { fa: 'نمونه تغییرات قبل و بعد از کامپوزیت', en: 'Before and after visual for composite veneers' },
    relatedTitle: { fa: 'خدمات مرتبط با کامپوزیت ونیر', en: 'Care paths related to composite veneers' },
    finalCtaTitle: { fa: 'مشاوره کامپوزیت ونیر در کلینیک دکتر سعید مقدم', en: 'Review composite veneers at Dr. Saeed Moghaddam Dental Clinic' }
  },
  orthodontics: {
    introTitle: { fa: 'برنامه‌ریزی ارتودنسی چگونه انجام می‌شود؟', en: 'How is orthodontic care planned?' },
    fitTitle: { fa: 'چه زمانی ارتودنسی پیشنهاد می‌شود؟', en: 'When is orthodontics considered?' },
    benefitsTitle: { fa: 'ارتودنسی چه کمکی می‌کند؟', en: 'Real benefits of orthodontics' },
    stepsTitle: { fa: 'مراحل درمان ارتودنسی', en: 'Standard steps for orthodontics' },
    aftercareTitle: { fa: 'مراقبت‌ها و نگهدارنده بعد از ارتودنسی', en: 'Standard aftercare after orthodontics' },
    visualTitle: { fa: 'نمونه تغییرات قبل و بعد از ارتودنسی', en: 'Before and after visual for orthodontics' },
    relatedTitle: { fa: 'خدمات مرتبط با ارتودنسی', en: 'Care paths related to orthodontics' },
    finalCtaTitle: { fa: 'مشاوره ارتودنسی در کلینیک دکتر سعید مقدم', en: 'Review orthodontics at Dr. Saeed Moghaddam Dental Clinic' }
  },
  whitening: {
    introTitle: { fa: 'قبل از سفید کردن دندان چه چیزهایی بررسی می‌شود؟', en: 'How is teeth whitening planned?' },
    fitTitle: { fa: 'سفید کردن دندان برای چه تغییر رنگ‌هایی مناسب است؟', en: 'When is teeth whitening considered?' },
    benefitsTitle: { fa: 'مزایای سفید کردن دندان', en: 'Real benefits of teeth whitening' },
    stepsTitle: { fa: 'مراحل سفید کردن دندان', en: 'Standard steps for teeth whitening' },
    aftercareTitle: { fa: 'مراقبت‌های بعد از سفید کردن دندان', en: 'Standard aftercare after teeth whitening' },
    visualTitle: { fa: 'نمونه تغییر رنگ قبل و بعد از بلیچینگ', en: 'Before and after visual for teeth whitening' },
    relatedTitle: { fa: 'خدمات مرتبط با سفید کردن دندان', en: 'Care paths related to teeth whitening' },
    finalCtaTitle: { fa: 'مشاوره سفید کردن دندان در کلینیک دکتر سعید مقدم', en: 'Review teeth whitening at Dr. Saeed Moghaddam Dental Clinic' }
  },
  'root-canal': {
    introTitle: { fa: 'درمان ریشه چگونه شروع می‌شود؟', en: 'How is root canal therapy planned?' },
    fitTitle: { fa: 'چه علائمی نیاز به درمان ریشه را مطرح می‌کند؟', en: 'When is root canal therapy considered?' },
    benefitsTitle: { fa: 'درمان ریشه چه کمکی می‌کند؟', en: 'Real benefits of root canal therapy' },
    stepsTitle: { fa: 'مراحل درمان ریشه', en: 'Standard steps for root canal therapy' },
    aftercareTitle: { fa: 'مراقبت‌های بعد از درمان ریشه', en: 'Standard aftercare after root canal therapy' },
    visualTitle: { fa: 'قبل و بعد از کنترل درد و عفونت دندان', en: 'Before and after visual for root canal therapy' },
    relatedTitle: { fa: 'خدمات مرتبط با درمان ریشه', en: 'Care paths related to root canal therapy' },
    finalCtaTitle: { fa: 'مشاوره درمان ریشه در کلینیک دکتر سعید مقدم', en: 'Review root canal therapy at Dr. Saeed Moghaddam Dental Clinic' }
  },
  pediatric: {
    introTitle: { fa: 'مراجعه کودک چگونه برنامه‌ریزی می‌شود؟', en: 'How is pediatric dental care planned?' },
    fitTitle: { fa: 'چه زمانی کودک به دندان‌پزشکی نیاز دارد؟', en: 'When is pediatric dental care considered?' },
    benefitsTitle: { fa: 'دندان‌پزشکی کودکان چه کمکی می‌کند؟', en: 'Real benefits of pediatric dental care' },
    stepsTitle: { fa: 'مراحل مراجعه کودک', en: 'Standard steps for pediatric dental care' },
    aftercareTitle: { fa: 'مراقبت‌های خانه برای سلامت دندان کودک', en: 'Standard aftercare after pediatric dental care' },
    visualTitle: { fa: 'قبل و بعد از مراجعه آرام کودک', en: 'Before and after visual for pediatric dental care' },
    relatedTitle: { fa: 'خدمات مرتبط با دندان‌پزشکی کودکان', en: 'Care paths related to pediatric dental care' },
    finalCtaTitle: { fa: 'مشاوره دندان‌پزشکی کودکان در کلینیک دکتر سعید مقدم', en: 'Review pediatric dental care at Dr. Saeed Moghaddam Dental Clinic' }
  },
  'gum-treatment': {
    introTitle: { fa: 'درمان لثه چگونه برنامه‌ریزی می‌شود؟', en: 'How is gum treatment planned?' },
    fitTitle: { fa: 'چه نشانه‌هایی به بررسی لثه نیاز دارند؟', en: 'When is gum treatment considered?' },
    benefitsTitle: { fa: 'درمان لثه چه کمکی می‌کند؟', en: 'Real benefits of gum treatment' },
    stepsTitle: { fa: 'مراحل بررسی و درمان لثه', en: 'Standard steps for gum treatment' },
    aftercareTitle: { fa: 'مراقبت‌های بعد از درمان لثه', en: 'Standard aftercare after gum treatment' },
    visualTitle: { fa: 'قبل و بعد از کنترل التهاب لثه', en: 'Before and after visual for gum treatment' },
    relatedTitle: { fa: 'خدمات مرتبط با درمان لثه', en: 'Care paths related to gum treatment' },
    finalCtaTitle: { fa: 'مشاوره درمان لثه در کلینیک دکتر سعید مقدم', en: 'Review gum treatment at Dr. Saeed Moghaddam Dental Clinic' }
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
          <img
            [src]="service.image.src"
            [attr.srcset]="service.image.srcset"
            [attr.sizes]="service.image.sizes"
            [width]="service.image.width"
            [height]="service.image.height"
            [alt]="pickText(service.title, language())"
            loading="eager"
            decoding="async"
            fetchpriority="high"
          />
        </div>
      </section>

      <section class="page-section intro-panel">
        <div class="section-heading">
          <h2>{{ detailCopyText('introTitle') }}</h2>
        </div>
        <p class="long-text">{{ pickText(service.longIntro, language()) }}</p>
      </section>

      <section class="page-section">
        <div class="section-heading center">
          <h2>{{ language() === 'fa' ? 'زمان، هزینه و هدف مراجعه' : 'Time, cost and treatment goal' }}</h2>
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
            <h3>{{ language() === 'fa' ? 'هدف اصلی' : 'Result goal' }}</h3>
            <p>{{ resultGoal() }}</p>
          </article>
        </div>
      </section>

      <section class="page-section two-column">
        <div>
          <div class="section-heading">
            <h2>{{ detailCopyText('fitTitle') }}</h2>
          </div>
          <ul class="check-list">
            <li *ngFor="let item of service.idealFor"><app-fa-icon name="check"></app-fa-icon>{{ pickText(item, language()) }}</li>
          </ul>
        </div>
        <div class="glass-card">
          <span class="icon-bubble"><app-fa-icon name="phone"></app-fa-icon></span>
          <h3>{{ language() === 'fa' ? 'مشاوره برای انتخاب درست' : 'Consult before deciding' }}</h3>
          <p>{{ language() === 'fa' ? 'اگر مطمئن نیستید این خدمت با نیاز دهان و دندان شما هماهنگ است، درخواست مشاوره ثبت کنید تا مسیر مراجعه روشن‌تر شود.' : 'If you are unsure whether this treatment matches your oral condition, request a consultation so the visit path is clearer.' }}</p>
          <a class="secondary-btn" routerLink="/contact">{{ language() === 'fa' ? 'ثبت درخواست مشاوره' : 'Request consultation' }}</a>
        </div>
      </section>

      <section class="page-section">
        <div class="section-heading center">
          <h2>{{ detailCopyText('benefitsTitle') }}</h2>
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
          <h2>{{ detailCopyText('stepsTitle') }}</h2>
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
          <h2>{{ detailCopyText('aftercareTitle') }}</h2>
        </div>
        <ul class="check-list">
          <li *ngFor="let item of service.care"><app-fa-icon name="shield"></app-fa-icon>{{ pickText(item, language()) }}</li>
        </ul>
      </section>

      <section class="page-section before-after">
        <div>
          <h2>{{ detailCopyText('visualTitle') }}</h2>
          <p>{{ language() === 'fa' ? 'این تصاویر فقط برای آشنایی با نوع تغییرات هستند؛ نتیجه هر مراجعه‌کننده بعد از معاینه، عکس و طرح درمان مشخص می‌شود.' : 'These sample visuals explain the treatment change; each patient result is defined after examination, imaging and treatment planning.' }}</p>
        </div>
        <div class="result-frame">
          <figure class="before">
            <img
              [src]="resultVisual().before.src"
              [attr.srcset]="resultVisual().before.srcset"
              [attr.sizes]="resultVisual().before.sizes"
              [width]="resultVisual().before.width"
              [height]="resultVisual().before.height"
              [alt]="pickText(resultVisual().beforeAlt, language())"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
            />
            <figcaption>{{ language() === 'fa' ? 'قبل' : 'Before' }}</figcaption>
          </figure>
          <figure class="after">
            <img
              [src]="resultVisual().after.src"
              [attr.srcset]="resultVisual().after.srcset"
              [attr.sizes]="resultVisual().after.sizes"
              [width]="resultVisual().after.width"
              [height]="resultVisual().after.height"
              [alt]="pickText(resultVisual().afterAlt, language())"
              loading="lazy"
              decoding="async"
              fetchpriority="low"
            />
            <figcaption>{{ language() === 'fa' ? 'بعد' : 'After' }}</figcaption>
          </figure>
          <span></span>
        </div>
      </section>

      <section class="page-section faq-section">
        <div class="section-heading">
          <h2>{{ language() === 'fa' ? 'پرسش‌های رایج درباره ' + pickText(service.title, language()) : 'Frequently asked questions about ' + pickText(service.title, language()) }}</h2>
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
          <h2>{{ detailCopyText('relatedTitle') }}</h2>
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
        <h2>{{ detailCopyText('finalCtaTitle') }}</h2>
        <p>{{ language() === 'fa' ? 'برای هماهنگی مراجعه، پرسیدن سوال اولیه یا انتخاب مسیر مناسب، از بخش تماس با کلینیک اقدام کنید.' : 'For visit coordination, initial questions or checking whether this treatment is suitable, contact the clinic.' }}</p>
        <div class="hero-actions centered">
          <a class="primary-btn" routerLink="/contact"><app-fa-icon name="phone"></app-fa-icon>{{ language() === 'fa' ? 'ثبت درخواست مشاوره' : 'Request consultation' }}</a>
          <a class="secondary-btn" routerLink="/contact">{{ language() === 'fa' ? 'تماس با ما' : 'Contact us' }}</a>
        </div>
      </section>
    </article>
  `,
  styles: [`
    .detail-hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(330px, .82fr);
      gap: 36px;
      align-items: center;
      min-height: 610px;
      padding-top: 132px;
    }

    .detail-hero h1 {
      margin: 10px 0 8px;
      font-size: clamp(1.75rem, 3.3vw, 3rem);
    }

    .detail-hero h2 {
      margin: 0 0 14px;
      color: var(--brand);
      font-size: clamp(1rem, 1.6vw, 1.35rem);
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 24px;
    }

    .hero-actions.centered {
      justify-content: center;
    }

    .detail-media {
      position: relative;
    }

    .detail-media img {
      width: 100%;
      height: 440px;
      object-fit: cover;
      border-radius: 40px;
      box-shadow: var(--shadow);
    }

    .detail-media::before {
      content: '';
      position: absolute;
      inset: -18px;
      z-index: -1;
      border: 2px dashed color-mix(in srgb, var(--accent) 48%, transparent);
      border-radius: 50px;
      transform: rotate(3deg);
    }

    .intro-panel {
      padding: 36px;
      border: 1px solid var(--line);
      border-radius: 36px;
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    .long-text {
      max-width: none;
      font-size: 1rem;
    }

    .three {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .two-column,
    .care-panel,
    .before-after {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(310px, .9fr);
      gap: 26px;
      align-items: center;
    }

    .check-list {
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .check-list li {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 14px 16px;
      border: 1px solid var(--line);
      border-radius: 20px;
      background: color-mix(in srgb, var(--surface) 78%, transparent);
      font-weight: 800;
    }

    .check-list app-fa-icon {
      margin-top: 5px;
      color: var(--brand);
    }

    .timeline {
      display: grid;
      gap: 14px;
    }

    .timeline article {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 16px;
      align-items: start;
      padding: 18px;
      border: 1px solid var(--line);
      border-radius: 26px;
      background: color-mix(in srgb, var(--surface) 82%, transparent);
    }

    .timeline article > span {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--brand), var(--brand-2));
      color: #fff;
      font-weight: 950;
    }

    .timeline h3 {
      margin: 0 0 4px;
      font-size: 1.05rem;
    }

    .timeline p {
      margin: 0;
    }

    .care-panel,
    .before-after,
    .final-cta {
      padding: 34px;
      border: 1px solid var(--line);
      border-radius: 36px;
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    .result-frame {
      position: relative;
      display: grid;
      grid-template-columns: 1fr 1fr;
      min-height: 320px;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 34px;
      background: var(--surface);
    }

    .result-frame figure {
      position: relative;
      display: grid;
      min-height: 320px;
      margin: 0;
      overflow: hidden;
    }

    .result-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .result-frame figcaption {
      position: absolute;
      inset: auto 14px 14px auto;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(17, 16, 14, .72);
      color: #fff;
      font-size: .9rem;
      font-weight: 950;
    }

    .result-frame .before img {
      opacity: .72;
    }

    .result-frame span {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      width: 3px;
      background: #fff;
      box-shadow: 0 0 0 999px rgba(255, 255, 255, .02);
    }

    .related-rail {
      display: grid;
      grid-auto-flow: column;
      grid-auto-columns: minmax(280px, 360px);
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 10px;
      scroll-snap-type: x mandatory;
    }

    .related-rail .service-card {
      scroll-snap-align: start;
    }

    .final-cta {
      text-align: center;
    }

    .final-cta h2 {
      margin: 0 0 12px;
      font-size: clamp(1.35rem, 2.3vw, 2.25rem);
    }

    @media (max-width: 900px) {
      .detail-hero,
      .two-column,
      .care-panel,
      .before-after {
        grid-template-columns: 1fr;
      }

      .detail-hero {
        min-height: auto;
        padding-top: 112px;
      }

      .detail-media {
        order: -1;
      }

      .detail-media img {
        height: 320px;
      }

      .three {
        grid-template-columns: 1fr;
      }

      .intro-panel,
      .care-panel,
      .before-after,
      .final-cta {
        padding: 24px;
        border-radius: 30px;
      }

      .result-frame,
      .result-frame figure {
        min-height: 240px;
      }
    }
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

  detailCopyText(key: keyof ServiceDetailCopy): string {
    return pickText(this.detailCopy()[key], this.language());
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

  private detailCopy(): ServiceDetailCopy {
    return DETAIL_COPY[this.service.id] ?? DETAIL_COPY['implant'];
  }

  private updateSeo(): void {
    this.title.setTitle(pickText(this.service.seo.title, this.language()));
    this.meta.updateTag({ name: 'description', content: pickText(this.service.seo.description, this.language()) });
    this.meta.updateTag({ property: 'og:title', content: pickText(this.service.seo.title, this.language()) });
    this.meta.updateTag({ property: 'og:description', content: pickText(this.service.seo.description, this.language()) });
  }
}
