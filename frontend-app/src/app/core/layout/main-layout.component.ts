import { Component, signal, OnInit, inject, HostListener, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml, Title, Meta } from '@angular/platform-browser';
import { DashboardService, ModuleDto } from '../services/dashboard.service';
import { IconComponent } from '../../shared/components/icon.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';


interface MenuItem extends ModuleDto {
  isOpen?: boolean;
  children: MenuItem[];
}

interface Company {
  id: string;
  name: string;
  nit: string;
}

interface UserInfo {
  username: string;
  role: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    ButtonModule,
    TooltipModule,
    SelectModule,
    FormsModule,
    FormsModule,
    IconComponent,
    ToastComponent
  ],

  template: `
    <!-- Topbar Decor -->
    <div class="fixed top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent z-[1001]"></div>

    <!-- Mobile Sidebar Overlay -->
    <div 
      *ngIf="isMobileMenuOpen()" 
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998] md:hidden"
      (click)="toggleMobileMenu()">
    </div>

    <!-- Sidebar Navigation -->
    <aside 
      class="fixed left-0 top-0 h-full z-[999] transition-all duration-300 ease-in-out flex flex-col
             bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800/60
             shadow-xl shadow-slate-900/5 dark:shadow-black/20"

      [ngClass]="{
        'w-[280px]': !isSidebarCollapsed(),
        'w-[80px]': isSidebarCollapsed(),
        '-translate-x-full md:translate-x-0': !isMobileMenuOpen(),
        'translate-x-0': isMobileMenuOpen()
      }">
      
      <!-- Sidebar Header / Logo Section -->
      <div class="h-[4.5rem] px-5 flex items-center border-b border-slate-100 dark:border-slate-800/60">
        <div class="flex items-center gap-3 overflow-hidden">
          <div class="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-2xl grid place-items-center shadow-lg shadow-primary/20 border border-white/10 group-hover:scale-105 transition-transform">
            <img [src]="logoUrl()" (error)="onLogoError($event)" alt="Logo" class="w-6 h-6 object-contain brightness-0 invert">
          </div>
          
          <div *ngIf="!isSidebarCollapsed()" class="flex flex-col transition-all duration-300 animate-in fade-in slide-in-from-left-2">
            <h1 class="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
              <span class="text-primary">Mi</span>Aplicación
            </h1>
            <span class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mt-1">Tech Solutions</span>
          </div>
        </div>
      </div>

      <!-- Navigation Links (Recursive) -->
      <div class="flex-1 overflow-y-auto py-6 px-3 space-y-1 sidebar-scroll">

        <ng-container *ngFor="let item of menuItems()">
          <ng-container *ngTemplateOutlet="menuNode; context: { $implicit: item, depth: 0 }"></ng-container>
        </ng-container>
      </div>

      <!-- Recursive Template for Menu Node -->
      <ng-template #menuNode let-node let-depth="depth">
          <!-- Item Link (No Children) -->
          <a 
            *ngIf="!node.children || node.children.length === 0"
            [routerLink]="node.url"
            routerLinkActive="bg-primary/10 text-primary border-primary/20 shadow-sm"
            [routerLinkActiveOptions]="{exact: true}"
            [style.padding-left.px]="isSidebarCollapsed() ? 12 : (depth * 12 + 12)"
            class="flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group relative border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
            [pTooltip]="isSidebarCollapsed() ? node.title : ''"
            tooltipPosition="right">
            
            <div class="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/50 dark:bg-slate-800/50 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shrink-0">
               <app-icon [icon]="node.icon" svgClass="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" iconClass="text-lg text-slate-400 group-hover:text-primary transition-colors"></app-icon>
            </div>

            
            <span *ngIf="!isSidebarCollapsed()" class="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-opacity">
              {{ node.title }}
            </span>
          </a>

          <!-- Parent Item (With Children) -->
          <div *ngIf="node.children && node.children.length > 0">
            <button 
              (click)="toggleSubmenu(node)"
              [style.padding-left.px]="isSidebarCollapsed() ? 12 : (depth * 12 + 12)"
              class="w-full flex items-center gap-3 py-2.5 rounded-xl transition-all duration-200 group border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40"
              [pTooltip]="isSidebarCollapsed() ? node.title : ''"
              tooltipPosition="right">
              
              <div class="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100/50 dark:bg-slate-800/50 group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors shrink-0">
                <app-icon [icon]="node.icon" svgClass="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" iconClass="text-lg text-slate-400 group-hover:text-primary transition-colors"></app-icon>
              </div>

              
              <span *ngIf="!isSidebarCollapsed()" class="flex-1 text-left text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">
                {{ node.title }}
              </span>
              
              <i *ngIf="!isSidebarCollapsed()" class="pi pi-chevron-down text-[10px] text-slate-400 transition-transform duration-200" [ngClass]="{'rotate-180': node.isOpen}"></i>
            </button>

            <!-- Nested Level -->
            <div *ngIf="node.isOpen && !isSidebarCollapsed()" class="mt-1 space-y-1 animate-in fade-in slide-in-from-top-2">
                <ng-container *ngFor="let child of node.children">
                    <ng-container *ngTemplateOutlet="menuNode; context: { $implicit: child, depth: depth + 1 }"></ng-container>
                </ng-container>
            </div>
          </div>
      </ng-template>


      <!-- Sidebar Mini Profile -->
      <div *ngIf="isSidebarCollapsed()" class="mt-auto p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
        <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
            {{ userInfo()?.username?.substring(0, 1) || 'U' }}
        </div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main 
      class="min-h-screen transition-all duration-300 ease-in-out bg-slate-50/50 dark:bg-[#0B1120]"
      [ngClass]="{
        'md:ml-[280px]': !isSidebarCollapsed(),
        'md:ml-[80px]': isSidebarCollapsed()
      }">
      
      <!-- Navbar (Topbar) -->
      <header 
        class="sticky top-0 z-[997] h-[4.5rem] px-4 md:px-8 flex items-center justify-between
               bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60">
        
        <div class="flex items-center gap-4">
          <button (click)="toggleSidebar()" class="hidden md:flex w-10 h-10 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary/30 transition-all shadow-sm">
            <i class="pi" [ngClass]="isSidebarCollapsed() ? 'pi-bars' : 'pi-align-left'"></i>
          </button>
          <button (click)="toggleMobileMenu()" class="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            <i class="pi pi-bars"></i>
          </button>

          <div class="hidden sm:block">
            <span class="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 leading-none block mb-1">Empresa Actual</span>
            <p class="text-sm font-bold text-slate-900 dark:text-white leading-tight">
               {{ selectedCompany()?.name || 'Cargando...' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 md:gap-4">
          <button (click)="toggleTheme()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:text-primary transition-all border border-transparent hover:border-primary/20" [pTooltip]="isDarkMode() ? 'Modo Claro' : 'Modo Oscuro'">
            <i [class]="isDarkMode() ? 'pi pi-sun' : 'pi pi-moon'"></i>
          </button>

          <div class="hidden lg:block w-[220px]">
            <p-select [options]="companies()" [(ngModel)]="selectedCompanyId" optionLabel="name" optionValue="id" placeholder="Seleccionar Empresa" (onChange)="onCompanyChange($event)" class="header-company-select"></p-select>
          </div>

          <div class="hidden sm:block h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>

          <div class="flex items-center gap-3 pl-2 group cursor-pointer">
            <div class="hidden md:flex flex-col text-right">
                <span class="text-sm font-bold text-slate-900 dark:text-white">{{ userInfo()?.username || 'Usuario' }}</span>
                <span class="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">{{ userInfo()?.role || 'Admin' }}</span>
            </div>
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-primary/20 border border-white/20">
                {{ userInfo()?.username?.substring(0, 1) || 'U' }}
            </div>
            <button (click)="logout()" class="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm" pTooltip="Cerrar Sesión" tooltipPosition="left">
              <i class="pi pi-power-off"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <div class="p-4 md:p-10 max-w-[1700px] mx-auto animate-in fade-in duration-500">
        <router-outlet></router-outlet>
      </div>

      <!-- Footer -->
      <footer class="py-8 px-8 md:px-12 border-t border-slate-200/60 dark:border-slate-800/60">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div class="flex items-center gap-3">
             <img [src]="logoUrl()" alt="Logo" class="w-5 h-5 opacity-40 grayscale group-hover:grayscale-0 transition-all">
             <p class="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                © 2025 MiAplicación. Todos los derechos reservados.
             </p>
          </div>
          <div class="flex items-center gap-8">
            <a href="#" class="text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">Legal</a>
            <a href="#" class="text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">Soporte</a>
            <a href="#" class="text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">v1.2.0</a>
          </div>
        </div>
      </footer>
    </main>

    <!-- Global Decoration -->
    <div class="fixed top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>
    <div class="fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none z-0"></div>

    <app-toast></app-toast>
    `,
  styles: [`
        :host ::ng-deep {
            .header-company-select {
                .p-select {
                    background: transparent !important;
                    border: 1px solid rgba(226, 232, 240, 0.8) !important;
                    border-radius: 0.75rem !important;
                    font-size: 0.875rem !important;
                    height: 2.5rem !important;
                    align-items: center;
                    display: flex;
                    transition: all 0.2s;
                    box-shadow: none !important;

                    &:hover {
                        border-color: var(--p-primary-color) !important;
                    }

                    .p-select-label {
                        padding-left: 0.75rem !important;
                        font-weight: 600 !important;
                        color: #1e293b;
                    }
                }

                .dark .p-select {
                    border-color: rgba(51, 65, 85, 0.8) !important;
                    .p-select-label {
                        color: #f8fafc;
                    }
                }
            }

            /* Custom Premium Scrollbar for Sidebar */
            .sidebar-scroll {
                &::-webkit-scrollbar {
                    width: 4px;
                }
                &::-webkit-scrollbar-track {
                    background: transparent;
                }
                &::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.2);
                    border-radius: 20px;
                }
                &:hover::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.4);
                }
            }
        }

    `]
})
export class MainLayoutComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private dashboardService = inject(DashboardService);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  // State
  isSidebarCollapsed = signal(false);
  isMobileMenuOpen = signal(false);
  isDarkMode = signal(false);

  // Dynamic Menu Items
  menuItems = signal<MenuItem[]>([]);

  companies = signal<Company[]>([]);
  selectedCompany = signal<Company | null>(null);
  selectedCompanyId: string = '';
  userInfo = signal<UserInfo | null>(null);

  // Logo Handling
  logoCandidates = [
    '/api/public/assets/images/logo.png',
    '/api/assets/logos/logo.webp'
  ];
  private currentLogoIndex = 0;
  logoUrl = signal(this.logoCandidates[this.currentLogoIndex]);

  onLogoError(event: Event) {
    this.currentLogoIndex++;
    if (this.currentLogoIndex < this.logoCandidates.length) {
      this.logoUrl.set(this.logoCandidates[this.currentLogoIndex]);
    }
  }

  ngOnInit() {
    // SEO / Metadata
    try {
      this.titleService.setTitle('MiAplicación | Automatiza tu Gestión Empresarial y Automatización SaaS');
      this.metaService.updateTag({ name: 'description', content: 'Plataforma SaaS para centralizar la gestión de tu equipo. Automatiza flujos de trabajo, gestiona tu bolsa de empleo y protege tus datos con seguridad de grado bancario.' });
      this.metaService.updateTag({ property: 'og:title', content: 'MiAplicación: Gestión de RRHH Inteligente' });
      this.metaService.updateTag({ property: 'og:description', content: 'Centraliza tu equipo y automatiza procesos con total seguridad.' });
      this.metaService.updateTag({ property: 'og:type', content: 'website' });
      this.metaService.updateTag({ property: 'og:url', content: 'https://www.appmiaplicacion.com' });
    } catch (e) {
      // Best-effort: don't break the UI if platform-browser is unavailable in some environments
      const errMsg = (e as any)?.message ?? String(e);
      console.warn('Could not set meta tags:', errMsg);
    }

    // Ensure the default logo is the public asset (overrides candidate order)
    this.logoUrl.set('/api/public/assets/images/logo.png');

    this.loadTheme();
    this.loadCurrentCompany();
    this.loadUserInfo();
    this.dashboardService.loadUserModules().subscribe(modules => {
      this.menuItems.set(this.mapModules(modules));
    });
  }

  private mapModules(modules: ModuleDto[]): MenuItem[] {
    return modules.map(m => ({
      ...m,
      isOpen: false,
      children: m.children ? this.mapModules(m.children) : []
    }));
  }



  private loadTheme() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode.set(
        savedTheme === 'dark' ||
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
      this.applyTheme();
    }
  }

  private loadCurrentCompany() {
    this.http.get<Company>('/api/companies/current').subscribe({
      next: (company) => {
        if (company && company.id) {
          this.selectedCompany.set(company);
          this.selectedCompanyId = company.id;
        }
      }
    });

    this.http.get<Company[]>('/api/companies/available').subscribe({
      next: (companies) => this.companies.set(companies)
    });
  }

  private loadUserInfo() {
    this.http.get<any>('/api/auth/me').subscribe({
      next: (user) => {
        if (user) {
          this.userInfo.set({
            username: user.firstName || user.username,
            role: user.isSuperAdmin ? 'Super Admin' : 'Administrador'
          });
        }
      }
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  toggleSubmenu(item: MenuItem) {
    item.isOpen = !item.isOpen;
    this.menuItems.set([...this.menuItems()]);
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
  }

  private applyTheme() {
    if (typeof document !== 'undefined') {
      if (this.isDarkMode()) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  onCompanyChange(event: any) {
    const companyId = event.value;
    this.http.post('/api/companies/select', { companyId }).subscribe({
      next: () => {
        const company = this.companies().find(c => c.id === companyId);
        if (company) {
          this.selectedCompany.set(company);
        }
        window.location.reload();
      }
    });
  }

  logout() {
    this.http.post('/api/auth/logout', {}).subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
