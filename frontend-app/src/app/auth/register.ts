import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { AuthService, User } from '../core/services/auth.service';

@Component({
  selector: 'app-register',
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
    <div class="min-h-screen bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden transition-colors duration-300">
      <!-- Background Ornaments -->
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2 opacity-50"></div>
      <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2 opacity-30"></div>

      <!-- Top Left: Back Button -->
      <a 
        routerLink="/login"
        class="absolute top-6 left-6 z-50 group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 hover:text-primary transition-all border border-slate-200 dark:border-white/10 shadow-sm"
      >
        <i class="pi pi-arrow-left transition-transform group-hover:-translate-x-1"></i>
        Regresar al login
      </a>

      <!-- Top Right: Theme Toggle -->
      <button 
        (click)="toggleTheme()"
        class="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-white/5 backdrop-blur-md hover:scale-105 transition-all shadow-sm"
      >
        <i class="pi" [ngClass]="isDarkMode() ? 'pi-sun text-yellow-400' : 'pi-moon text-slate-600'"></i>
      </button>

      <!-- Register Card -->
      <div class="w-full max-w-[640px] bg-white dark:bg-[#1E293B] rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 p-8 lg:p-12 border border-slate-100 dark:border-white/5 relative z-10 mx-auto animate-fadeinup overflow-hidden">
        
        <!-- Decoration Glows -->
        <div class="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>
        <div class="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>

        <!-- Header -->
        <div class="text-center mb-10 relative">
          <div class="w-16 h-16 mx-auto mb-6 text-primary flex items-center justify-center">
             <i class="pi pi-user-plus text-4xl dark:text-indigo-400"></i>
             <div class="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
          </div>
          <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Crear Cuenta</h1>
          <p class="text-slate-500 dark:text-slate-400 font-medium">Únete a nuestra plataforma SaaS</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-8 relative">
          
          <!-- Section 1: User Info -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 mb-2">
              <span class="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-black">1</span>
              <h2 class="text-sm font-black uppercase tracking-widest text-slate-400">Información Personal</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Username -->
              <div class="md:col-span-2 space-y-2">
                <label class="block text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre de Usuario</label>
                <div class="relative group">
                  <i class="pi pi-at absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors z-10"></i>
                  <input pInputText formControlName="username" class="w-full !rounded-2xl !py-3.5 !pl-11 !bg-slate-50 dark:!bg-[#0f172a] !border-slate-200 dark:!border-slate-700 text-slate-900 dark:text-slate-100 focus:!border-primary transition-all font-semibold" placeholder="usuario123" />
                </div>
              </div>

              <!-- Email -->
              <div class="md:col-span-2 space-y-2">
                <label class="block text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Correo Electrónico</label>
                <div class="relative group">
                  <i class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors z-10"></i>
                  <input pInputText formControlName="email" class="w-full !rounded-2xl !py-3.5 !pl-11 !bg-slate-50 dark:!bg-[#0f172a] !border-slate-200 dark:!border-slate-700 text-slate-900 dark:text-slate-100 focus:!border-primary transition-all font-semibold" placeholder="correo@empresa.com" />
                </div>
              </div>

              <!-- Names -->
              <div class="space-y-2">
                <label class="block text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Nombre</label>
                <input pInputText formControlName="firstName" class="w-full !rounded-2xl !py-3.5 !px-5 !bg-slate-50 dark:!bg-[#0f172a] !border-slate-200 dark:!border-slate-700 text-slate-900 dark:text-slate-100 focus:!border-primary transition-all font-semibold" placeholder="Tu nombre" />
              </div>
              <div class="space-y-2">
                <label class="block text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Apellido</label>
                <input pInputText formControlName="firstSurname" class="w-full !rounded-2xl !py-3.5 !px-5 !bg-slate-50 dark:!bg-[#0f172a] !border-slate-200 dark:!border-slate-700 text-slate-900 dark:text-slate-100 focus:!border-primary transition-all font-semibold" placeholder="Tu apellido" />
              </div>
            </div>
          </div>

          <!-- Section 2: Security -->
          <div class="space-y-6">
            <div class="flex items-center gap-3 mb-2">
              <span class="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-black">2</span>
              <h2 class="text-sm font-black uppercase tracking-widest text-slate-400">Seguridad</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Password -->
              <div class="space-y-2">
                <label class="block text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Contraseña</label>
                <p-password formControlName="password" [feedback]="true" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full !rounded-2xl !py-3.5 !pl-5 !bg-slate-50 dark:!bg-[#0f172a] !border-slate-200 dark:!border-slate-700 text-slate-900 dark:text-slate-100 focus:!border-primary transition-all font-semibold" placeholder="••••••••" promptLabel="Escribe una contraseña" weakLabel="Débil" mediumLabel="Media" strongLabel="Fuerte"></p-password>
              </div>

              <!-- Confirm Password -->
              <div class="space-y-2">
                <label class="block text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Confirmar</label>
                <p-password formControlName="confirmPassword" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full !rounded-2xl !py-3.5 !pl-5 !bg-slate-50 dark:!bg-[#0f172a] !border-slate-200 dark:!border-slate-700 text-slate-900 dark:text-slate-100 focus:!border-primary transition-all font-semibold" placeholder="••••••••"></p-password>
              </div>
            </div>
            
            <!-- Validation Errors -->
            <div *ngIf="registerForm.hasError('mismatch') && registerForm.get('confirmPassword')?.touched" class="text-red-500 text-xs font-bold flex items-center gap-1 animate-fadein">
              <i class="pi pi-exclamation-circle"></i> Las contraseñas no coinciden
            </div>
          </div>

          <!-- Submit -->
          <div class="pt-4">
            <p-button 
                type="submit" 
                [loading]="loading" 
                label="CREAR MI CUENTA" 
                [disabled]="registerForm.invalid" 
                styleClass="w-full !rounded-2xl !py-4 !bg-primary hover:!bg-indigo-500 !border-0 !font-black !tracking-widest !uppercase !text-white !text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all">
            </p-button>
            <p class="text-[10px] text-slate-400 text-center mt-6 leading-relaxed uppercase tracking-widest">
              Al registrarte, aceptas nuestros <a routerLink="/terms" class="hover:text-primary underline">Términos</a> y <a routerLink="/privacy" class="hover:text-primary underline">Privacidad</a>
            </p>
          </div>

          <!-- Error Message -->
          <div *ngIf="error" class="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-bold flex items-start gap-3 animate-fadein">
            <i class="pi pi-exclamation-circle text-lg mt-0.5"></i>
            <span class="leading-tight">{{ error }}</span>
          </div>

          <!-- Success Message -->
          <div *ngIf="success" class="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 p-4 rounded-xl text-sm font-bold flex items-start gap-3 animate-fadein">
            <i class="pi pi-check-circle text-lg mt-0.5"></i>
            <span class="leading-tight">{{ success }} Ingresa ahora.</span>
          </div>

        </form>

        <!-- Footer -->
        <div class="mt-12 text-center pt-8 border-t border-slate-100 dark:border-white/5">
          <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
            ¿Ya tienes cuenta? 
            <a routerLink="/login" class="font-black text-primary hover:text-indigo-400 transition-colors ml-1">Inicia Sesión</a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  error = '';
  success = '';
  isDarkMode = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      firstSurname: ['', [Validators.required, Validators.maxLength(50)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode.set(savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches));
      this.applyTheme();
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
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

  onSubmit() {
    if (this.registerForm.valid) {
      this.loading = true;
      this.error = '';
      this.success = '';

      const { confirmPassword, ...registerData } = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (res: User) => {
          this.loading = false;
          this.success = res.message;
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.error || 'Ocurrió un error al registrar el usuario.';
        }
      });
    }
  }
}
