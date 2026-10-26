import { ChangeDetectionStrategy, } from "@angular/core";
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
export class BasePageShellComponent {constructor() { BasePageShellComponent.prototype.__init.call(this);BasePageShellComponent.prototype.__init2.call(this);BasePageShellComponent.prototype.__init3.call(this); }
  Input({ required: true })
  __init() {this.title = ""}
  Input()
  __init2() {this.description = ""}
  Input()
  __init3() {this.showHeader = true}
}
