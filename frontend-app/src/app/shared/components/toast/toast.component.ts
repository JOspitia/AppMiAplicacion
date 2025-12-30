import { Component, Input, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon.component';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title: string;
    message: string;
}

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule, IconComponent],
    template: `
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <div 
        *ngFor="let toast of toasts()" 
        class="pointer-events-auto min-w-[320px] max-w-md bg-white dark:bg-slate-800 border-l-4 shadow-xl rounded-lg p-4 flex items-start gap-3 animate-slide-in-right transform transition-all duration-300 hover:scale-[1.02]"
        [ngClass]="{
            'border-emerald-500 shadow-emerald-500/10': toast.type === 'success',
            'border-red-500 shadow-red-500/10': toast.type === 'error',
            'border-blue-500 shadow-blue-500/10': toast.type === 'info',
            'border-amber-500 shadow-amber-500/10': toast.type === 'warning'
        }">
        
        <!-- Icon -->
        <div class="shrink-0 pt-0.5">
            <div [ngClass]="{
                'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10': toast.type === 'success',
                'text-red-500 bg-red-50 dark:bg-red-500/10': toast.type === 'error',
                'text-blue-500 bg-blue-50 dark:bg-blue-500/10': toast.type === 'info',
                'text-amber-500 bg-amber-50 dark:bg-amber-500/10': toast.type === 'warning'
            }" class="w-8 h-8 rounded-full flex items-center justify-center">
                <app-icon [name]="getIconName(toast.type)" size="18"></app-icon>
            </div>
        </div>

        <!-- Content -->
        <div class="flex-1">
            <h4 class="font-bold text-sm text-slate-900 dark:text-white leading-tight mb-1">{{ toast.title }}</h4>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-snug">{{ toast.message }}</p>
        </div>

        <!-- Close -->
        <button (click)="remove(toast.id)" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <i class="pi pi-times text-xs"></i>
        </button>
      </div>
    </div>
  `,
    styles: [`
    @keyframes slideInRight {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in-right {
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
  `]
})
export class ToastComponent {
    toasts = signal<ToastMessage[]>([]);

    // Static instance to allow global access (Simple Service Pattern)
    private static instance: ToastComponent;

    constructor() {
        ToastComponent.instance = this;
    }

    static add(type: ToastType, title: string, message: string, duration = 5000) {
        if (ToastComponent.instance) {
            ToastComponent.instance.addToast(type, title, message, duration);
        }
    }

    addToast(type: ToastType, title: string, message: string, duration: number) {
        const id = Math.random().toString(36).substring(2, 9);
        const newToast: ToastMessage = { id, type, title, message };

        this.toasts.update(current => [newToast, ...current]);

        setTimeout(() => {
            this.remove(id);
        }, duration);
    }

    remove(id: string) {
        this.toasts.update(current => current.filter(t => t.id !== id));
    }

    getIconName(type: ToastType): string {
        switch (type) {
            case 'success': return 'check';
            case 'error': return 'x';
            case 'warning': return 'alert-triangle';
            case 'info': return 'info';
            default: return 'info';
        }
    }
}

// Global helper to use anywhere
export const Toast = {
    success: (title: string, message: string) => ToastComponent.add('success', title, message),
    error: (title: string, message: string) => ToastComponent.add('error', title, message),
    info: (title: string, message: string) => ToastComponent.add('info', title, message),
    warning: (title: string, message: string) => ToastComponent.add('warning', title, message)
};
