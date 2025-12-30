import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CompanyService, Company } from '../../core/services/company.service';

@Component({
    selector: 'app-company-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, InputTextModule, TooltipModule, TagModule, IconComponent, AlertComponent, ConfirmDialogComponent],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in">
        
        <app-alert [message]="successMessage()" type="success" (closed)="successMessage.set(null)"></app-alert>
        <app-alert [message]="errorMessage()" type="error" (closed)="errorMessage.set(null)"></app-alert>

        <app-confirm-dialog
            [isOpen]="!!confirmationData()"
            [title]="confirmationData()?.title || ''"
            [message]="confirmationData()?.message || ''"
            (confirm)="onConfirmToggle()"
            (cancel)="confirmationData.set(null)">
        </app-confirm-dialog>

        <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
                <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Módulo Corporativo</span>
                <h1 class="text-3xl font-black text-slate-900 dark:text-white">
                    Directorio de <span class="text-primary">Empresas</span>
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">Gestiona las entidades legales y sucursales del sistema.</p>
            </div>
            <a routerLink="/core/companies/create" 
               class="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95">
                <app-icon name="plus" size="18"></app-icon>
                <span>Nueva Empresa</span>
            </a>
        </div>

        <div class="bg-white/80 dark:bg-[#0F172A]/90 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden p-6 transition-colors duration-300">
            
            <p-table #dt [value]="companies()" [rows]="10" [paginator]="true" 
                     [globalFilterFields]="['name', 'nit', 'emailExtension']"
                     styleClass="p-datatable-sm" 
                     [tableStyle]="{ 'min-width': '50rem' }">
                
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between pb-6">
                        <div class="relative w-full max-w-sm group">
                            <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors z-10 text-base"></i>
                            <input pInputText type="text" 
                                   (input)="dt.filterGlobal($any($event.target).value, 'contains')" 
                                   placeholder="Buscar por nombre, NIT o dominio..." 
                                   style="padding-left: 3.5rem !important;"
                                   class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                        </div>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr class="border-b border-slate-200 dark:border-slate-700/50">
                        <th class="py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-transparent" style="width:15%">NIT</th>
                        <th class="py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-transparent" style="width:25%">Empresa</th>
                        <th class="py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-transparent" style="width:20%">Contacto</th>
                        <th class="py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-transparent" style="width:15%">Ubicación</th>
                        <th class="py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-transparent" style="width:10%">Estado</th>
                        <th class="py-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-transparent text-center" style="width:15%">Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-company>
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-none">
                        <td class="py-4 px-2">
                            <span class="font-mono text-sm text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md">{{ company.nit }}</span>
                        </td>
                        <td class="py-4 px-2">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-indigo-500/10 dark:from-primary/20 dark:to-indigo-500/20 flex items-center justify-center text-primary font-black shadow-sm border border-primary/10">
                                    {{ company.name.charAt(0) }}
                                </div>
                                <div class="flex flex-col">
                                    <span class="font-bold text-slate-800 dark:text-slate-200 text-sm leading-tight">{{ company.name }}</span>
                                    <span class="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5" *ngIf="company.emailExtension">{{ company.emailExtension }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="py-4 px-2">
                            <div class="flex flex-col text-sm gap-1">
                                <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400" *ngIf="company.phone">
                                    <i class="pi pi-phone text-xs opacity-50"></i>
                                    <span>{{ company.phone }}</span>
                                </div>
                                <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400" *ngIf="company.emailExtension">
                                    <i class="pi pi-envelope text-xs opacity-50"></i>
                                    <span>admin{{ company.emailExtension }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="py-4 px-2">
                             <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm" *ngIf="company.address; else noAddress">
                                <i class="pi pi-map-marker text-xs opacity-50"></i>
                                <span class="truncate max-w-[150px]" [title]="company.address">{{ company.address }}</span>
                            </div>
                            <ng-template #noAddress>
                                <span class="text-slate-400 text-xs italic">No registrada</span>
                            </ng-template>
                        </td>
                        <td class="py-4 px-2">
                            <div class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border"
                                 [ngClass]="company.status ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'">
                                <span class="w-1.5 h-1.5 rounded-full mr-2" [ngClass]="company.status ? 'bg-emerald-500' : 'bg-red-500'"></span>
                                {{ company.status ? 'Activo' : 'Inactivo' }}
                            </div>
                        </td>
                        <td class="py-4 px-2">
                            <div class="flex justify-center items-center gap-1">
                                <button pButton icon="pi pi-pencil" 
                                        [routerLink]="['/core/companies/edit', company.id]"
                                        class="p-button-rounded p-button-text p-button-secondary p-button-sm w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
                                        pTooltip="Editar"></button>

                                <button pButton
                                        [icon]="company.status ? 'pi pi-ban' : 'pi pi-check-circle'"
                                        (click)="toggleStatus(company)"
                                        class="p-button-rounded p-button-text p-button-sm w-8 h-8 transition-colors"
                                        [ngClass]="company.status ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'"
                                        [pTooltip]="company.status ? 'Desactivar Empresa' : 'Activar Empresa'"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="6" class="text-center py-16">
                            <div class="flex flex-col items-center justify-center">
                                <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <i class="pi pi-search text-2xl text-slate-400"></i>
                                </div>
                                <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No se encontraron resultados</h3>
                                <p class="text-slate-500 dark:text-slate-400 text-sm">Intenta con otros términos de búsqueda.</p>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    </div>
    `
})
export class CompanyListComponent implements OnInit {
    private companyService = inject(CompanyService);
    companies = signal<Company[]>([]);

    // Alerts
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    // Confirmation Modal
    confirmationData = signal<{ title: string, message: string, company: Company } | null>(null);

    ngOnInit() {
        this.loadCompanies();
    }

    loadCompanies() {
        this.companyService.getAll().subscribe(data => this.companies.set(data));
    }

    deleteCompany(id: string) {
        // Kept for backward compatibility, but prefer toggleStatus now
        if (confirm('¿Estás seguro de eliminar esta empresa?')) {
            this.companyService.delete(id).subscribe(() => this.loadCompanies());
        }
    }

    toggleStatus(company: Company) {
        // 1. Open Confirmation Modal (Toast for question)
        const isActivating = !company.status;
        this.confirmationData.set({
            title: isActivating ? '¿Activar Empresa?' : '¿Desactivar Empresa?',
            message: isActivating
                ? `¿Deseas reactivar el acceso para ${company.name}? Los usuarios podrán volver a ingresar.`
                : `¿Estás seguro de desactivar a ${company.name}? Esto bloqueará el acceso a todos sus usuarios.`,
            company: company
        });
    }

    onConfirmToggle() {
        const data = this.confirmationData();
        if (!data) return;

        const company = data.company;
        const newStatus = !company.status;

        this.companyService.setStatus(company.id!, newStatus).subscribe({
            next: () => {
                this.loadCompanies();
                this.confirmationData.set(null); // Close modal
                // 2. Show Success Alert (Banner)
                this.successMessage.set(newStatus
                    ? 'Empresa activada correctamente. El acceso ha sido restaurado.'
                    : 'Empresa desactivada correctamente. El acceso ha sido revocado.');
            },
            error: () => {
                this.confirmationData.set(null);
                this.errorMessage.set('Error al cambiar el estado. Intenta de nuevo.');
            }
        });
    }
}