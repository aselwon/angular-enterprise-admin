import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
@Component({ selector: 'pa-load-state', imports: [MatButtonModule], template: `
  @if (loading()) { <div class="state" role="status"><span class="spinner"></span> Loading data…</div> }
  @else if (error()) { <div class="state" role="alert"><strong>{{ error() }}</strong><button mat-stroked-button (click)="retry.emit()">Try again</button></div> }
  @else if (empty()) { <div class="state"><strong>No results</strong><span>Change the filters or clear your search.</span></div> }
` })
export class LoadState {
  readonly loading = input(false); readonly error = input(''); readonly empty = input(false); readonly retry = output<void>();
}
