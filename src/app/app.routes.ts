import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';
import { ShellComponent } from './layout/shell';
export const routes: Routes = [
  { path: 'login', title: 'Sign in · PolicyAdmin', loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent) },
  { path: '', component: ShellComponent, canActivate: [authGuard], canActivateChild: [authGuard], children: [
    { path: '', pathMatch: 'full', redirectTo: 'employees' },
    { path: 'employees', title: 'Employees · PolicyAdmin', loadComponent: () => import('./features/employees/employees-page').then(m => m.EmployeesPage) },
    { path: 'employees/:id', title: 'Employee profile · PolicyAdmin', loadComponent: () => import('./features/employees/employee-detail').then(m => m.EmployeeDetail) },
    { path: 'roles', title: 'Roles & permissions · PolicyAdmin', loadComponent: () => import('./features/roles/roles-page').then(m => m.RolesPage) },
    { path: 'policies', title: 'Access policies · PolicyAdmin', loadComponent: () => import('./features/policies/policies-page').then(m => m.PoliciesPage) },
    { path: 'policies/new', title: 'New policy · PolicyAdmin', canActivate: [roleGuard], loadComponent: () => import('./features/policies/policy-form').then(m => m.PolicyFormPage) },
    { path: 'audit', title: 'Audit log · PolicyAdmin', loadComponent: () => import('./features/audit/audit-page').then(m => m.AuditPage) },
    { path: 'forbidden', title: 'Access denied · PolicyAdmin', loadComponent: () => import('./shared/message-page').then(m => m.MessagePage), data: { forbidden: true } },
    { path: '**', title: 'Page not found · PolicyAdmin', loadComponent: () => import('./shared/message-page').then(m => m.MessagePage) },
  ] },
];
