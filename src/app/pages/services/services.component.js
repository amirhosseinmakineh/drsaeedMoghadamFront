import { NgFor } from "@angular/common";
import { signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  FEATURED_DENTAL_SERVICES,

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
export class ServicesComponent {constructor() { ServicesComponent.prototype.__init.call(this);ServicesComponent.prototype.__init2.call(this);ServicesComponent.prototype.__init3.call(this);ServicesComponent.prototype.__init4.call(this); }
  __init() {this.language = signal("fa")}
  __init2() {this.services = FEATURED_DENTAL_SERVICES}
    __init3() {this.pickText = pickText}
    __init4() {this.servicePath = servicePath}

  setLanguage(language) {
    this.language.set(language);
  }
}
