import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { IconComponent } from '../../../shared/components/icon.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RoleManagementService, Role } from '../../services/role-management.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { computed } from '@angular/core';

@Component({
    selector: 'app-role-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, InputTextModule, TooltipModule, IconComponent, AlertComponent, ConfirmDialogComponent, ToggleSwitchModule, FormsModule],
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
                <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Módulo de Seguridad</span>
                <h1 class="text-3xl font-black text-slate-900 dark:text-white">
                    Roles y <span class="text-primary">Perfiles</span>
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">Gestión de permisos y jerarquías de seguridad a nivel global.</p>
            </div>
            <a routerLink="/core/management/roles/create" 
               class="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95">
                <app-icon name="plus" size="18"></app-icon>
                <span>Nuevo Rol</span>
            </a>
        </div>

        <div class="bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden p-6 transition-all duration-300">
            
            <p-table #dt [value]="filteredRoles()" [rows]="10" [paginator]="true" 
                     [globalFilterFields]="['name', 'description']"
                     styleClass="p-datatable-sm" 
                     [tableStyle]="{ 'min-width': '50rem' }">
                
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between pb-6 gap-4">
                        <div class="relative w-full max-w-md group">
                            <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors z-10 text-base"></i>
                            <input pInputText type="text" 
                                   (input)="dt.filterGlobal($any($event.target).value, 'contains')" 
                                   placeholder="Buscar por nombre o descripción de rol..." 
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
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent" style="width:45%">Identificación del Rol</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-center" style="width:15%">Permisos</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-center" style="width:15%">Estado</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-right" style="width:25%">Gestión</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-role>
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-indigo-500/5 transition-all duration-300 group border-b border-slate-100 dark:border-slate-800/50 last:border-none">
                        <td class="py-6 px-4">
                            <div class="flex items-center gap-4">
                                <div class="h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                    {{ role.name.substring(0,2).toUpperCase() }}
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ role.name }}</span>
                                    <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2 overflow-hidden" 
                                          *ngIf="role.description"
                                          [pTooltip]="role.description" 
                                          tooltipStyleClass="tooltip-wide"
                                          tooltipPosition="bottom"
                                          [showDelay]="500">
                                        {{ role.description }}
                                    </span>
                                    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 mt-1 w-fit" *ngIf="role.isSystemRole">
                                        <i class="pi pi-lock text-[8px]"></i>
                                        Sistema
                                    </span>
                                </div>
                            </div>
                        </td>
                        <td class="py-6 px-4 text-center">
                            <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
                                <i class="pi pi-shield text-[10px]"></i>
                                <span>{{ role.permissionCount || 0 }}</span>
                            </div>
                        </td>
                        <td class="py-6 px-4 text-center">
                            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors"
                                 [ngClass]="role.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'">
                                <div class="w-1 h-1 rounded-full" [ngClass]="role.active ? 'bg-emerald-500' : 'bg-rose-500'"></div>
                                <span>{{ role.active ? 'Activo' : 'Inactivo' }}</span>
                            </div>
                        </td>
                        <td class="py-6 px-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button pButton icon="pi pi-pencil" 
                                        [routerLink]="['/core/management/roles/edit', role.id]"
                                        class="p-button-rounded p-button-text p-button-secondary p-button-sm w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        pTooltip="Editar"></button>

                                <button pButton
                                        *ngIf="!role.isSystemRole"
                                        [icon]="role.active ? 'pi pi-ban' : 'pi pi-check-circle'"
                                        (click)="toggleActive(role)"
                                        class="p-button-rounded p-button-text p-button-sm w-8 h-8 transition-colors"
                                        [ngClass]="role.active ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'"
                                        [pTooltip]="role.active ? 'Desactivar Rol' : 'Activar Rol'"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="4" class="text-center py-20">
                            <div class="flex flex-col items-center">
                                <div class="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 text-slate-400 mb-4 flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-transform hover:scale-110">
                                    <app-icon name="shield" size="32"></app-icon>
                                </div>
                                <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Sin roles definidos</h3>
                                <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-2">No se han configurado perfiles de seguridad en el ecosistema.</p>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    </div>
    `
})
export class RoleListComponent implements OnInit {
    private roleService = inject(RoleManagementService);
    roles = signal<Role[]>([]);
    showInactive = signal<boolean>(false);

    filteredRoles = computed(() => {
        return this.roles().filter(role => role.active === !this.showInactive());
    });

    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);
    confirmationData = signal<{ title: string, message: string, role: Role } | null>(null);

    ngOnInit() {
        this.loadRoles();
    }

    loadRoles() {
        this.roleService.getAll().subscribe(data => this.roles.set(data));
    }

    toggleActive(role: Role) {
        const isActivating = !role.active;
        this.confirmationData.set({
            title: isActivating ? '¿Activar Rol?' : '¿Desactivar Rol?',
            message: isActivating
                ? `¿Deseas reactivar el rol "${role.name}"? Los usuarios con este rol recuperarán sus permisos.`
                : `¿Estás seguro de desactivar el rol "${role.name}"? Los usuarios con este rol perderán temporalmente sus permisos.`,
            role: role
        });
    }

    onConfirmToggle() {
        const data = this.confirmationData();
        if (!data) return;

        this.roleService.toggleActive(data.role.id).subscribe({
            next: () => {
                this.loadRoles();
                this.confirmationData.set(null);
                this.successMessage.set(data.role.active
                    ? 'Rol desactivado correctamente.'
                    : 'Rol activado correctamente.');
            },
            error: () => {
                this.confirmationData.set(null);
                this.errorMessage.set('Error al cambiar el estado del rol.');
            }
        });
    }
}
