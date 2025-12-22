import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule],
    template: `
    <div class="landing-container min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
      <!-- Background Glows -->
      <div class="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -z-10 animate-pulse"></div>
      <div class="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] -z-10 animate-pulse" style="animation-delay: 2s;"></div>

      <!-- Content -->
      <div class="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <h1 class="text-6xl md:text-8xl font-black tracking-tight leading-tight">
          Bienvenido a <br>
          <span class="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AppMiAplicacion
          </span>
        </h1>
        
        <p class="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
          La plataforma inteligente diseñada para llevar tu gestión al siguiente nivel con tecnología de vanguardia y diseño premium.
        </p>

        <div class="flex flex-wrap items-center justify-center gap-4 pt-8">
          <button pButton pRipple label="Comenzar Ahora" class="p-button-lg p-button-raised bg-blue-600 border-none hover:bg-blue-500 transition-all transform hover:scale-105 px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/25"></button>
          
          <button pButton pRipple label="Saber Más" [outlined]="true" class="p-button-lg border-slate-700 text-slate-300 hover:bg-slate-900 px-8 py-4 rounded-xl font-bold transition-all"></button>
        </div>

        <!-- Micro-stats -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-8 pt-16 border-t border-slate-800/50 mt-16 text-left">
          <div class="space-y-1">
            <div class="text-3xl font-bold text-blue-400">100%</div>
            <div class="text-xs uppercase tracking-widest text-slate-500 font-bold">Seguridad</div>
          </div>
          <div class="space-y-1 border-l border-slate-800 pl-8">
            <div class="text-3xl font-bold text-purple-400">24/7</div>
            <div class="text-xs uppercase tracking-widest text-slate-500 font-bold">Disponibilidad</div>
          </div>
          <div class="space-y-1 border-l border-slate-800 pl-8 hidden md:block">
            <div class="text-3xl font-bold text-pink-400">Cloud</div>
            <div class="text-xs uppercase tracking-widest text-slate-500 font-bold">Tecnología</div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="absolute bottom-8 left-0 w-full text-slate-600 text-sm font-medium">
        &copy; 2025 AppMiAplicacion. Todos los derechos reservados.
      </footer>
    </div>
  `,
    styles: [`
    :host {
      display: block;
    }
    .landing-container {
      background: radial-gradient(circle at top center, #0f172a 0%, #020617 100%);
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.2; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.1); }
    }
    .animate-pulse {
      animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class LandingComponent { }
