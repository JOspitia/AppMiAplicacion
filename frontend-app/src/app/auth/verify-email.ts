import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-verify-email',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule],
    template: `
    <div class="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden">
      <!-- Oranges blurring background -->
      <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      
      <div class="w-full max-w-[440px] bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl p-10 border border-slate-100 dark:border-white/5 relative z-10 text-center animate-fadein">
        
        <div *ngIf="status() === 'loading'" class="space-y-6">
          <div class="flex justify-center">
            <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">Verificando cuenta</h2>
          <p class="text-slate-500 dark:text-slate-400">Validando tu token de seguridad...</p>
        </div>

        <div *ngIf="status() === 'success'" class="space-y-6">
          <div class="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <i class="pi pi-check text-2xl text-emerald-500"></i>
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">¡Verificación exitosa!</h2>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Tu cuenta ha sido activada correctamente. Ahora puedes disfrutar de todos nuestros servicios.</p>
          <div class="pt-4">
            <p-button 
                label="INICIAR SESIÓN" 
                routerLink="/login"
                styleClass="w-full !rounded-xl !py-4 !bg-primary !border-0 !font-black !tracking-widest !uppercase !text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
            </p-button>
          </div>
        </div>

        <div *ngIf="status() === 'error'" class="space-y-6">
          <div class="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <i class="pi pi-times text-2xl text-red-500"></i>
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white">Error de Verificación</h2>
          <p class="text-slate-500 dark:text-slate-400 font-medium">{{ errorMessage() }}</p>
          <div class="pt-4">
            <p-button 
                label="VOLVER AL INICIO" 
                routerLink="/"
                styleClass="w-full !rounded-xl !py-4 !bg-slate-800 dark:!bg-white dark:!text-slate-900 !border-0 !font-black !tracking-widest !uppercase shadow-xl transition-all">
            </p-button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class VerifyEmailComponent implements OnInit {
    status = signal<'loading' | 'success' | 'error'>('loading');
    errorMessage = signal('');

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService
    ) { }

    ngOnInit() {
        // Small delay to make it feel premium
        setTimeout(() => {
            const token = this.route.snapshot.queryParamMap.get('token');
            if (!token) {
                this.status.set('error');
                this.errorMessage.set('Falta el token de seguridad para completar la operación.');
                return;
            }

            this.authService.verify(token).subscribe({
                next: () => {
                    this.status.set('success');
                },
                error: (err) => {
                    this.status.set('error');
                    this.errorMessage.set(err.error?.message || 'El enlace es inválido o ya ha sido utilizado.');
                }
            });
        }, 1500);
    }
}
