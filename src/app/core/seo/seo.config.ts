import { DENTAL_SERVICES, text } from "../../models/clinic.model";
import { SeoPageConfig } from "./seo.models";

const service = (id: string) => DENTAL_SERVICES.find((item) => item.id === id)!;

export const PUBLIC_SEO: Record<string, SeoPageConfig> = {
  "/": {
    title: text("دکتر سعید مقدم | کامپوزیت، لمینت و بلیچینگ دندان", "Dr. Saeed Moghaddam | Veneers & Teeth Whitening"),
    description: text("وب‌سایت دکتر سعید مقدم؛ تمرکز ویژه بر لمینت، کامپوزیت ونیر و بلیچینگ، با امکان دریافت خدمات اقساطی بدون ضامن و بدون پیش‌پرداخت و فقط با چک.", "Dr. Saeed Moghaddam's clinic focuses on veneers, composite and professional whitening, with installment services available without a guarantor or down payment, by cheque only."),
    canonicalPath: "/",
    imagePath: "/1.png",
    schema: "website",
  },
  "/services": {
    title: text("خدمات زیبایی دندان | کلینیک دکتر سعید مقدم", "Cosmetic dental services | Dr. Saeed Moghaddam Dental Clinic"),
    description: text("معرفی خدمات زیبایی دندان؛ لمینت سرامیکی، کامپوزیت ونیر و بلیچینگ دندان با توضیح سلامت‌محور و شرایط پرداخت اقساطی بدون ضامن و پیش‌پرداخت، فقط با چک.", "Cosmetic dental services: porcelain veneers, composite and whitening with health-first guidance and cheque-only installment terms."),
    canonicalPath: "/services/",
    schema: "clinic",
  },
  "/about": {
    title: text("درباره ما | کلینیک دندان‌پزشکی دکتر سعید مقدم", "About us | Dr. Saeed Moghaddam Dental Clinic"),
    description: text("معرفی کلینیک دندان‌پزشکی دکتر سعید مقدم، تمرکز آن بر لمینت و زیبایی طبیعی، ارزش‌ها و رویکرد درمانی شفاف.", "About Dr. Saeed Moghaddam Dental Clinic, its focus on veneers, natural aesthetics, values and clear care philosophy."),
    canonicalPath: "/about/",
    schema: "clinic",
  },
  "/contact": {
    title: text("تماس با ما | کلینیک دندان‌پزشکی دکتر سعید مقدم", "Contact us | Dr. Saeed Moghaddam Dental Clinic"),
    description: text("فرم درخواست تماس مشاور برای لمینت و خدمات زیبایی، بررسی دریافت خدمات اقساطی بدون ضامن و بدون پیش‌پرداخت و فقط با چک، ساعات پاسخگویی و راهنمای مراجعه.", "Request a consultation for veneers and cosmetic care, and ask about cheque-only installment terms, response hours and visit coordination."),
    canonicalPath: "/contact/",
    schema: "clinic",
  },
  "/composite": {
    title: service("composite").seo.title,
    description: service("composite").seo.description,
    canonicalPath: "/composite/",
    imagePath: "/4.png",
    schema: "clinic",
  },
  "/bleaching": {
    title: service("whitening").seo.title,
    description: service("whitening").seo.description,
    canonicalPath: "/bleaching/",
    imagePath: "/6.png",
    schema: "clinic",
  },
  "/services/laminate": {
    title: service("laminate").seo.title,
    description: service("laminate").seo.description,
    canonicalPath: "/services/laminate/",
    imagePath: "/3.png",
    schema: "clinic",
  },
};

export const LEGACY_CANONICALS: Record<string, string> = {
  "/services/composite": "/composite",
  "/services/whitening": "/bleaching",
};

export const PRIVATE_ROUTE_PREFIXES = [
  "/admin", "/consultant", "/dashboard", "/secretary", "/select-dashboard",
];
