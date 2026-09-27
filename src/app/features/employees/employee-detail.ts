import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, of, Subject, switchMap, tap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Employee, Policy, Role } from '../../core/models';
import { LoadState } from '../../shared/load-state';
import { StatusBadge } from '../../shared/status-badge';
import { IconComponent } from '../../shared/icon';
@Component({ selector: 'pa-employee-detail', imports: [RouterLink, DatePipe, MatButtonModule, LoadState, StatusBadge, IconComponent], template: `
  <a class="back-link" routerLink="/employees"><pa-icon name="back" /> All employees</a>
  <pa-load-state [loading]="loading()" [error]="error()" (retry)="retry()" />
  @if (employee(); as person) { <div class="page-heading"><div class="person detail-title"><span class="avatar large">{{ person.initials }}</span><div><span class="eyebrow">{{ person.id }}</span><h1>{{ person.name }}</h1><p>{{ person.jobTitle }} · {{ person.department }}</p></div></div><pa-status [value]="person.status" /></div>
  <div class="detail-grid"><section class="panel"><div class="panel-heading"><h2>Employee profile</h2></div><dl class="detail-list"><div><dt>Email address</dt><dd>{{ person.email }}</dd></div><div><dt>Department</dt><dd>{{ person.department }}</dd></div><div><dt>Location</dt><dd>{{ person.location }}</dd></div><div><dt>Date joined</dt><dd>{{ person.joinedAt | date:'d MMMM yyyy' }}</dd></div><div><dt>Assigned role</dt><dd><a routerLink="/roles">{{ role()?.name }}</a></dd></div></dl></section>
  <section class="panel"><div class="panel-heading"><div><h2>Policies for the assigned role</h2><p>Rules for role {{ role()?.name }}</p></div><pa-icon name="shield" /></div><div class="policy-details-list">@for (policy of policies(); track policy.id) { <article><div><strong>{{ policy.name }}</strong><p>{{ policy.resource }} · {{ policy.actions.join(', ') }}</p></div><pa-status [value]="policy.effect" /></article> } @empty { <p class="muted">No policies assigned to this role.</p> }</div><div class="panel-footer"><a mat-button routerLink="/policies">View all policies <pa-icon name="arrow" /></a></div></section></div>
  <div class="page-note"><pa-icon name="info" />These rules are assigned to the role; this is not an effective-access simulation. Suspended accounts should not have an active session.</div> }
` })
export class EmployeeDetail {
  private readonly api = inject(ApiService); private readonly route = inject(ActivatedRoute); private readonly requests = new Subject<string>();
  readonly employee = signal<Employee | null>(null); readonly role = signal<Role | null>(null); readonly policies = signal<Policy[]>([]); readonly loading = signal(true); readonly error = signal('');
  constructor() {
    this.requests.pipe(tap(() => { this.loading.set(true); this.error.set(''); this.employee.set(null); }), switchMap(id => forkJoin({ employee: this.api.employee(id), roles: this.api.roles(), policies: this.api.policies() }).pipe(catchError(() => { this.error.set('The profile was not found or could not be loaded.'); return of(null); }))), takeUntilDestroyed()).subscribe(data => { if (data) { this.employee.set(data.employee); this.role.set(data.roles.find(role => role.id === data.employee.roleId) ?? null); this.policies.set(data.policies.filter(policy => policy.roleId === data.employee.roleId)); } this.loading.set(false); });
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe(params => this.requests.next(params.get('id') ?? ''));
  }
  retry() { this.requests.next(this.route.snapshot.paramMap.get('id') ?? ''); }
}
