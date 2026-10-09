import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [RouterLink],
  template: `<section class="not-found"><p>۴۰۴</p><h1>صفحه پیدا نشد</h1><a routerLink="/">بازگشت به صفحه اصلی</a></section>`,
  styles: [`.not-found{min-height:60vh;display:grid;place-content:center;text-align:center;gap:1rem;padding:2rem}.not-found p{font-size:4rem;font-weight:900;margin:0}.not-found h1{margin:0}.not-found a{color:inherit}`],
})
export class NotFoundComponent {}
