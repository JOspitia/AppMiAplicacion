import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DashboardService } from '../services/dashboard.service';
import { IconComponent } from '../../shared/components/icon.component';
import { environment } from '../../../environments/environment';


interface UserProfile {
  firstName: string;
  companyName: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],

  template: `
    <div class="min-h-[calc(100vh-8rem)] flex flex-col">
      <!-- Personalized Welcome Section -->
      <div class="mb-14 animate-fadeinup">
        <!-- Premium Section Label -->
        <div class="flex items-center gap-4 mb-8 group">
          <div class="flex items-center justify-center p-2 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10 transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-110">
            <div class="relative w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <span class="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></span>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none mb-1">Ecosistema Global</span>
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Panel de Control</h3>
          </div>
        </div>

        <div class="space-y-6">
          <h2 class="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            ¡Hola, <span class="bg-clip-text text-transparent uppercase" [style.backgroundImage]="'linear-gradient(to right, var(--primary), var(--primary-stop))'">{{ userProfile().firstName }}</span>! 
            <span class="inline-block animate-bounce">👋</span>
          </h2>
          <p class="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed font-medium">
            Gestiona tu infraestructura empresarial con precisión quirúrgica. Todo lo que necesitas para el
            crecimiento de <span class="text-slate-800 dark:text-white font-bold underline decoration-primary/40 decoration-[3px] underline-offset-[6px]">{{ userProfile().companyName }}</span>
            está disponible hoy.
          </p>
        </div>
      </div>

      <!-- Module Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <a 
          *ngFor="let module of modules(); let i = index"
          [routerLink]="module.url"
          class="group relative bg-white dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-700/50 hover:border-transparent transition-all duration-500 overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-2xl"
          [style.animation-delay]="(i * 100) + 'ms'"
          style="animation: fadeinup 0.5s ease-out both;">
          
          <!-- Gradient Overlay on Hover -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
               [style.background]="'linear-gradient(135deg, var(--primary), var(--primary-dark))'"></div>
          
          <!-- Content -->
          <div class="relative z-10">
            <!-- Icon -->
            <div class="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl bg-primary">
              <app-icon [icon]="module.icon" svgClass="w-8 h-8 text-white" iconClass="text-2xl text-white"></app-icon>
            </div>

            
            <!-- Title -->
            <h3 class="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-white transition-colors">
              {{ module.title }}
            </h3>
            
            <!-- Description -->
            <p class="text-sm text-slate-600 dark:text-slate-400 group-hover:text-white/90 transition-colors leading-relaxed">
              {{ module.description || ('Acceder al módulo de ' + module.title.toLowerCase() + ' y gestionar sus operaciones.') }}
            </p>
            
            <!-- Arrow -->
            <div class="mt-6 flex items-center gap-2 group-hover:text-white transition-colors"
                 [style.color]="'var(--primary)'">
              <span class="text-sm font-bold">Explorar</span>
              <i class="pi pi-arrow-right text-sm transition-transform group-hover:translate-x-2"></i>
            </div>
          </div>
        </a>
      </div>

      <!-- Empty State (if no modules) -->
      <div *ngIf="modules().length === 0" class="flex-1 flex items-center justify-center">
        <div class="text-center py-16">
          <div class="w-24 h-24 mx-auto mb-6 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <i class="pi pi-inbox text-4xl text-slate-400"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Sin módulos disponibles</h3>
          <p class="text-slate-500 dark:text-slate-400 max-w-md">
            Tu empresa aún no tiene módulos activos. Contacta al administrador para habilitar funcionalidades.
          </p>
        </div>
      </div>

      <!-- Security Banner -->
      <div class="mt-auto pt-12">
        <div class="relative bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 overflow-hidden border border-slate-700/50">
          <!-- Background Pattern -->
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-0 right-0 w-64 h-64 blur-[100px]" [style.backgroundColor]="'var(--primary)'"></div>
            <div class="absolute bottom-0 left-0 w-48 h-48 blur-[80px]" [style.backgroundColor]="'var(--primary-dark)'"></div>
          </div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <i class="pi pi-shield text-2xl text-emerald-400"></i>
              </div>
              <div>
                <h4 class="text-lg font-bold text-white mb-1">Seguridad Empresarial</h4>
                <p class="text-sm text-slate-400">Tus datos están protegidos con encriptación de grado militar.</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span class="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <i class="pi pi-lock mr-2"></i>SSL Activo
              </span>
              <span class="px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-bold">
                <i class="pi pi-verified mr-2"></i>Verificado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    `,
  styles: [`
    @keyframes fadeinup {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private http = inject(HttpClient);

  userProfile = signal<UserProfile>({ firstName: 'Usuario', companyName: 'tu empresa' });
  modules = this.dashboardService.modules;

  ngOnInit() {
    this.loadUserProfile();
    if (this.modules().length === 0) {
      this.dashboardService.loadUserModules().subscribe();
    }
  }

  private loadUserProfile() {
    // Load user info
    this.http.get<any>(`${environment.apiUrl}/auth/me`).subscribe({
      next: (user) => {
        if (user && user.firstName) {
          this.userProfile.update(p => ({ ...p, firstName: user.firstName }));
        }
      }
    });

    // Load from company context
    this.http.get<any>(`${environment.apiUrl}/companies/current`).subscribe({
      next: (company) => {
        if (company && company.name) {
          this.userProfile.update(p => ({ ...p, companyName: company.name }));
        }
      }
    });
  }
}
