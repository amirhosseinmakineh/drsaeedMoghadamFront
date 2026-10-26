import {
  ChangeDetectionStrategy,

  EventEmitter,



} from "@angular/core";
@Component({
  selector: "app-base-modal",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `@if (open) {
    <div class="backdrop" (click)="backdropClick($event)">
      <section role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId">
        <header>
          <h2 [id]="titleId">{{ title }}</h2>
          <button type="button" aria-label="بستن" (click)="close.emit()">
            ×
          </button>
        </header>
        <main><ng-content /></main>
        <footer><ng-content select="[baseModalFooter]" /></footer>
      </section>
    </div>
  }`,
  styleUrl: "./modal.component.scss",
})
export class BaseModalComponent {constructor() { BaseModalComponent.prototype.__init.call(this);BaseModalComponent.prototype.__init2.call(this);BaseModalComponent.prototype.__init3.call(this);BaseModalComponent.prototype.__init4.call(this);BaseModalComponent.prototype.__init5.call(this); }
  Input() __init() {this.open = false}
  Input({ required: true }) __init2() {this.title = ""}
  Input() __init3() {this.closeOnBackdrop = true}
  Output() __init4() {this.close = new EventEmitter()}
   __init5() {this.titleId = `bm-modal-${Math.random().toString(36).slice(2)}`}
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
