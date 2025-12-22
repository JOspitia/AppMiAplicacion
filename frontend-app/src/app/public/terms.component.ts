import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="relative pt-32 pb-20 overflow-hidden bg-white dark:bg-slate-900 font-sans">
      <!-- Background Ornament -->
      <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div class="relative max-w-6xl mx-auto px-6 z-10">
        <!-- Back Button -->
        <a routerLink="/" class="group inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-700 transition-all mb-12 border border-slate-100 dark:border-white/5 shadow-sm">
          <i class="pi pi-arrow-left transition-transform group-hover:-translate-x-1"></i>
          Volver al inicio
        </a>

        <!-- Header -->
        <div class="mb-16 pb-12">
          <h1 class="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
            Términos <span class="text-primary italic">y</span> Condiciones
          </h1>
          <div class="flex flex-wrap items-center gap-4">
            <span class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Versión 1.0 (Diciembre 2025)
            </span>
            <span class="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10">
              Vigencia para Colombia
            </span>
          </div>
        </div>

        <div class="grid lg:grid-cols-[1fr_320px] gap-16">
          
          <!-- MAIN CONTENT -->
          <div class="space-y-20">
            
            <!-- INTRO -->
            <section class="relative p-10 rounded-[3rem] bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden group">
              <div class="absolute -right-8 -bottom-8 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                <i class="pi pi-file-pdf text-[140px]"></i>
              </div>
              <p class="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic relative z-10">
                "Este documento constituye un contrato de adhesión legal entre MiAplicación y el Usuario. Al acceder y registrarte, manifiestas tu consentimiento expreso para vincularte a las siguientes cláusulas."
              </p>
            </section>

            <!-- SECTIONS -->
            <div class="space-y-24">
              
              <!-- 1. Objeto -->
              <section id="objeto" class="scroll-mt-32">
                <div class="flex items-start gap-8">
                  <div class="w-16 h-16 min-w-[64px] rounded-[1.5rem] bg-primary flex items-center justify-center text-white shadow-2xl shadow-primary/40">
                    <i class="pi pi-map text-3xl"></i>
                  </div>
                  <div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-10">1. Objeto y Alcance</h2>
                    <div class="space-y-12">
                       <div class="relative pl-10 border-l-2 border-primary/20">
                          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">1.1. Licencia de Uso</h4>
                          <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">Otorgamos una licencia de uso no exclusiva, intransferible y revocable para acceder a nuestra infraestructura de gestión en la nube.</p>
                       </div>
                       <div class="relative pl-10 border-l-2 border-primary/20">
                          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">1.2. De Medio, No de Resultado</h4>
                          <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">Nuestra obligación es suministrar la herramienta tecnológica. El éxito administrativo y legal de la gestión depende del <strong class="text-slate-900 dark:text-white">uso proactivo</strong> del Cliente.</p>
                       </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 2. Comercial -->
              <section id="comercial" class="scroll-mt-32">
                <div class="flex items-start gap-8">
                  <div class="w-16 h-16 min-w-[64px] rounded-[1.5rem] bg-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40">
                    <i class="pi pi-credit-card text-3xl"></i>
                  </div>
                  <div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-10">2. Condiciones de Pago</h2>
                    <div class="space-y-12">
                       <div class="relative pl-10 border-l-2 border-indigo-200 dark:border-indigo-500/20">
                          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-4 font-semibold text-primary">2.1. Tarifa Plana Prepago</h4>
                          <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">El servicio se factura por mes anticipado a través de <strong class="text-slate-900 dark:text-white text-primary">Mercado Pago</strong>. No somos responsables de IVA bajo el Art. 437 del E.T.</p>
                       </div>
                       <div class="relative pl-10 border-l-2 border-indigo-200 dark:border-indigo-500/20">
                          <h4 class="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-4 font-semibold text-primary text-primary">2.2. Política de Suspensión</h4>
                          <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">Tras 3 días de mora, el sistema inhabilita las funciones principales automáticamente hasta saldar la deuda.</p>
                       </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 3. Propiedad -->
              <section id="propiedad" class="scroll-mt-32">
                <div class="flex items-start gap-8">
                  <div class="w-16 h-16 min-w-[64px] rounded-[1.5rem] bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white shadow-2xl">
                    <i class="pi pi-shield text-3xl"></i>
                  </div>
                  <div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-10">3. Propiedad Intelectual</h2>
                    <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10 font-medium">Bajo la Ley 23 de 1982, Johan Ospitia es el único autor y titular de los derechos de autor de MiAplicación.</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                       <div class="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-100 dark:border-white/5">
                          <i class="pi pi-times-circle text-red-500 mb-3 text-xl"></i>
                          <p class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">Ingeniería Inversa</p>
                          <p class="text-xs text-slate-500 mt-2">Terminantemente prohibido intentar extraer o copiar el código fuente.</p>
                       </div>
                       <div class="p-6 bg-slate-50 dark:bg-slate-800/60 rounded-3xl border border-slate-100 dark:border-white/5">
                          <i class="pi pi-user-minus text-red-500 mb-3 text-xl"></i>
                          <p class="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase">Sub-Licenciamiento</p>
                          <p class="text-xs text-slate-500 mt-2">No puedes vender ni alquilar tu acceso a terceros ajenos a tu empresa.</p>
                       </div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- 4. Responsabilidad -->
              <section id="responsabilidad" class="scroll-mt-32">
                <div class="flex items-start gap-8">
                  <div class="w-16 h-16 min-w-[64px] rounded-[1.5rem] bg-orange-500 flex items-center justify-center text-white shadow-2xl shadow-orange-500/40">
                    <i class="pi pi-exclamation-triangle text-3xl"></i>
                  </div>
                  <div>
                    <h2 class="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-10">4. Limitación de Responsabilidad</h2>
                    <div class="p-10 bg-orange-50/50 dark:bg-orange-500/5 rounded-[3rem] border-2 border-orange-100 dark:border-orange-500/20 relative">
                      <div class="absolute top-0 right-0 p-4 opacity-10">
                         <i class="pi pi-ban text-4xl"></i>
                      </div>
                      <p class="text-slate-700 dark:text-slate-300 leading-relaxed font-bold text-lg mb-4">
                        Cláusula de Indemnidad:
                      </p>
                      <p class="text-slate-600 dark:text-slate-400">
                        No asumimos responsabilidad por errores de liquidación de nómina, aportes o sanciones de la UGPP derivados de datos erróneos ingresados por EL CLIENTE.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

            </div>

             <!-- FOOTER LEGAL -->
             <div class="pt-24 border-t border-slate-100 dark:border-white/5 flex flex-col items-center gap-8">
                <div class="flex items-center gap-3">
                   <div class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                   <div class="w-24 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                   <div class="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></div>
                </div>
                <div class="grid sm:grid-cols-3 gap-12 w-full text-center">
                  <div>
                    <h5 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Domicilio</h5>
                    <p class="text-xs font-bold text-slate-600 dark:text-slate-400">Cali, Valle del Cauca</p>
                  </div>
                  <div>
                    <h5 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Contacto Oficial</h5>
                    <p class="text-xs font-bold text-slate-600 dark:text-slate-400">jjohanospitia@gmail.com</p>
                  </div>
                  <div>
                    <h5 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Soporte</h5>
                    <p class="text-xs font-bold text-slate-600 dark:text-slate-400">+57 322 359 5445</p>
                  </div>
                </div>
             </div>

          </div>

          <!-- SIDEBAR NAV -->
          <aside class="hidden lg:block">
            <div class="sticky top-32 space-y-8">
              
              <!-- Quick Nav -->
              <div class="bg-white dark:bg-slate-800/40 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/40 dark:shadow-none border border-white dark:border-white/5 backdrop-blur-xl">
                <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-10">CONTENIDO</h4>
                <nav class="space-y-6">
                  <a href="terms#objeto" class="group flex items-center gap-4 text-sm font-black text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    <span class="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-[11px] shadow-sm">1</span>
                    OBJETO
                  </a>
                  <a href="terms#comercial" class="group flex items-center gap-4 text-sm font-black text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    <span class="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all text-[11px] shadow-sm">2</span>
                    COMERCIAL
                  </a>
                  <a href="terms#propiedad" class="group flex items-center gap-4 text-sm font-black text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    <span class="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all text-[11px] shadow-sm">3</span>
                    PROPIEDAD
                  </a>
                  <a href="terms#responsabilidad" class="group flex items-center gap-4 text-sm font-black text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                    <span class="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all text-[11px] shadow-sm">4</span>
                    RESPONSABILIDAD
                  </a>
                </nav>
              </div>

              <!-- CTA Card -->
              <div class="bg-primary rounded-[3rem] p-10 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
                 <!-- Decoration -->
                 <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                 
                 <i class="pi pi-question-circle text-4xl mb-6 relative z-10"></i>
                 <h5 class="text-2xl font-black mb-4 relative z-10 leading-tight">¿Alguna<br>Duda Legal?</h5>
                 <p class="text-sm text-white/70 leading-relaxed mb-10 relative z-10">Si necesitas una aclaración sobre las cláusulas, estamos para ayudarte.</p>
                 <a routerLink="/#contact" class="inline-flex items-center justify-center w-full px-8 py-4 bg-white text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl active:scale-95">
                   CONTACTAR AHORA
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
export class TermsComponent { }
