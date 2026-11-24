import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AccountingApiService, accountingError } from '../accounting-api.service';
import { AccountantUser, ACCOUNTING_PERMISSION_LABELS } from '../accounting.models';

@Component({ selector: 'app-accounting-permissions', standalone: true, imports: [CommonModule],
  templateUrl: './accounting-permissions.component.html', styleUrl: '../accounting-shared.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class AccountingPermissionsComponent implements OnInit {
  @Input() available: string[] = [];
  readonly labels = ACCOUNTING_PERMISSION_LABELS;
  users: AccountantUser[] = [];
  loading = false;
  busyId: string | null = null;
  error = '';
  success = '';
  private readonly destroyRef = inject(DestroyRef);
  constructor(private readonly api: AccountingApiService, private readonly cdr: ChangeDetectorRef) {}
  ngOnInit(): void { this.load(); }
  load(): void {
    this.loading = true; this.error = '';
    this.api.accountants().pipe(finalize(() => { this.loading = false; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: users => this.users = users, error: e => this.error = accountingError(e)
    });
  }
  toggle(user: AccountantUser, permission: string): void {
    user.permissions = user.permissions.includes(permission) ? user.permissions.filter(x => x !== permission) : [...user.permissions, permission];
  }
  save(user: AccountantUser): void {
    if (this.busyId) return;
    this.busyId = user.id; this.error = ''; this.success = '';
    this.api.permissions(user.id, user.permissions).pipe(finalize(() => { this.busyId = null; this.cdr.markForCheck(); }), takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.success = `دسترسی ${user.name} ذخیره شد.`, error: e => this.error = accountingError(e)
    });
  }
}
