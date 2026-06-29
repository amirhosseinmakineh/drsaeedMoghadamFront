import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-loading",
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <div *ngIf="loading" role="status" aria-live="polite">{{ label }}</div>
      <ng-content *ngIf="!loading"></ng-content>
    </section>
  `,
})
export class LoadingComponent {
  @Input() loading = false;
  @Input() label = "Loading";
}
