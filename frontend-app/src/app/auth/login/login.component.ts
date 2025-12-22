import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    MessageModule
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      <!-- Background Ornaments -->
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 opacity-50"></div>
      <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2 opacity-30"></div>

      <!-- Top Left: Back Button -->
      <a 
        routerLink="/"
        class="absolute top-6 left-6 z-50 group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 hover:text-primary transition-all border border-slate-200 dark:border-white/10 shadow-sm"
      >
        <i class="pi pi-arrow-left transition-transform group-hover:-translate-x-1"></i>
        Volver al inicio
      </a>

      <!-- Top Right: Theme Toggle -->
      <button 
        (click)="toggleTheme()"
        class="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-white/5 backdrop-blur-md hover:scale-105 transition-all shadow-sm"
        aria-label="Toggle Theme"
      >
        <i class="pi" [ngClass]="isDarkMode() ? 'pi-sun text-yellow-400' : 'pi-moon text-slate-600'"></i>
      </button>

      <!-- Login Card -->
      <div class="w-full max-w-[440px] bg-white dark:bg-[#1E293B] rounded-[2rem] shadow-2xl shadow-indigo-500/10 p-8 sm:p-12 border border-slate-100 dark:border-white/5 relative z-10 mx-auto animate-fadeinup">
        
        <!-- Header -->
        <div class="text-center mb-10">
          <div class="w-16 h-16 mx-auto mb-6 text-primary flex items-center justify-center relative">
             <i class="pi pi-user text-4xl dark:text-indigo-400"></i>
             <div class="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
          </div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Bienvenido</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Ingresa a tu cuenta corporativa</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-6">
          
          <!-- User or Email -->
          <div class="space-y-2.5">
            <label for="usernameOrEmail" class="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Usuario o Correo</label>
            <div class="relative group">
              <i class="pi pi-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors z-10"></i>
              <input 
                pInputText 
                id="usernameOrEmail" 
                formControlName="usernameOrEmail" 
                class="w-full !rounded-2xl !py-4 !pl-11 !bg-slate-50 dark:!bg-[#0f172a] !border-slate-200 dark:!border-slate-700 text-slate-900 dark:text-slate-100 focus:!border-primary focus:!ring-4 focus:!ring-primary/10 transition-all font-semibold placeholder:text-slate-400" 
                placeholder="Identificador de usuario" 
              />
            </div>
            <small *ngIf="loginForm.get('usernameOrEmail')?.invalid && loginForm.get('usernameOrEmail')?.touched" class="text-red-500 text-xs font-bold ml-1 flex items-center gap-1">
              <i class="pi pi-exclamation-circle"></i> Identificador requerido
            </small>
          </div>

          <!-- Password -->
          <div class="space-y-2.5 text-primary">
            <label for="password" class="block text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 ml-1">Contraseña</label>
            <p-password 
              id="password" 
              formControlName="password" 
              [feedback]="false" 
              [toggleMask]="true" 
              styleClass="w-full" 
              inputStyleClass="w-full !rounded-2xl !py-4 !pl-4 !bg-slate-50 dark:!bg-[#0f172a] !border-slate-200 dark:!border-slate-700 text-slate-900 dark:text-slate-100 focus:!border-primary focus:!ring-4 focus:!ring-primary/10 transition-all font-semibold placeholder:text-slate-400" 
              placeholder="••••••••">
            </p-password>
          </div>

          <!-- Options -->
          <div class="flex items-center justify-between pt-1">
            <div class="flex items-center gap-2">
              <p-checkbox formControlName="remember" [binary]="true" inputId="remember" styleClass="scale-90"></p-checkbox>
              <label for="remember" class="text-sm text-slate-500 dark:text-slate-400 font-medium cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200 transition-colors">Recordarme</label>
            </div>
            <a href="#" class="text-sm font-bold text-primary hover:text-indigo-400 transition-colors">¿Olvidaste tu contraseña?</a>
          </div>

          <!-- Submit Button -->
          <div class="pt-6">
            <p-button 
                type="submit" 
                [loading]="loading" 
                label="INGRESAR" 
                [disabled]="loginForm.invalid" 
                styleClass="w-full !rounded-xl !py-4 !bg-primary hover:!bg-indigo-500 !border-0 !font-black !tracking-widest !uppercase !text-white !text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
            </p-button>
          </div>

          <!-- Error Message -->
          <div *ngIf="error" class="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-bold flex items-start gap-3 animate-fadein">
            <i class="pi pi-exclamation-circle text-lg mt-0.5"></i>
            <span class="leading-tight">{{ error }}</span>
          </div>

        </form>

        <!-- Footer Link -->
        <div class="mt-12 text-center space-y-4">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            ¿No tienes cuenta? 
            <a routerLink="/register" class="font-bold text-primary hover:text-indigo-400 transition-colors ml-1">Regístrate ahora</a>
          </p>
          <div class="h-px bg-slate-100 dark:bg-white/5 w-1/2 mx-auto"></div>
          <p class="text-xs text-slate-400">
            O si lo prefieres 
            <a routerLink="/landing" fragment="contact" class="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors ml-1 text-primary">Contactar Ventas</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  error = '';
  isDarkMode = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      usernameOrEmail: ['', [Validators.required]],
      password: ['', Validators.required],
      remember: [false]
    });
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

  countdown = signal(0);
  private timer: any;

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';
      this.loginForm.disable();

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.loading = false;

          // Company selection logic
          if (!response.companies || response.companies.length === 0) {
            this.error = 'No tienes acceso a ninguna empresa. Contacta a soporte.';
            this.loginForm.enable();
          } else if (response.companies.length === 1) {
            // Auto-select single company
            const companyId = response.companies[0].id;
            this.authService.selectCompany(companyId).subscribe({
              next: () => this.router.navigate(['/dashboard']),
              error: () => {
                this.error = 'Error al seleccionar la empresa';
                this.loginForm.enable();
              }
            });
          } else {
            // Navigate to company selector
            this.router.navigate(['/select-company']);
          }
        },
        error: (err) => {
          this.loading = false;
          this.loginForm.enable();

          if (err.status === 429) {
            this.startCountdown(60);
          } else if (err.status === 401) {
            this.error = 'Credenciales incorrectas. Verifique su usuario y contraseña.';
          } else {
            this.error = 'Ocurrió un error inesperado. Intente nuevamente.';
            console.error('Login error', err);
          }
        }
      });
    }
  }

  startCountdown(seconds: number) {
    this.countdown.set(seconds);
    this.loginForm.disable();
    this.error = `Límite de intentos seguridad excedido. Por favor espera ${seconds} segundos.`;

    this.timer = setInterval(() => {
      this.countdown.update(c => c - 1);
      const remaining = this.countdown();

      if (remaining > 0) {
        this.error = `Límite de intentos seguridad excedido. Por favor espera ${remaining} segundos.`;
      } else {
        this.stopCountdown();
      }
    }, 1000);
  }

  stopCountdown() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.countdown.set(0);
    this.error = '';
    this.loginForm.enable();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
