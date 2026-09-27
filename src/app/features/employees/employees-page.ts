import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, of, startWith, Subject, switchMap, tap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api.service';
import { DEPARTMENTS, Employee, Page } from '../../core/models';
import { EmployeeTable } from './employee-table';
import { IconComponent } from '../../shared/icon';
import { LoadState } from '../../shared/load-state';
import { Pagination } from '../../shared/pagination';
@Component({ selector: 'pa-employees-page', imports: [ReactiveFormsModule, MatButtonModule, EmployeeTable, IconComponent, LoadState, Pagination], template: `
  <div class="page-heading"><div><span class="eyebrow">ORGANIZATION DIRECTORY</span><h1>Employees <span class="heading-count">{{ stats()?.total ?? '—' }}</span></h1><p>Organization identities, assigned roles, and account status.</p></div><span class="read-only"><pa-icon name="users" /> Cobalt IAM</span></div>
  <div class="stats-grid" aria-label="Employee summary">
    @for (stat of statCards; track stat.key) { <div class="stat-card"><div><span>{{ stat.label }}</span><strong>{{ stats()?.[stat.key] ?? '—' }}</strong><small>{{ stat.note }}</small></div><span class="stat-icon" [class]="'stat-icon ' + stat.color"><pa-icon [name]="stat.icon" /></span></div> }
  </div>
  <section class="panel"><div class="panel-heading"><div><h2>All employees</h2><p>An overview of accounts and permissions across your organization</p></div><span class="subtle-chip">Directory · read only</span></div>
    <form class="filters" [formGroup]="filters" (submit)="$event.preventDefault()"><div class="search-field"><pa-icon name="search" /><input aria-label="Search employees" formControlName="search" placeholder="Search by name, email, or ID…" /></div><select aria-label="Department filter" formControlName="department"><option value="">All departments</option>@for (department of departments; track department) { <option [value]="department">{{ department }}</option> }</select><select aria-label="Status filter" formControlName="status"><option value="">All statuses</option><option value="active">Active</option><option value="invited">Invited</option><option value="suspended">Suspended</option></select>@if (hasFilters()) { <button mat-button type="button" (click)="clearFilters()">Clear</button> }</form>
    <pa-load-state [loading]="loading()" [error]="error()" [empty]="!result().total" (retry)="load()" />
    @if (!loading() && !error() && result().total) { <pa-employee-table [employees]="result().items" /> }
    <pa-pagination [page]="result().page" [total]="result().total" [disabled]="loading() || !!error()" (pageChange)="load($event)" />
  </section><div class="page-note"><pa-icon name="info" /><span>Employee access is determined by their assigned role and organization policies.</span></div>
` })
export class EmployeesPage {
  private readonly api = inject(ApiService); private readonly destroyRef = inject(DestroyRef); private readonly requests = new Subject<number>();
  readonly departments = DEPARTMENTS; readonly filters = inject(FormBuilder).nonNullable.group({ search: '', department: '', status: '' });
  readonly loading = signal(true); readonly error = signal(''); readonly hasFilters = signal(false);
  readonly stats = signal<{ total: number; active: number; invited: number; suspended: number } | null>(null);
  readonly result = signal<Page<Employee>>({ items: [], total: 0, page: 1, pageSize: 10 });
  readonly statCards: { key: 'total' | 'active' | 'invited' | 'suspended'; label: string; note: string; icon: string; color: string }[] = [
    { key: 'total', label: 'All employees', note: 'In the organization directory', icon: 'users', color: 'neutral' },
    { key: 'active', label: 'Active accounts', note: 'Organization access', icon: 'check', color: 'green' },
    { key: 'invited', label: 'Pending invitations', note: 'Awaiting first sign-in', icon: 'clock', color: 'amber' },
    { key: 'suspended', label: 'Suspended accounts', note: 'Access on hold', icon: 'shield', color: 'lilac' },
  ];
  constructor() {
    this.api.stats().pipe(takeUntilDestroyed()).subscribe({ next: stats => this.stats.set(stats), error: () => this.stats.set(null) });
    this.requests.pipe(startWith(1), tap(() => { this.loading.set(true); this.error.set(''); }), switchMap(page => this.api.employees({ ...this.filters.getRawValue(), page, pageSize: 10 }).pipe(catchError(() => { this.error.set('Unable to load employees.'); return of(null); }))), takeUntilDestroyed()).subscribe(result => { if (result) this.result.set(result); this.loading.set(false); });
    this.filters.valueChanges.pipe(debounceTime(250), distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)), takeUntilDestroyed(this.destroyRef)).subscribe(() => { this.hasFilters.set(Object.values(this.filters.getRawValue()).some(Boolean)); this.load(); });
  }
  load(page = 1) { this.requests.next(page); }
  clearFilters() { this.filters.reset(); }
}
