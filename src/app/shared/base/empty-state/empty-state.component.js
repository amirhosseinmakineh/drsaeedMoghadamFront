import { CommonModule } from "@angular/common";
import { EventEmitter, } from "@angular/core";

@Component({
  selector: "app-empty-state",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./empty-state.component.html"
})
export class EmptyStateComponent {constructor() { EmptyStateComponent.prototype.__init.call(this);EmptyStateComponent.prototype.__init2.call(this);EmptyStateComponent.prototype.__init3.call(this);EmptyStateComponent.prototype.__init4.call(this); }
  Input() __init() {this.title = ""}
  Input() __init2() {this.description = ""}
  Input() __init3() {this.actionLabel = ""}

  Output() __init4() {this.actionClick = new EventEmitter()}
}
