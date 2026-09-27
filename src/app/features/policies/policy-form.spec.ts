import { fireEvent, render, screen } from '@testing-library/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { PolicyFormPage } from './policy-form';

describe('PolicyFormPage accessible interactions', () => {
  it('shows required-field messages and conditional date fields', async () => {
    await render(PolicyFormPage, { providers: [provideRouter([]), provideHttpClient()] });
    fireEvent.click(screen.getByRole('button', { name: 'Create policy' }));
    expect(await screen.findByText('The name must contain 4 to 80 characters.')).toBeTruthy();
    expect(screen.getByText('Select at least one permission.')).toBeTruthy();
    expect(screen.queryByLabelText(/Start date/)).toBeNull();
    fireEvent.change(screen.getByLabelText('Access duration'), { target: { value: 'scheduled' } });
    expect(await screen.findByLabelText(/Start date/)).toBeTruthy();
    expect(screen.getByText('The start date must be today or later.')).toBeTruthy();
    fireEvent.change(screen.getByLabelText('Access duration'), { target: { value: 'permanent' } });
    expect(screen.queryByLabelText(/Start date/)).toBeNull();
  });
});
