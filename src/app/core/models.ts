export type AppRole = 'admin' | 'auditor';
export interface Session { token: string; name: string; email: string; role: AppRole }
export interface Employee {
  id: string; name: string; email: string; initials: string; department: string;
  jobTitle: string; roleId: string; status: 'active' | 'invited' | 'suspended'; location: string; joinedAt: string;
}
export interface Role { id: string; name: string; description: string; permissions: string[] }
export interface Page<T> { items: T[]; total: number; page: number; pageSize: number }
export interface EmployeeQuery { search: string; department: string; status: string; page: number; pageSize: number }
export interface PolicyInput {
  name: string; description: string; roleId: string; resource: string;
  environment: 'all' | 'staging' | 'production'; effect: 'allow' | 'deny';
  actions: string[]; duration: 'permanent' | 'scheduled'; startsAt: string; endsAt: string; requireMfa: boolean;
}
export interface Policy extends PolicyInput { id: string; createdAt: string; createdBy: string }
export interface AuditEntry { id: string; actor: string; action: string; target: string; createdAt: string; outcome: 'success' | 'denied' }
export const DEPARTMENTS = ['Engineering', 'Finance', 'People & Culture', 'Operations'];
export const RESOURCES = ['Internal applications', 'Financial data', 'Employee data', 'Infrastructure'];
export const ACTIONS = ['Read', 'Write', 'Export'];
export const PERMISSIONS = ['employees.read', 'roles.read', 'policies.read', 'policies.create', 'audit.read'];
