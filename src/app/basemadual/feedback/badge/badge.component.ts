import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from "@angular/core";
import { BaseBadgeVariant } from "../../models/base-ui.models";
@Component({
  selector: "app-base-badge",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: "./badge.component.scss",
})
export class BaseBadgeComponent {
  @Input() variant: BaseBadgeVariant = "neutral";
  @HostBinding("class") get variantClass(): string {
    return this.variant;
  }
}
