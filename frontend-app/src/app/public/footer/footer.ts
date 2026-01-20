import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BrandingService } from '../../core/services/branding.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="w-full bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-white/5 pt-20 pb-10">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          <!-- Brand Section -->
          <div class="space-y-6">
            <a routerLink="/" class="flex items-center gap-3 group">
              <div class="w-10 h-10 bg-primary rounded-2xl grid place-items-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-110 overflow-hidden border border-white/10">
                <img [src]="logoUrl()" alt="Logo" class="w-7 h-7 object-contain brightness-0 invert">
              </div>
              <span class="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
                <span class="text-primary">Mi</span>Aplicación
              </span>
            </a>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Transformando la gestión empresarial con tecnología inteligente y automatización para el crecimiento de tu equipo.
            </p>
          </div>

          <!-- Product Links -->
          <div class="space-y-6">
            <h4 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mt-1">Producto</h4>
            <ul class="space-y-4">
              <li><a href="/#features" class="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Características</a></li>
              <li><a routerLink="/pricing" class="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Planes y Precios</a></li>
              <li><a href="/#platform" class="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Plataforma</a></li>
            </ul>
          </div>

          <!-- Support Links -->
          <div class="space-y-6">
            <h4 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mt-1">Soporte</h4>
            <ul class="space-y-4">
              <li><a href="/#contact" class="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Centro de Ayuda</a></li>
              <li><a href="#" class="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Documentación API</a></li>
              <li><a href="#" class="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Estado del Sistema</a></li>
            </ul>
          </div>

          <!-- Legal Links -->
          <div class="space-y-6">
            <h4 class="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mt-1">Legal</h4>
            <ul class="space-y-4">
              <li><a routerLink="/terms" class="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Términos y Condiciones</a></li>
              <li><a routerLink="/privacy" class="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Privacidad</a></li>
              <li><a routerLink="/cookies" class="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors font-medium">Política de Cookies</a></li>
            </ul>
          </div>
        </div>

        <div class="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            © 2025 MiAplicación. Todos los derechos reservados.
          </p>
          <div class="flex items-center gap-6">
            <a href="#" class="text-slate-400 hover:text-primary transition-colors">
              <i class="pi pi-linkedin text-xl"></i>
            </a>
            <a href="#" class="text-slate-400 hover:text-primary transition-colors">
              <i class="pi pi-twitter text-xl"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  private brandingService = inject(BrandingService);
  logoUrl = this.brandingService.currentLogo;
}
