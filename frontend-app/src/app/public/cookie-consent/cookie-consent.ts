import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-cookie-consent',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule],
    template: `
    <div 
      *ngIf="isVisible()" 
      class="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[100] animate-fadeinup"
    >
      <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 shadow-2xl shadow-indigo-500/10 relative overflow-hidden">
        <!-- Decorative Glow -->
        <div class="absolute -top-12 -right-12 w-24 h-24 bg-primary/20 blur-2xl rounded-full pointer-events-none"></div>

        <div class="relative flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <i class="pi pi-shield text-xl"></i>
            </div>
            <h3 class="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Privacidad y Cookies</h3>
          </div>

          <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
            Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. 
            Al continuar navegando, aceptas su uso según nuestra 
            <a routerLink="/privacy" class="text-primary hover:underline font-bold">Política de Cookies</a>.
          </p>

          <div class="flex items-center gap-3 pt-4">
            <p-button 
              label="ACEPTAR TODO" 
              (click)="acceptAll()"
              styleClass="flex-1 !rounded-2xl !py-4 !px-6 !text-[11px] !font-black !tracking-[0.1em] !bg-primary hover:!bg-indigo-500 !border-0 shadow-xl shadow-primary/20 transition-all hover:-translate-y-0.5"
            ></p-button>
            <button 
              (click)="dismiss()"
              class="flex-1 px-4 py-4 text-[11px] font-black tracking-[0.1em] text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-all uppercase border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50/50 dark:bg-white/5"
            >
              Configurar
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CookieConsentComponent implements OnInit {
    isVisible = signal(false);
    private readonly COOKIE_KEY = 'cookie_consent_accepted';

    ngOnInit() {
        // Solo mostrar si no se ha aceptado previamente
        if (typeof window !== 'undefined') {
            const isAccepted = localStorage.getItem(this.COOKIE_KEY);
            if (!isAccepted) {
                // Pequeño delay para que no aparezca de golpe al cargar
                setTimeout(() => this.isVisible.set(true), 1500);
            }
        }
    }

    acceptAll() {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.COOKIE_KEY, 'true');
            this.isVisible.set(false);
        }
    }

    dismiss() {
        this.isVisible.set(false);
    }
}
