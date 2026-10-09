import { NgFor } from "@angular/common";
import { Component, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  FEATURED_DENTAL_SERVICES,
  LanguageCode,
  pickText,
} from "../../models/clinic.model";
import { FaIconComponent } from "../../shared/ui/fa-icon/fa-icon.component";
import { servicePath } from "../../shared/routing/service-path";

@Component({
  selector: "app-services",
  standalone: true,
  imports: [NgFor, RouterLink, FaIconComponent],
  templateUrl: "./services.component.html",
  styleUrl: "./services.component.scss",
})
export class ServicesComponent {
  language = signal<LanguageCode>("fa");
  services = FEATURED_DENTAL_SERVICES;
  protected readonly pickText = pickText;
  protected readonly servicePath = servicePath;

  setLanguage(language: LanguageCode): void {
    this.language.set(language);
  }
}
