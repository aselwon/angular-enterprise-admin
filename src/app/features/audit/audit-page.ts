import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, of, startWith, Subject, switchMap, tap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { AuditEntry, Page } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { StatusBadge } from '../../shared/status-badge';
import { LoadState } from '../../shared/load-state';
import { Pagination } from '../../shared/pagination';
@Component({ selector: 'pa-audit-page', imports: [DatePipe, ReactiveFormsModule, IconComponent, StatusBadge, LoadState, Pagination], template: `
  <div class="page-heading"><div><span class="eyebrow">ORGANIZATION HISTORY</span><h1>Audit log</h1><p>Every change has a history. See who did what and when.</p></div><span class="read-only"><pa-icon name="clock" /> Newest events first</span></div>
  <section class="panel"><div class="panel-heading"><div><h2>Organization activity</h2><p>Sign-ins, new policies, and denied write requests</p></div><span class="subtle-chip">{{ result().total }} events</span></div>
  <form class="filters" [formGroup]="filters" (submit)="$event.preventDefault()"><div class="search-field"><pa-icon name="search" /><input aria-label="Search events" formControlName="search" placeholder="Search by person, action, or object…" /></div><select aria-label="Event outcome" formControlName="outcome"><option value="">All outcomes</option><option value="success">Success</option><option value="denied">Denied</option></select></form>
  <pa-load-state [loading]="loading()" [error]="error()" [empty]="!result().total" (retry)="load()" />
  @if (!loading() && !error() && result().total) { <div class="table-scroll"><table><caption class="sr-only">Audit events</caption><thead><tr><th scope="col">Date and time</th><th scope="col">User</th><th scope="col">Action</th><th scope="col">Object</th><th scope="col">Outcome</th></tr></thead><tbody>@for (entry of result().items; track entry.id) { <tr><td class="mono">{{ entry.createdAt | date:'dd MMM yyyy' }}<small>{{ entry.createdAt | date:'HH:mm:ss' }}</small></td><td><strong>{{ entry.actor }}</strong></td><td>{{ entry.action }}</td><td>{{ entry.target }}</td><td><pa-status [value]="entry.outcome" /></td></tr> }</tbody></table></div> }
  <pa-pagination [page]="result().page" [total]="result().total" [disabled]="loading() || !!error()" (pageChange)="load($event)" /></section><div class="page-note"><pa-icon name="info" />Times use your browser time zone. Refreshing resets the demo history.</div>
` })
export class AuditPage {
  private readonly api = inject(ApiService); private readonly requests = new Subject<number>();
  readonly filters = inject(FormBuilder).nonNullable.group({ search: '', outcome: '' }); readonly loading = signal(true); readonly error = signal('');
  readonly result = signal<Page<AuditEntry>>({ items: [], page: 1, pageSize: 10, total: 0 });
  constructor() {
    this.requests.pipe(startWith(1), tap(() => { this.loading.set(true); this.error.set(''); }), switchMap(page => { const { search, outcome } = this.filters.getRawValue(); return this.api.audit(search, outcome, page).pipe(catchError(() => { this.error.set('Unable to load the audit log.'); return of(null); })); }), takeUntilDestroyed()).subscribe(result => { if (result) this.result.set(result); this.loading.set(false); });
    this.filters.valueChanges.pipe(debounceTime(250), takeUntilDestroyed()).subscribe(() => this.load());
  }
  load(page = 1) { this.requests.next(page); }
}
