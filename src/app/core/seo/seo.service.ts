import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { environment } from "../../../environments/environment";
import { LanguageCode, pickText } from "../../models/clinic.model";
import { text } from "../../models/clinic.model";
import { LEGACY_CANONICALS, PUBLIC_SEO } from "./seo.config";
import { BreadcrumbItem, SeoPageConfig } from "./seo.models";

const INDEX = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const NOINDEX = "noindex, nofollow, noarchive";
const SITE_URL =
  (environment as { siteUrl?: string }).siteUrl ?? "http://localhost:4200";

@Injectable({ providedIn: "root" })
export class SeoService {
  constructor(private title: Title, private meta: Meta, @Inject(DOCUMENT) private document: Document) {}

  applyForUrl(rawUrl: string, language: LanguageCode): void {
    const path = this.normalizePath(rawUrl);
    const canonicalPath = LEGACY_CANONICALS[path] ?? path;
    const config = PUBLIC_SEO[canonicalPath];
    if (config) {
      const breadcrumbs = ["/composite", "/bleaching", "/services/laminate"].includes(canonicalPath)
        ? [
            { label: text("صفحه اصلی", "Home"), path: "/" },
            { label: text("خدمات", "Services"), path: "/services/" },
            { label: config.title, path: config.canonicalPath },
          ]
        : [];
      this.apply(config, language, breadcrumbs);
      return;
    }

    this.applyRobotsOnly(NOINDEX);
    this.removeCanonical();
    this.removeJsonLd("seo-structured-data");
  }

  apply(config: SeoPageConfig, language: LanguageCode, breadcrumbs: BreadcrumbItem[] = []): void {
    const pageTitle = pickText(config.title, language);
    const description = pickText(config.description, language);
    const canonical = this.absolute(config.canonicalPath);
    const image = this.absolute(config.imagePath ?? "/images/1-960.png");

    this.title.setTitle(pageTitle);
    this.meta.updateTag({ name: "description", content: description });
    this.meta.updateTag({ name: "robots", content: config.robots ?? INDEX });
    this.meta.updateTag({ property: "og:type", content: "website" });
    this.meta.updateTag({ property: "og:locale", content: language === "fa" ? "fa_IR" : "en_US" });
    this.meta.updateTag({ property: "og:title", content: pageTitle });
    this.meta.updateTag({ property: "og:description", content: description });
    this.meta.updateTag({ property: "og:url", content: canonical });
    this.meta.updateTag({ property: "og:image", content: image });
    this.meta.updateTag({ name: "twitter:card", content: "summary_large_image" });
    this.meta.updateTag({ name: "twitter:title", content: pageTitle });
    this.meta.updateTag({ name: "twitter:description", content: description });
    this.meta.updateTag({ name: "twitter:image", content: image });
    this.setCanonical(canonical);
    this.setJsonLd(this.buildSchema(config, language, pageTitle, description, canonical, breadcrumbs));
  }

  private buildSchema(config: SeoPageConfig, language: LanguageCode, name: string, description: string, url: string, breadcrumbs: BreadcrumbItem[]): object {
    const graph: object[] = [{ "@type": "WebSite", "@id": `${this.absolute("/")}#website`, url: this.absolute("/"), name: language === "fa" ? "وب‌سایت دکتر سعید مقدم" : "Dr. Saeed Moghaddam website", inLanguage: language === "fa" ? "fa-IR" : "en-US" }];
    if (config.schema === "clinic") graph.push({ "@type": "MedicalClinic", "@id": `${this.absolute("/")}#clinic`, name: language === "fa" ? "کلینیک دندان‌پزشکی دکتر سعید مقدم" : "Dr. Saeed Moghaddam Dental Clinic", url: this.absolute("/") });
    graph.push({ "@type": "WebPage", "@id": `${url}#webpage`, url, name, description, isPartOf: { "@id": `${this.absolute("/")}#website` }, inLanguage: language === "fa" ? "fa-IR" : "en-US" });
    if (breadcrumbs.length) graph.push({ "@type": "BreadcrumbList", itemListElement: breadcrumbs.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: pickText(item.label, language), item: this.absolute(item.path) })) });
    return { "@context": "https://schema.org", "@graph": graph };
  }

  private normalizePath(rawUrl: string): string { const path = rawUrl.split(/[?#]/, 1)[0] || "/"; return path.length > 1 ? path.replace(/\/+$/, "").toLowerCase() : "/"; }
  private absolute(path: string): string { return new URL(path, `${SITE_URL.replace(/\/$/, "")}/`).toString(); }
  private applyRobotsOnly(content: string): void { this.meta.updateTag({ name: "robots", content }); }
  private setCanonical(href: string): void { let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]'); if (!link) { link = this.document.createElement("link"); link.rel = "canonical"; this.document.head.appendChild(link); } link.href = href; }
  private removeCanonical(): void { this.document.head.querySelector('link[rel="canonical"]')?.remove(); }
  private setJsonLd(data: object): void { let script = this.document.getElementById("seo-structured-data") as HTMLScriptElement | null; if (!script) { script = this.document.createElement("script"); script.id = "seo-structured-data"; script.type = "application/ld+json"; this.document.head.appendChild(script); } script.textContent = JSON.stringify(data); }
  private removeJsonLd(id: string): void { this.document.getElementById(id)?.remove(); }
}
