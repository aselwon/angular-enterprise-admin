import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuditEntry, Employee, EmployeeQuery, Page, Policy, PolicyInput, Role } from './models';
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  employees(query: EmployeeQuery) { return this.http.get<Page<Employee>>('/api/employees', { params: { ...query } }); }
  employee(id: string) { return this.http.get<Employee>(`/api/employees/${encodeURIComponent(id)}`); }
  roles() { return this.http.get<Role[]>('/api/roles'); }
  policies() { return this.http.get<Policy[]>('/api/policies'); }
  createPolicy(input: PolicyInput) { return this.http.post<Policy>('/api/policies', input); }
  audit(search: string, outcome: string, page: number) { return this.http.get<Page<AuditEntry>>('/api/audit', { params: { search, outcome, page, pageSize: 10 } }); }
  stats() { return this.http.get<{ total: number; active: number; invited: number; suspended: number }>('/api/employees/stats'); }
}
