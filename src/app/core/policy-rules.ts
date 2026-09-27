import { ACTIONS, PolicyInput, RESOURCES } from './models';

export function policyErrors(value: PolicyInput, today = new Date().toISOString().slice(0, 10)): Record<string, string> {
  const errors: Record<string, string> = {};
  if (value.name.trim().length < 4 || value.name.trim().length > 80) errors['name'] = 'The name must contain 4 to 80 characters.';
  if (value.description.length > 500) errors['description'] = 'The description can contain up to 500 characters.';
  if (!['admin', 'auditor', 'member'].includes(value.roleId)) errors['roleId'] = 'Select a role.';
  if (!RESOURCES.includes(value.resource)) errors['resource'] = 'Select a resource.';
  if (!['all', 'staging', 'production'].includes(value.environment)) errors['environment'] = 'Select an environment.';
  if (!['allow', 'deny'].includes(value.effect)) errors['effect'] = 'Select a policy effect.';
  if (!value.actions.length || value.actions.some(action => !ACTIONS.includes(action))) errors['actions'] = 'Select at least one permission.';
  if (!['permanent', 'scheduled'].includes(value.duration)) errors['duration'] = 'Select an access duration.';
  if (value.duration === 'scheduled') {
    const validDate = (date: string) => /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
    if (!validDate(value.startsAt) || value.startsAt < today) errors['startsAt'] = 'The start date must be today or later.';
    if (!validDate(value.endsAt) || value.endsAt <= value.startsAt) errors['endsAt'] = 'The end date must be after the start date.';
  }
  if (value.effect === 'allow' && value.environment !== 'staging' && !value.requireMfa) errors['requireMfa'] = 'Access that includes production requires MFA.';
  return errors;
}
