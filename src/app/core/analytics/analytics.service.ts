import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

export type ConversionEventName =
  | "phone_click"
  | "whatsapp_click"
  | "consultation_form_submit"
  | "appointment_booking"
  | "panoramic_image_submit"
  | "service_cta_click";

export interface ConversionEventParams {
  service_name?: string;
  cta_location?: string;
  result?: "success" | "failure";
}

declare global {
  interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; }
}

const GA4_MEASUREMENT_ID =
  (environment as { ga4MeasurementId?: string }).ga4MeasurementId?.trim() ?? "";

@Injectable({ providedIn: "root" })
export class AnalyticsService {
  private initialized = false;
  private clickTrackingStarted = false;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  initialize(): void {
    const id = GA4_MEASUREMENT_ID;
    if (typeof window === "undefined" || !id || this.initialized) return;
    this.initialized = true;
    const script = this.document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    this.document.head.appendChild(script);
    window.dataLayer = window.dataLayer ?? [];
    window.gtag = (...args: unknown[]) => window.dataLayer?.push(args);
    window.gtag("js", new Date());
    window.gtag("config", id);
  }

  startClickTracking(): void {
    if (typeof window === "undefined" || this.clickTrackingStarted) return;
    this.clickTrackingStarted = true;
    this.document.addEventListener("click", (event) => {
      const element = (event.target as Element | null)?.closest<HTMLElement>("[data-analytics-event],a[href^='tel:'],a[href*='wa.me'],a[href*='whatsapp.com']");
      if (!element) return;
      const href = element instanceof HTMLAnchorElement ? element.href : "";
      const inferred = href.startsWith("tel:") ? "phone_click" : /wa\.me|whatsapp\.com/.test(href) ? "whatsapp_click" : null;
      const name = (element.dataset["analyticsEvent"] || inferred) as ConversionEventName | null;
      if (!name) return;
      this.track(name, { service_name: element.dataset["serviceName"], cta_location: element.dataset["ctaLocation"] });
    });
  }

  track(name: ConversionEventName, params: ConversionEventParams = {}): void {
    if (typeof window === "undefined" || !GA4_MEASUREMENT_ID) return;
    this.initialize();
    window.gtag?.("event", name, {
      page_location: window.location.href,
      page_title: this.document.title,
      device_type: matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
      ...params,
    });
  }
}
