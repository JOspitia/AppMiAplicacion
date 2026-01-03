import { Component, OnInit, inject, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { computed } from '@angular/core';

@Component({
    selector: 'app-company-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, InputTextModule, TooltipModule, TagModule, IconComponent, AlertComponent, ConfirmDialogComponent, ToggleSwitchModule, FormsModule],
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
            <a *ngIf="isSuperAdmin()" routerLink="/core/management/companies/create" 
               class="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95">
                <app-icon name="plus" size="18"></app-icon>
                <span>Nueva Empresa</span>
            </a>
        </div>

        <div class="bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden p-6 transition-all duration-300">
            
            <p-table #dt [value]="filteredCompanies()" [rows]="10" [paginator]="true" 
                     [globalFilterFields]="['name', 'nit', 'emailExtension']"
                     styleClass="p-datatable-sm" 
                     [tableStyle]="{ 'min-width': '50rem' }">
                
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between pb-6 gap-4">
                        <div class="relative w-full max-w-md group">
                            <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors z-10 text-base"></i>
                            <input pInputText type="text" 
                                   (input)="dt.filterGlobal($any($event.target).value, 'contains')" 
                                   placeholder="Buscar por nombre, NIT o dominio..." 
                                   style="padding-left: 3.5rem !important;"
                                   class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                        </div>

                        <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                            <span class="text-[10px] font-bold uppercase tracking-wider transition-colors"
                                  [ngClass]="showInactive() ? 'text-slate-400' : 'text-primary'">Activas</span>
                            <p-toggleSwitch [ngModel]="showInactive()" 
                                           (onChange)="showInactive.set($event.checked)"
                                           size="small"></p-toggleSwitch>
                            <span class="text-[10px] font-bold uppercase tracking-wider transition-colors"
                                  [ngClass]="showInactive() ? 'text-red-500' : 'text-slate-400'">Inactivas</span>
                        </div>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr class="border-b border-slate-200 dark:border-slate-700/50">
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent" style="width:15%">NIT</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent" style="width:30%">Empresa</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent" style="width:20%">Contacto</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent" style="width:15%">Ubicación</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-center" style="width:10%">Estado</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-right" style="width:10%">Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-company>
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-none">
                        <td class="py-6 px-4">
                            <span class="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/5">{{ company.nit }}</span>
                        </td>
                        <td class="py-6 px-4">
                            <div class="flex items-center gap-4">
                                <div class="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform overflow-hidden border border-white/10">
                                    <img *ngIf="company.logoUrl" [src]="getLogoUrl(company.logoUrl)" alt="Logo" class="w-full h-full object-contain p-2 bg-white">
                                    <span *ngIf="!company.logoUrl">{{ company.name.substring(0, 2).toUpperCase() }}</span>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ company.name }}</span>
                                    <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider" *ngIf="company.allowedDomain">{{ company.allowedDomain }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="py-6 px-4">
                            <div class="flex flex-col text-sm gap-1">
                                <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400" *ngIf="company.notificationEmail">
                                    <i class="pi pi-envelope text-[10px] opacity-70 text-primary"></i>
                                    <span class="text-[11px] font-medium truncate max-w-[180px]" [pTooltip]="company.notificationEmail" tooltipStyleClass="tooltip-wide">{{ company.notificationEmail }}</span>
                                </div>
                                <div class="flex items-center gap-2 text-slate-600 dark:text-slate-400" *ngIf="company.mainPhone">
                                    <i class="pi pi-phone text-[10px] opacity-70 text-primary"></i>
                                    <span class="text-[11px] font-medium">{{ company.phoneExtension }} {{ company.mainPhone }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="py-6 px-4">
                             <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm" *ngIf="company.streetAddress; else noAddress">
                                <i class="pi pi-map-marker text-[10px] opacity-70 text-primary"></i>
                                <span class="line-clamp-2 overflow-hidden text-[11px] font-medium pr-4" [pTooltip]="company.streetAddress" tooltipStyleClass="tooltip-wide">{{ company.streetAddress }}</span>
                            </div>
                            <ng-template #noAddress>
                                <span class="text-slate-400 text-[10px] italic">No registrada</span>
                            </ng-template>
                        </td>
                        <td class="py-6 px-4 text-center">
                            <div class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold border transition-all"
                                 [ngClass]="company.status ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400' : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'">
                                <span class="w-1 h-1 rounded-full mr-2" [ngClass]="company.status ? 'bg-emerald-500' : 'bg-red-500'"></span>
                                {{ company.status ? 'Activo' : 'Inactivo' }}
                            </div>
                        </td>
                        <td class="py-6 px-4 text-right">
                            <div class="flex items-center justify-end gap-2 text-primary">
                                <button *ngIf="canEditCompany()" pButton icon="pi pi-pencil" 
                                        [routerLink]="['/core/management/companies/edit', company.id]"
                                        class="p-button-rounded p-button-text p-button-sm w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        pTooltip="Editar"></button>

                                <button *ngIf="isSuperAdmin()" pButton icon="pi pi-server" 
                                        [routerLink]="['/core/management/companies', company.id, 'subscriptions']"
                                        class="p-button-rounded p-button-text p-button-sm w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        pTooltip="Gestionar Suscripciones"></button>
 
                                <button pButton
                                        *ngIf="isSuperAdmin()"
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
    private authService = inject(AuthService);
    companies = signal<Company[]>([]);
    showInactive = signal<boolean>(false);

    filteredCompanies = computed(() => {
        return this.companies().filter(company => company.status === !this.showInactive());
    });

    isSuperAdmin(): boolean {
        const user = this.authService.currentUser();
        return user?.isSuperAdmin ?? false;
    }

    canEditCompany(): boolean {
        // Super Admin (Global) can edit all
        // ROLE_ADMIN can edit (usually their own company as filtered by backend)
        return this.isSuperAdmin() || this.authService.hasPermission('ROLE_ADMIN');
    }

    // Alerts
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    // Confirmation Modal
    confirmationData = signal<{ title: string, message: string, company: Company } | null>(null);

    ngOnInit() {
        this.loadCompanies();
    }

    getLogoUrl(url: string | undefined): string {
        if (!url) return '';
        if (url.startsWith('private-assets/')) {
            return `/api/${url}`;
        }
        return url;
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