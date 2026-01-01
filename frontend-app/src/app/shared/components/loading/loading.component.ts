import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';
import { BrandingService } from '../../../core/services/branding.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-loading',
    standalone: true,
    imports: [CommonModule, ProgressSpinnerModule],
    template: `
    <div *ngIf="loadingService.isLoading()" 
         class="fixed inset-0 z-[9999] flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl animate-fade-in">
      <div class="flex flex-col items-center relative">
        
        <!-- Spinner & Logo Container -->
        <div class="relative flex items-center justify-center w-48 h-48">
            <!-- Dynamic Spinner with company color -->
            <p-progressSpinner 
                strokeWidth="2" 
                animationDuration=".8s"
                [style.color]="brandingService.currentPrimaryColor()"
                styleClass="w-full h-full opacity-30">
            </p-progressSpinner>
            
            <!-- Company Logo / Icon Fallback -->
            <div class="absolute inset-0 flex items-center justify-center p-10">
                <ng-container *ngIf="!logoError; else iconFallback">
                    <img [src]="brandingService.currentLogo()" 
                         (error)="logoError = true"
                         alt="Logo" 
                         class="max-w-full max-h-full object-contain animate-float drop-shadow-2xl">
                </ng-container>
                <ng-template #iconFallback>
                    <div class="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                        <i class="pi pi-briefcase text-3xl text-primary animate-pulse"></i>
                    </div>
                </ng-template>
            </div>
        </div>
        
        <!-- Processing Text with Dots -->
        <div class="mt-4 flex flex-col items-center gap-3">
            <span class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
                Procesando
            </span>
            <div class="flex gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></div>
            </div>
        </div>
      </div>
    </div>
  `
})
export class LoadingComponent {
    loadingService = inject(LoadingService);
    brandingService = inject(BrandingService);
    logoError = false;

    constructor() {
        // Reset logo error when the logo URL changes
        effect(() => {
            this.brandingService.currentLogo();
            this.logoError = false;
        });
    }
}
