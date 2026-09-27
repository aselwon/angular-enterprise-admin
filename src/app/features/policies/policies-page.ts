import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { Policy } from '../../core/models';
import { IconComponent } from '../../shared/icon';
import { LoadState } from '../../shared/load-state';
import { StatusBadge } from '../../shared/status-badge';
@Component({ selector: 'pa-policies-page', imports: [RouterLink, DatePipe, MatButtonModule, IconComponent, LoadState, StatusBadge], template: `
  <div class="page-heading"><div><span class="eyebrow">ORGANIZATION RULES</span><h1>Access policies</h1><p>Define who can access each resource and under which conditions.</p></div>@if (auth.isAdmin()) { <a mat-flat-button routerLink="/policies/new"><pa-icon name="plus" /> New policy</a> } @else { <span class="subtle-chip">Auditor · read only</span> }</div>
  <section class="panel"><div class="panel-heading"><div><h2>Organization policies</h2><p>{{ policies().length }} resource access rules</p></div><pa-icon name="shield" /></div><div class="filters"><div class="search-field"><pa-icon name="search" /><input aria-label="Search policies" placeholder="Search policies or resources…" (input)="search.set($any($event.target).value)" /></div><select aria-label="Policy effect" (change)="effect.set($any($event.target).value)"><option value="">All effects</option><option value="allow">Allow</option><option value="deny">Deny</option></select></div>
  <pa-load-state [loading]="loading()" [error]="error()" [empty]="!filtered().length" (retry)="load()" />
  @if (!loading() && !error() && filtered().length) {<div class="table-scroll"><table><caption class="sr-only">Organization policies</caption><thead><tr><th scope="col">Policy</th><th scope="col">Role and resource</th><th scope="col">Permissions</th><th scope="col">Conditions</th><th scope="col">Effect</th></tr></thead><tbody>@for (policy of filtered(); track policy.id) {<tr><td><strong>{{ policy.name }}</strong><small>{{ policy.id }} · {{ policy.createdAt | date:'dd MMM yyyy' }}</small><p class="cell-description">{{ policy.description }}</p></td><td>{{ roleNames[policy.roleId] }}<small>{{ policy.resource }}</small></td><td>{{ policy.actions.join(', ') }}</td><td><span>{{ environmentNames[policy.environment] }}</span><small>{{ policy.requireMfa ? 'MFA required' : 'MFA not required' }}</small><small>{{ policy.duration === 'permanent' ? 'Indefinite' : policy.startsAt + ' — ' + policy.endsAt }}</small></td><td><pa-status [value]="policy.effect" /></td></tr>}</tbody></table></div>}
  </section><div class="page-note"><pa-icon name="info" />Policies are demo configuration. The MVP does not enforce them in external systems.</div>
` })
export class PoliciesPage {
  readonly auth = inject(AuthService); private readonly api = inject(ApiService); private readonly destroyRef = inject(DestroyRef);
  readonly policies = signal<Policy[]>([]); readonly search = signal(''); readonly effect = signal(''); readonly loading = signal(true); readonly error = signal('');
  readonly roleNames: Record<string, string> = { admin: 'Administrator', auditor: 'Auditor', member: 'Employee' };
  readonly environmentNames: Record<string, string> = { all: 'All environments', staging: 'Staging', production: 'Production' };
  readonly filtered = computed(() => this.policies().filter(policy => `${policy.name} ${policy.resource}`.toLocaleLowerCase('en').includes(this.search().trim().toLocaleLowerCase('en')) && (!this.effect() || policy.effect === this.effect())));
  constructor() { this.load(); }
  load() { this.loading.set(true); this.error.set(''); this.api.policies().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: policies => { this.policies.set(policies); this.loading.set(false); }, error: () => { this.error.set('Unable to load policies.'); this.loading.set(false); } }); }
}
