import {
  ChangeDetectionStrategy,

  EventEmitter,



} from "@angular/core";
@Component({
  selector: "app-base-drawer",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (open) {
    <div class="backdrop" (click)="backdropClick($event)">
      <aside
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title"
        [class.loading]="loading"
      >
        <header>
          <h2>{{ title }}</h2>
          <button type="button" aria-label="بستن" (click)="close.emit()">
            ×
          </button>
        </header>
        <main><ng-content /></main>
        <footer><ng-content select="[baseDrawerFooter]" /></footer>
      </aside>
    </div>
  }`,
  styleUrl: "./drawer.component.scss",
})
export class BaseDrawerComponent {constructor() { BaseDrawerComponent.prototype.__init.call(this);BaseDrawerComponent.prototype.__init2.call(this);BaseDrawerComponent.prototype.__init3.call(this);BaseDrawerComponent.prototype.__init4.call(this);BaseDrawerComponent.prototype.__init5.call(this); }
  Input() __init() {this.open = false}
  Input({ required: true }) __init2() {this.title = ""}
  Input() __init3() {this.loading = false}
  Input() __init4() {this.closeOnBackdrop = true}
  Output() __init5() {this.close = new EventEmitter()}
  HostListener("document:keydown.escape") onEscape() {
    if (this.open) {
      this.close.emit();
    }
  }
  backdropClick(event) {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
