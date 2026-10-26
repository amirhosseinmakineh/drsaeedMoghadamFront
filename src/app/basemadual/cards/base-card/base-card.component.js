import {
  ChangeDetectionStrategy,



} from "@angular/core";

@Component({
  selector: "app-base-card",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styleUrl: "./base-card.component.scss",
})
export class BaseCardComponent {constructor() { BaseCardComponent.prototype.__init.call(this); }
  Input() __init() {this.variant = "default"}
  HostBinding("class") get variantClass() {
    return `variant-${this.variant}`;
  }
}
