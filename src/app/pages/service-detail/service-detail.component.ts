import { NgFor } from "@angular/common";
import { Component, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Meta, Title } from "@angular/platform-browser";
import {
  ClinicImage,
  DENTAL_SERVICES,
  DentalService,
  LanguageCode,
  LocalizedText,
  pickText,
  publicClinicImage,
} from "../../models/clinic.model";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";

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

const resultImage = (
  key: Parameters<typeof publicClinicImage>[0],
): ClinicImage => publicClinicImage(key, "(max-width: 900px) 50vw, 24vw");

const RESULT_VISUALS: Record<string, ResultVisual> = {
  laminate: {
    before: resultImage("clinic"),
    after: resultImage("laminate"),
    beforeAlt: {
      fa: "بررسی رنگ و فرم دندان‌ها پیش از لمینت",
      en: "Tooth shade and shape review before veneers",
    },
    afterAlt: {
      fa: "هماهنگی فرم و رنگ پس از لمینت سرامیکی",
      en: "Shape and shade harmony after porcelain veneers",
    },
  },
  composite: {
    before: resultImage("clinic"),
    after: resultImage("composite"),
    beforeAlt: {
      fa: "ارزیابی فاصله و فرم دندان پیش از کامپوزیت",
      en: "Gap and tooth-shape assessment before composite veneers",
    },
    afterAlt: {
      fa: "اصلاح فرم دندان با کامپوزیت ونیر",
      en: "Tooth-shape correction with composite veneers",
    },
  },
  whitening: {
    before: resultImage("clinic"),
    after: resultImage("whitening"),
    beforeAlt: {
      fa: "ثبت رنگ پایه دندان پیش از بلیچینگ",
      en: "Baseline tooth shade before whitening",
    },
    afterAlt: {
      fa: "روشن‌تر شدن کنترل‌شده دندان پس از بلیچینگ",
      en: "Controlled tooth brightening after whitening",
    },
  },
};

const DETAIL_COPY: Record<string, ServiceDetailCopy> = {
  laminate: {
    introTitle: {
      fa: "برنامه‌ریزی لمینت سرامیکی چگونه انجام می‌شود؟",
      en: "How are porcelain veneers planned?",
    },
    fitTitle: {
      fa: "لمینت سرامیکی برای چه لبخندی مناسب است؟",
      en: "When are porcelain veneers considered?",
    },
    benefitsTitle: {
      fa: "مزایای لمینت سرامیکی",
      en: "Real benefits of porcelain veneers",
    },
    stepsTitle: {
      fa: "مراحل انجام لمینت سرامیکی",
      en: "Standard steps for porcelain veneers",
    },
    aftercareTitle: {
      fa: "مراقبت‌های بعد از لمینت سرامیکی",
      en: "Standard aftercare after porcelain veneers",
    },
    visualTitle: {
      fa: "نمونه تغییرات قبل و بعد از لمینت",
      en: "Before and after visual for porcelain veneers",
    },
    relatedTitle: {
      fa: "خدمات مرتبط با لمینت سرامیکی",
      en: "Care paths related to porcelain veneers",
    },
    finalCtaTitle: {
      fa: "مشاوره لمینت سرامیکی در کلینیک دکتر سعید مقدم",
      en: "Review porcelain veneers at Dr. Saeed Moghaddam Dental Clinic",
    },
  },
  composite: {
    introTitle: {
      fa: "برنامه‌ریزی کامپوزیت ونیر چگونه انجام می‌شود؟",
      en: "How are composite veneers planned?",
    },
    fitTitle: {
      fa: "کامپوزیت ونیر چه زمانی انتخاب خوبی است؟",
      en: "When are composite veneers considered?",
    },
    benefitsTitle: {
      fa: "مزایای کامپوزیت ونیر",
      en: "Real benefits of composite veneers",
    },
    stepsTitle: {
      fa: "مراحل انجام کامپوزیت ونیر",
      en: "Standard steps for composite veneers",
    },
    aftercareTitle: {
      fa: "مراقبت‌های بعد از کامپوزیت ونیر",
      en: "Standard aftercare after composite veneers",
    },
    visualTitle: {
      fa: "نمونه تغییرات قبل و بعد از کامپوزیت",
      en: "Before and after visual for composite veneers",
    },
    relatedTitle: {
      fa: "خدمات مرتبط با کامپوزیت ونیر",
      en: "Care paths related to composite veneers",
    },
    finalCtaTitle: {
      fa: "مشاوره کامپوزیت ونیر در کلینیک دکتر سعید مقدم",
      en: "Review composite veneers at Dr. Saeed Moghaddam Dental Clinic",
    },
  },
  whitening: {
    introTitle: {
      fa: "قبل از بلیچینگ دندان چه چیزهایی بررسی می‌شود؟",
      en: "How is dental bleaching planned?",
    },
    fitTitle: {
      fa: "بلیچینگ دندان برای چه تغییر رنگ‌هایی مناسب است؟",
      en: "When is dental bleaching considered?",
    },
    benefitsTitle: {
      fa: "مزایای بلیچینگ دندان",
      en: "Real benefits of dental bleaching",
    },
    stepsTitle: {
      fa: "مراحل بلیچینگ دندان",
      en: "Standard steps for dental bleaching",
    },
    aftercareTitle: {
      fa: "مراقبت‌های بعد از بلیچینگ دندان",
      en: "Standard aftercare after dental bleaching",
    },
    visualTitle: {
      fa: "نمونه تغییر رنگ قبل و بعد از بلیچینگ",
      en: "Before and after visual for dental bleaching",
    },
    relatedTitle: {
      fa: "خدمات مرتبط با بلیچینگ دندان",
      en: "Care paths related to dental bleaching",
    },
    finalCtaTitle: {
      fa: "مشاوره بلیچینگ دندان در کلینیک دکتر سعید مقدم",
      en: "Review dental bleaching at Dr. Saeed Moghaddam Dental Clinic",
    },
  },
};

