import {
  ChangeDetectionStrategy,



} from "@angular/core";

@Component({
  selector: "app-base-badge",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: "./badge.component.scss",
})
export class BaseBadgeComponent {constructor() { BaseBadgeComponent.prototype.__init.call(this); }
  Input() __init() {this.variant = "neutral"}
  HostBinding("class") get variantClass() {
    return this.variant;
  }
}
