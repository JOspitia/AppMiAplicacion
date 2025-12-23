import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon.component';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div *ngIf="message" [class]="containerClass" role="status">
      <div [class]="iconWrapperClass">
        <app-icon [name]="iconName" [class]="iconClass" size="18"></app-icon>
      </div>
      <span class="font-bold flex-1">{{ message }}</span>
      <button *ngIf="dismissible" (click)="onClose()" class="ml-3 text-xs text-slate-500 hover:text-slate-700">
        <i class="pi pi-times"></i>
      </button>
    </div>
  `
})
export class AlertComponent implements OnChanges {
  @Input() type: 'success' | 'error' = 'success';
  @Input() message: string | null = null;
  @Input() autoHide: number | null = 6000; // ms, default 6s
  @Input() dismissible = false;
  @Output() closed = new EventEmitter<void>();

  private hideTimer: any;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['message']) {
      if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; }
      if (this.message && this.autoHide) {
        this.hideTimer = setTimeout(() => this.onClose(), this.autoHide);
      }
    }
  }

  get iconName() { 
    return this.type === 'success' ? 'check' : 'x'; 
  }
  get containerClass() {
    if (this.type === 'success') return 'max-w-2xl mx-auto mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 px-4 py-3 rounded-xl flex items-center gap-3 shadow-md animate-slide-up text-sm';
    return 'max-w-2xl mx-auto mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-xl flex items-center gap-3 shadow-md animate-slide-up text-sm';
  }
  get iconWrapperClass() {
    return this.type === 'success' ? 'w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center' : 'w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center';
  }
  get iconClass() { return this.type === 'success' ? 'w-4 h-4 text-emerald-500' : 'w-4 h-4 text-red-500'; }

  onClose() {
    this.message = null;
    this.closed.emit();
    if (this.hideTimer) { clearTimeout(this.hideTimer); this.hideTimer = null; }
  }
}
