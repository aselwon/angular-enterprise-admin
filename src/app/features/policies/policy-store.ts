import { computed, inject, Injectable, signal } from '@angular/core';
import { finalize, tap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Policy, PolicyInput } from '../../core/models';
@Injectable()
export class PolicyStore {
  private readonly api = inject(ApiService);
  readonly saving = signal(false); readonly saved = signal<Policy | null>(null); readonly error = signal('');
  readonly status = computed(() => this.saving() ? 'Saving' : this.saved() ? 'Saved' : 'Draft');
  create(input: PolicyInput) {
    this.saving.set(true); this.error.set('');
    return this.api.createPolicy(input).pipe(tap({ next: policy => this.saved.set(policy), error: error => this.error.set(typeof error.error?.message === 'string' ? error.error.message : 'Unable to save. Please try again.') }), finalize(() => this.saving.set(false)));
  }
}
