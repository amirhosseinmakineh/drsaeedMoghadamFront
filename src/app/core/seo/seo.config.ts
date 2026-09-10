import { DENTAL_SERVICES, text } from "../../models/clinic.model";
import { SeoPageConfig } from "./seo.models";

const service = (id: string) => DENTAL_SERVICES.find((item) => item.id === id)!;

export const PUBLIC_SEO: Record<string, SeoPageConfig> = {
  "/": {
    title: text("دکتر سعید مقدم | کامپوزیت، لمینت و بلیچینگ دندان", "Dr. Saeed Moghaddam | Veneers & Teeth Whitening"),
    description: text("وب‌سایت دکتر سعید مقدم؛ راهنمای کامپوزیت ونیر، لمینت سرامیکی و بلیچینگ دندان، مراقبت، نمونه‌کار و درخواست تماس.", "Dr. Saeed Moghaddam's guide to composite and porcelain veneers and professional teeth whitening, including aftercare and call requests."),
    canonicalPath: "/",
    imagePath: "/images/1-960.png",
    schema: "website",
  },
  "/services": {
    title: text("خدمات زیبایی دندان | کلینیک دکتر سعید مقدم", "Cosmetic dental services | Dr. Saeed Moghaddam Dental Clinic"),
    description: text("معرفی خدمات زیبایی دندان؛ کامپوزیت ونیر، لمینت سرامیکی و بلیچینگ دندان با توضیح سلامت‌محور.", "Cosmetic dental services: composite veneers, porcelain veneers and dental bleaching with health-first guidance."),
    canonicalPath: "/services/",
    schema: "clinic",
  },
  "/about": {
    title: text("درباره ما | کلینیک دندان‌پزشکی دکتر سعید مقدم", "About us | Dr. Saeed Moghaddam Dental Clinic"),
    description: text("معرفی کلینیک دندان‌پزشکی دکتر سعید مقدم، ارزش‌ها و رویکرد درمانی آن.", "About Dr. Saeed Moghaddam Dental Clinic, its values and care philosophy."),
    canonicalPath: "/about/",
    schema: "clinic",
  },
  "/contact": {
    title: text("تماس با ما | کلینیک دندان‌پزشکی دکتر سعید مقدم", "Contact us | Dr. Saeed Moghaddam Dental Clinic"),
    description: text("فرم درخواست تماس مشاور، ساعات پاسخگویی و راهنمای هماهنگی مراجعه کلینیک دندان‌پزشکی دکتر سعید مقدم.", "Consultant call request form, response hours and visit coordination guidance."),
    canonicalPath: "/contact/",
    schema: "clinic",
  },
  "/composite": {
    title: service("composite").seo.title,
    description: service("composite").seo.description,
    canonicalPath: "/composite/",
    imagePath: "/images/3-960.png",
    schema: "clinic",
  },
  "/bleaching": {
    title: service("whitening").seo.title,
    description: service("whitening").seo.description,
    canonicalPath: "/bleaching/",
    imagePath: "/images/5-960.png",
    schema: "clinic",
  },
  "/services/laminate": {
    title: service("laminate").seo.title,
    description: service("laminate").seo.description,
    canonicalPath: "/services/laminate/",
    imagePath: "/images/2-960.png",
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
