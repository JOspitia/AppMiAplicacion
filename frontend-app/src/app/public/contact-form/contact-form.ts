import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    ButtonModule,
    RippleModule
  ],
  template: `
    <section id="contact" class="py-24 bg-slate-50 dark:bg-slate-950/50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          
          <!-- Text Content -->
          <div>
            <span class="inline-flex items-center px-4 py-2 text-[10px] font-bold uppercase tracking-widest badge-indigo rounded-full mb-6">
              Contacto
            </span>
            <h2 class="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 leading-tight">
              Atención Personalizada
            </h2>
            <p class="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
              ¿Tienes dudas sobre cómo MiAplicación puede ayudar a tu empresa? Nuestro equipo está listo para brindarte una consultoría personalizada y mostrarte la mejor solución para tu gestión.
            </p>

            <ul class="space-y-6">
               <li class="flex items-center gap-4 group">
                  <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <i class="pi pi-check-circle"></i>
                  </div>
                  <span class="text-slate-700 dark:text-slate-300 font-medium">Consultoría personalizada de 30 minutos</span>
               </li>
               <li class="flex items-center gap-4 group">
                  <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <i class="pi pi-check-circle"></i>
                  </div>
                  <span class="text-slate-700 dark:text-slate-300 font-medium">Sin compromiso ni tarjeta de crédito</span>
               </li>
               <li class="flex items-center gap-4 group">
                  <div class="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <i class="pi pi-check-circle"></i>
                  </div>
                  <span class="text-slate-700 dark:text-slate-300 font-medium">Respuesta en menos de 24 horas</span>
               </li>
            </ul>
          </div>

          <!-- Form Card -->
          <div class="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-white/5 relative overflow-hidden">
            <!-- Decorative gradient -->
            <div class="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full"></div>
            
            <form class="space-y-6 relative z-10">
              <div class="space-y-2">
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400">Nombre completo</label>
                <input 
                  type="text" 
                  pInputText 
                  placeholder="Tu nombre" 
                  class="w-full !bg-slate-50 dark:!bg-slate-800/50 !border-slate-100 dark:!border-white/5 !rounded-2xl !p-4 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400">Correo electrónico</label>
                <input 
                  type="email" 
                  pInputText 
                  placeholder="tu@empresa.com" 
                  class="w-full !bg-slate-50 dark:!bg-slate-800/50 !border-slate-100 dark:!border-white/5 !rounded-2xl !p-4 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400">Empresa</label>
                <input 
                  type="text" 
                  pInputText 
                  placeholder="Nombre de tu empresa" 
                  class="w-full !bg-slate-50 dark:!bg-slate-800/50 !border-slate-100 dark:!border-white/5 !rounded-2xl !p-4 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                />
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-bold uppercase tracking-widest text-slate-400">Mensaje (opcional)</label>
                <textarea 
                  pTextarea 
                  [autoResize]="true" 
                  placeholder="¿En qué podemos ayudarte?" 
                  rows="4"
                  class="w-full !bg-slate-50 dark:!bg-slate-800/50 !border-slate-100 dark:!border-white/5 !rounded-2xl !p-4 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                ></textarea>
              </div>

              <button 
                pButton pRipple 
                label="ENVIAR MENSAJE" 
                class="w-full !bg-indigo-600 !border-indigo-600 font-black tracking-widest py-5 rounded-2xl shadow-xl shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 transition-all text-white"
              ></button>

              <p class="text-center text-[10px] text-slate-400">
                Al enviar, aceptas nuestra <a routerLink="/privacy" class="text-indigo-600 hover:underline cursor-pointer">Política de Privacidad</a>.
              </p>
            </form>
          </div>

        </div>
      </div>
    </section>
  `,
  styles: [`
    :host ::ng-deep {
      .p-inputtext:focus {
        border-color: var(--primary-color) !important;
      }
    }
  `]
})
export class ContactFormComponent { }
