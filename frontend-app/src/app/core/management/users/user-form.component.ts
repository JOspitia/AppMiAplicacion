import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DialogModule } from 'primeng/dialog';
import { IconComponent } from '../../../shared/components/icon.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { UserService, CreateUserRequest } from '../../services/user.service';
import { RoleService, Role } from '../../services/role.service';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        ButtonModule, InputTextModule, MultiSelectModule, ToggleSwitchModule, DialogModule,
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

        <!-- Wizard Container -->
        <div class="max-w-4xl mx-auto">
            <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-500">
                
                <!-- Premium Step Indicator (Only for Create) -->
                <div *ngIf="!isEditMode()" class="p-8 pb-4">
                    <div class="flex items-center justify-between relative px-2 sm:px-8">
                        <!-- Background Track -->
                        <div class="absolute top-[34px] left-0 right-0 h-[2px] bg-slate-200 dark:bg-white/5 -z-0 mx-12 sm:mx-20">
                            <!-- Progress Line -->
                            <div class="h-full transition-all duration-700 ease-out shadow-lg bg-primary" 
                                 [style.boxShadow]="'0 0 15px var(--primary-light)'"
                                 [style.width]="(currentStep() / 2 * 100) + '%'"></div>
                        </div>

                        <!-- Step Nodes -->
                        <ng-container *ngFor="let stepName of ['Identidad', 'Perfil', 'Roles']; let i = index">
                            <div class="flex flex-col items-center gap-4 relative z-10 group">
                                <div [class]="currentStep() === i ? 'bg-white dark:bg-slate-900 ring-4 ring-primary/10' : (currentStep() > i ? 'bg-white dark:bg-slate-900' : 'bg-white dark:bg-slate-900')"
                                     class="p-1.5 rounded-[1.25rem] transition-all duration-500 border border-slate-200 dark:border-white/10">
                                    <div [class]="currentStep() === i ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-110' : (currentStep() > i ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-transparent text-slate-400 dark:text-slate-700 border border-slate-200 dark:border-white/10')"
                                         class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-all duration-500">
                                        <app-icon *ngIf="currentStep() > i" name="check" class="w-6 h-6 stroke-[3]"></app-icon>
                                        <span *ngIf="currentStep() <= i">{{ i + 1 }}</span>
                                    </div>
                                </div>
                                <span [class]="currentStep() === i ? 'text-primary' : (currentStep() > i ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-700')"
                                      class="text-[10px] font-black uppercase tracking-[0.15em] transition-colors duration-500">
                                    {{ stepName }}
                                </span>
                            </div>
                        </ng-container>
                    </div>
                </div>

                <div class="p-8 md:p-12" [class.pt-4]="!isEditMode()">
                    <form [formGroup]="form" (ngSubmit)="handleMainAction()" class="space-y-10">
                        
                        <!-- STEP 1: Identidad (Acceso) -->
                        <div *ngIf="currentStep() === 0 || isEditMode()" class="animate-fade-in">
                            <div class="flex items-center gap-3 mb-6">
                                <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                                <h2 class="text-xl font-black text-slate-800 dark:text-white">Credenciales de Acceso</h2>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre de Usuario *</label>
                                    <div class="relative group">
                                        <app-icon name="user" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                        <input pInputText formControlName="username" 
                                               style="padding-left: 3.5rem !important;"
                                               [readonly]="isEditMode()"
                                                class="w-full pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                    </div>
                                </div>

                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico *</label>
                                    <div class="relative group">
                                        <app-icon name="mail" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                        <input pInputText formControlName="email" type="email"
                                               style="padding-left: 3.5rem !important;"
                                               [readonly]="isEditMode()"
                                               class="w-full pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                    </div>
                                </div>
                            </div>
                            <p *ngIf="!isEditMode()" class="text-[10px] text-slate-400 italic mt-4">* La contraseña se generará automáticamente y se enviará por correo electrónico.</p>
                        </div>

                        <!-- STEP 2: Información Personal -->
                        <div *ngIf="(currentStep() === 1 && !isEditMode()) || isEditMode()" class="animate-fade-in">
                            <div class="flex items-center gap-3 mb-6">
                                <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                                <h2 class="text-xl font-black text-slate-800 dark:text-white">Perfil Personal</h2>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombres *</label>
                                    <input pInputText formControlName="firstName" 
                                           class="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                </div>

                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Primer Apellido *</label>
                                    <input pInputText formControlName="firstSurname" 
                                           class="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                </div>

                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Segundo Apellido</label>
                                    <input pInputText formControlName="secondSurname" 
                                           class="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                </div>
                            </div>
                        </div>

                        <!-- STEP 3: Roles -->
                        <div *ngIf="(currentStep() === 2 && !isEditMode()) || isEditMode()" class="animate-fade-in">
                            <div class="flex items-center gap-3 mb-6">
                                <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                                <h2 class="text-xl font-black text-slate-800 dark:text-white">Asignación de Roles</h2>
                            </div>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <!-- Rol selector (Full width for better readability) -->
                                <div class="flex flex-col gap-2 md:col-span-2">
                                    <div class="flex flex-col gap-1 mb-1">
                                        <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Roles en la Organización *</label>
                                        <p *ngIf="!isEditMode()" class="text-[9px] text-primary/70 font-bold italic ml-1">
                                            Tip: Si no seleccionas ninguno, se asignará automáticamente "NUEVO_EMPLEADO".
                                        </p>
                                    </div>
                                    
                                    <!-- ÁREA DE CHIPS EXTERNA: Roles Seleccionados -->
                                    <div class="flex flex-wrap gap-2 mb-2 min-h-[32px] max-h-32 overflow-y-auto pr-1 premium-scrollbar" *ngIf="form.get('roleIds')?.value?.length > 0">
                                        <div *ngFor="let role of form.get('roleIds')?.value" 
                                             class="group flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-default animate-fade-in text-slate-700 dark:text-slate-200 font-bold text-xs">
                                            
                                            <!-- Icono decorativo -->
                                            <div class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]"></div>
                                            
                                            <span>{{ role.name }}</span>
                                            
                                            <!-- Botón Eliminar -->
                                            <button (click)="removeRole(role)" type="button" 
                                                    class="ml-1 p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-danger transition-colors">
                                                <app-icon name="x" class="w-3.5 h-3.5"></app-icon>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- SELECTOR -->
                                    <p-multiSelect [options]="roles()" optionLabel="name" formControlName="roleIds" 
                                              [filter]="true" filterBy="name"
                                              dataKey="id"
                                              class="w-full" styleClass="w-full" appendTo="body"
                                              [showHeader]="true">
                                        
                                        <ng-template let-value pTemplate="selectedItems">
                                            <div *ngIf="!value || value.length === 0" class="py-1">
                                                <span class="text-slate-500 dark:text-slate-400 text-sm">Seleccionar roles...</span>
                                            </div>
                                            <div *ngIf="value && value.length > 0" class="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center gap-2 py-1">
                                                <span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">{{ value.length }}</span>
                                                <span>roles asignados</span>
                                            </div>
                                        </ng-template>

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
                                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 h-[56px] shadow-sm">
                                        <span class="text-sm font-bold ml-1 text-slate-700 dark:text-slate-200">{{ form.get('active')?.value ? 'Activo' : 'Inactivo' }}</span>
                                        <p-toggleswitch formControlName="active"></p-toggleswitch>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Wizard Controls -->
                        <div class="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-white/10">
                            <!-- Left: Cancel or Previous -->
                            <button type="button" (click)="currentStep() === 0 || isEditMode() ? onCancel() : previousStep()"
                                    class="px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold">
                                {{ currentStep() === 0 || isEditMode() ? 'Cancelar' : 'Atrás' }}
                            </button>

                            <!-- Right: Next or Submit -->
                            <button type="submit" [disabled]="loading()"
                                    class="px-10 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-primary/30 flex items-center gap-2">
                                <app-icon *ngIf="!loading()" [name]="isLastStep() || isEditMode() ? 'save' : 'arrow-right'" size="18"></app-icon>
                                <app-icon *ngIf="loading()" icon="pi-spin pi-spinner" size="18"></app-icon>
                                <span>
                                    {{ loading() ? 'Procesando...' : (isLastStep() || isEditMode() ? (isEditMode() ? 'Actualizar' : 'Crear Usuario') : 'Siguiente') }}
                                </span>
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>

        <!-- Global Link Confirmation Dialog -->
        <p-dialog [(visible)]="showLinkModal" [modal]="true" [draggable]="false" [resizable]="false" 
                  [closable]="true" [showHeader]="false"
                  styleClass="premium-dialog-alt !bg-transparent !border-0 !shadow-none" 
                  [style]="{width: '450px', background: 'transparent', border: 'none'}">
            <div class="relative overflow-hidden bg-white/90 dark:bg-[#0f172a]/95 backdrop-blur-3xl rounded-[3rem] border border-white/20 dark:border-white/10 shadow-2xl pt-14 pb-8 px-8 md:pt-16 md:pb-10 md:px-10 animate-fade-in">
                
                <!-- Decorative Glow -->
                <div class="absolute -top-16 -right-16 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>
                <div class="absolute -bottom-16 -left-16 w-32 h-32 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>

                <div class="relative space-y-8">
                    <!-- Icon & Title Section -->
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                            <app-icon name="user" size="24"></app-icon>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">Usuario Existente</span>
                            <h3 class="text-xl font-black text-slate-900 dark:text-white leading-none">Vincular a Empresa</h3>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="space-y-4">
                        <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                            <span class="text-xs text-slate-400 block mb-1">Nombre Completo</span>
                            <span class="text-lg font-bold text-slate-800 dark:text-slate-100">{{ globalUserName() }}</span>
                        </div>
                        <p class="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                            Este usuario ya se encuentra registrado en nuestra red global. Al vincularlo, se mantendrán sus datos personales pero se le otorgarán los roles específicos de esta organización.
                        </p>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-col sm:flex-row gap-3 pt-2">
                        <button type="button" (click)="showLinkModal = false"
                                class="flex-1 px-8 py-4 text-xs font-black uppercase tracking-widest bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded-2xl transition-all border border-transparent dark:border-white/5">
                            Cancelar
                        </button>
                        <button type="button" (click)="confirmGlobalLink()"
                                class="flex-1 px-8 py-4 text-xs font-black uppercase tracking-widest bg-primary text-white rounded-2xl shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 transition-all">
                            Vincular Usuario
                        </button>
                    </div>
                </div>

                <!-- Close Button -->
                <button (click)="showLinkModal = false" class="absolute top-6 right-6 p-2 text-slate-400 hover:text-primary transition-colors">
                    <app-icon name="x" size="20"></app-icon>
                </button>
            </div>
        </p-dialog>

    </div>
    `
})
export class UserFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private userService = inject(UserService);
    private roleService = inject(RoleService);
    private authService = inject(AuthService);

    isEditMode = signal(false);
    loading = signal(false);
    currentStep = signal(0);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);
    roles = signal<Role[]>([]);

    // Modal states
    showLinkModal = false;
    globalUserName = signal('');

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
            roleIds: [[]], // Initially optional, logic will handle empty for default
            active: [true]
        });
    }

    private loadRoles() {
        const roles$ = this.roleService.getAll();
        roles$.subscribe(data => {
            const isSuperAdmin = this.authService.currentUser()?.isSuperAdmin;
            this.roles.set(data.filter(r => r.active && (isSuperAdmin || !r.isRootRole)));
        });
        return roles$;
    }

    private loadUser(id: string) {
        this.userService.getById(id).subscribe({
            next: (data) => {
                this.realUserId = data.userId;
                const formValue: any = { ...data };
                if (data.roleIds?.length > 0) {
                    formValue.roleIds = this.roles().filter(r => data.roleIds.includes(r.id));
                }
                this.form.patchValue(formValue);
            },
            error: () => this.errorMessage.set('Error al cargar la información del usuario.')
        });
    }

    isLastStep() { return this.currentStep() === 2; }

    handleMainAction() {
        if (this.isLastStep() || this.isEditMode()) {
            this.onSubmit();
        } else {
            this.nextStep();
        }
    }

    onCancel() { this.router.navigate(['/core/management/users']); }

    previousStep() {
        if (this.currentStep() > 0) this.currentStep.set(this.currentStep() - 1);
    }

    nextStep() {
        if (this.currentStep() === 0) {
            // Validation for Identity
            if (this.form.get('username')?.invalid || this.form.get('email')?.invalid) {
                this.errorMessage.set('Nombre de usuario y correo son obligatorios.');
                return;
            }

            // CHECK GLOBAL: Intent to create with forceLink = false
            this.loading.set(true);
            const checkData: CreateUserRequest = {
                ...this.form.value,
                roleIds: [], // Just checking
                forceLink: false
            };

            this.userService.create(checkData).subscribe({
                next: () => {
                    // This wouldn't normally happen if we just want to verify, 
                    // but the backend will hold it or create if totally new.
                    // Actually, for a clean Step 1 -> Step 2, we should have a "verify" endpoint.
                    // But we can use the Conflict response.
                    this.loading.set(false);
                    this.currentStep.set(1);
                },
                error: (err) => {
                    this.loading.set(false);
                    const msg = err.error?.message || '';
                    if (msg.startsWith('USER_EXISTS_GLOBAL:')) {
                        this.globalUserName.set(msg.split(':')[1]);
                        this.showLinkModal = true;
                    } else if (err.status === 409 || msg.includes('ya está registrado en esta empresa')) {
                        this.errorMessage.set('El usuario ya pertenece a esta empresa o hay un conflicto.');
                    } else {
                        // If no global match, proceed to personal info
                        this.currentStep.set(1);
                    }
                }
            });
        } else if (this.currentStep() === 1) {
            if (this.form.get('firstName')?.invalid || this.form.get('firstSurname')?.invalid) {
                this.errorMessage.set('La información personal es obligatoria para nuevos usuarios.');
                return;
            }
            this.currentStep.set(2);
        }
    }

    confirmGlobalLink() {
        this.showLinkModal = false;
        // Jump directly to roles assignment
        this.currentStep.set(2);
    }

    removeRole(roleToRemove: Role) {
        const currentRoles = this.form.get('roleIds')?.value || [];
        const updatedRoles = currentRoles.filter((r: Role) => r.id !== roleToRemove.id);
        this.form.patchValue({ roleIds: updatedRoles });
    }

    onSubmit() {
        if (this.form.invalid && this.isEditMode()) {
            this.errorMessage.set('Por favor completa los campos requeridos.');
            return;
        }

        this.loading.set(true);
        const formValue = this.form.value;
        const roleIdsToSend = (formValue.roleIds || []).map((r: any) => r.id);

        if (this.isEditMode() && this.realUserId) {
            this.userService.updateRoles(this.realUserId, roleIdsToSend).subscribe({
                next: () => {
                    this.successMessage.set('Roles actualizados exitosamente.');
                    setTimeout(() => this.onCancel(), 1500);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.errorMessage.set(err.error?.message || 'Error al actualizar.');
                }
            });
        } else {
            const userData: CreateUserRequest = {
                ...formValue,
                roleIds: roleIdsToSend,
                forceLink: true // Always true if they reached this step via confirmation or new
            };

            this.userService.create(userData).subscribe({
                next: () => {
                    this.successMessage.set('Proceso completado con éxito.');
                    setTimeout(() => this.onCancel(), 2000);
                },
                error: (err) => {
                    this.loading.set(false);
                    this.errorMessage.set(err.error?.message || 'Error en el proceso.');
                }
            });
        }
    }
}

