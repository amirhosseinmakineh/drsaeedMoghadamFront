import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from "@angular/core";
import { BaseCardVariant } from "../../models/base-ui.models";
@Component({
  selector: "app-base-card",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: "./base-card.component.scss",
})
export class BaseCardComponent {
  @Input() variant: BaseCardVariant = "default";
  @HostBinding("class") get variantClass(): string {
    return `variant-${this.variant}`;
  }
}