@Component({
  selector: "app-service-detail",
  standalone: true,
  imports: [NgFor, RouterLink, FaIconComponent],
  template: `
    <article>
      <section
        class="page-section detail-hero"
        [style.--accent]="service.accent"
      >
        <div>
          <h1>{{ pickText(service.title, language()) }}</h1>
          <h2>{{ pickText(service.subtitle, language()) }}</h2>
          <p>{{ pickText(service.summary, language()) }}</p>
          <div class="hero-actions">
            <a class="primary-btn" routerLink="/contact">
              <app-fa-icon name="phone"></app-fa-icon>
              {{
                language() === "fa"
                  ? "ثبت درخواست مشاوره"
                  : "Request consultation"
              }}
            </a>
            <a class="secondary-btn" routerLink="/contact">
              <app-fa-icon name="phone"></app-fa-icon>
              {{ language() === "fa" ? "تماس با ما" : "Contact us" }}
            </a>
          </div>
        </div>
        <div class="detail-media">
          @switch (service.id) {
            @case ("laminate") {
              <img
                src="/images/2-640.png"
                srcset="
                  /images/2-360.png 360w,
                  /images/2-640.png 640w,
                  /images/2-960.png 960w
                "
                sizes="(max-width: 640px) 92vw, (max-width: 980px) 70vw, 42vw"
                width="1310"
                height="1200"
                [alt]="pickText(service.title, language())"
                loading="eager"
                decoding="async"
                fetchpriority="high"
              />
            }
            @case ("composite") {
              <img
                src="/images/3-640.png"
                srcset="
                  /images/3-360.png 360w,
                  /images/3-640.png 640w,
                  /images/3-960.png 960w
                "
                sizes="(max-width: 640px) 92vw, (max-width: 980px) 70vw, 42vw"
                width="1310"
                height="1201"
                [alt]="pickText(service.title, language())"
                loading="eager"
                decoding="async"
                fetchpriority="high"
              />
            }
            @case ("whitening") {
              <img
                src="/images/5-640.png"
                srcset="
                  /images/5-360.png 360w,
                  /images/5-640.png 640w,
                  /images/5-960.png 960w
                "
                sizes="(max-width: 640px) 92vw, (max-width: 980px) 70vw, 42vw"
                width="1310"
                height="1201"
                [alt]="pickText(service.title, language())"
                loading="eager"
                decoding="async"
                fetchpriority="high"
              />
            }
            @default {
              <img
                src="/images/1-640.png"
                srcset="
                  /images/1-360.png 360w,
                  /images/1-640.png 640w,
                  /images/1-960.png 960w
                "
                sizes="(max-width: 640px) 92vw, (max-width: 980px) 70vw, 42vw"
                width="1361"
                height="1156"
                [alt]="pickText(service.title, language())"
                loading="eager"
                decoding="async"
                fetchpriority="high"
              />
            }
          }
        </div>
      </section>

      <section class="page-section intro-panel">
        <div class="section-heading">
          <h2>{{ detailCopyText("introTitle") }}</h2>
        </div>
        <p class="long-text">{{ pickText(service.longIntro, language()) }}</p>
      </section>

      <section class="page-section">
        <div class="section-heading center">
          <h2>
            {{
              language() === "fa"
                ? "زمان، هزینه و هدف مراجعه"
                : "Time, cost and treatment goal"
            }}
          </h2>
        </div>
        <div class="info-grid three">
          <article class="info-card">
            <span class="icon-bubble"
              ><app-fa-icon name="clock"></app-fa-icon
            ></span>
            <h3>{{ language() === "fa" ? "مدت درمان" : "Treatment time" }}</h3>
            <p>{{ pickText(service.duration, language()) }}</p>
          </article>
          <article class="info-card">
            <span class="icon-bubble"
              ><app-fa-icon name="shield"></app-fa-icon
            ></span>
            <h3>{{ language() === "fa" ? "هزینه" : "Cost" }}</h3>
            <p>{{ pickText(service.cost, language()) }}</p>
          </article>
          <article class="info-card">
            <span class="icon-bubble"
              ><app-fa-icon name="sparkle"></app-fa-icon
            ></span>
            <h3>{{ language() === "fa" ? "هدف اصلی" : "Result goal" }}</h3>
            <p>{{ resultGoal() }}</p>
          </article>
        </div>
      </section>

      <section class="page-section two-column">
        <div>
          <div class="section-heading">
            <h2>{{ detailCopyText("fitTitle") }}</h2>
          </div>
          <ul class="check-list">
            <li *ngFor="let item of service.idealFor">
              <app-fa-icon name="check"></app-fa-icon
              >{{ pickText(item, language()) }}
            </li>
          </ul>
        </div>
        <div class="glass-card">
          <span class="icon-bubble"
            ><app-fa-icon name="phone"></app-fa-icon
          ></span>
          <h3>
            {{
              language() === "fa"
                ? "مشاوره برای انتخاب درست"
                : "Consult before deciding"
            }}
          </h3>
          <p>
            {{
              language() === "fa"
                ? "اگر مطمئن نیستید این خدمت با نیاز دهان و دندان شما هماهنگ است، درخواست مشاوره ثبت کنید تا مسیر مراجعه روشن‌تر شود."
                : "If you are unsure whether this treatment matches your oral condition, request a consultation so the visit path is clearer."
            }}
          </p>
          <a class="secondary-btn" routerLink="/contact">{{
            language() === "fa" ? "ثبت درخواست مشاوره" : "Request consultation"
          }}</a>
        </div>
      </section>

      <section class="page-section">
        <div class="section-heading center">
          <h2>{{ detailCopyText("benefitsTitle") }}</h2>
        </div>
        <div class="benefit-grid">
          <article class="glass-card" *ngFor="let item of service.benefits">
            <span class="icon-bubble"
              ><app-fa-icon name="check"></app-fa-icon
            ></span>
            <h3>{{ pickText(item, language()) }}</h3>
          </article>
        </div>
      </section>

      <section class="page-section journey-section">
        <div class="section-heading">
          <h2>{{ detailCopyText("stepsTitle") }}</h2>
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
          <h2>{{ detailCopyText("aftercareTitle") }}</h2>
        </div>
        <ul class="check-list">
          <li *ngFor="let item of service.care">
            <app-fa-icon name="shield"></app-fa-icon
            >{{ pickText(item, language()) }}
          </li>
        </ul>
      </section>

      <section class="page-section before-after">
        <div>
          <h2>{{ detailCopyText("visualTitle") }}</h2>
          <p>
            {{
              language() === "fa"
                ? "این تصاویر فقط برای آشنایی با نوع تغییرات هستند؛ نتیجه هر مراجعه‌کننده بعد از معاینه، عکس و طرح درمان مشخص می‌شود."
                : "These sample visuals explain the treatment change; each patient result is defined after examination, imaging and treatment planning."
            }}
          </p>
        </div>
        <div class="result-frame">
          <figure class="before">
            @switch (service.id) {
              @default {
                <img
                  src="/images/1-640.png"
                  srcset="
                    /images/1-360.png 360w,
                    /images/1-640.png 640w,
                    /images/1-960.png 960w
                  "
                  sizes="(max-width: 640px) 92vw, (max-width: 980px) 70vw, 42vw"
                  width="1361"
                  height="1156"
                  [alt]="pickText(resultVisual().beforeAlt, language())"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
              }
            }
            <figcaption>
              {{ language() === "fa" ? "قبل" : "Before" }}
            </figcaption>
          </figure>
          <figure class="after">
            @switch (service.id) {
              @case ("laminate") {
                <img
                  src="/images/2-640.png"
                  srcset="
                    /images/2-360.png 360w,
                    /images/2-640.png 640w,
                    /images/2-960.png 960w
                  "
                  sizes="(max-width: 640px) 92vw, (max-width: 980px) 70vw, 42vw"
                  width="1310"
                  height="1200"
                  [alt]="pickText(resultVisual().afterAlt, language())"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
              }
              @case ("composite") {
                <img
                  src="/images/3-640.png"
                  srcset="
                    /images/3-360.png 360w,
                    /images/3-640.png 640w,
                    /images/3-960.png 960w
                  "
                  sizes="(max-width: 640px) 92vw, (max-width: 980px) 70vw, 42vw"
                  width="1310"
                  height="1201"
                  [alt]="pickText(resultVisual().afterAlt, language())"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
              }
              @case ("whitening") {
                <img
                  src="/images/5-640.png"
                  srcset="
                    /images/5-360.png 360w,
                    /images/5-640.png 640w,
                    /images/5-960.png 960w
                  "
                  sizes="(max-width: 640px) 92vw, (max-width: 980px) 70vw, 42vw"
                  width="1310"
                  height="1201"
                  [alt]="pickText(resultVisual().afterAlt, language())"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
              }
              @default {
                <img
                  src="/images/1-640.png"
                  srcset="
                    /images/1-360.png 360w,
                    /images/1-640.png 640w,
                    /images/1-960.png 960w
                  "
                  sizes="(max-width: 640px) 92vw, (max-width: 980px) 70vw, 42vw"
                  width="1361"
                  height="1156"
                  [alt]="pickText(resultVisual().afterAlt, language())"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                />
              }
            }
            <figcaption>{{ language() === "fa" ? "بعد" : "After" }}</figcaption>
          </figure>
          <span></span>
        </div>
      </section>

      <section class="page-section faq-section">
        <div class="section-heading">
          <h2>
            {{
              language() === "fa"
                ? "پرسش‌های رایج درباره " + pickText(service.title, language())
                : "Frequently asked questions about " +
                  pickText(service.title, language())
            }}
          </h2>
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
          <h2>{{ detailCopyText("relatedTitle") }}</h2>
        </div>
        <div class="related-rail">
          <a
            class="service-card"
            *ngFor="let item of relatedServices"
            [routerLink]="['/services', item.id]"
            [style.--accent]="item.accent"
          >
            <span class="icon-bubble"
              ><app-fa-icon [name]="item.icon"></app-fa-icon
            ></span>
            <h3>{{ pickText(item.title, language()) }}</h3>
            <p>{{ pickText(item.summary, language()) }}</p>
          </a>
        </div>
      </section>

      <section class="page-section final-cta">
        <h2>{{ detailCopyText("finalCtaTitle") }}</h2>
        <p>
          {{
            language() === "fa"
              ? "برای هماهنگی مراجعه، پرسیدن سوال اولیه یا انتخاب مسیر مناسب، از بخش تماس با کلینیک اقدام کنید."
              : "For visit coordination, initial questions or checking whether this treatment is suitable, contact the clinic."
          }}
        </p>
        <div class="hero-actions centered">
          <a class="primary-btn" routerLink="/contact"
            ><app-fa-icon name="phone"></app-fa-icon
            >{{
              language() === "fa"
                ? "ثبت درخواست مشاوره"
                : "Request consultation"
            }}</a
          >
          <a class="secondary-btn" routerLink="/contact">{{
            language() === "fa" ? "تماس با ما" : "Contact us"
          }}</a>
        </div>
      </section>
    </article>
  `,
  styles: [
    `
      .detail-hero {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(330px, 0.82fr);
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
        content: "";
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
        grid-template-columns: minmax(0, 1fr) minmax(310px, 0.9fr);
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
        background: rgba(17, 16, 14, 0.72);
        color: #fff;
        font-size: 0.9rem;
        font-weight: 950;
      }

      .result-frame .before img {
        opacity: 0.72;
      }

      .result-frame span {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 3px;
        background: #fff;
        box-shadow: 0 0 0 999px rgba(255, 255, 255, 0.02);
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
    `,
  ],
})
export class ServiceDetailComponent {
  language = signal<LanguageCode>("fa");
  service: DentalService;
  relatedServices: DentalService[];
  protected readonly pickText = pickText;

