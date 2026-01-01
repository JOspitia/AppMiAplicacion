import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ProgressBarModule } from 'primeng/progressbar';
import { IconComponent } from '../../../shared/components/icon.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { GeoSyncService, GeoStats, SyncResult } from '../../services/geo-sync.service';

@Component({
    selector: 'app-geo-sync',
    standalone: true,
    imports: [CommonModule, ButtonModule, CardModule, ProgressBarModule, IconComponent, AlertComponent],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in text-slate-800 dark:text-slate-100">
        
        <app-alert [message]="successMessage()" type="success" (closed)="successMessage.set(null)"></app-alert>
        <app-alert [message]="errorMessage()" type="error" (closed)="errorMessage.set(null)"></app-alert>

        <div class="max-w-4xl mx-auto mb-10">
            <div>
                <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Administración del Sistema</span>
                <h1 class="text-3xl font-black text-slate-900 dark:text-white">
                    Sincronización de <span class="text-primary">Ubicaciones</span>
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                    Sincroniza el catálogo global de países, estados, ciudades, <span class="text-primary font-semibold">monedas y extensiones telefónicas</span> desde el repositorio oficial.
                </p>
            </div>
        </div>

        <div class="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-10">
            <!-- Stats Cards -->
            <div class="bg-white dark:bg-[var(--bg-card)] p-5 rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-xl flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
                <div class="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <app-icon name="globe" size="20"></app-icon>
                </div>
                <span class="text-2xl font-black text-slate-900 dark:text-white">{{ stats()?.countries || 0 }}</span>
                <span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Países</span>
            </div>

            <div class="bg-white dark:bg-[var(--bg-card)] p-5 rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-xl flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
                <div class="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-500/10 text-sky-500 flex items-center justify-center mb-3 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <app-icon name="map-pin" size="20"></app-icon>
                </div>
                <span class="text-2xl font-black text-slate-900 dark:text-white">{{ stats()?.states || 0 }}</span>
                <span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Estados / Deptos</span>
            </div>

            <div class="bg-white dark:bg-[var(--bg-card)] p-5 rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-xl flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
                <div class="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-3 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    <app-icon name="building" size="20"></app-icon>
                </div>
                <span class="text-2xl font-black text-slate-900 dark:text-white">{{ stats()?.cities || 0 }}</span>
                <span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Ciudades</span>
            </div>

            <div class="bg-white dark:bg-[var(--bg-card)] p-5 rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-xl flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
                <div class="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <app-icon name="money-bill" icon="pi pi-money-bill" size="20"></app-icon>
                </div>
                <span class="text-2xl font-black text-slate-900 dark:text-white">{{ stats()?.currencies || 0 }}</span>
                <span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Monedas</span>
            </div>

            <div class="bg-white dark:bg-[var(--bg-card)] p-5 rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-xl flex flex-col items-center text-center group hover:scale-105 transition-transform duration-300">
                <div class="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                    <app-icon name="phone" size="20"></app-icon>
                </div>
                <span class="text-2xl font-black text-slate-900 dark:text-white">{{ stats()?.phoneCodes || 0 }}</span>
                <span class="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-1">Extensiones</span>
            </div>
        </div>

        <!-- Sync Action Card -->
        <div class="max-w-4xl mx-auto">
            <div class="bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-[2.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden p-10 text-center">
                
                <div class="mb-8">
                    <div class="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary/10 text-primary mb-6 animate-pulse">
                        <app-icon name="refresh" icon="pi pi-sync" size="32"></app-icon>
                    </div>
                    <h2 class="text-2xl font-black text-slate-800 dark:text-white mb-3">Sincronización de Datos Globales</h2>
                    <p class="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed font-medium">
                        Esta operación descargará la última versión del repositorio 
                        <span class="text-primary font-bold">dr5hn/countries-states-cities-database</span>, 
                        que incluye información de <span class="font-bold">países, estados, ciudades, monedas y extensiones telefónicas</span>.
                    </p>
                </div>

                <div *ngIf="isSyncing()" class="max-w-md mx-auto mb-8 space-y-4 animate-fade-in">
                    <p-progressbar mode="indeterminate" [style]="{ height: '6px' }" styleClass="rounded-full overflow-hidden bg-primary/10"></p-progressbar>
                    <p class="text-[11px] font-bold uppercase tracking-widest text-primary animate-bounce">
                        Procesando repositorio... por favor no cierres la ventana
                    </p>
                </div>

                <button pButton (click)="runSync()" [disabled]="isSyncing()"
                        class="px-12 py-4 bg-primary text-white rounded-full font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto">
                    <app-icon [name]="isSyncing() ? 'refresh-cw' : 'play'" [icon]="isSyncing() ? 'pi pi-spin pi-spinner' : 'pi pi-play'" size="20"></app-icon>
                    <span>{{ isSyncing() ? 'Sincronizando...' : 'Iniciar Sincronización Global' }}</span>
                </button>

                <!-- Last Sync Results -->
                <div *ngIf="syncResult()" class="mt-12 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-white/5 grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-in">
                    <div class="flex flex-col items-center">
                        <span class="text-xl font-black text-primary">{{ syncResult()?.countriesAdded }}</span>
                        <span class="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Países</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <span class="text-xl font-black text-sky-500">{{ syncResult()?.statesAdded }}</span>
                        <span class="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Estados</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <span class="text-xl font-black text-emerald-500">{{ syncResult()?.citiesAdded }}</span>
                        <span class="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Ciudades</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <span class="text-xl font-black text-amber-500">{{ syncResult()?.currenciesAdded }}</span>
                        <span class="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Monedas</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <span class="text-xl font-black text-rose-500">{{ syncResult()?.phoneCodesSynced }}</span>
                        <span class="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Extensiones</span>
                    </div>
                    <div class="flex flex-col items-center">
                        <span class="text-xl font-black text-slate-700 dark:text-white">{{ (syncResult()?.durationMs || 0) / 1000 | number:'1.1-1' }}s</span>
                        <span class="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Tiempo</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
})
export class GeoSyncComponent implements OnInit {
    private geoSyncService = inject(GeoSyncService);

    stats = signal<GeoStats | null>(null);
    isSyncing = signal(false);
    syncResult = signal<SyncResult | null>(null);

    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    ngOnInit() {
        this.loadStats();
    }

    loadStats() {
        this.geoSyncService.getStats().subscribe({
            next: (data) => this.stats.set(data),
            error: () => this.errorMessage.set('Error al cargar estadísticas geográficas.')
        });
    }

    runSync() {
        this.isSyncing.set(true);
        this.syncResult.set(null);
        this.successMessage.set(null);
        this.errorMessage.set(null);

        this.geoSyncService.runSync().subscribe({
            next: (result) => {
                this.isSyncing.set(false);
                if (result.error) {
                    this.errorMessage.set('Error en el proceso: ' + result.error);
                } else {
                    this.syncResult.set(result);
                    this.successMessage.set('Sincronización completada exitosamente.');
                    this.loadStats();
                }
            },
            error: (err) => {
                this.isSyncing.set(false);
                this.errorMessage.set('Fallo crítico al conectar con el servidor de sincronización.');
            }
        });
    }
}
