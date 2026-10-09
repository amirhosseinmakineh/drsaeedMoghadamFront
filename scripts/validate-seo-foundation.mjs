import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [sitemap, robots, seoConfig, seoService, analytics, prodEnvironment] = await Promise.all([
  read("public/sitemap.xml"), read("public/robots.txt"), read("src/app/core/seo/seo.config.ts"),
  read("src/app/core/seo/seo.service.ts"), read("src/app/core/analytics/analytics.service.ts"),
  read("src/environments/environment.prod.ts"),
]);

const fail = (message) => { throw new Error(message); };
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
if (!locations.length || locations.some((url) => /[?&]|\/(dashboard|admin|secretary|consultant)\b/.test(url))) fail("Sitemap contains a private or parameterized URL");
if (new Set(locations).size !== locations.length) fail("Sitemap contains duplicate URLs");
if (!robots.includes("Sitemap: https://drsaeedmoghadam.com/sitemap.xml")) fail("robots.txt is missing the sitemap declaration");
for (const route of ["dashboard", "admin", "secretary", "consultant"]) if (!robots.includes(`Disallow: /${route}/`)) fail(`robots.txt does not disallow ${route}`);
for (const field of ["og:title", "og:description", "og:image", "twitter:card", "canonical", "application/ld+json"]) if (!seoService.includes(field)) fail(`Central metadata is missing ${field}`);
for (const event of ["phone_click", "whatsapp_click", "consultation_form_submit", "appointment_booking", "panoramic_image_submit", "service_cta_click"]) if (!analytics.includes(event)) fail(`Missing conversion event ${event}`);
if (!prodEnvironment.includes('ga4MeasurementId: ""')) fail("GA4 must remain unset until a real measurement ID is supplied");
for (const path of ["/composite/", "/bleaching/"]) if (!seoConfig.includes(path)) fail(`Missing canonical service config ${path}`);

console.log(`SEO foundation validation passed (${locations.length} canonical sitemap URLs).`);
