import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-slate-900 font-sans">
      <!-- Ornaments -->
      <div class="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-400/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div class="relative max-w-6xl mx-auto px-6 z-10">
        <!-- Back Button -->
        <a routerLink="/" class="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all mb-12 border border-slate-100 dark:border-white/5 shadow-sm">
          <i class="pi pi-arrow-left transition-transform group-hover:-translate-x-1"></i>
          Volver al inicio
        </a>

        <!-- Header -->
        <div class="mb-16 pb-12">
          <h1 class="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
            Política de <span class="text-primary italic">Privacidad</span>
          </h1>
          <div class="flex flex-wrap items-center gap-4">
            <span class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Versión 1.1 (Actualizada Diciembre 2025)
            </span>
            <span class="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/5">
              Habeas Data Ley 1581
            </span>
          </div>
        </div>

        <!-- MAIN LAYOUT -->
        <div class="grid lg:grid-cols-[1fr_320px] gap-16">
          
          <div class="space-y-20">
            
            <!-- SUMMARY CARD -->
            <section class="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group">
               <div class="absolute right-0 top-0 w-64 h-64 bg-primary/20 blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
               <div class="relative z-10">
                  <h3 class="text-2xl font-black mb-6 flex items-center gap-3">
                    <i class="pi pi-shield text-primary"></i>
                    Compromiso de Seguridad
                  </h3>
                  <p class="text-slate-400 leading-relaxed text-lg font-medium">
                    En MiAplicación, protegemos tus datos empresariales como si fueran propios. No vendemos información a terceros y cumplimos estrictamente con el marco legal colombiano.
                  </p>
               </div>
            </section>

            <!-- SECTIONS -->
            <div class="space-y-24">
               
               <!-- Section 1 -->
               <section id="responsable" class="scroll-mt-32 group">
                 <div class="flex gap-8">
                   <div class="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm border border-slate-100 dark:border-white/5">
                     <i class="pi pi-id-card text-2xl"></i>
                   </div>
                   <div class="flex-1">
                     <h2 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-8">1. El Responsable</h2>
                     <div class="grid sm:grid-cols-2 gap-6">
                        <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                           <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">PROVEEDOR (Encargado)</p>
                           <p class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase leading-none mb-1">Johan Ospitia</p>
                           <p class="text-xs text-slate-500">jjohanospitia@gmail.com</p>
                        </div>
                        <div class="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                           <p class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">EL CLIENTE (Responsable)</p>
                           <p class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase leading-none mb-1">Tu Empresa</p>
                           <p class="text-xs text-slate-500">Titular de los datos originales</p>
                        </div>
                     </div>
                   </div>
                 </div>
               </section>

               <!-- Section 2 -->
               <section id="finalidad" class="scroll-mt-32">
                 <div class="flex gap-8">
                    <div class="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm border border-slate-100 dark:border-white/5">
                      <i class="pi pi-check-square text-2xl"></i>
                    </div>
                    <div class="flex-1">
                      <h2 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-8">2. Finalidad del Uso</h2>
                      <p class="text-lg text-slate-500 dark:text-slate-400 mb-10">Tratamos los datos ingresados exclusivamente para el funcionamiento de los módulos SaaS:</p>
                      
                      <div class="grid sm:grid-cols-2 gap-4">
                         <div class="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <i class="pi pi-users text-primary"></i>
                            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Gestión de Nómina y RRHH</span>
                         </div>
                         <div class="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <i class="pi pi-chart-bar text-primary"></i>
                            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Análisis Corporativo</span>
                         </div>
                         <div class="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <i class="pi pi-database text-primary"></i>
                            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Respaldo de Información</span>
                         </div>
                         <div class="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <i class="pi pi-lock text-primary"></i>
                            <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Seguridad y Auditoría</span>
                         </div>
                      </div>
                    </div>
                 </div>
               </section>

               <!-- Section 3 -->
               <section id="sensibles" class="scroll-mt-32">
                  <div class="flex gap-8">
                     <div class="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30">
                       <i class="pi pi-exclamation-circle text-2xl"></i>
                     </div>
                     <div class="flex-1">
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-8">3. Datos Sensibles</h2>
                        <div class="p-10 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-white/10 space-y-6">
                           <p class="text-slate-600 dark:text-slate-400 leading-relaxed italic">
                             "Dado que manejamos Nómina y Salud Ocupacional (SST), nos comprometemos a no utilizar estos datos para fines comerciales propios bajo ninguna circunstancia."
                           </p>
                           <div class="flex flex-wrap gap-4">
                              <span class="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-500">Cero Venta a Terceros</span>
                              <span class="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] font-black uppercase text-slate-500">Encriptación de Nivel Bancario</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

               <!-- Section 4 -->
               <section id="derechos" class="scroll-mt-32">
                  <div class="flex gap-8">
                     <div class="w-16 h-16 rounded-3xl bg-sky-500 flex items-center justify-center text-white shadow-xl shadow-sky-500/30">
                       <i class="pi pi-user-plus text-2xl"></i>
                     </div>
                     <div class="flex-1">
                        <h2 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-10">4. Tus Derechos</h2>
                        <div class="space-y-4">
                           <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 flex items-start gap-4 border border-slate-100 dark:border-white/5">
                              <div class="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">1</div>
                              <p class="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">Poder conocer, actualizar y rectificar tus datos personales en cualquier momento.</p>
                           </div>
                           <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 flex items-start gap-4 border border-slate-100 dark:border-white/5">
                              <div class="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">2</div>
                              <p class="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">Solicitar prueba de la autorización otorgada a la plataforma.</p>
                           </div>
                           <div class="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 flex items-start gap-4 border border-slate-100 dark:border-white/5">
                              <div class="w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-500 flex items-center justify-center shrink-0">3</div>
                              <p class="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed">Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </section>

            </div>

             <!-- FOOTER -->
             <div class="pt-24 border-t border-slate-100 dark:border-white/5 flex flex-col items-center gap-4">
                <p class="text-[10px] font-black uppercase tracking-widest text-slate-400">Canal de atención:</p>
                <div class="p-4 px-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-white/5 text-lg font-black text-slate-900 dark:text-white">
                  jjohanospitia@gmail.com
                </div>
             </div>

          </div>

          <!-- SIDEBAR -->
          <aside class="hidden lg:block">
            <div class="sticky top-32 space-y-8">
              
              <!-- Quick Nav -->
              <div class="bg-white dark:bg-slate-800/40 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/40 dark:shadow-none border border-white dark:border-white/5 backdrop-blur-xl">
                 <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10 italic">Secciones</h4>
                 <nav class="space-y-6">
                    <a href="privacy#responsable" class="group flex items-center gap-4 text-[11px] font-black text-slate-500 hover:text-primary transition-all uppercase">
                       <span class="w-2 h-1 bg-slate-200 dark:bg-slate-700 group-hover:w-4 group-hover:bg-primary transition-all"></span>
                       Responsable
                    </a>
                    <a href="privacy#finalidad" class="group flex items-center gap-4 text-[11px] font-black text-slate-500 hover:text-primary transition-all uppercase">
                       <span class="w-2 h-1 bg-slate-200 dark:bg-slate-700 group-hover:w-4 group-hover:bg-primary transition-all"></span>
                       Finalidad
                    </a>
                    <a href="privacy#sensibles" class="group flex items-center gap-4 text-[11px] font-black text-slate-500 hover:text-primary transition-all uppercase">
                       <span class="w-2 h-1 bg-slate-200 dark:bg-slate-700 group-hover:w-4 group-hover:bg-primary transition-all"></span>
                       Sensibles
                    </a>
                    <a href="privacy#derechos" class="group flex items-center gap-4 text-[11px] font-black text-slate-500 hover:text-primary transition-all uppercase">
                       <span class="w-2 h-1 bg-slate-200 dark:bg-slate-700 group-hover:w-4 group-hover:bg-primary transition-all"></span>
                       Derechos
                    </a>
                 </nav>
              </div>

               <!-- Help Card -->
               <div class="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                  <i class="pi pi-lock text-4xl mb-6 text-primary"></i>
                  <h5 class="text-xl font-black mb-4">Seguridad ISO</h5>
                  <p class="text-xs text-slate-400 leading-relaxed mb-8">Utilizamos estándares de encriptación para asegurar que tu información corporativa esté siempre protegida.</p>
                  <a routerLink="/#contact" class="flex items-center justify-center p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase transition-all tracking-widest">
                    Consultar Seguridad
                  </a>
               </div>

            </div>
          </aside>

        </div>
      </div>
    </main>
  `,
  styles: [`
    :host { display: block; }
    html { scroll-behavior: smooth; }
  `]
})
export class PrivacyComponent { }
