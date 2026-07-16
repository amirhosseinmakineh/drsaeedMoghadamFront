import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-loading",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./loading.component.html"
})
export class LoadingComponent {
  @Input() loading = false;
  @Input() label = "Loading";
}
