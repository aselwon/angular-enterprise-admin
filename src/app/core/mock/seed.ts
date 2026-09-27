import { AuditEntry, Employee, Policy, Role } from '../models';

export const ROLES: Role[] = [
  { id: 'admin', name: 'Administrator', description: 'Manage organization access and policies.', permissions: ['employees.read', 'roles.read', 'policies.read', 'policies.create', 'audit.read'] },
  { id: 'auditor', name: 'Auditor', description: 'View configuration and change history.', permissions: ['employees.read', 'roles.read', 'policies.read', 'audit.read'] },
  { id: 'member', name: 'Employee', description: 'Access applications assigned through policies.', permissions: [] },
];
const PEOPLE = [
  ['Anna Kowalska', 'AK', 'Engineering', 'Staff Engineer', 'admin'],
  ['Michał Nowak', 'MN', 'Finance', 'Financial Analyst', 'auditor'],
  ['Julia Wiśniewska', 'JW', 'People & Culture', 'People Partner', 'member'],
  ['Piotr Zieliński', 'PZ', 'Engineering', 'Frontend Developer', 'member'],
  ['Zofia Wójcik', 'ZW', 'Operations', 'Operations Lead', 'admin'],
  ['Jakub Kamiński', 'JK', 'Engineering', 'Platform Engineer', 'member'],
  ['Maja Lewandowska', 'ML', 'Finance', 'Finance Manager', 'auditor'],
  ['Aleksander Dąbrowski', 'AD', 'Operations', 'Project Manager', 'member'],
  ['Lena Szymańska', 'LS', 'People & Culture', 'Recruiter', 'member'],
  ['Jan Woźniak', 'JW', 'Engineering', 'Backend Developer', 'member'],
  ['Maria Kozłowska', 'MK', 'Finance', 'Accountant', 'member'],
  ['Antoni Jankowski', 'AJ', 'Engineering', 'QA Engineer', 'member'],
  ['Natalia Mazur', 'NM', 'Operations', 'Business Analyst', 'auditor'],
  ['Szymon Krawczyk', 'SK', 'Engineering', 'Product Designer', 'member'],
  ['Alicja Kaczmarek', 'AK', 'People & Culture', 'HR Specialist', 'member'],
  ['Wojciech Piotrowski', 'WP', 'Engineering', 'Engineering Manager', 'admin'],
  ['Hanna Grabowska', 'HG', 'Finance', 'Controller', 'auditor'],
  ['Filip Pawłowski', 'FP', 'Operations', 'Operations Specialist', 'member'],
  ['Oliwia Michalska', 'OM', 'Engineering', 'Data Engineer', 'member'],
  ['Kacper Król', 'KK', 'People & Culture', 'People Lead', 'member'],
  ['Amelia Wieczorek', 'AW', 'Engineering', 'Security Engineer', 'auditor'],
  ['Adam Jabłoński', 'AJ', 'Operations', 'Support Specialist', 'member'],
  ['Wiktoria Wróbel', 'WW', 'Finance', 'Treasury Analyst', 'member'],
  ['Tomasz Nowakowski', 'TN', 'Engineering', 'DevOps Engineer', 'member'],
];
export const EMPLOYEES: Employee[] = PEOPLE.map(([name, initials, department, jobTitle, roleId], index) => ({
  id: `EMP-${String(index + 1).padStart(3, '0')}`, name, initials, department, jobTitle, roleId,
  email: `${name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ł/g, 'l').replace(/ /g, '.')}@cobalt.example`,
  status: index === 8 || index === 21 ? 'invited' : index === 12 ? 'suspended' : 'active',
  location: index % 3 === 0 ? 'Warsaw' : index % 3 === 1 ? 'Krakow' : 'Remote', joinedAt: `2025-${String(index % 9 + 1).padStart(2, '0')}-12`,
}));
export const POLICIES: Policy[] = [
  { id: 'POL-001', name: 'Baseline employee access', description: 'Read access to internal applications for all employees.', roleId: 'member', resource: 'Internal applications', environment: 'all', effect: 'allow', actions: ['Read'], duration: 'permanent', startsAt: '', endsAt: '', requireMfa: true, createdAt: '2026-09-20T09:00:00Z', createdBy: 'Anna Kowalska' },
  { id: 'POL-002', name: 'Financial data audit', description: 'Controlled access to production reports.', roleId: 'auditor', resource: 'Financial data', environment: 'production', effect: 'allow', actions: ['Read', 'Export'], duration: 'permanent', startsAt: '', endsAt: '', requireMfa: true, createdAt: '2026-09-21T11:30:00Z', createdBy: 'Anna Kowalska' },
  { id: 'POL-003', name: 'Infrastructure protection', description: 'Employees cannot modify production infrastructure.', roleId: 'member', resource: 'Infrastructure', environment: 'production', effect: 'deny', actions: ['Write'], duration: 'permanent', startsAt: '', endsAt: '', requireMfa: false, createdAt: '2026-09-22T14:15:00Z', createdBy: 'Zofia Wójcik' },
];
export const AUDIT: AuditEntry[] = [
  { id: 'AUD-003', actor: 'Zofia Wójcik', action: 'Policy created', target: 'Infrastructure protection', createdAt: '2026-09-22T14:15:00Z', outcome: 'success' },
  { id: 'AUD-002', actor: 'Anna Kowalska', action: 'Policy created', target: 'Financial data audit', createdAt: '2026-09-21T11:30:00Z', outcome: 'success' },
  { id: 'AUD-001', actor: 'Anna Kowalska', action: 'Policy created', target: 'Baseline employee access', createdAt: '2026-09-20T09:00:00Z', outcome: 'success' },
];
