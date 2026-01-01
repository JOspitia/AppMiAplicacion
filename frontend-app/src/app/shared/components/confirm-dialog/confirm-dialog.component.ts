import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'app-confirm-dialog',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    animations: [
        trigger('overlayAnimation', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('200ms ease-out', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0 }))
            ])
        ]),
        trigger('modalAnimation', [
            transition(':enter', [
                style({ transform: 'scale(0.95) translateY(10px)', opacity: 0 }),
                animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'scale(1) translateY(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ transform: 'scale(0.95) translateY(10px)', opacity: 0 }))
            ])
        ])
    ],
    template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4" [@overlayAnimation]>
      <!-- Backdrop -->
      <div (click)="onCancel()" class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"></div>

      <!-- Modal -->
      <div [@modalAnimation] class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        <div class="p-8 text-center">
            
            <!-- Icon -->
            <div class="w-16 h-16 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center mx-auto mb-6 transform transition-transform hover:scale-110 duration-300 ring-8 ring-primary/5">
                <i class="pi pi-question text-3xl"></i>
            </div>

            <!-- Content -->
            <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{{ title }}</h3>
            <p class="text-slate-500 dark:text-slate-400 leading-relaxed">{{ message }}</p>

            <!-- Actions -->
            <div class="flex items-center justify-center gap-4 mt-8">
                <button (click)="onCancel()" 
                        class="px-6 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                    Cancelar
                </button>
                <button (click)="onConfirm()" 
                        class="px-8 py-2.5 rounded-xl bg-brand-gradient text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:-translate-y-0.5 transition-all">
                    Confirmar
                </button>
            </div>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent {
    @Input() isOpen = false;
    @Input() title = '¿Estás seguro?';
    @Input() message = 'Esta acción no se puede deshacer.';

    @Output() confirm = new EventEmitter<void>();
    @Output() cancel = new EventEmitter<void>();

    onConfirm() {
        this.confirm.emit();
    }

    onCancel() {
        this.cancel.emit();
    }
}
