import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { IconComponent } from '../../../shared/components/icon.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { UserService, CreateUserRequest } from '../../services/user.service';
import { RoleService, Role } from '../../services/role.service';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        ButtonModule, InputTextModule, MultiSelectModule, ToggleSwitchModule,
        IconComponent, AlertComponent
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in text-slate-800 dark:text-slate-100">

        <!-- Alerts -->
        <app-alert *ngIf="successMessage()" type="success" [message]="successMessage()" (closed)="successMessage.set(null)"></app-alert>
        <app-alert *ngIf="errorMessage()" type="error" [message]="errorMessage()" (closed)="errorMessage.set(null)"></app-alert>

        <!-- Header Section -->
        <div class="max-w-4xl mx-auto mb-10">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Administración</span>
                    <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                        {{ isEditMode() ? 'Editar' : 'Nuevo' }} <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">Usuario</span>
                    </h1>
                </div>
                <button [routerLink]="['/core/management/users']" class="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm">
                    <app-icon name="arrow-left" class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors"></app-icon>
                </button>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Define las credenciales de acceso, asignación de roles y perfil personal para el nuevo integrante de la organización.
            </p>
        </div>

        <!-- Form Container -->
        <div class="max-w-4xl mx-auto">
            <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-500 p-8 md:p-12">
                
                <form [formGroup]="form" class="space-y-10">
                    
                    <!-- Sección 1: Datos de Acceso -->
                    <div>
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 class="text-xl font-black text-slate-800 dark:text-white">Credenciales de Acceso</h2>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Username -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre de Usuario *</label>
                                <div class="relative group">
                                    <app-icon name="user" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                    <input pInputText formControlName="username" placeholder="jdoe" 
                                           style="padding-left: 3.5rem !important;"
                                           class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                </div>
                            </div>

                            <!-- Email -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico *</label>
                                <div class="relative group">
                                    <app-icon name="mail" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                    <input pInputText formControlName="email" type="email" placeholder="john.doe@empresa.com" 
                                           style="padding-left: 3.5rem !important;"
                                           class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                </div>
                            </div>
                        </div>
                        <p class="text-[10px] text-slate-400 italic mt-4">* La contraseña se generará automáticamente y se enviará por correo electrónico.</p>
                    </div>

                    <!-- Sección 2: Información Personal -->
                    <div>
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 class="text-xl font-black text-slate-800 dark:text-white">Perfil Personal</h2>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Nombre -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombres *</label>
                                <input pInputText formControlName="firstName" placeholder="John" 
                                       class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                            </div>

                            <!-- Apellido 1 -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Primer Apellido *</label>
                                <input pInputText formControlName="firstSurname" placeholder="Doe" 
                                       class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                            </div>

                            <!-- Apellido 2 -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Segundo Apellido</label>
                                <input pInputText formControlName="secondSurname" placeholder="Smith" 
                                       class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                            </div>
                        </div>
                    </div>

                    <!-- Sección 3: Organización -->
                    <div>
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 class="text-xl font-black text-slate-800 dark:text-white">Asignación de Roles</h2>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Rol -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Roles en la Organización *</label>
                                
                                <!-- ÁREA DE CHIPS EXTERNA: Roles Seleccionados -->
                                <div class="flex flex-wrap gap-2 mb-1 min-h-[32px]" *ngIf="form.get('roleIds')?.value?.length > 0">
                                    <div *ngFor="let role of form.get('roleIds')?.value" 
                                         class="group flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-default animate-fade-in">
                                        
                                        <!-- Icono decorativo -->
                                        <div class="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]"></div>
                                        
                                        <span class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ role.name }}</span>
                                        
                                        <!-- Botón Eliminar -->
                                        <button (click)="removeRole(role)" type="button" 
                                                class="ml-1 p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-danger transition-colors">
                                            <app-icon name="x" class="w-3.5 h-3.5"></app-icon>
                                        </button>
                                    </div>
                                </div>

                                <!-- SELECTOR: Solo para añadir, visualización limpia -->
                                <p-multiSelect [options]="roles()" optionLabel="name" formControlName="roleIds" 
                                          [filter]="true" filterBy="name"
                                          dataKey="id"
                                          placeholder="Seleccionar roles..."
                                          class="w-full" styleClass="w-full" appendTo="body"
                                          [showHeader]="true">
                                    
                                    <!-- Template cuando hay items seleccionados (Resumen limpio) -->
                                    <ng-template let-value pTemplate="selectedItems">
                                        <div *ngIf="!value || value.length === 0" class="text-slate-400">
                                            Seleccionar roles para asignar...
                                        </div>
                                        <div *ngIf="value && value.length > 0" class="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center gap-2">
                                            <span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">{{ value.length }}</span>
                                            <span>roles asignados actualmente</span>
                                        </div>
                                    </ng-template>

                                    <!-- Template para items de la lista desplegable -->
                                    <ng-template let-role pTemplate="item">
                                        <div class="flex flex-col py-1">
                                            <span class="font-bold text-sm text-slate-700 dark:text-slate-200">{{role.name}}</span>
                                            <span class="text-xs text-slate-400" *ngIf="role.description">{{role.description}}</span>
                                        </div>
                                    </ng-template>

                                </p-multiSelect>
                            </div>

                            <!-- Status Toggle -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Estado de Cuenta</label>
                                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 h-[52px]">
                                    <span class="text-sm font-bold ml-1">{{ form.get('active')?.value ? 'Activo' : 'Inactivo' }}</span>
                                    <p-toggleswitch formControlName="active"></p-toggleswitch>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="flex items-center justify-end gap-4 pt-8 border-t border-slate-200 dark:border-white/10">
                        <button type="button" [routerLink]="['/core/management/users']" 
                                class="px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold">
                            Cancelar
                        </button>
                        <button type="button" (click)="onSubmit()" [disabled]="loading()"
                                class="px-10 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all font-bold shadow-lg shadow-primary/30 flex items-center gap-2">
                            <app-icon *ngIf="!loading()" name="save" size="18"></app-icon>
                            <span *ngIf="!loading()">{{ isEditMode() ? 'Actualizar Usuario' : 'Crear Usuario' }}</span>
                            <span *ngIf="loading()">Procesando...</span>
                        </button>
                    </div>

                </form>

            </div>
        </div>
    </div>
    `
})
export class UserFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private userService = inject(UserService);
    private roleService = inject(RoleService);

    isEditMode = signal(false);
    loading = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);
    roles = signal<Role[]>([]);

    form!: FormGroup;
    userId?: string;
    realUserId?: string;

    ngOnInit() {
        this.initForm();
        this.loadRoles().subscribe(() => {
            this.route.params.subscribe(params => {
                if (params['id']) {
                    this.userId = params['id'];
                    this.isEditMode.set(true);
                    this.loadUser(params['id']);
                }
            });
        });
    }

    private initForm() {
        this.form = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            firstName: ['', Validators.required],
            firstSurname: ['', Validators.required],
            secondSurname: [''],
            roleIds: [[], [Validators.required]],
            active: [true]
        });
    }

    private loadRoles() {
        const roles$ = this.roleService.getAll();
        roles$.subscribe(data => {
            // Filter only active roles for assignment
            this.roles.set(data.filter(r => r.active));
        });
        return roles$;
    }

    private loadUser(id: string) {
        this.userService.getById(id).subscribe({
            next: (data) => {
                this.realUserId = data.userId;
                const formValue: any = { ...data };
                if (data.roleIds && data.roleIds.length > 0) {
                    const selectedRoles = this.roles().filter(r => data.roleIds.includes(r.id));
                    formValue.roleIds = selectedRoles;
                } else {
                    formValue.roleIds = [];
                }
                this.form.patchValue(formValue);
            },
            error: () => this.errorMessage.set('Error al cargar la información del usuario.')
        });
    }

    removeRole(roleToRemove: Role) {
        const currentRoles = this.form.get('roleIds')?.value || [];
        const updatedRoles = currentRoles.filter((r: Role) => r.id !== roleToRemove.id);
        this.form.patchValue({ roleIds: updatedRoles });
        this.form.markAsDirty();
    }

    onSubmit() {
        if (this.form.invalid) {
            this.errorMessage.set('Por favor completa los campos requeridos correctamente.');
            return;
        }

        this.loading.set(true);
        const formValue = this.form.value;

        // Transformar objetos Role a UUIDs
        let roleIdsToSend: string[] = [];
        if (formValue.roleIds && Array.isArray(formValue.roleIds)) {
            roleIdsToSend = formValue.roleIds.map((r: any) => r.id);
        }

        const userData = {
            ...formValue,
            roleIds: roleIdsToSend
        };

        if (this.isEditMode() && this.realUserId) {
            this.userService.updateRoles(this.realUserId, userData.roleIds).subscribe({
                next: () => {
                    this.loading.set(false);
                    this.successMessage.set('Roles actualizados exitosamente.');
                    setTimeout(() => this.router.navigate(['/core/management/users']), 1500);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.errorMessage.set(err.error?.message || 'Error al actualizar los roles.');
                }
            });
        } else {
            this.userService.create(userData).subscribe({
                next: () => {
                    this.loading.set(false);
                    this.successMessage.set('Usuario registrado exitosamente. Se han enviado las credenciales por correo.');
                    setTimeout(() => this.router.navigate(['/core/management/users']), 2000);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.errorMessage.set(err.error?.message || 'Error al registrar el usuario.');
                }
            });
        }
    }
}
