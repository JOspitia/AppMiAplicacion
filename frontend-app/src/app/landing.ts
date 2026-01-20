import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title, Meta } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';
import { HeroCarouselComponent } from './public/hero-carousel/hero-carousel';
import { ContactFormComponent } from './public/contact-form/contact-form';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule, RouterModule, HeroCarouselComponent, ContactFormComponent],
    template: `
    <!-- HERO SECTION -->
    <section class="relative w-full min-h-[90vh] flex flex-col pt-32 pb-20 overflow-hidden bg-white dark:bg-slate-900">
        <!-- Background Effects -->
        <div class="absolute inset-0 pointer-events-none">
            <div class="absolute -top-[10%] left-[25%] w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full"></div>
            <div class="absolute -bottom-[10%] right-[25%] w-[600px] h-[600px] bg-sky-500/5 blur-[120px] rounded-full"></div>
        </div>

        <div class="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center z-10">
            <!-- Text Content -->
            <div class="text-center lg:text-left">
                <span class="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest badge-indigo rounded-full mb-8 backdrop-blur-md">
                    <span class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                    Plataforma SaaS Empresarial
                </span>
                
                <h1 class="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-8 text-slate-900 dark:text-white">
                    Automatiza tu <br>
                    <span class="bg-gradient-to-r from-indigo-600 to-violet-400 bg-clip-text text-transparent">Gestión Empresarial</span>
                </h1>
                
                <p class="text-lg lg:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                    Centraliza la gestión de tu equipo, automatiza workflows y toma decisiones inteligentes con nuestra plataforma todo-en-uno.
                </p>
                
                <div class="flex flex-wrap gap-4 justify-center lg:justify-start mb-12">
                    <button pButton pRipple label="Atención Personalizada" icon="pi pi-arrow-right" iconPos="right" class="p-button-lg font-bold bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 rounded-2xl px-8 py-4 hover:scale-105 transition-transform"></button>
                    
                    <button pButton pRipple label="Ver Demo" icon="pi pi-play" class="p-button-lg p-button-outlined font-bold border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 rounded-2xl px-8 py-4"></button>
                </div>

                 <!-- Micro Stats -->
                <div class="flex gap-10 justify-center lg:justify-start pt-8 border-t border-slate-200 dark:border-white/5">
                    <div>
                        <span class="block text-2xl font-black text-indigo-600">500+</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Empresas</span>
                    </div>
                    <div>
                        <span class="block text-2xl font-black text-indigo-600">99.9%</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Uptime</span>
                    </div>
                    <div>
                        <span class="block text-2xl font-black text-indigo-600">24/7</span>
                        <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Soporte</span>
                    </div>
                </div>
            </div>

            <!-- Hero Carousel Component -->
            <app-hero-carousel></app-hero-carousel>
        </div>
    </section>

    <!-- FEATURES GRID -->
    <section id="features" class="py-24 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-white/5">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center mb-16 max-w-2xl mx-auto">
                <span class="text-indigo-600 font-bold tracking-widest text-xs uppercase mb-2 block">Características</span>
                <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-4">Todo lo que necesitas</h2>
                <p class="text-slate-500 dark:text-slate-400">Potentes herramientas diseñadas para escalar tu negocio sin complicaciones.</p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <!-- Feature 1 -->
                <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-1 hover:shadow-xl group">
                    <div class="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                        <i class="pi pi-bolt text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Automatización</h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        Integración nativa para crear flujos de trabajo automatizados que ahorran tiempo y reducen errores humanos.
                    </p>
                </div>

                <!-- Feature 2 -->
                 <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-1 hover:shadow-xl group">
                    <div class="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                        <i class="pi pi-shield text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Seguridad Total</h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        Protección de grado bancario para tus datos con encriptación de extremo a extremo y copias de seguridad automáticas.
                    </p>
                </div>

                <!-- Feature 3 -->
                 <div class="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-1 hover:shadow-xl group">
                    <div class="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                        <i class="pi pi-chart-line text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Analítica Avanzada</h3>
                    <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                        Visualiza el rendimiento de tu empresa en tiempo real con dashboards personalizables y reportes detallados.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- TESTIMONIALS SECTION -->
    <section id="testimonials" class="py-24 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5">
        <div class="max-w-7xl mx-auto px-6">
             <div class="text-center mb-16">
                <h2 class="text-3xl font-black text-slate-900 dark:text-white">Lo que dicen nuestros clientes</h2>
            </div>
            
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <!-- Testimonio 1 -->
                 <div class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5">
                      <div class="flex gap-1 text-warning mb-4">
                          <i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i>
                      </div>
                      <p class="text-slate-600 dark:text-slate-300 italic mb-6 text-sm">"La implementación fue rápida y el soporte es increíble. Ha transformado completamente nuestra gestión diaria."</p>
                      <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-slate-500">JC</div>
                          <div>
                              <div class="font-bold text-slate-900 dark:text-white text-sm">Juan Carlos</div>
                              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Director General</div>
                          </div>
                      </div>
                 </div>

                  <!-- Testimonio 2 -->
                 <div class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5">
                      <div class="flex gap-1 text-warning mb-4">
                          <i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i>
                      </div>
                      <p class="text-slate-600 dark:text-slate-300 italic mb-6 text-sm">"La interfaz is intuitiva y moderna. Mi equipo aprendió a usarla en menos de una semana."</p>
                       <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-slate-500">MR</div>
                          <div>
                              <div class="font-bold text-slate-900 dark:text-white text-sm">María Rodríguez</div>
                              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">Gerente de RRHH</div>
                          </div>
                      </div>
                 </div>

                  <!-- Testimonio 3 -->
                 <div class="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5">
                      <div class="flex gap-1 text-warning mb-4">
                          <i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i>
                      </div>
                      <p class="text-slate-600 dark:text-slate-300 italic mb-6 text-sm">"La mejor inversión que hemos hecho este año. La automatización nos ha ahorrado cientos de horas."</p>
                       <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center font-bold text-slate-500">AP</div>
                          <div>
                              <div class="font-bold text-slate-900 dark:text-white text-sm">Andrea Pérez</div>
                              <div class="text-[10px] font-bold uppercase tracking-wider text-slate-500">CTO</div>
                          </div>
                      </div>
                 </div>
            </div>
        </div>
    </section>

    <!-- CONTACT SECTION -->
    <app-contact-form></app-contact-form>
  `
})
export class LandingComponent implements OnInit {
    private titleService = inject(Title);
    private metaService = inject(Meta);

    constructor() { }

    ngOnInit() {
        try {
            this.titleService.setTitle('MiAplicación | Automatiza tu Gestión Empresarial y Automatización SaaS');
            this.metaService.updateTag({ name: 'description', content: 'Plataforma SaaS para centralizar la gestión de tu equipo. Automatiza flujos de trabajo, gestiona tu bolsa de empleo y protege tus datos con seguridad de grado bancario.' });
            this.metaService.updateTag({ property: 'og:title', content: 'MiAplicación: Gestión de RRHH Inteligente' });
            this.metaService.updateTag({ property: 'og:description', content: 'Centraliza tu equipo y automatiza procesos con total seguridad.' });
            this.metaService.updateTag({ property: 'og:type', content: 'website' });
            this.metaService.updateTag({ property: 'og:url', content: 'https://www.appmiaplicacion.com' });
            this.metaService.updateTag({ property: 'og:image', content: `${environment.apiUrl}/public/assets/images/logo.png` });
        } catch (e) {
            const errMsg = (e as any)?.message ?? String(e);
            console.warn('Could not set meta tags on landing:', errMsg);
        }
    }
}
