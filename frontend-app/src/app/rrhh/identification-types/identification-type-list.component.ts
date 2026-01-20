import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { IdentificationTypeService, IdentificationType } from '../../core/services/identification-type.service';

@Component({
    selector: 'app-identification-type-list',
    standalone: true,
    imports: [
        CommonModule, RouterModule, TableModule, ButtonModule,
        InputTextModule, TooltipModule, ToggleSwitchModule,
        FormsModule, IconComponent, AlertComponent, ConfirmDialogComponent
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in text-slate-800 dark:text-slate-100">
        
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
                <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Configuración RRHH</span>
                <h1 class="text-3xl font-black text-slate-900 dark:text-white">
                    Tipos de <span class="text-primary">Identificación</span>
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">Gestiona los documentos de identidad para empleados (CC, TI, Pasaporte, etc.)</p>
            </div>
            <a routerLink="/rrhh/identification-types/create" 
               class="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95">
                <app-icon name="plus" size="18"></app-icon>
                <span>Nuevo Tipo</span>
            </a>
        </div>

        <div class="bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden p-6 transition-all duration-300">
            
            <p-table #dt [value]="displayItems" [rows]="10" [paginator]="true" 
                     [globalFilterFields]="['name', 'code', 'countryName']"
                     styleClass="p-datatable-sm" 
                     [tableStyle]="{ 'min-width': '60rem' }">
                
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between pb-6 gap-4">
                        <div class="relative w-full max-w-md group">
                            <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors z-10 text-base"></i>
                            <input pInputText type="text" 
                                   (input)="dt.filterGlobal($any($event.target).value, 'contains')" 
                                   placeholder="Buscar por código o nombre..." 
                                   style="padding-left: 3.5rem !important;"
                                   class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                        </div>

                        <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                            <span class="text-[10px] font-bold uppercase tracking-wider transition-colors"
                                  [ngClass]="showInactive() ? 'text-slate-400' : 'text-primary'">Activos</span>
                            <p-toggleSwitch [ngModel]="showInactive()" 
                                           (onChange)="showInactive.set($event.checked)"
                                           size="small"></p-toggleSwitch>
                            <span class="text-[10px] font-bold uppercase tracking-wider transition-colors"
                                  [ngClass]="showInactive() ? 'text-rose-500' : 'text-slate-400'">Inactivos</span>
                        </div>
                    </div>
                </ng-template>

                <ng-template pTemplate="header">
                    <tr class="border-b border-slate-200 dark:border-slate-700/50">
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent" style="width:15%">Código</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent" style="width:35%">Nombre</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-center" style="width:12%">País</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-center" style="width:10%">Estado</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-right" style="width:8%">Gestión</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-item>
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-indigo-500/5 transition-all duration-300 group border-b border-slate-100 dark:border-slate-800/50 last:border-none">
                        <td class="py-6 px-4">
                            <div class="flex items-center gap-2">
                                <span class="text-xs font-black px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" *ngIf="item.code">
                                    {{ item.code }}
                                </span>
                                <span class="text-xs text-slate-400" *ngIf="!item.code">-</span>
                            </div>
                        </td>
                        <td class="py-6 px-4">
                            <div class="flex items-start gap-4">
                                <div class="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm transition-transform mt-1"
                                     [ngClass]="item.isGlobal ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' : 'bg-primary/10 text-primary group-hover:scale-110'">
                                    <app-icon name="id-card" size="18"></app-icon>
                                </div>
                                <div class="flex flex-col gap-0.5">
                                    <div class="flex items-center gap-2">
                                        <span class="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{{ item.name }}</span>
                                        <div *ngIf="item.validationRegex" 
                                             [pTooltip]="'Regla de Validación: ' + item.validationRegex" 
                                             tooltipPosition="bottom"
                                             class="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all cursor-help">
                                            <app-icon name="sparkles" size="10"></app-icon>
                                        </div>
                                    </div>
                                    <span class="text-[9px] text-slate-400 uppercase tracking-widest font-black" *ngIf="item.validationRegex">Formato Validado</span>
                                </div>
                            </div>
                        </td>
                        <td class="py-6 px-4 text-center">
                            <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20" *ngIf="item.countryName">
                                {{ item.countryName }}
                            </span>
                            <span class="text-xs text-slate-400" *ngIf="!item.countryName">-</span>
                        </td>
                        <td class="py-6 px-4 text-center">
                            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors"
                                 [ngClass]="item.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'">
                                <div class="w-1 h-1 rounded-full" [ngClass]="item.active ? 'bg-emerald-500' : 'bg-rose-500'"></div>
                                <span>{{ item.active ? 'Activo' : 'Inactivo' }}</span>
                            </div>
                        </td>
                        <td class="py-6 px-4 text-right">
                            <div class="flex items-center justify-end gap-2 text-primary" *ngIf="!item.isGlobal">
                                <button pButton icon="pi pi-pencil" 
                                        [routerLink]="['/rrhh/identification-types/edit', item.id]"
                                        class="p-button-rounded p-button-text p-button-sm w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        pTooltip="Editar"></button>

                                <button pButton
                                        [icon]="item.active ? 'pi pi-ban' : 'pi pi-check-circle'"
                                        (click)="toggleActive(item)"
                                        class="p-button-rounded p-button-text p-button-sm w-8 h-8 transition-colors"
                                        [ngClass]="item.active ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'"
                                        [pTooltip]="item.active ? 'Desactivar' : 'Activar'"></button>
                            </div>
                            <div class="flex items-center justify-end gap-2" *ngIf="item.isGlobal">
                                <span class="text-[10px] text-slate-400 cursor-not-allowed opacity-50 bg-slate-100 px-2 py-1 rounded">Sistema</span>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="7" class="text-center py-20">
                            <div class="flex flex-col items-center">
                                <div class="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 text-slate-400 mb-4 flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-transform hover:scale-110">
                                    <app-icon name="id-card" size="32"></app-icon>
                                </div>
                                <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Sin tipos de identificación</h3>
                                <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-2">No se han configurado tipos de documentos de identidad.</p>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    </div>
    `
})
export class IdentificationTypeListComponent implements OnInit {
    private service = inject(IdentificationTypeService);

    items = signal<IdentificationType[]>([]);
    showInactive = signal<boolean>(false);
    displayItems: IdentificationType[] = [];

    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);
    confirmationData = signal<{ title: string, message: string, item: IdentificationType } | null>(null);

    constructor() {
        effect(() => {
            this.displayItems = this.items()
                .filter(item => item.active === !this.showInactive())
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        });
    }

    ngOnInit() {
        this.loadItems();
    }

    loadItems() {
        this.service.getAll().subscribe({
            next: (data) => this.items.set(data),
            error: () => this.errorMessage.set('Error al cargar los tipos de identificación.')
        });
    }

    toggleActive(item: IdentificationType) {
        const isActivating = !item.active;
        this.confirmationData.set({
            title: isActivating ? '¿Activar Tipo?' : '¿Desactivar Tipo?',
            message: isActivating
                ? `¿Deseas reactivar el tipo de identificación "${item.name}"?`
                : `¿Estás seguro de desactivar el tipo de identificación "${item.name}"?`,
            item: item
        });
    }

    onConfirmToggle() {
        const data = this.confirmationData();
        if (!data || !data.item.id) return;

        this.service.toggleActive(data.item.id).subscribe({
            next: () => {
                this.loadItems();
                this.confirmationData.set(null);
                this.successMessage.set(data.item.active
                    ? 'Tipo de identificación desactivado correctamente.'
                    : 'Tipo de identificación activado correctamente.');
            },
            error: () => {
                this.confirmationData.set(null);
                this.errorMessage.set('Error al cambiar el estado del tipo de identificación.');
            }
        });
    }
}
