import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { EMPLOYEES } from '../../core/mock/seed';
import { EmployeeTable } from './employee-table';
describe('EmployeeTable', () => {
  it('renders employee data and accessible profile links', async () => {
    await render(EmployeeTable, { inputs: { employees: EMPLOYEES.slice(0, 1) }, providers: [provideRouter([])] });
    expect(screen.getByRole('table', { name: 'Organization employees' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Profile: Anna Kowalska' }).getAttribute('href')).toBe('/employees/EMP-001');
    expect(screen.getByText('Administrator')).toBeTruthy();
    expect(screen.getByText('Active')).toBeTruthy();
  });
});
