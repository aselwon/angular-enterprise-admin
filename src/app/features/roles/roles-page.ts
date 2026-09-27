import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../../core/api.service';
import { PERMISSIONS, Role } from '../../core/models';
import { LoadState } from '../../shared/load-state';
import { IconComponent } from '../../shared/icon';
@Component({ selector: 'pa-roles-page', imports: [LoadState, IconComponent], template: `
  <div class="page-heading"><div><span class="eyebrow">ACCESS CONTROL</span><h1>Roles & permissions</h1><p>Clear responsibilities across your organization.</p></div><span class="subtle-chip">3 system roles</span></div>
  <pa-load-state [loading]="loading()" [error]="error()" (retry)="load()" />
  @if (!loading() && !error()) { <div class="role-cards">@for (role of roles(); track role.id) { <article class="panel role-card"><span class="stat-icon" [class.green]="role.id === 'admin'"><pa-icon [name]="role.id === 'admin' ? 'shield' : 'key'" /></span><h2>{{ role.name }}</h2><p>{{ role.description }}</p><span class="subtle-chip">{{ role.permissions.length }} dashboard permissions</span></article> }</div>
  <section class="panel"><div class="panel-heading"><div><h2>Permissions matrix</h2><p>System permissions for PolicyAdmin dashboard features</p></div><span class="subtle-chip">Read only</span></div><div class="table-scroll"><table class="matrix"><caption class="sr-only">System role permissions matrix</caption><thead><tr><th scope="col">Dashboard feature</th>@for (role of roles(); track role.id) {<th scope="col">{{ role.name }}</th>}</tr></thead><tbody>@for (permission of permissions; track permission) {<tr><th scope="row"><strong>{{ labels[permission] }}</strong><small>{{ permission }}</small></th>@for (role of roles(); track role.id) {<td>@if (role.permissions.includes(permission)) {<span class="permission-yes"><pa-icon name="check" /><span class="sr-only">Allowed</span></span>} @else {<span class="permission-no" aria-label="Not permitted">—</span>}</td>}</tr>}</tbody></table></div></section>
  <div class="page-note"><pa-icon name="info" />System roles are fixed in the MVP. Policies define resource access rules; they do not change dashboard administration permissions.</div> }
` })
export class RolesPage {
  private readonly api = inject(ApiService); private readonly destroyRef = inject(DestroyRef);
  readonly roles = signal<Role[]>([]); readonly loading = signal(true); readonly error = signal(''); readonly permissions = PERMISSIONS;
  readonly labels: Record<string, string> = { 'employees.read': 'View employees', 'roles.read': 'View roles', 'policies.read': 'View policies', 'policies.create': 'Create policies', 'audit.read': 'View audit log' };
  constructor() { this.load(); }
  load() { this.loading.set(true); this.error.set(''); this.api.roles().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: roles => { this.roles.set(roles); this.loading.set(false); }, error: () => { this.error.set('Unable to load the permissions matrix.'); this.loading.set(false); } }); }
}
