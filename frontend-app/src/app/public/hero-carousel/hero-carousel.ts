import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CarouselModule } from 'primeng/carousel';
import { catchError, of } from 'rxjs';

interface CarouselImage {
  url: string;
  name: string;
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, CarouselModule],
  template: `
    <div class="relative hidden lg:block perspective-1000">
      
      <!-- Ambient Background Glows -->
      <div class="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full animate-pulse"></div>
      <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full delay-700"></div>

      <!-- Floating Decoration 1: Status Card -->
      <div class="absolute -left-12 top-1/4 z-20 animate-float">
        <div class="glass p-4 rounded-2xl shadow-xl flex items-center gap-4 border-white/20">
          <div class="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <i class="pi pi-users text-lg"></i>
          </div>
          <div>
            <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Usuarios Activos</div>
            <div class="text-lg font-bold text-slate-900 dark:text-white leading-tight">1.2k+</div>
          </div>
        </div>
      </div>

      <!-- Floating Decoration 2: Performance Card -->
      <div class="absolute -right-8 bottom-12 z-20 animate-float-delayed">
        <div class="glass p-4 rounded-2xl shadow-xl flex items-center gap-4 border-white/20">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <i class="pi pi-bolt text-lg"></i>
          </div>
          <div>
            <div class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Performance</div>
            <div class="text-lg font-bold text-slate-900 dark:text-white leading-tight">99.9%</div>
          </div>
        </div>
      </div>

      <!-- Main Browser Frame -->
      <div class="relative bg-white dark:bg-slate-900/80 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden aspect-[16/10] group transition-transform duration-700 hover:scale-[1.01]">
        
        <!-- Mock Browser Header -->
        <div class="h-10 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-white/5 flex items-center px-4 gap-2">
          <div class="flex gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
            <span class="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
          </div>
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2 flex-1 text-center pr-12">
            www.appmiaplicacion.com / dashboard
          </div>
        </div>

        <!-- Carousel Content -->
        <div class="relative h-[calc(100%-3rem)] w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
          <div *ngIf="images.length > 0; else loadingTemplate" class="w-full h-full">
            <p-carousel
              [value]="images"
              [numVisible]="1"
              [numScroll]="1"
              [circular]="true"
              [autoplayInterval]="5000"
              class="custom-carousel"
            >
              <ng-template #item let-image>
                <div class="w-full h-full flex items-center justify-center p-12">
                  <div class="image-container group/image relative">
                    <!-- Subtle glow behind image -->
                    <div class="absolute -inset-4 bg-primary/20 blur-2xl rounded-2xl opacity-0 group-hover/image:opacity-100 transition-opacity duration-500"></div>
                    
                    <img
                      [src]="image.url || fallbackDataUrl"
                      [alt]="image.name"
                      class="carousel-image relative rounded-xl shadow-lg border border-white/10"
                      loading="lazy"
                      (error)="onImageError($event, image)"
                      (load)="onImageLoad($event)"
                    />
                    
                    <!-- Caption Overlay -->
                    <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-full opacity-0 translate-y-2 group-hover/image:opacity-100 group-hover/image:translate-y-0 transition-all duration-300 whitespace-nowrap">
                      <span class="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">{{image.name}}</span>
                    </div>
                  </div>
                </div>
              </ng-template>
            </p-carousel>
          </div>

          <ng-template #loadingTemplate>
            <div class="flex flex-col items-center">
              <div class="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4"></div>
              <span class="text-[10px] tracking-[0.3em] uppercase opacity-40 font-black">Cargando Sistema...</span>
            </div>
          </ng-template>
        </div>

        <!-- Floating Status (Dynamic Badge) -->
        <div *ngIf="showStatusBadge" 
             class="absolute top-16 right-6 z-30 animate-in fade-in slide-in-from-right-4 duration-1000">
          <div class="glass p-2 border border-primary/20 rounded-full flex items-center gap-2 pr-4 shadow-xl">
             <div class="flex h-2 w-2 relative ml-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
             </div>
             <span class="text-[9px] font-bold text-primary uppercase tracking-tighter">Servidor: Online</span>
             <button (click)="showStatusBadge = false" class="ml-2 w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] hover:bg-slate-300 transition-colors">&times;</button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-carousel { height: 100%; }
      .p-carousel-content { height: 100%; position: relative; }
      .p-carousel-container { height: 100%; }
      .p-carousel-items-content { height: 100%; }
      .p-carousel-item { height: 100%; display:flex; align-items:center; justify-content:center; }

      .custom-carousel {
        /* Arrows styling */
        .p-carousel-prev, .p-carousel-next {
          position: absolute;
          top: 50% !important;
          transform: translateY(-50%) !important;
          z-index: 40 !important;
          width: 3.5rem !important;
          height: 3.5rem !important;
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
          border-radius: 50% !important;
          color: #1e293b !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          opacity: 0;
          visibility: hidden;
        }

        .dark .p-carousel-prev, .dark .p-carousel-next {
          background: rgba(30, 41, 59, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.05) !important;
          color: white !important;
        }

        .p-carousel-content:hover .p-carousel-prev, 
        .p-carousel-content:hover .p-carousel-next {
          opacity: 1;
          visibility: visible;
        }

        .p-carousel-prev { left: 1rem !important; transform: translate(-0.5rem, -50%) !important; }
        .p-carousel-next { right: 1rem !important; transform: translate(0.5rem, -50%) !important; }

        .p-carousel-content:hover .p-carousel-prev { transform: translate(0, -50%) !important; }
        .p-carousel-content:hover .p-carousel-next { transform: translate(0, -50%) !important; }

        .p-carousel-prev:hover, .p-carousel-next:hover {
          background: #4f46e5 !important;
          color: white !important;
          transform: translateY(-50%) scale(1.1) !important;
        }

        /* Indicators styling */
        .p-carousel-indicators {
          padding: 1.5rem;
          gap: 0.5rem;
        }
        .p-carousel-indicator button {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background: #cbd5e1 !important;
          transition: all 0.3s ease;
        }
        .dark .p-carousel-indicator button {
          background: #334155 !important;
        }
        .p-carousel-indicator.p-highlight button {
          width: 1.5rem;
          border-radius: 1rem;
          background: #4f46e5 !important;
        }
      }

      .carousel-image {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        transition: transform .5s cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      .image-container:hover .carousel-image {
        transform: scale(1.02);
      }

      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-15px); }
      }
      @keyframes float-delayed {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }

      .animate-float { animation: float 6s ease-in-out infinite; }
      .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; animation-delay: 1s; }
      
      .perspective-1000 { perspective: 1000px; }
    }
  `]
})
export class HeroCarouselComponent implements OnInit, OnDestroy {
  images: CarouselImage[] = [];
  private minioCandidates = [
    '/api/public/assets/images/landing',
  ];
  showStatusBadge = true;

