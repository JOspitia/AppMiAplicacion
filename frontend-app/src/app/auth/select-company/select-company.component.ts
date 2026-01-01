import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { BrandingService } from '../../core/services/branding.service';

interface Company {
  id: string;
  name: string;
  nit: string;
  logoUrl?: string;
  primaryColor?: string;
}

@Component({
  selector: 'app-select-company',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  template: `
    <!-- Ambient Glow Background -->
    <div class="ambient-glow"></div>

    <!-- Theme Toggle -->
    <button 
      (click)="toggleTheme()" 
      class="fixed top-6 right-6 z-50 w-11 h-11 rounded-xl flex items-center justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-primary dark:hover:border-primary transition-all shadow-lg hover:shadow-primary/20"
      aria-label="Toggle theme"
    >
      <i class="pi pi-sun dark:hidden text-lg"></i>
      <i class="pi pi-moon hidden dark:block text-lg"></i>
    </button>

    <div class="min-h-screen flex items-center justify-center p-6 relative overflow-x-hidden">
      <div class="w-full max-w-[500px] relative py-12">
        <!-- Header -->
        <div class="text-center mb-10 animate-fade-in">
          <h1 class="text-4xl font-black mb-3 tracking-tight">
            <span class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Mi</span><span class="text-slate-900 dark:text-white">Aplicación</span>
          </h1>
          <p class="text-slate-600 dark:text-slate-400 font-medium">
            Selecciona tu empresa para continuar
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading()" class="space-y-4">
          <div *ngFor="let i of [1,2,3]" class="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl animate-pulse"></div>
        </div>

        <!-- Error State -->
        <div *ngIf="error()" class="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-center">
          <p class="text-red-600 dark:text-red-400 font-semibold">{{ error() }}</p>
        </div>

        <!-- Company Selection -->
        <div *ngIf="!loading() && !error()" class="space-y-4">
          <button
            *ngFor="let company of companies(); let i = index"
            (click)="selectCompany(company.id)"
            [disabled]="selecting()"
            class="company-card-premium w-full group p-5 rounded-2xl flex items-center justify-between outline-none animate-fade-in hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            [style.animation-delay]="(0.2 + i * 0.1) + 's'"
          >
            <div class="item-glow -top-10 -left-10"></div>

            <div class="text-left relative z-10">
              <span class="block font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors text-lg">
                {{ company.name }}
              </span>
              <span class="block text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                NIT: {{ company.nit }}
              </span>
            </div>

            <div class="relative z-10 text-slate-400 group-hover:text-primary transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </button>
        </div>

        <p class="text-center text-slate-500 dark:text-slate-400 text-xs mt-10 font-medium">
          © 2025 MiAplicación. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `,
  styles: [`
    .ambient-glow {
      position: fixed;
      top: 10%;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(var(--primary-rgb), 0.15) 0%, transparent 70%);
      filter: blur(60px);
      pointer-events: none;
      z-index: 0;
    }

    .company-card-premium {
      background: rgba(255, 255, 255, 0.8);
      border: 1px solid rgba(226, 232, 240, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    :host-context(.dark) .company-card-premium {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .company-card-premium:hover {
      border-color: var(--primary);
      box-shadow: 0 20px 25px -5px rgba(var(--primary-rgb), 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .item-glow {
      position: absolute;
      width: 100px;
      height: 100px;
      background: var(--primary);
      filter: blur(60px);
      opacity: 0;
      transition: opacity 0.3s ease;
      pointer-events: none;
    }

    .company-card-premium:hover .item-glow {
      opacity: 0.05;
    }

    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.5s ease forwards;
      opacity: 0;
    }
  `]
})
export class SelectCompanyComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private brandingService = inject(BrandingService);

  companies = signal<Company[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  selecting = signal(false);

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.http.get<Company[]>('/api/companies/available').subscribe({
      next: (data) => {
        if (data.length === 0) {
          this.error.set('No tienes acceso a ninguna empresa');
        } else if (data.length === 1) {
          // Auto-select if only one company
          this.selectCompany(data[0].id, data[0]);
        } else {
          this.companies.set(data);
        }
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar las empresas. Intenta nuevamente.');
        this.loading.set(false);
        console.error('Error loading companies:', err);
      }
    });
  }

  selectCompany(companyId: string, companyData?: Company) {
    this.selecting.set(true);
    this.http.post<any>('/api/companies/select', { companyId }).subscribe({
      next: (response) => {
        // response.company should now contain the full branding info
        const targetCompany = response.company || companyData;

        if (targetCompany) {
          this.brandingService.setBranding({
            logoUrl: targetCompany.logoUrl,
            primaryColor: targetCompany.primaryColor
          });
        }

        // Navigate to dashboard or home after successful selection
        const forceChange = this.route.snapshot.queryParams['forceChange'] === 'true';
        if (forceChange) {
          this.router.navigate(['/core/management/users/profile/change-password']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.error.set('Error al seleccionar la empresa');
        this.selecting.set(false);
        console.error('Error selecting company:', err);
      }
    });
  }

  toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.contains('dark');

    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  }
}