  constructor(
    route: ActivatedRoute,
    private title: Title,
    private meta: Meta,
  ) {
    const serviceId =
      route.snapshot.paramMap.get("id") ?? DENTAL_SERVICES[0].id;
    this.service =
      DENTAL_SERVICES.find((item) => item.id === serviceId) ??
      DENTAL_SERVICES[0];
    this.relatedServices = DENTAL_SERVICES.filter((item) =>
      this.service.relatedIds.includes(item.id),
    );
    this.updateSeo();
  }

  setLanguage(language: LanguageCode): void {
    this.language.set(language);
    this.updateSeo();
  }

  resultVisual(): ResultVisual {
    return RESULT_VISUALS[this.service.id] ?? RESULT_VISUALS["composite"];
  }

  detailCopyText(key: keyof ServiceDetailCopy): string {
    return pickText(this.detailCopy()[key], this.language());
  }

  resultGoal(): string {
    const goals: Record<string, LocalizedText> = {
      laminate: {
        fa: "اصلاح رنگ، فرم و تناسب دندان‌های جلو با حداقل تراش لازم و نتیجه‌ای طبیعی، تمیز و قابل نگهداری.",
        en: "Improving front-tooth shade, form and proportion with the least needed preparation and a natural, maintainable result.",
      },
      composite: {
        fa: "اصلاح محافظه‌کارانه فرم، فاصله یا لب‌پریدگی دندان با پولیش دقیق و توضیح روشن درباره مراقبت و رنگ‌پذیری.",
        en: "Conservative correction of shape, gaps or chips with precise polishing and clear guidance on care and staining limits.",
      },
      whitening: {
        fa: "روشن‌تر شدن کنترل‌شده رنگ دندان طبیعی بدون تغییر رنگ ترمیم‌ها، با مدیریت حساسیت و انتظار واقع‌بینانه.",
        en: "Controlled brightening of natural teeth without changing restorations, with sensitivity control and realistic expectations.",
      },
    };

    return pickText(
      goals[this.service.id] ?? goals["composite"],
      this.language(),
    );
  }

  private detailCopy(): ServiceDetailCopy {
    return DETAIL_COPY[this.service.id] ?? DETAIL_COPY["composite"];
  }

  private updateSeo(): void {
    this.title.setTitle(pickText(this.service.seo.title, this.language()));
    this.meta.updateTag({
      name: "description",
      content: pickText(this.service.seo.description, this.language()),
    });
    this.meta.updateTag({
      property: "og:title",
      content: pickText(this.service.seo.title, this.language()),
    });
    this.meta.updateTag({
      property: "og:description",
      content: pickText(this.service.seo.description, this.language()),
    });
  }
}
