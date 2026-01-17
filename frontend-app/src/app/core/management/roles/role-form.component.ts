import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { IconComponent } from '../../../shared/components/icon.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { RoleManagementService, PermissionsGrouped } from '../../services/role-management.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-role-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, FormsModule, RouterModule,
        ButtonModule, InputTextModule, CheckboxModule, TextareaModule, TooltipModule,
        IconComponent, AlertComponent
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in">

        <app-alert *ngIf="successMessage()" type="success" [message]="successMessage()" (closed)="successMessage.set(null)"></app-alert>
        <app-alert *ngIf="errorMessage()" type="error" [message]="errorMessage()" (closed)="errorMessage.set(null)"></app-alert>

        <!-- Header Section -->
        <div class="max-w-6xl mx-auto mb-10">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Administración</span>
                    <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                        {{ isEditMode() ? 'Editar' : 'Crear' }} <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">Rol</span>
                    </h1>
                </div>
                <button [routerLink]="['/core/management/roles']" class="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm">
                    <app-icon icon="arrow-left" class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors"></app-icon>
                </button>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Define el nombre, descripción y conjunto de permisos que tendrán los usuarios asignados a este rol.
            </p>
        </div>

        <!-- Form Container -->
        <div class="max-w-6xl mx-auto">
            <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden p-8 md:p-12">
                
                <form [formGroup]="form" class="space-y-10">
                    
                    <!-- Sección: Información Básica -->
                    <div>
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 class="text-xl font-black text-slate-800 dark:text-white">Información Básica</h2>
                        </div>
                        
                        <div class="grid grid-cols-1 gap-6">
                            <!-- Nombre del Rol -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre del Rol *</label>
                                <div class="relative group">
                                    <app-icon icon="shield" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                    <input pInputText formControlName="name" placeholder="Administrador de Recursos Humanos" 
                                           style="padding-left: 3.5rem !important;"
                                           class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                </div>
                            </div>

                            <!-- Descripción -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descripción</label>
                                <textarea pTextarea formControlName="description" rows="3" placeholder="Breve descripción del rol y sus responsabilidades..."
                                          class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm resize-none"></textarea>
                            </div>
                            <!-- Información de Jerarquía (Solo para Root/SuperAdmin) -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4" *ngIf="authService.currentUser()?.isSuperAdmin">
                                <div class="flex items-center gap-4 p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/20">
                                    <p-checkbox formControlName="isAdminRole" [binary]="true" inputId="isAdminRole"></p-checkbox>
                                    <label for="isAdminRole" class="flex flex-col cursor-pointer">
                                        <span class="text-sm font-bold text-slate-800 dark:text-white">Rol de Administrador</span>
                                        <span class="text-[10px] text-slate-500 dark:text-slate-400">Otorga permisos básicos de administración por defecto.</span>
                                    </label>
                                </div>
                                <div class="flex items-center gap-4 p-4 bg-red-500/5 dark:bg-red-500/10 rounded-2xl border border-red-500/20">
                                    <p-checkbox formControlName="isRootRole" [binary]="true" inputId="isRootRole"></p-checkbox>
                                    <label for="isRootRole" class="flex flex-col cursor-pointer">
                                        <span class="text-sm font-bold text-red-600 dark:text-red-400">Rol ROOT (Súper Usuario)</span>
                                        <span class="text-[10px] text-slate-500 dark:text-slate-400">Acceso total al sistema. ¡Usar con extrema precaución!</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sección: Permisos -->
                    <div>
                        <div class="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
                            <div class="flex items-center gap-3">
                                <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                                <h2 class="text-xl font-black text-slate-800 dark:text-white">Permisos</h2>
                            </div>
                            <div class="flex gap-2">
                                <button type="button" (click)="toggleAll(true)"
                                        class="px-4 py-2 text-xs font-bold rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-all active:scale-95">
                                    Seleccionar Todo
                                </button>
                                <button type="button" (click)="toggleAll(false)"
                                        class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-95">
                                    Deseleccionar Todo
                                </button>
                            </div>
                        </div>

                        <div *ngIf="permissionsGrouped() as grouped" class="space-y-8 animate-fade-in-up delay-100">
                            <div *ngFor="let subscription of objectKeys(grouped)" 
                                 class="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm">
                                
                                <!-- Subscription Header (e.g. Plataforma Base) -->
                                <div class="px-6 py-4 bg-slate-50/80 dark:bg-white/5 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div class="w-1 h-6 bg-primary rounded-full"></div>
                                        <h3 class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                            {{ subscription }}
                                        </h3>
                                    </div>
                                    <p-checkbox 
                                        [binary]="true"
                                        [ngModel]="isSubscriptionFullySelected(subscription)"
                                        (onChange)="toggleSubscription(subscription, $event.checked)"
                                        [ngModelOptions]="{standalone: true}"
                                        tooltipPosition="left"
                                        pTooltip="Seleccionar todo el módulo {{ subscription }}">
                                    </p-checkbox>
                                </div>

                                <div class="p-6">
                                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <!-- Category Group (e.g. Gestión de Empresas) -->
                                        <div *ngFor="let category of objectKeys(grouped[subscription])" 
                                             class="bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 hover:border-primary/30 dark:hover:border-primary/30 transition-colors group">
                                            
                                            <!-- Category Header with Bulk Select -->
                                            <div class="px-4 py-3 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-transparent">
                                                <div class="flex items-center gap-2">
                                                    <app-icon icon="folder" size="16" class="text-primary opacity-75"></app-icon>
                                                    <span class="font-bold text-sm text-slate-700 dark:text-slate-200">{{ category }}</span>
                                                </div>
                                                <p-checkbox 
                                                    [binary]="true"
                                                    [ngModel]="isResourceFullySelected(subscription, category)"
                                                    (onChange)="toggleResource(subscription, category, $event.checked)"
                                                    [ngModelOptions]="{standalone: true}"
                                                    tooltipPosition="left"
                                                    pTooltip="Seleccionar todo {{ category }}">
                                                </p-checkbox>
                                            </div>

                                            <!-- Permissions List -->
                                            <div class="p-4 space-y-3">
                                                <div *ngFor="let perm of grouped[subscription][category]" 
                                                     class="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                                     [class.opacity-50]="isPermissionDisabled(perm, grouped[subscription][category])">
                                                    
                                                    <p-checkbox 
                                                        [binary]="true"
                                                        [ngModel]="isPermissionSelected(perm.id)"
                                                        [disabled]="isPermissionDisabled(perm, grouped[subscription][category])"
                                                        (onChange)="togglePermission(perm, $event.checked, grouped[subscription][category])"
                                                        [ngModelOptions]="{standalone: true}"
                                                        [inputId]="'perm_' + perm.id">
                                                    </p-checkbox>
                                                    
                                                    <label [for]="'perm_' + perm.id" 
                                                           class="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none flex-1 flex flex-col gap-1">
                                                        
                                                        <div class="flex items-center gap-2">
                                                            <!-- Optional Action Icon based on actionType -->
                                                            <span *ngIf="perm.actionType === 'VIEW'" class="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Ver</span>
                                                            <span *ngIf="perm.actionType === 'CREATE'" class="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Crear</span>
                                                            <span *ngIf="perm.actionType === 'EDIT'" class="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Editar</span>
                                                            <span *ngIf="perm.actionType === 'DELETE'" class="text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Eliminar</span>
                                                            <span *ngIf="perm.actionType === 'ACTION'" class="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Acción</span>
                                                        </div>

                                                        <span class="block text-xs text-slate-500 dark:text-slate-400 leading-tight">{{ perm.description }}</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div *ngIf="!permissionsGrouped() || objectKeys(permissionsGrouped()).length === 0"
                             class="text-center py-12 text-slate-500 dark:text-slate-400">
                            <app-icon icon="alert-circle" size="48" class="mx-auto mb-4 opacity-50"></app-icon>
                            <p>No hay permisos disponibles para esta compañía.</p>
                        </div>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="flex justify-end gap-4 pt-8 border-t border-slate-200 dark:border-white/10">
                        <button type="button" [routerLink]="['/core/management/roles']" 
                                class="px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold">
                            Cancelar
                        </button>
                        <button type="button" (click)="onSubmit()" [disabled]="loading()"
                                class="px-10 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-primary/30 flex items-center gap-2">
                            <app-icon *ngIf="!loading()" icon="save" size="18"></app-icon>
                            <app-icon *ngIf="loading()" icon="pi-spin pi-spinner" size="18"></app-icon>
                            <span>{{ loading() ? 'Procesando...' : (isEditMode() ? 'Actualizar Rol' : 'Crear Rol') }}</span>
                        </button>
                    </div>

                </form>

            </div>
        </div>
    </div>
    `
})
export class RoleFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private roleService = inject(RoleManagementService);
    public authService = inject(AuthService);

    isEditMode = signal(false);
    loading = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);
    permissionsGrouped = signal<PermissionsGrouped | null>(null);

    form!: FormGroup;
    roleId?: string;

    // Helper for template
    objectKeys(obj: any): string[] {
        return obj ? Object.keys(obj) : [];
    }

    ngOnInit() {
        this.initForm();
        this.loadPermissions();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.roleId = params['id'];
                this.isEditMode.set(true);
                this.loadRole(params['id']);
            }
        });
    }

    private initForm() {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: [''],
            isAdminRole: [false],
            isRootRole: [false],
            permissionIds: [[]] // Initialize as an empty array for ngModel
        });
    }

    // --- Manual Permission Handling Helper Methods ---

    isPermissionSelected(permId: string): boolean {
        const currentIds = this.form.get('permissionIds')?.value as string[] || [];
        return currentIds.includes(permId);
    }

    isPermissionDisabled(perm: any, siblings: any[]): boolean {
        // VIEW permissions are never disabled by dependency
        if (perm.actionType === 'VIEW') return false;

        // Find the VIEW permission in the same group
        const viewPerm = siblings.find(p => p.actionType === 'VIEW');

        // If there is no VIEW permission, we don't disable (fallback)
        if (!viewPerm) return false;

        // Disable if VIEW is NOT selected
        return !this.isPermissionSelected(viewPerm.id);
    }

    togglePermission(perm: any, checked: boolean, siblings: any[]) {
        const currentIds = this.form.get('permissionIds')?.value as string[] || [];
        let newIds = [...currentIds];

        if (checked) {
            // Add permission if not present
            if (!newIds.includes(perm.id)) {
                newIds.push(perm.id);
            }

            // AUTO-CHECK VIEW: If this is an action (not VIEW), ensure VIEW is also checked
            if (perm.actionType !== 'VIEW') {
                const viewPerm = siblings.find(p => p.actionType === 'VIEW');
                if (viewPerm && !newIds.includes(viewPerm.id)) {
                    newIds.push(viewPerm.id);
                }
            }
        } else {
            // Remove permission
            newIds = newIds.filter(id => id !== perm.id);

            // CASCADING UNCHECK: If this is VIEW, remove all other permissions in the group
            if (perm.actionType === 'VIEW') {
                const siblingIds = siblings.map(s => s.id);
                // Remove all IDs that belong to this group (except the VIEW which is already removed by line above)
                newIds = newIds.filter(id => !siblingIds.includes(id));
            }
        }

        this.form.get('permissionIds')?.setValue(newIds);
    }

    // ------------------------------------------------

    private loadPermissions() {
        this.roleService.getPermissionsGrouped().subscribe(data => {
            this.permissionsGrouped.set(data || {});
        });
    }

    private loadRole(id: string) {
        this.roleService.getById(id).subscribe({
            next: (data) => {
                this.form.patchValue({
                    name: data.role.name,
                    description: data.role.description,
                    isAdminRole: data.role.isAdminRole || false,
                    isRootRole: data.role.isRootRole || false,
                    permissionIds: data.assignedPermissionIds || [] // Patch the array directly
                });

                // Security: Disable inputs if ROOT role and user is not superAdmin
                if (data.role.isRootRole && !this.authService.currentUser()?.isSuperAdmin) {
                    this.form.get('name')?.disable();
                    this.form.get('isAdminRole')?.disable();
                    this.form.get('isRootRole')?.disable();
                }
            },
            error: () => this.errorMessage.set('Error al cargar la información del rol.')
        });
    }

    toggleAll(checked: boolean) {
        const permissionIdsControl = this.form.get('permissionIds');
        if (!permissionIdsControl) return;

        if (checked && this.permissionsGrouped()) {
            const grouped = this.permissionsGrouped()!;
            const allPermIds: string[] = [];
            Object.keys(grouped).forEach(module => {
                Object.keys(grouped[module]).forEach(resource => {
                    grouped[module][resource].forEach(perm => {
                        allPermIds.push(perm.id);
                    });
                });
            });
            permissionIdsControl.setValue(allPermIds);
        } else {
            permissionIdsControl.setValue([]);
        }
    }

    toggleResource(moduleName: string, resourceName: string, checked: boolean) {
        const permissionIdsControl = this.form.get('permissionIds');
        if (!permissionIdsControl) return;

        const grouped = this.permissionsGrouped();
        if (!grouped || !grouped[moduleName] || !grouped[moduleName][resourceName]) return;

        const permissionsInResource = grouped[moduleName][resourceName];
        const resourcePermIds = permissionsInResource.map(perm => perm.id);

        let currentSelectedIds = permissionIdsControl.value as string[] || [];
        let newSelectedIds = [...currentSelectedIds];

        if (checked) {
            // Add all permissions from this resource that are not already selected
            resourcePermIds.forEach(id => {
                if (!newSelectedIds.includes(id)) {
                    newSelectedIds.push(id);
                }
            });
        } else {
            // Remove all permissions from this resource
            newSelectedIds = newSelectedIds.filter(id => !resourcePermIds.includes(id));
        }
        permissionIdsControl.setValue(newSelectedIds);
    }

    // New: Toggle all permissions for a specific Module/Subscription
    toggleSubscription(moduleName: string, checked: boolean) {
        const permissionIdsControl = this.form.get('permissionIds');
        if (!permissionIdsControl) return;

        const grouped = this.permissionsGrouped();
        if (!grouped || !grouped[moduleName]) return;

        let modulePermIds: string[] = [];
        // Flatten all permission IDs within this module
        Object.keys(grouped[moduleName]).forEach(resourceName => {
            grouped[moduleName][resourceName].forEach(perm => {
                modulePermIds.push(perm.id);
            });
        });

        let currentSelectedIds = permissionIdsControl.value as string[] || [];
        let newSelectedIds = [...currentSelectedIds];

        if (checked) {
            modulePermIds.forEach(id => {
                if (!newSelectedIds.includes(id)) newSelectedIds.push(id);
            });
        } else {
            newSelectedIds = newSelectedIds.filter(id => !modulePermIds.includes(id));
        }
        permissionIdsControl.setValue(newSelectedIds);
    }

    isResourceFullySelected(moduleName: string, resourceName: string): boolean {
        const grouped = this.permissionsGrouped();
        if (!grouped || !grouped[moduleName] || !grouped[moduleName][resourceName]) return false;

        const permissions = grouped[moduleName][resourceName];
        const permissionIds = (this.form.get('permissionIds')?.value as string[]) || [];

        return permissions.every(perm => permissionIds.includes(perm.id));
    }

    // New: Check if all permissions in a subscription/module are selected
    isSubscriptionFullySelected(moduleName: string): boolean {
        const grouped = this.permissionsGrouped();
        if (!grouped || !grouped[moduleName]) return false;

        const permissionIds = (this.form.get('permissionIds')?.value as string[]) || [];

        // Check every single permission in this module group
        return Object.keys(grouped[moduleName]).every(resourceName => {
            return grouped[moduleName][resourceName].every(perm =>
                permissionIds.includes(perm.id)
            );
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.errorMessage.set('Por favor completa los campos requeridos correctamente.');
            return;
        }

        this.loading.set(true);
        const formData = {
            name: this.form.getRawValue().name, // Use getRawValue to include disabled fields if needed
            description: this.form.value.description,
            isAdminRole: this.form.value.isAdminRole || false,
            isRootRole: this.form.value.isRootRole || false,
            permissionIds: this.form.value.permissionIds || []
        };

        const operation = this.isEditMode()
            ? this.roleService.update(this.roleId!, formData)
            : this.roleService.create(formData);

        operation.subscribe({
            next: () => {
                // We DON'T set loading to false here so the button stays in "Processing/Disabled" state until redirection
                this.successMessage.set(this.isEditMode()
                    ? 'Rol actualizado exitosamente.'
                    : 'Rol creado exitosamente.');
                setTimeout(() => this.router.navigate(['/core/management/roles']), 1500);
            },
            error: (err) => {
                this.loading.set(false);
                this.errorMessage.set(err.error?.message || 'Error al guardar el rol.');
            }
        });
    }
}
