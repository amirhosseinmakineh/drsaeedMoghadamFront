import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({selector:'app-mobile-nav',standalone:true,imports:[RouterLink],template:`<nav class="mob"><a routerLink="/">خانه</a><a routerLink="/services">خدمات</a><a routerLink="/contact">رزرو</a><a routerLink="/contact">تماس</a></nav>`,styles:[`.mob{display:none}@media(max-width:760px){.mob{position:fixed;bottom:0;right:0;left:0;z-index:20;background:#fffaf2;border-top:1px solid #eadfce;display:grid;grid-template-columns:repeat(4,1fr);text-align:center;padding:10px 0}.mob a{font-weight:700;color:#6b4b35}}`]} )
export class MobileNavComponent {}
