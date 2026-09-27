import { Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
@Component({ selector: 'pa-pagination', imports: [MatButtonModule], template: `
  <nav class="pagination" aria-label="Pagination"><span>{{ total() ? (page() - 1) * pageSize() + 1 : 0 }}–{{ end() }} of {{ total() }} results</span><div>
    <button mat-button [disabled]="disabled() || page() <= 1" (click)="pageChange.emit(page() - 1)">Previous</button>
    <span class="page-count">{{ page() }} / {{ pages() }}</span>
    <button mat-button [disabled]="disabled() || page() >= pages()" (click)="pageChange.emit(page() + 1)">Next</button>
  </div></nav>` })
export class Pagination {
  readonly page = input(1); readonly pageSize = input(10); readonly total = input(0); readonly disabled = input(false); readonly pageChange = output<number>();
  readonly pages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  readonly end = computed(() => Math.min(this.page() * this.pageSize(), this.total()));
}
