import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule, RouterModule],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-[#0B0A10] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      <!-- NAVBAR -->
      <nav class="fixed top-0 w-full z-50 bg-white/80 dark:bg-[#0B0A10]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/5 transition-all duration-300">
          <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <!-- Logo -->
              <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                      <i class="pi pi-bolt text-white text-xl"></i>
                  </div>
                  <span class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                      MiAplicación
                  </span>
              </div>

              <!-- Desktop Menu -->
              <div class="hidden md:flex items-center gap-8">
                  <a href="#features" class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Características</a>
                  <a href="#testimonials" class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Testimonios</a>
                  <a href="#contact" class="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors">Contacto</a>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-4">
                 <button (click)="toggleTheme()" class="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 transition-colors">
                      <i class="pi" [ngClass]="isDarkMode ? 'pi-sun' : 'pi-moon'"></i>
                  </button>
                  <a routerLink="/login" pButton pRipple label="Iniciar Sesión" class="p-button-outlined p-button-sm font-bold border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 px-6 rounded-xl"></a>
                  <button pButton pRipple label="Comenzar" class="p-button-sm font-bold bg-gradient-to-r from-primary to-accent border-none shadow-lg shadow-primary/25 hover:shadow-primary/40 px-6 rounded-xl text-white"></button>
              </div>
          </div>
      </nav>

      <!-- HERO SECTION -->
      <section class="relative w-full min-h-screen flex flex-col pt-32 pb-20 overflow-hidden">
          <!-- Background Effects -->
          <div class="absolute inset-0 pointer-events-none">
              <div class="absolute -top-[10%] left-[25%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full animate-pulse"></div>
              <div class="absolute -bottom-[10%] right-[25%] w-[600px] h-[600px] bg-accent/5 blur-[120px] rounded-full"></div>
          </div>

          <div class="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center z-10">
              <!-- Text Content -->
              <div class="text-center lg:text-left">
                  <span class="inline-flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 rounded-full mb-8 backdrop-blur-md">
                      <span class="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                      Plataforma SaaS Empresarial
                  </span>
                  
                  <h1 class="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight mb-8 text-slate-900 dark:text-white">
                      Automatiza tu <br>
                      <span class="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">Gestión Empresarial</span>
                  </h1>
                  
                  <p class="text-lg lg:text-xl text-slate-500 dark:text-slate-400 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                      Centraliza la gestión de tu equipo, automatiza workflows y toma decisiones inteligentes con nuestra plataforma todo-en-uno.
                  </p>
                  
                  <div class="flex flex-wrap gap-4 justify-center lg:justify-start mb-12">
                      <button pButton pRipple label="Atención Personalizada" icon="pi pi-arrow-right" iconPos="right" class="p-button-lg font-bold bg-gradient-to-r from-primary to-accent border-none shadow-xl shadow-primary/25 rounded-2xl px-8 py-4 text-white hover:scale-105 transition-transform"></button>
                      
                      <button pButton pRipple label="Ver Demo" icon="pi pi-play" class="p-button-lg p-button-outlined font-bold border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 rounded-2xl px-8 py-4"></button>
                  </div>

                   <!-- Micro Stats -->
                  <div class="flex gap-10 justify-center lg:justify-start pt-8 border-t border-slate-200 dark:border-white/5">
                      <div>
                          <span class="block text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">500+</span>
                          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Empresas</span>
                      </div>
                      <div>
                          <span class="block text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">99.9%</span>
                          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Uptime</span>
                      </div>
                      <div>
                          <span class="block text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">24/7</span>
                          <span class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Soporte</span>
                      </div>
                  </div>
              </div>

              <!-- Hero Image / Carousel placeholder -->
              <div class="relative hidden lg:block">
                   <div class="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl rounded-[3rem]"></div>
                   <div class="relative bg-white dark:bg-[#15141F] rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden aspect-[16/10] group">
                        
                        <!-- Mock Browser Header -->
                        <div class="h-10 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/5 flex items-center px-4 gap-2">
                            <div class="flex gap-1.5">
                                <span class="w-2.5 h-2.5 rounded-full bg-red-400/60"></span>
                                <span class="w-2.5 h-2.5 rounded-full bg-yellow-400/60"></span>
                                <span class="w-2.5 h-2.5 rounded-full bg-green-400/60"></span>
                            </div>
                            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 flex-1 text-center pr-12">
                                Dashboard Principal
                            </div>
                        </div>

                        <!-- Image Content -->
                        <div class="relative h-full w-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                             <i class="pi pi-image text-4xl mb-2"></i>
                             <!-- Aquí irían tus imágenes del carrusel, por ahora un placeholder elegante -->
                             <span class="absolute bottom-10 text-xs tracking-widest uppercase opacity-50">Vista Previa del Sistema</span>
                        </div>

                         <!-- Decorative Floating Elements -->
                         <div class="absolute -right-10 top-20 bg-white dark:bg-[#1E1C24] p-4 rounded-xl shadow-xl border border-slate-100 dark:border-white/5 animate-[float_4s_ease-in-out_infinite] z-20">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                    <i class="pi pi-check"></i>
                                </div>
                                <div>
                                    <div class="text-xs text-slate-400 font-medium">Estado del Sistema</div>
                                    <div class="text-sm font-bold text-slate-900 dark:text-white">Operativo 100%</div>
                                </div>
                            </div>
                         </div>
                   </div>
              </div>
          </div>
      </section>

      <!-- FEATURES GRID -->
      <section id="features" class="py-24 bg-slate-50 dark:bg-[#0E0D15] border-t border-slate-200 dark:border-white/5">
          <div class="max-w-7xl mx-auto px-6">
              <div class="text-center mb-16 max-w-2xl mx-auto">
                  <span class="text-primary font-bold tracking-widest text-xs uppercase mb-2 block">Características</span>
                  <h2 class="text-4xl font-black text-slate-900 dark:text-white mb-4">Todo lo que necesitas</h2>
                  <p class="text-slate-500 dark:text-slate-400">Potentes herramientas diseñadas para escalar tu negocio sin complicaciones.</p>
              </div>

              <div class="grid md:grid-cols-3 gap-8">
                  <!-- Feature 1 -->
                  <div class="bg-white dark:bg-[#15141F] p-8 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl group">
                      <div class="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                          <i class="pi pi-bolt text-2xl"></i>
                      </div>
                      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Automatización</h3>
                      <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                          Integración nativa para crear flujos de trabajo automatizados que ahorran tiempo y reducen errores humanos.
                      </p>
                  </div>

                  <!-- Feature 2 -->
                   <div class="bg-white dark:bg-[#15141F] p-8 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1 hover:shadow-xl group">
                      <div class="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 group-hover:scale-110 transition-transform">
                          <i class="pi pi-shield text-2xl"></i>
                      </div>
                      <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-3">Seguridad Total</h3>
                      <p class="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                          Protección de grado bancario para tus datos con encriptación de extremo a extremo y copias de seguridad automáticas.
                      </p>
                  </div>

                  <!-- Feature 3 -->
                   <div class="bg-white dark:bg-[#15141F] p-8 rounded-3xl border border-slate-200 dark:border-white/5 hover:border-purple-500/30 transition-all hover:-translate-y-1 hover:shadow-xl group">
                      <div class="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-6 group-hover:scale-110 transition-transform">
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
      <section id="testimonials" class="py-24 bg-white dark:bg-[#0B0A10]">
          <div class="max-w-7xl mx-auto px-6">
               <div class="text-center mb-16">
                  <h2 class="text-3xl font-black text-slate-900 dark:text-white">Lo que dicen nuestros clientes</h2>
              </div>
              
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                   <!-- Testimonio 1 -->
                   <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#15141F] border border-slate-100 dark:border-white/5">
                        <div class="flex gap-1 text-yellow-400 mb-4">
                            <i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i>
                        </div>
                        <p class="text-slate-600 dark:text-slate-300 italic mb-6">"La implementación fue rápida y el soporte es increíble. Ha transformado completamente nuestra gestión diaria."</p>
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-slate-500">JC</div>
                            <div>
                                <div class="font-bold text-slate-900 dark:text-white text-sm">Juan Carlos</div>
                                <div class="text-xs text-slate-500">Director General</div>
                            </div>
                        </div>
                   </div>

                    <!-- Testimonio 2 -->
                   <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#15141F] border border-slate-100 dark:border-white/5">
                        <div class="flex gap-1 text-yellow-400 mb-4">
                            <i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i>
                        </div>
                        <p class="text-slate-600 dark:text-slate-300 italic mb-6">"La interfaz es intuitiva y moderna. Mi equipo aprendió a usarla en menos de una semana."</p>
                         <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-slate-500">MR</div>
                            <div>
                                <div class="font-bold text-slate-900 dark:text-white text-sm">María Rodríguez</div>
                                <div class="text-xs text-slate-500">Gerente de RRHH</div>
                            </div>
                        </div>
                   </div>

                    <!-- Testimonio 3 -->
                   <div class="p-6 rounded-2xl bg-slate-50 dark:bg-[#15141F] border border-slate-100 dark:border-white/5">
                        <div class="flex gap-1 text-yellow-400 mb-4">
                            <i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i><i class="pi pi-star-fill"></i>
                        </div>
                        <p class="text-slate-600 dark:text-slate-300 italic mb-6">"La mejor inversión que hemos hecho este año. La automatización nos ha ahorrado cientos de horas."</p>
                         <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10 flex items-center justify-center font-bold text-slate-500">AP</div>
                            <div>
                                <div class="font-bold text-slate-900 dark:text-white text-sm">Andrea Pérez</div>
                                <div class="text-xs text-slate-500">CTO</div>
                            </div>
                        </div>
                   </div>
              </div>
          </div>
      </section>

      <!-- FOOTER -->
      <footer class="py-12 bg-white dark:bg-[#0B0A10] border-t border-slate-200 dark:border-white/5 text-center text-slate-500 text-sm">
          <p>&copy; 2025 MiAplicación. Todos los derechos reservados.</p>
      </footer>

    </div>
  `
})
export class LandingComponent implements OnInit, OnDestroy {
  isDarkMode = false;

  // Images placeholder array for when we implement the full carousel later
  images: string[] = [
    'assets/images/landing/Inicio.png',
    'assets/images/landing/Login.png'
  ];

  constructor() { }

  ngOnInit() {
    // Check system preference or saved theme
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      this.isDarkMode = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      this.applyTheme();
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
  }

  applyTheme() {
    if (typeof document !== 'undefined') {
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }
}
