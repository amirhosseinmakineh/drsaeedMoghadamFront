import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
@Component({
  selector: "app-base-page-shell",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="shell" dir="rtl">
      <div class="breadcrumbs"><ng-content select="[baseBreadcrumbs]" /></div>
      @if (showHeader) { <header>
        <div>
          <h1>{{ title }}</h1>
          @if (description) {
            <p>{{ description }}</p>
          }
        </div>
        <div class="actions"><ng-content select="[basePageActions]" /></div>
      </header> }
      <div class="filters"><ng-content select="[basePageFilters]" /></div>
      <ng-content />
    </main>
  `,
  styleUrl: "./page-shell.component.scss",
})
export class BasePageShellComponent {
  @Input({ required: true })
  title = "";
  @Input()
  description = "";
  @Input()
  showHeader = true;
}
