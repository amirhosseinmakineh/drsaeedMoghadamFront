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
  templateUrl: "./service-detail.component.html",
  styleUrl: "./service-detail.component.scss",
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
