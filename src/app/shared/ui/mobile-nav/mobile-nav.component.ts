import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({selector:'app-mobile-nav',standalone:true,imports:[RouterLink],template:`<nav class="mob"><a routerLink="/">خانه</a><a routerLink="/services">خدمات</a><a routerLink="/contact">رزرو</a><a routerLink="/contact">تماس</a></nav>`,styles:[`.mob{display:none}@media(max-width:760px){.mob{position:fixed;bottom:0;right:0;left:0;z-index:20;background:rgba(255,253,248,.9);backdrop-filter:blur(18px);border-top:1px solid rgba(133,109,84,.16);display:grid;grid-template-columns:repeat(4,1fr);text-align:center;padding:8px 0 calc(8px + env(safe-area-inset-bottom))}.mob a{font-size:12px;font-weight:900;color:#4b392d;padding:4px 0}}`]} )
export class MobileNavComponent {}
