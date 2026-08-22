import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Subscription, finalize } from "rxjs";
import { ConsultantFollowUp, FollowUpService } from "../../core/follow-up/follow-up.service";
import { formatIranDate, formatIranDateTime } from "../../utils/iran-datetime.util";

@Component({ selector: "app-consultant-follow-ups", standalone: true, imports: [CommonModule, FormsModule], templateUrl: "./consultant-follow-ups.component.html", styleUrl: "./consultant-follow-ups.component.scss", changeDetection: ChangeDetectionStrategy.OnPush })
export class ConsultantFollowUpsComponent implements OnInit, OnDestroy {
  items: ConsultantFollowUp[] = []; search = ""; page = 1; pageSize = 20; totalCount = 0; loading = false; error = "";
  private timer: ReturnType<typeof setTimeout> | null = null; private request: Subscription | null = null;
  constructor(private api: FollowUpService, private cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); } ngOnDestroy(): void { if (this.timer) clearTimeout(this.timer); this.request?.unsubscribe(); }
  get totalPages(): number { return Math.max(1, Math.ceil(this.totalCount / this.pageSize)); }
  onSearch(): void { if (this.timer) clearTimeout(this.timer); this.timer = setTimeout(() => { this.page = 1; this.load(); }, 350); }
  load(): void { this.request?.unsubscribe(); this.loading = true; this.error = ""; this.request = this.api.getConsultantFollowUps(this.page, this.pageSize, this.search.trim()).pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); })).subscribe({ next: response => { this.items = response.items; this.page = response.page; this.pageSize = response.pageSize; this.totalCount = response.totalCount; }, error: error => this.error = error.message }); }
  pageTo(page: number): void { if (page < 1 || page > this.totalPages || page === this.page) return; this.page = page; this.load(); } changeSize(): void { this.page = 1; this.load(); }
  date(value: string): string { return formatIranDate(value); } dateTime(value: string): string { return formatIranDateTime(value); }
}
