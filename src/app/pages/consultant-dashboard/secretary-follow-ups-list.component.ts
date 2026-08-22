import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subject, debounceTime, distinctUntilChanged, finalize, takeUntil } from "rxjs";
import { ConsultantFollowUp } from "../../core/follow-up/follow-up.model";
import { FollowUpService } from "../../core/follow-up/follow-up.service";
import { formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({ selector: "app-secretary-follow-ups-list", standalone: true, imports: [CommonModule, FormsModule], templateUrl: "./secretary-follow-ups-list.component.html", styleUrl: "../secretary-dashboard/secretary-follow-ups.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class SecretaryFollowUpsListComponent implements OnInit {
  items: ConsultantFollowUp[] = []; search = ""; page = 1; pageSize = 20; totalCount = 0; loading = false; error = false;
  private readonly search$ = new Subject<string>(); private readonly destroyed$ = new Subject<void>(); private readonly destroyRef = inject(DestroyRef);
  constructor(private api: FollowUpService, private cdr: ChangeDetectorRef) { this.destroyRef.onDestroy(() => { this.destroyed$.next(); this.destroyed$.complete(); }); }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalCount / this.pageSize)); }
  ngOnInit(): void { this.search$.pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroyed$)).subscribe(() => { this.page = 1; this.load(); }); this.load(); }
  onSearch(): void { this.search$.next(this.search); }
  load(): void { this.loading = true; this.error = false; this.api.getConsultantFollowUps(this.page, this.pageSize, this.search).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); })).subscribe({ next: result => { this.items = result.items; this.totalCount = result.totalCount; this.cdr.markForCheck(); }, error: () => { this.error = true; this.items = []; } }); }
  changePage(value: number): void { if (value < 1 || value > this.totalPages || value === this.page || this.loading) return; this.page = value; this.load(); }
  changePageSize(): void { this.page = 1; this.load(); }
  formatDate(value: string): string { return formatIranDateTime(value, { year: "numeric", month: "2-digit", day: "2-digit" }); }
  formatCreatedAt(value: string): string { return formatIranDateTime(value); }
  trackById(_: number, item: ConsultantFollowUp): number { return item.id; }
}
