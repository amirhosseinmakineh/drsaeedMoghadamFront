import { LocalizedText } from "../../models/clinic.model";

export interface SeoPageConfig {
  title: LocalizedText;
  description: LocalizedText;
  canonicalPath: string;
  robots?: string;
  imagePath?: string;
  schema?: "website" | "clinic";
}

export interface BreadcrumbItem {
  label: LocalizedText;
  path: string;
}
