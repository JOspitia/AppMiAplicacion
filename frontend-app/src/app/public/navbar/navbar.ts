import { Component, signal, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { BrandingService } from '../../core/services/branding.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, RippleModule],
  template: `
    <nav 
      class="fixed top-0 left-0 w-full z-50 h-[4.5rem] transition-all duration-500"
      [ngClass]="{
        'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5': scrolled(),
        'bg-transparent': !scrolled()
      }"
    >
      <div class="max-w-7xl mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <!-- Logo -->
        <div class="flex items-center gap-3 flex-shrink-0">
          <a routerLink="/" class="flex items-center gap-3 group">
            <div class="relative w-10 h-10 bg-indigo-600 rounded-2xl grid place-items-center shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-110 overflow-hidden border border-white/10">
              <img [src]="logoUrl()" alt="Logo" class="w-7 h-7 object-contain brightness-0 invert" />
            </div>
            <span class="text-xl font-black tracking-tighter text-slate-900 dark:text-white hidden sm:block">
              <span class="text-indigo-600">Mi</span>Aplicación
            </span>
          </a>
        </div>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center justify-center flex-1">
          <nav class="flex items-center gap-8">
            <a href="/#features" class="text-[13px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">Caracteristicas</a>
            <a href="/#platform" class="text-[13px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">Plataforma</a>
            <a routerLink="/pricing" class="text-[13px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">Precios</a>
            <a href="/#contact" class="text-[13px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors">Contacto</a>
          </nav>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <!-- Theme Toggle -->
          <button 
            (click)="toggleTheme()"
            class="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all active:scale-90"
          >
            <i class="pi" [ngClass]="isDarkMode() ? 'pi-sun' : 'pi-moon'"></i>
          </button>

          <div class="hidden sm:flex items-center gap-3">
            <a routerLink="/login" class="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all">Ingresar</a>
            <button 
              pButton pRipple 
              label="ATENCIÓN PERSONALIZADA" 
              class="p-button-sm font-black uppercase tracking-widest bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-500/25 px-7 py-3"
            ></button>
          </div>

          <!-- Mobile Toggle -->
          <button 
            (click)="mobileMenuOpen.set(true)"
            class="md:hidden p-2 text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <i class="pi pi-bars text-2xl"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- Mobile Menu Overlay -->
    <div 
      *ngIf="mobileMenuOpen()"
      class="fixed inset-0 z-[100] bg-white dark:bg-slate-900 p-6 flex flex-col gap-8 transition-all animate-fadein"
    >
      <div class="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-6">
        <span class="text-2xl font-black text-indigo-600">Menú</span>
        <button (click)="mobileMenuOpen.set(false)" class="p-2 text-slate-500">
          <i class="pi pi-times text-2xl"></i>
        </button>
      </div>
      <nav class="flex flex-col gap-2">
        <a (click)="mobileMenuOpen.set(false)" href="/#features" class="py-4 text-xl font-bold text-slate-700 dark:text-slate-200 border-b border-slate-50 dark:border-white/5">Características</a>
        <a (click)="mobileMenuOpen.set(false)" href="/#platform" class="py-4 text-xl font-bold text-slate-700 dark:text-slate-200 border-b border-slate-50 dark:border-white/5">Plataforma</a>
        <a (click)="mobileMenuOpen.set(false)" routerLink="/pricing" class="py-4 text-xl font-bold text-slate-700 dark:text-slate-200 border-b border-slate-50 dark:border-white/5">Precios</a>
        <a (click)="mobileMenuOpen.set(false)" routerLink="/login" class="mt-6 py-5 text-center text-xl font-black bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white rounded-2xl">Iniciar Sesión</a>
        <button 
           pButton pRipple 
           label="ATENCIÓN PERSONALIZADA" 
           class="w-full py-5 text-center text-xl font-black bg-indigo-600 text-white rounded-2xl"
        ></button>

        <!-- Mobile legal links -->
        <div class="mt-4 border-t border-slate-100 dark:border-white/5 pt-4 flex flex-col gap-2">
          <a (click)="mobileMenuOpen.set(false)" routerLink="/terms" class="text-lg font-semibold text-slate-700 dark:text-slate-200">Términos</a>
          <a (click)="mobileMenuOpen.set(false)" routerLink="/privacy" class="text-lg font-semibold text-slate-700 dark:text-slate-200">Privacidad</a>
          <a (click)="mobileMenuOpen.set(false)" routerLink="/cookies" class="text-lg font-semibold text-slate-700 dark:text-slate-200">Cookies</a>
        </div>
      </nav>
    </div>
  `
})
export class NavbarComponent implements OnInit {
  private brandingService = inject(BrandingService);

  scrolled = signal(false);
  isDarkMode = signal(false);
  mobileMenuOpen = signal(false);

  logoUrl = this.brandingService.currentLogo;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode.set(savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches));
      this.applyTheme();
    }
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
}
