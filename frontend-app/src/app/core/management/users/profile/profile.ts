import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RippleModule } from 'primeng/ripple';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { IconComponent } from '../../../../shared/components/icon.component';
import { AddressBuilderComponent } from '../../../../shared/components/address-builder/address-builder.component';
import { PrimeDropdownSettingsDirective } from '../../../../shared/directives/primeng-dropdown-settings.directive';
import { PrimeDatePickerSettingsDirective } from '../../../../shared/directives/primeng-datepicker-settings.directive';
import { ProfileService, UserProfile } from '../../../services/profile.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        SelectModule,
        DatePickerModule,
        FloatLabelModule,
        RippleModule,
        DialogModule,
        TooltipModule,
        IconComponent,
        AddressBuilderComponent,
        PrimeDropdownSettingsDirective,
        PrimeDatePickerSettingsDirective,
        AlertComponent
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in">

        <!-- Header Section -->
        <div class="max-w-4xl mx-auto mb-10">
            <div class="flex items-center justify-between mb-4">
                <div>
                     <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Configuración</span>
                     <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                        Mi Perfil de <span class="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">Usuario</span>
                     </h1>
                </div>
                <button [routerLink]="['/home']" class="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm">
                    <app-icon icon="home" class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors"></app-icon>
                </button>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Gestiona tu identidad personal, ubicación geográfica y parámetros de seguridad para mantener tu cuenta protegida y actualizada.
            </p>
        </div>

        <!-- Alerts -->
        <app-alert *ngIf="successMessage()" type="success" [message]="successMessage()" [autoHide]="6000" (closed)="successMessage.set(null)"></app-alert>
        <app-alert *ngIf="errorMessage()" type="error" [message]="errorMessage()" [autoHide]="6000" (closed)="errorMessage.set(null)"></app-alert>

        <!-- Main Card Container -->
        <div class="max-w-4xl mx-auto">
            <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-500">
                
                <!-- Premium Navigation Tabs -->
                <div class="flex flex-col sm:flex-row p-2 bg-slate-950/5 dark:bg-white/5 rounded-[2.5rem] m-4 sm:m-8 mb-4 gap-2 border border-black/5 dark:border-white/5">
                    <button (click)="activeTab.set('info')" 
                        [class]="activeTab() === 'info' ? activeTabClass : inactiveTabClass"
                        class="flex items-center justify-center gap-2">
                        <app-icon icon="user" class="w-4 h-4"></app-icon>
                        <span class="hidden sm:inline">Información Personal</span>
                        <span class="sm:hidden">Información</span>
                    </button>
                    <button (click)="activeTab.set('security')" 
                        [class]="activeTab() === 'security' ? activeTabClass : inactiveTabClass"
                        class="flex items-center justify-center gap-2">
                        <app-icon icon="shield" class="w-4 h-4"></app-icon>
                        <span class="hidden sm:inline">Seguridad y Acceso</span>
                        <span class="sm:hidden">Seguridad</span>
                    </button>
                </div>

                <div class="p-8 md:p-12 pt-6">
                    <!-- Tab: Personal Information -->
                    <div *ngIf="activeTab() === 'info'" class="animate-fade-in space-y-10">
                        <form [formGroup]="infoForm" (ngSubmit)="onUpdateInfo()" class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-7">
                            <!-- Nombres -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombres</label>
                                <div class="relative group w-full">
                                    <input pInputText formControlName="firstName" class="premium-input-locked w-full" readonly placeholder="Juan">
                                    <app-icon icon="lock" class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300"></app-icon>
                                </div>
                            </div>
                            
                            <!-- Apellidos -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Apellidos</label>
                                <div class="relative group w-full">
                                    <input pInputText formControlName="firstSurname" class="premium-input-locked w-full" readonly placeholder="Pérez">
                                    <app-icon icon="lock" class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300"></app-icon>
                                </div>
                            </div>

                            <!-- Correo (Full Width) -->
                            <div class="col-span-1 md:col-span-2 flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico Actual</label>
                                <div class="relative group w-full">
                                    <input pInputText formControlName="email" class="premium-input-locked w-full" readonly placeholder="usuario@empresa.com">
                                    <app-icon icon="email" class="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300"></app-icon>
                                </div>
                                <div *ngIf="user()?.pendingEmail" class="mt-2 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex items-center gap-3">
                                    <app-icon icon="email" class="w-4 h-4 text-amber-500"></app-icon>
                                    <span class="text-xs font-bold text-amber-700 dark:text-amber-400">Cambio pendiente a: {{ user()?.pendingEmail }}</span>
                                </div>
                            </div>

                            <!-- Teléfono (Contacto) -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Teléfono de Contacto</label>
                                <div class="grid grid-cols-[8rem_1fr] gap-3 w-full">
                                    <p-select [options]="countries" optionLabel="label" optionValue="phoneCode" formControlName="phoneExtension" placeholder="Ext" class="w-full" styleClass="w-full" appendTo="body">
                                        <ng-template let-country pTemplate="item">
                                            <div class="flex align-items-center gap-2">
                                                <span>{{ country.phoneCode }} - {{ country.name }}</span>
                                            </div>
                                        </ng-template>
                                        <ng-template let-country pTemplate="selectedItem">
                                            <div class="flex align-items-center gap-2" *ngIf="country">
                                                <span>{{ country.phoneCode }}</span>
                                            </div>
                                        </ng-template>
                                    </p-select>
                                    <input pInputText formControlName="phoneNumber" placeholder="300 123 4567" class="w-full">
                                </div>
                                <small *ngIf="infoForm.get('phoneNumber')?.errors?.['pattern']" class="text-rose-500 text-[10px] font-bold ml-1 h-4 block">Formato inválido (7-15 dígitos)</small>
                            </div>

                            <!-- Género -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Género</label>
                                <p-select [options]="genders" optionLabel="name" optionValue="id" formControlName="genderId" placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Fecha de Nacimiento</label>
                                <p-datepicker formControlName="dateOfBirth" dateFormat="yy-mm-dd" [showIcon]="true" class="w-full" styleClass="w-full" (onSelect)="calculateAge()" (onInput)="calculateAge()" appendTo="body" placeholder="1990-01-01"></p-datepicker>
                            </div>

                            <!-- Edad (Readonly) -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Edad Calculada</label>
                                <div class="relative w-full">
                                    <input pInputText formControlName="age" class="premium-input-locked w-full" readonly placeholder="30">
                                    <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase">años</span>
                                </div>
                            </div>

                            <!-- Dirección (Full Width) -->
                            <div class="col-span-1 md:col-span-2 flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Dirección de Residencia</label>
                                <div class="flex gap-3 w-full">
                                    <input pInputText formControlName="address" class="flex-1 w-full cursor-pointer hover:border-primary/50" readonly (click)="openAddressBuilder()" placeholder="Haz clic para construir tu dirección...">
                                    <button type="button" (click)="openAddressBuilder()" class="p-[10px] w-12 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-500 hover:text-primary transition-all active:scale-90 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                        <app-icon icon="pencil" class="w-5 h-5"></app-icon>
                                    </button>
                                </div>
                            </div>

                            <!-- Ubicación Geográfica (Grid anidado 3 columnas) -->
                            <div class="col-span-1 md:col-span-2 pt-6 border-t border-slate-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">País</label>
                                    <p-select [options]="countries" optionLabel="name" optionValue="name" formControlName="country" placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                                </div>

                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Departamento</label>
                                    <p-select [options]="states" optionLabel="name" optionValue="name" formControlName="department" placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                                </div>

                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Ciudad</label>
                                    <p-select [options]="cities" optionLabel="name" optionValue="name" formControlName="city" placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                                </div>
                            </div>

                            <!-- Botón de acción (Full Width) -->
                            <div class="col-span-1 md:col-span-2 flex flex-col justify-center pt-8">
                                <button pButton pRipple type="submit" label="Actualizar Perfil" icon="pi pi-check-circle" class="p-button-lg bg-primary text-white shadow-2xl shadow-primary/30 rounded-[2rem] px-12 py-6 transition-transform hover:scale-105" [loading]="loading()"></button>
                            </div>
                        </form>

                        <!-- Zone: Email Security -->
                         <div class="mt-16 pt-12 border-t border-slate-100 dark:border-white/5 relative">
                            <h3 class="text-xs font-black text-slate-800 dark:text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                                <span class="w-8 h-px bg-slate-200 dark:bg-white/10"></span>
                                Zona de Seguridad: Correo
                                <span class="flex-1 h-px bg-slate-200 dark:bg-white/10"></span>
                            </h3>
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nueva Dirección de Correo</label>
                                    <input pInputText [disabled]="!emailUnlocked()" [(ngModel)]="newEmail" [placeholder]="emailUnlocked() ? 'ejemplo@empresa.com' : '••••••••••••••••'" class="w-full" [class.opacity-50]="!emailUnlocked()">
                                </div>
                                <div class="flex gap-4">
                                    <button *ngIf="!emailUnlocked()" (click)="showPasswordDialog = true" class="px-10 h-11 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10">Desbloquear</button>
                                    <button *ngIf="emailUnlocked()" (click)="onRequestEmailChange()" class="px-10 h-11 bg-primary text-white text-sm font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-500/20" [disabled]="!newEmail">Solicitar Cambio</button>
                                </div>
                            </div>
                            <p class="mt-6 text-[11px] font-bold text-slate-400 flex items-center gap-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                                <app-icon icon="document-text" class="w-4 h-4 text-primary"></app-icon>
                                Por razones de seguridad, se enviará un enlace de verificación único que expira en 24h.
                            </p>
                         </div>
                    </div>

                    <!-- Tab: Security -->
                    <div *ngIf="activeTab() === 'security'" class="animate-fade-in max-w-2xl mx-auto space-y-12">
                        <div class="text-center">
                            <div class="inline-flex items-center justify-center w-28 h-28 rounded-[3rem] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500 mb-8 border border-indigo-100 dark:border-indigo-500/20 shadow-inner relative group">
                                <div class="absolute inset-0 bg-indigo-500/10 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <app-icon icon="key" class="w-12 h-12 relative z-10"></app-icon>
                            </div>
                            <div class="flex items-center justify-center flex-col">
                                <h2 class="text-3xl font-black text-slate-800 dark:text-white mb-3">Cambiar Contraseña</h2>
                                <p class="text-sm text-slate-500 dark:text-slate-400">Te recomendamos actualizar tu contraseña cada 90 días para mayor seguridad.</p>
                            </div>
                        </div>

                        <form [formGroup]="passwordForm" (ngSubmit)="onUpdatePassword()" class="space-y-8">
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Contraseña Actual</label>
                                <p-password formControlName="oldPassword" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"></p-password>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                                    <p-password formControlName="newPassword" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"
                                        promptLabel="Ingresa tu contraseña"
                                        weakLabel="Débil"
                                        mediumLabel="Media"
                                        strongLabel="Fuerte"></p-password>
                                </div>

                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Confirmar Nueva Contraseña</label>
                                    <p-password formControlName="confirmPassword" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"></p-password>
                                </div>
                            </div>

                            <div *ngIf="passwordForm.errors?.['mismatch'] && (passwordForm.get('confirmPassword')?.touched || passwordForm.dirty)" class="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-center justify-center gap-2 text-rose-500 animate-bounce">
                                <app-icon icon="shield" class="w-4 h-4"></app-icon>
                                <span class="text-xs font-bold">Las contraseñas no coinciden.</span>
                            </div>

                            <div class="flex justify-end pt-6">
                                <button pButton pRipple type="submit" label="Actualizar Contraseña" icon="pi pi-check-circle" class="p-button-lg bg-primary text-white shadow-2xl shadow-primary/30 rounded-[2rem] px-12 py-6 transition-transform hover:scale-105" [loading]="loading()"></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        <!-- Address Builder Component -->
        <app-address-builder
            [(visible)]="showAddressBuilder"
            (onConfirm)="handleAddressConfirm($event)">
        </app-address-builder>

        <!-- Identity Verification Dialog -->
        <p-dialog [(visible)]="showPasswordDialog" [modal]="true" [draggable]="false" [resizable]="false" header="Verificar Identidad" styleClass="max-w-md w-full">
            <div class="text-center p-8">
                <div class="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 text-slate-500 mb-6 border border-slate-200 dark:border-white/10 shadow-inner">
                    <app-icon icon="shield" class="w-10 h-10 text-primary"></app-icon>
                </div>
                <h3 class="text-xl font-black text-slate-800 dark:text-white mb-2">Seguridad Primero</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mb-10 font-bold leading-relaxed px-4">Confirma tu contraseña actual para autorizar modificaciones sensibles en tu cuenta.</p>
                
                <div class="space-y-6">
                    <p-password [(ngModel)]="verificationPassword" [feedback]="false" placeholder="Ingresa tu contraseña" styleClass="w-full" [toggleMask]="true" inputStyleClass="w-full text-center"></p-password>
                    
                    <div class="flex flex-col gap-3">
                        <button pButton label="Verificar y Continuar" (click)="onVerifyPassword()" class="bg-primary text-white rounded-2xl py-5 font-black shadow-xl shadow-indigo-500/20 transition-transform active:scale-95" [loading]="loading()"></button>
                        <button (click)="showPasswordDialog = false" class="text-sm font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white py-3 transition-colors">Cancelar operación</button>
                    </div>
                </div>
            </div>
        </p-dialog>
    </div>
    `,
    styles: [`
        :host ::ng-deep {
            /* Locked Input Variant - Extends global .p-inputtext */
            .premium-input-locked {
                @apply bg-slate-50/50 dark:bg-slate-950/20 opacity-70 cursor-not-allowed border-dashed !important;
            }

            /* Address Builder Specific Styles (Modal Context) */
            .builder-input {
                @apply bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-bold transition-all focus:border-primary outline-none !important;
            }

            .builder-dropdown .p-select {
                @apply bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 rounded-xl text-xs font-bold !important;
                .p-select-label { @apply p-3 !important; }
                &.p-focus { @apply border-primary !important; }
            }
        }
    `]
})
export class ProfileComponent implements OnInit {
    private fb = inject(FormBuilder);
    private profileService = inject(ProfileService);

    user = signal<UserProfile | null>(null);
    activeTab = signal<'info' | 'security'>('info');
    loading = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);
    emailUnlocked = signal(false);
    showPasswordDialog = false;
    showAddressBuilder = false;

    infoForm!: FormGroup;
    passwordForm!: FormGroup;
    newEmail = '';
    verificationPassword = '';



    countries: any[] = [{ name: 'Colombia', phoneCode: '+57' }, { name: 'México', phoneCode: '+52' }];
    genders: any[] = [{ id: '1', name: 'Masculino' }, { id: '2', name: 'Femenino' }, { id: '3', name: 'Otro' }];
    states: any[] = [];
    cities: any[] = [];




    activeTabClass = "flex-1 py-5 px-6 rounded-[2rem] text-sm font-black transition-all duration-300 active:scale-95 bg-primary text-white shadow-xl shadow-indigo-500/20";
    inactiveTabClass = "flex-1 py-5 px-6 rounded-[2rem] text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all duration-300";


    ngOnInit() {
        this.initForms();
        this.loadInitialData();
        this.setupLocationWatchers();
    }

    private loadInitialData() {
        this.profileService.getGenders().subscribe(data => this.genders = data);
        this.profileService.getCountries().subscribe(data => {
            this.countries = data.map((c: any) => ({
                ...c,
                label: `${c.phoneCode} - ${c.name}`
            }));
            // Iniciamos la carga del perfil una vez tenemos los países
            this.loadProfile();
        });
    }

    private setupLocationWatchers() {
        // Watch country change to load states
        this.infoForm.get('country')?.valueChanges.subscribe(countryName => {
            if (!countryName) return;
            const country = this.countries.find(c => c.name === countryName);
            if (country && country.id) {
                this.profileService.getStates(country.id).subscribe(data => {
                    this.states = data;
                    // Solo reseteamos si hay un cambio real disparado por el usuario
                    // (patchValue no suele disparar esto si es la carga inicial)
                });
            }
        });

        // Watch state change to load cities
        this.infoForm.get('department')?.valueChanges.subscribe(stateName => {
            if (!stateName) return;
            const state = this.states.find(s => s.name === stateName);
            if (state && state.id) {
                this.profileService.getCities(state.id).subscribe(data => {
                    this.cities = data;
                });
            }
        });
    }

    private loadProfile() {
        this.profileService.getProfile().subscribe({
            next: (data) => {
                this.user.set(data);
                if (data.dateOfBirth) {
                    data.dateOfBirth = new Date(data.dateOfBirth) as any;
                }

                // --- CARGA SECUENCIAL INICIAL DE GEOGRAFÍA ---
                if (data.country) {
                    const country = this.countries.find(c => c.name === data.country);
                    if (country) {
                        this.profileService.getStates(country.id).subscribe(states => {
                            this.states = states;
                            if (data.department) {
                                const state = this.states.find(s => s.name === data.department);
                                if (state) {
                                    this.profileService.getCities(state.id).subscribe(cities => {
                                        this.cities = cities;
                                        this.infoForm.patchValue(data);
                                        this.calculateAge();
                                    });
                                } else {
                                    this.infoForm.patchValue(data);
                                }
                            } else {
                                this.infoForm.patchValue(data);
                            }
                        });
                        return; // Evitamos el patchValue de abajo si entramos en la cascada
                    }
                }

                this.infoForm.patchValue(data);
                this.calculateAge();
            }
        });
    }

    private initForms() {
        this.infoForm = this.fb.group({
            firstName: [{ value: '', disabled: true }],
            firstSurname: [{ value: '', disabled: true }],
            email: [{ value: '', disabled: true }],
            phoneExtension: [''],
            phoneNumber: ['', [Validators.pattern('[0-9]{7,15}')]],
            genderId: [''],
            dateOfBirth: [null],
            age: [{ value: '', disabled: true }],
            address: [''],
            country: [''],
            department: [''],
            city: ['']
        });

        this.passwordForm = this.fb.group({
            oldPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', Validators.required]
        }, { validators: this.passwordMatchValidator });
    }

    private passwordMatchValidator(g: FormGroup) {
        return g.get('newPassword')?.value === g.get('confirmPassword')?.value
            ? null : { 'mismatch': true };
    }

    calculateAge() {
        const dob = this.infoForm.get('dateOfBirth')?.value;
        if (!dob) return;
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
        this.infoForm.get('age')?.setValue(age);
    }


    onUpdateInfo() {
        if (this.infoForm.invalid) return;
        this.loading.set(true);
        this.profileService.updateProfile(this.infoForm.getRawValue()).subscribe({
            next: (res) => {
                console.log('[Profile] Success:', res);
                this.loading.set(false);
                this.showSuccess('¡Excelente! Tu perfil ha sido actualizado correctamente.');
                this.loadProfile();
            },
            error: (err) => {
                console.error('[Profile] Error:', err);
                this.loading.set(false);
                const msg = err?.error?.message || 'Error al actualizar el perfil';
                this.showError(msg);
            }
        });
    }

    onVerifyPassword() {
        if (!this.verificationPassword) return;
        this.loading.set(true);
        this.profileService.verifyPassword(this.verificationPassword).subscribe({
            next: (isValid) => {
                this.loading.set(false);
                if (isValid) {
                    this.emailUnlocked.set(true);
                    this.showPasswordDialog = false;
                    this.verificationPassword = '';
                }
            },
            error: (err) => { this.loading.set(false); const msg = err?.error?.message || 'Error al verificar la contraseña'; this.showError(msg); }
        });
    }

    onRequestEmailChange() {
        if (!this.newEmail) return;
        this.loading.set(true);
        this.profileService.changeEmail(this.newEmail).subscribe({
            next: () => {
                this.loading.set(false);
                this.showSuccess('Enlace de verificación enviado a ' + this.newEmail);
                this.newEmail = '';
                this.emailUnlocked.set(false);
            },
            error: (err) => { this.loading.set(false); const msg = err?.error?.message || 'Error al solicitar cambio de correo'; this.showError(msg); }
        });
    }

    onUpdatePassword() {
        if (this.passwordForm.invalid) return;
        this.loading.set(true);
        const { oldPassword, newPassword, confirmPassword } = this.passwordForm.value;
        this.profileService.changePassword(oldPassword, newPassword, confirmPassword).subscribe({
            next: () => {
                this.loading.set(false);
                this.showSuccess('Tu contraseña ha sido robustecida con éxito');
                this.passwordForm.reset();
            },
            error: (err) => { this.loading.set(false); const msg = err?.error?.message || 'Error al cambiar la contraseña'; this.showError(msg); }
        });
    }

    private showSuccess(msg: string) {
        this.successMessage.set(msg);
        this.errorMessage.set(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => this.successMessage.set(null), 6000);
    }

    private showError(msg: string) {
        this.errorMessage.set(msg);
        this.successMessage.set(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setTimeout(() => this.errorMessage.set(null), 6000);
    }

    // Address Builder - Uses shared AddressBuilderComponent
    openAddressBuilder() {
        this.showAddressBuilder = true;
    }

    handleAddressConfirm(address: string) {
        this.infoForm.get('address')?.setValue(address);
    }
}
