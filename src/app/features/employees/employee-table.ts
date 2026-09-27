import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Employee } from '../../core/models';
import { StatusBadge } from '../../shared/status-badge';
import { IconComponent } from '../../shared/icon';
@Component({ selector: 'pa-employee-table', imports: [RouterLink, StatusBadge, IconComponent], template: `
  <div class="table-scroll"><table><caption class="sr-only">Organization employees</caption><thead><tr><th scope="col">Employee</th><th scope="col">Department</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Location</th><th scope="col"><span class="sr-only">Details</span></th></tr></thead><tbody>
  @for (employee of employees(); track employee.id) { <tr><td><a class="person" [routerLink]="['/employees', employee.id]"><span class="avatar" [class.lilac]="employee.department === 'Engineering'" [class.peach]="employee.department === 'Finance'">{{ employee.initials }}</span><span><strong>{{ employee.name }}</strong><small>{{ employee.email }}</small></span></a></td><td>{{ employee.department }}</td><td><span class="role-chip" [class.admin]="employee.roleId === 'admin'">{{ roleNames[employee.roleId] }}</span></td><td><pa-status [value]="employee.status" /></td><td class="muted">{{ employee.location }}</td><td><a class="row-link" [routerLink]="['/employees', employee.id]" [attr.aria-label]="'Profile: ' + employee.name"><pa-icon name="chevron" /></a></td></tr> }
  </tbody></table></div>
` })
export class EmployeeTable {
  readonly employees = input.required<Employee[]>();
  readonly roleNames: Record<string, string> = { admin: 'Administrator', auditor: 'Auditor', member: 'Employee' };
}
