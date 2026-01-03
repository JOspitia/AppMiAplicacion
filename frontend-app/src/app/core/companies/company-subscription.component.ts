import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { CompanySubscriptionService, ModuleSubscription } from './company-subscription.service';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';

@Component({
    selector: 'app-company-subscription',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, ToggleSwitchModule, FormsModule, IconComponent, AlertComponent],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in text-slate-800 dark:text-slate-100">
        
        <app-alert [message]="successMessage()" type="success" (closed)="successMessage.set(null)"></app-alert>
        <app-alert [message]="errorMessage()" type="error" (closed)="errorMessage.set(null)"></app-alert>

        <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <a routerLink="/core/management/companies" class="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-bold mb-2">
                    <app-icon name="arrow-left" size="12"></app-icon> Volver a Empresas
                </a>
                <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Suscripciones SaaS</span>
                <h1 class="text-3xl font-black text-slate-900 dark:text-white">
                    Módulos y <span class="text-primary">Servicios</span>
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">Activa o desactiva los módulos disponibles para esta empresa.</p>
            </div>
        </div>

        <div class="bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden p-6 transition-all duration-300">
            
            <p-table [value]="modules()" [loading]="loading()" styleClass="p-datatable-sm">
                <ng-template pTemplate="header">
                    <tr class="border-b border-slate-200 dark:border-slate-700/50">
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent" style="width:40%">Módulo</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-center" style="width:20%">Estado</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-center" style="width:20%">Acción</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-module>
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-indigo-500/5 transition-all duration-300 border-b border-slate-100 dark:border-slate-800/50 last:border-none">
                        <td class="py-6 px-4">
                            <div class="flex flex-col">
                                <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ module.name }}</span>
                                <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">{{ module.description }}</span>
                                <span class="text-[9px] text-slate-400 font-mono mt-1">{{ module.code }}</span>
                            </div>
                        </td>
                        <td class="py-6 px-4 text-center">
                            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors"
                                 [ngClass]="module.isSubscribed ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'">
                                <div class="w-1.5 h-1.5 rounded-full" [ngClass]="module.isSubscribed ? 'bg-emerald-500' : 'bg-slate-400'"></div>
                                <span>{{ module.isSubscribed ? 'Habilitado' : 'Deshabilitado' }}</span>
                            </div>
                        </td>
                        <td class="py-6 px-4 text-center">
                            <p-toggleSwitch [(ngModel)]="module.isSubscribed" (onChange)="toggleModule(module)"></p-toggleSwitch>
                        </td>
                    </tr>
                </ng-template>
                
                <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="3" class="text-center py-10 text-slate-400 text-sm">No hay módulos disponibles.</td>
                        </tr>
                    </ng-template>
            </p-table>
        </div>
    </div>
    `
})
export class CompanySubscriptionComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private subscriptionService = inject(CompanySubscriptionService);

    modules = signal<ModuleSubscription[]>([]);
    loading = signal<boolean>(true);
    companyId = signal<string>('');
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    ngOnInit() {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.companyId.set(params['id']);
                this.loadModules(params['id']);
            }
        });
    }

    loadModules(companyId: string) {
        this.loading.set(true);
        this.subscriptionService.listModules(companyId).subscribe({
            next: (data) => {
                this.modules.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Error al cargar módulos.');
                this.loading.set(false);
            }
        });
    }

    toggleModule(module: ModuleSubscription) {
        // Optimistic UI update already happened via ngModel
        this.subscriptionService.toggleModule(this.companyId(), module.id).subscribe({
            next: () => {
                this.successMessage.set(`Módulo ${module.name} ${module.isSubscribed ? 'activado' : 'desactivado'}.`);
                // Optional: reload to sync? Not needed if trusted.
            },
            error: () => {
                // Revert on error
                module.isSubscribed = !module.isSubscribed;
                this.errorMessage.set('Error al cambiar estado del módulo.');
            }
        });
    }
}
