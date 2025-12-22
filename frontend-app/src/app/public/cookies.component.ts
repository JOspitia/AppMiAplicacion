import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-slate-900 font-sans">
      <!-- Background Ornament -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div class="relative max-w-5xl mx-auto px-6 z-10">
        <!-- Back Button -->
        <a routerLink="/" class="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all mb-12 border border-slate-100 dark:border-white/5 shadow-sm">
          <i class="pi pi-arrow-left transition-transform group-hover:-translate-x-1"></i>
          Volver al inicio
        </a>

        <!-- Header -->
        <div class="mb-24 text-center">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-primary/10 text-primary mb-10 shadow-inner">
             <i class="pi pi-database text-4xl"></i>
          </div>
          <h1 class="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
            Política de <span class="text-primary italic">Cookies</span>
          </h1>
          <p class="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Transparencia total sobre cómo MiAplicación utiliza pequeñas piezas de información para mejorar tu experiencia profesional.
          </p>
        </div>

        <!-- CONTENT LAYOUT -->
        <div class="space-y-32">
           
           <!-- Section 1 -->
           <section class="max-w-3xl mx-auto text-center">
             <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6">Fundamentos</h4>
              <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-6">1. ¿Qué son las Cookies?</h2>
              <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-lg">
                Una cookie es un pequeño archivo de texto que se almacena en su navegador cuando visita cualquier página web. Su única función en nuestra plataforma es recordar que has iniciado sesión para que no tengas que ingresar tus credenciales en cada clic.
              </p>
           </section>

           <!-- Section 2: Technical Grid -->
           <section class="p-16 rounded-[4rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
              <div class="grid lg:grid-cols-2 gap-16 items-center">
                 <div>
                    <h2 class="text-3xl font-black text-slate-900 dark:text-white mb-6 leading-tight">2. ¿Qué tipos de Cookies utiliza este software?</h2>
                    <p class="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-medium">
                      Utilizamos únicamente <strong class="text-slate-900 dark:text-white border-b-2 border-primary/30">cookies técnicas strictly necesarias</strong>. Sin ellas, los servicios de nómina y RRHH no podrían funcionar de forma segura.
                    </p>
                    <div class="flex flex-wrap gap-4">
                       <span class="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm italic text-xs font-bold text-slate-500">
                         <i class="pi pi-hashtag text-primary"></i>
                         RRHH_SESSION_ID
                       </span>
                       <span class="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm italic text-xs font-bold text-slate-500">
                         <i class="pi pi-palette text-primary"></i>
                         Preference (Theme)
                       </span>
                    </div>
                 </div>
                 <div class="grid grid-cols-2 gap-4">
                    <div class="aspect-square bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5">
                       <i class="pi pi-lock text-3xl text-primary/40"></i>
                    </div>
                    <div class="aspect-square bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-white/5 mt-8">
                       <i class="pi pi-shield text-3xl text-primary/40"></i>
                    </div>
                 </div>
              </div>
           </section>

           <!-- Section 3: Transparency Card -->
           <section class="bg-primary rounded-[4rem] p-16 text-white text-center relative overflow-hidden group">
              <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
              <div class="relative z-10 transition-transform duration-500 group-hover:scale-105">
                 <h2 class="text-4xl font-black mb-6">Cero Publicidad</h2>
                 <p class="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium italic">
                   "Queremos ser absolutamente claros: No utilizamos cookies de terceros para fines publicitarios, re-marketing o seguimiento de comportamiento. Tus datos son privados."
                 </p>
              </div>
           </section>

           <!-- Section 4 -->
           <section class="max-w-3xl mx-auto grid sm:grid-cols-2 gap-12 pt-12 items-start">
             <div class="space-y-6">
                <h3 class="text-xl font-black text-slate-900 dark:text-white">Administración</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Puedes bloquear las cookies desde la configuración de tu navegador (Chrome, Safari, Firefox). Ten en cuenta que esto impedirá el acceso a las funciones principales de la plataforma.
                </p>
             </div>
             <div class="space-y-6">
                <h3 class="text-xl font-black text-slate-900 dark:text-white">Contacto</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed italic">
                  Si tienes dudas, escríbenos a <strong class="text-primary hover:underline">jjohanospitia@gmail.com</strong> detallando tu consulta sobre esta política.
                </p>
             </div>
           </section>

        </div>
      </div>
    </main>
  `,
  styles: [`
    :host { display: block; }
    html { scroll-behavior: smooth; }
  `]
})
export class CookiesComponent { }
