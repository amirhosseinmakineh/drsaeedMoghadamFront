import {CommonModule} from "@angular/common";
import {ChangeDetectionStrategy, DestroyRef, inject,} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {debounceTime, distinctUntilChanged, finalize, Subject, takeUntil} from "rxjs";



import {formatIranDateTime} from "../../utils/iran-datetime.util";

@Component({
  selector: "app-secretary-follow-ups-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./secretary-follow-ups-list.component.html",
  styleUrl: "./secretary-follow-ups-list.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SecretaryFollowUpsListComponent  {
  __init() {this.items = []}
  __init2() {this.search = ""}
  __init3() {this.page = 1}
  __init4() {this.pageSize = 20}
  __init5() {this.totalCount = 0}
  __init6() {this.loading = false}
  __init7() {this.error = false}
    __init8() {this.search$ = new Subject()}
    __init9() {this.destroyed$ = new Subject()}
    __init10() {this.destroyRef = inject(DestroyRef)}
  constructor( api,  cdr) {;this.api = api;this.cdr = cdr;SecretaryFollowUpsListComponent.prototype.__init.call(this);SecretaryFollowUpsListComponent.prototype.__init2.call(this);SecretaryFollowUpsListComponent.prototype.__init3.call(this);SecretaryFollowUpsListComponent.prototype.__init4.call(this);SecretaryFollowUpsListComponent.prototype.__init5.call(this);SecretaryFollowUpsListComponent.prototype.__init6.call(this);SecretaryFollowUpsListComponent.prototype.__init7.call(this);SecretaryFollowUpsListComponent.prototype.__init8.call(this);SecretaryFollowUpsListComponent.prototype.__init9.call(this);SecretaryFollowUpsListComponent.prototype.__init10.call(this);
    this.destroyRef.onDestroy(() => {
      this.destroyed$.next();
      this.destroyed$.complete();
    });
  }
  get totalPages() {
    return Math.max(1, Math.ceil(this.totalCount / this.pageSize));
  }
  get contactedCount() {
    return this.items.filter((item) => item.contacted).length;
  }

  get notContactedCount() {
    return this.items.filter((item) => !item.contacted).length;
  }
  ngOnInit() {
    this.search$.pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroyed$))
        .subscribe(() => {
          this.page = 1;
          this.load();
        });
    this.load();
  }
  onSearch() {
    this.search$.next(this.search);
  }
  load() {
    this.loading = true;
    this.error = false;
    this.api.getConsultantFollowUps(this.page, this.pageSize, this.search)
        .pipe(finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        }))
        .subscribe({
          next: result => {
            this.items = result.items;
            this.totalCount = result.totalCount;
            this.cdr.markForCheck();
          },
          error: () => {
            this.error = true;
            this.items = [];
          }
        });
  }
  changePage(value) {
    if (value < 1 || value > this.totalPages || value === this.page || this.loading) return;
    this.page = value;
    this.load();
  }
  changePageSize() {
    this.page = 1;
    this.load();
  }
  formatDate(value) {
    return formatIranDateTime(value, {year: "numeric", month: "2-digit", day: "2-digit"});
  }
  formatCreatedAt(value) {
    return formatIranDateTime(value);
  }
  trackById(_, item) {
    return item.id;
  }
}
