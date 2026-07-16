import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
  selector: "app-empty-state",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./empty-state.component.html"
})
export class EmptyStateComponent {
  @Input() title = "";
  @Input() description = "";
  @Input() actionLabel = "";

  @Output() actionClick = new EventEmitter<void>();
}
