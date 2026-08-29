import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
@Component({
  selector: "app-base-loading",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div role="status">
    <span aria-hidden="true"></span><b>{{ label }}</b>
  </div>`,
  styles: [
    `
      div {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        min-height: 44px;
        color: var(--muted);
      }
      span {
        width: 1.25rem;
        height: 1.25rem;
        border: 2px solid currentColor;
        border-inline-end-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(1turn);
        }
      }
    `,
  ],
})
export class BaseLoadingComponent {
  @Input() label = "در حال بارگذاری…";
}
