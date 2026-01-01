import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { IconComponent } from '../../../shared/components/icon.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserService, UserManagement } from '../../services/user.service';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { computed } from '@angular/core';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, InputTextModule, TooltipModule, TagModule, IconComponent, AlertComponent, ConfirmDialogComponent, ToggleSwitchModule, FormsModule],
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
                <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Recursos Humanos</span>
                <h1 class="text-3xl font-black text-slate-900 dark:text-white">
                    Directorio de <span class="text-primary">Usuarios</span>
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm">Control centralizado de accesos, perfiles y estados de cuenta.</p>
            </div>
            <a routerLink="/core/management/users/create" 
               class="flex items-center gap-2 bg-primary hover:bg-primary-600 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95">
                <app-icon name="user-plus" size="18"></app-icon>
                <span>Crear nuevo usuario</span>
            </a>
        </div>

        <div class="bg-white/80 dark:bg-[var(--bg-card)] backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden p-6 transition-all duration-300">
            
            <p-table #dt [value]="filteredUsers()" [rows]="10" [paginator]="true" 
                     [globalFilterFields]="['username', 'email', 'firstName', 'firstSurname']"
                     styleClass="p-datatable-sm" 
                     [tableStyle]="{ 'min-width': '50rem' }">
                
                <ng-template pTemplate="caption">
                    <div class="flex items-center justify-between pb-6 gap-4">
                        <div class="relative w-full max-w-md group">
                            <i class="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-primary transition-colors z-10 text-base"></i>
                            <input pInputText type="text" 
                                   (input)="dt.filterGlobal($any($event.target).value, 'contains')" 
                                   placeholder="Buscar por nombre, correo o usuario..." 
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
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent" style="width:35%">Información Personal</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-center" style="width:15%">Verificación</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-center" style="width:15%">Rol</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-center" style="width:15%">Estado</th>
                        <th class="py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 bg-transparent text-right" style="width:15%">Acciones</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-user>
                    <tr class="hover:bg-slate-50/80 dark:hover:bg-indigo-500/5 transition-all duration-300 group border-b border-slate-100 dark:border-slate-800/50 last:border-none">
                        <td class="py-6 px-4">
                            <div class="flex items-center gap-4">
                                <div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                                    {{ user.username.substring(0,2).toUpperCase() }}
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-sm font-bold text-slate-800 dark:text-slate-200">{{ user.firstName }} {{ user.firstSurname }}</span>
                                    <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400">{{ user.email }}</span>
                                </div>
                            </div>
                        </td>
                        <td class="py-6 px-4 text-center">
                            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition-colors"
                                 [ngClass]="user.verified ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'">
                                <div class="w-1 h-1 rounded-full" [ngClass]="user.verified ? 'bg-emerald-500' : 'bg-amber-500'"></div>
                                <span>{{ user.verified ? 'Verificado' : 'Pendiente' }}</span>
                            </div>
                        </td>
                        <td class="py-6 px-4 text-center">
                            <div class="flex flex-wrap justify-center gap-1">
                                <span *ngFor="let role of user.roleNames" class="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 tracking-wider">
                                    {{ role }}
                                </span>
                            </div>
                        </td>
                        <td class="py-6 px-4 text-center">
                            <span class="px-3 py-1 rounded-full text-[10px] font-bold border transition-all"
                                  [ngClass]="user.active ? 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400' : 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400'">
                                {{ user.active ? 'Activo' : 'Inactivo' }}
                            </span>
                        </td>
                        <td class="py-6 px-4 text-right">
                            <div class="flex items-center justify-end gap-2">
                                <button pButton icon="pi pi-pencil" 
                                        [routerLink]="['/core/management/users/edit', user.id]"
                                        class="p-button-rounded p-button-text p-button-secondary p-button-sm w-8 h-8 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                        pTooltip="Editar"></button>

                                <button pButton
                                        [icon]="user.active ? 'pi pi-ban' : 'pi pi-check-circle'"
                                        (click)="toggleActive(user)"
                                        class="p-button-rounded p-button-text p-button-sm w-8 h-8 transition-colors"
                                        [ngClass]="user.active ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'"
                                        [pTooltip]="user.active ? 'Desactivar Cuenta' : 'Activar Cuenta'"></button>
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="5" class="text-center py-20">
                            <div class="flex flex-col items-center">
                                <div class="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 text-slate-400 mb-4 flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-transform hover:scale-110">
                                    <app-icon name="users" size="32"></app-icon>
                                </div>
                                <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100">Sin usuarios registrados</h3>
                                <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xs mt-2">No se han encontrado cuentas de usuario en esta organización.</p>
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    </div>
    `
})
export class UserListComponent implements OnInit {
    private userService = inject(UserService);
    users = signal<UserManagement[]>([]);
    showInactive = signal<boolean>(false);

    filteredUsers = computed(() => {
        return this.users().filter(user => user.active === !this.showInactive());
    });

    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);
    confirmationData = signal<{ title: string, message: string, user: UserManagement } | null>(null);

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        this.userService.getAll().subscribe(data => this.users.set(data));
    }

    toggleActive(user: UserManagement) {
        const isActivating = !user.active;
        this.confirmationData.set({
            title: isActivating ? '¿Activar Usuario?' : '¿Desactivar Usuario?',
            message: isActivating
                ? `¿Deseas reactivar el acceso para ${user.firstName} ${user.firstSurname}?`
                : `¿Estás seguro de desactivar la cuenta de ${user.firstName} ${user.firstSurname}? Esto impedirá su ingreso al sistema.`,
            user: user
        });
    }

    onConfirmToggle() {
        const data = this.confirmationData();
        if (!data) return;

        this.userService.toggleActive(data.user.id).subscribe({
            next: () => {
                this.loadUsers();
                this.confirmationData.set(null);
                this.successMessage.set(data.user.active
                    ? 'Usuario desactivado correctamente.'
                    : 'Usuario activado correctamente.');
            },
            error: () => {
                this.confirmationData.set(null);
                this.errorMessage.set('Error al cambiar el estado del usuario.');
            }
        });
    }
}
