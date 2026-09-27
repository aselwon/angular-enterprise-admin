import { ValidatorFn } from '@angular/forms';
import { PolicyInput } from '../../core/models';
import { policyErrors } from '../../core/policy-rules';
export const policyValidator: ValidatorFn = control => {
  const errors = policyErrors(control.getRawValue() as PolicyInput);
  return Object.keys(errors).length ? errors : null;
};
