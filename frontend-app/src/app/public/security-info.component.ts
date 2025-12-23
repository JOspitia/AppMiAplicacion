import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-security-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-slate-900 font-sans">
        <!-- Ornaments -->
        <div class="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-400/5 blur-[120px] rounded-full pointer-events-none"></div>
        
            <div class="relative max-w-6xl mx-auto px-6 z-10">
                <!-- Back Button -->
                <a href="/" class="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all mb-12 border border-slate-100 dark:border-white/5 shadow-sm">
                <i class="pi pi-arrow-left transition-transform group-hover:-translate-x-1"></i>
                Volver al inicio
                </a>

                <!-- Header -->
                <div class="mb-16 pb-12">
                <h1 class="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
                    Infraestructura <span class="text-primary italic">Segura</span>
                </h1>
                <div class="flex flex-wrap items-center gap-4">
                    <span class="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Sistemas de protección activos
                    </span>
                    
                    <span class="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/5">
                        Estándar de cifrado AES-256
                    </span>
                </div>
            </div>

            <!-- MAIN LAYOUT -->
            <div class="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5 shadow-sm">
                <div class="flex items-start gap-6">
                    <div class="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <i class="pi pi-shield text-3xl"></i>
                    </div>

                    <div class="flex-1">
                    <h3 class="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        Seguridad de tu cuenta
                    </h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        Tu cuenta está protegida por un sistema de **seguridad de capas múltiples** que monitorea intentos de acceso inusuales y cifra tus datos de sesión de extremo a extremo.
                    </p>

                    <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div class="flex items-center gap-3 py-2 px-4 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <i class="pi pi-verified text-green-500 text-sm"></i>
                        <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Sesión Protegida</span>
                        </div>
                        
                        <div class="flex items-center gap-3 py-2 px-4 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                        <i class="pi pi-verified text-green-500 text-sm"></i>
                        <span class="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Antifraude Activo</span>
                        </div>
                    </div>

                    <div class="mt-8 pt-6 border-t border-slate-200/60 dark:border-white/5 flex flex-wrap gap-4 items-center">
                        <a routerLink="/privacy" fragment="registro-seguridad" 
                        class="text-xs font-black text-primary hover:text-primary-600 flex items-center gap-2 transition-colors">
                        <i class="pi pi-info-circle"></i>
                        CONOCER PROTOCOLOS SEGUROS
                        </a>
                        
                        <a href="mailto:jjohanospitia@gmail.com" 
                        class="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform">
                        Soporte Técnico
                        </a>
                    </div>
                    </div>
                </div>
            </div>

        </div>
    </main>
    `,
    styles: [`
        :host { display: block; }
        html { scroll-behavior: smooth; }
    `]
})
export class SecurityInfoComponent {}