  public fallbackDataUrl = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'><rect fill='#f8fafc' width='100%' height='100%'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#9ca3af' font-family='Arial' font-size='28'>Explora nuestra interfaz</text></svg>`
  );

  private createdObjectUrls: string[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadHeroImages();
  }

  ngOnDestroy(): void {
    this.createdObjectUrls.forEach(u => URL.revokeObjectURL(u));
  }

  private loadHeroImages() {
    const imageNames = [
      'Agregar Familia.png',
      'Configurables Recursos Humanos.png',
      'Detalles del Contrato.png',
      'Directorio de Empleados.png',
      'Documento Soporte.png',
      'Inicio.png',
      'Login.png',
      'Nuevo Empleado.png',
      'Seleccionar Empresa.png'
    ];

    this.images = imageNames.map(name => ({
      name: name.replace(/\.[^/.]+$/, ''),
      url: '' // we'll resolve per-candidates below
    }));

    console.log('Hero images to load:', imageNames);

    // Verify images; try candidates sequentially and use blob URL when found
    this.images.forEach((image, idx) => {
      const name = imageNames[idx];
      const candidates = this.minioCandidates.map(base => `${base}/${encodeURIComponent(name)}`);

      const tryCandidate = (i: number) => {
        if (i >= candidates.length) {
          console.warn('Imagen no encontrada en ninguna ruta, usando fallback:', name);
          image.url = this.fallbackDataUrl;
          return;
        }
        const url = candidates[i];
        this.http.get(url, { observe: 'response', responseType: 'blob' }).pipe(
          catchError(() => of(null))
        ).subscribe(res => {
          if (res && res.body instanceof Blob && res.body.size > 0 && res.body.type.startsWith('image')) {
            const blobUrl = URL.createObjectURL(res.body);
            this.createdObjectUrls.push(blobUrl);
            image.url = blobUrl;
            console.log('Loaded image from', url);
          } else {
            // try next candidate
            tryCandidate(i + 1);
          }
        });
      };

      tryCandidate(0);
    });
  }

  onImageError(event: Event, image: CarouselImage) {
    const img = event.target as HTMLImageElement;
    if (img.src !== this.fallbackDataUrl) {
      console.error(`Error cargando imagen, reemplazando por fallback: ${img.src}`);
      img.src = this.fallbackDataUrl;
      image.url = this.fallbackDataUrl;
    }
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    img.classList.remove('loading');
  }
}