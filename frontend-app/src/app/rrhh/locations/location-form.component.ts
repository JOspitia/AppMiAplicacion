import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { AddressBuilderComponent } from '../../shared/components/address-builder/address-builder.component';
import { LocationService, Location } from '../../core/services/location.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
    selector: 'app-location-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        ButtonModule, InputTextModule, SelectModule, ToggleSwitchModule,
        IconComponent, AlertComponent, AddressBuilderComponent
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
                    <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Recursos Humanos</span>
                    <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                        {{ isEditMode() ? 'Editar' : 'Nueva' }} <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">Sede</span>
                    </h1>
                </div>
                <button [routerLink]="['/rrhh/sedes']" class="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm">
                    <app-icon name="arrow-left" class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors"></app-icon>
                </button>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Define la información de contacto, ubicación geográfica y parámetros de operación para la sede de la organización.
            </p>
        </div>

        <!-- Form Container -->
        <div class="max-w-4xl mx-auto">
            <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-500 p-8 md:p-12">
                
                <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-10">
                    
                    <!-- Sección 1: Información General -->
                    <div>
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 class="text-xl font-black text-slate-800 dark:text-white">Información General</h2>
                        </div>
                        
                        <div class="grid grid-cols-1 gap-6">
                            <!-- Nombre de la Sede -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre de la Sede *</label>
                                <div class="relative group">
                                    <app-icon name="building" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                    <input pInputText formControlName="name" placeholder="Ej: Sede Principal, Sucursal Norte..." 
                                           style="padding-left: 3.5rem !important;"
                                           class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Es Sede Principal -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Sede Principal</label>
                                    <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 h-[52px]">
                                        <div class="flex items-center gap-2 ml-1">
                                            <app-icon [name]="form.get('isMain')?.value ? 'check-circle' : 'circle'" 
                                                      [class]="form.get('isMain')?.value ? 'text-primary' : 'text-slate-300'"
                                                      size="18"></app-icon>
                                            <span class="text-sm font-bold">{{ form.get('isMain')?.value ? 'Sede Matriz' : 'Sucursal' }}</span>
                                        </div>
                                        <p-toggleSwitch formControlName="isMain"></p-toggleSwitch>
                                    </div>
                                    <small class="text-[10px] text-slate-400 ml-1">Solo puede haber una sede principal por compañía.</small>
                                </div>

                                <!-- Estado Activo -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Estado Operativo</label>
                                    <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 h-[52px]">
                                        <span class="text-sm font-bold ml-1">{{ form.get('active')?.value ? 'Activa' : 'Inactiva' }}</span>
                                        <p-toggleSwitch formControlName="active"></p-toggleSwitch>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sección 2: Ubicación Geográfica -->
                    <div>
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 class="text-xl font-black text-slate-800 dark:text-white">Ubicación Geográfica</h2>
                        </div>
                        
                        <div class="space-y-6">
                            <!-- Dirección -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Dirección Física *</label>
                                <div class="flex gap-3 w-full">
                                    <div class="relative group flex-1">
                                        <app-icon name="map-pin" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                        <input pInputText formControlName="address" 
                                               style="padding-left: 3.5rem !important;"
                                               class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                               readonly (click)="openAddressBuilder()" placeholder="Haz clic para construir la dirección...">
                                    </div>
                                    <button type="button" (click)="openAddressBuilder()" class="p-3 bg-slate-100 dark:bg-white/5 rounded-xl text-slate-500 hover:text-primary transition-all active:scale-95 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                                        <app-icon name="edit" size="20"></app-icon>
                                    </button>
                                </div>
                            </div>

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <!-- País -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">País *</label>
                                    <p-select [options]="countries()" optionLabel="name" optionValue="name" formControlName="country" 
                                              [filter]="true" filterBy="name"
                                              placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                                </div>
                                
                                <!-- Departamento -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Departamento *</label>
                                    <p-select [options]="states()" optionLabel="name" optionValue="name" formControlName="department" 
                                              [filter]="true" filterBy="name"
                                              placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                                </div>

                                <!-- Ciudad -->
                                <div class="flex flex-col gap-2">
                                    <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Ciudad *</label>
                                    <p-select [options]="cities()" optionLabel="name" optionValue="name" formControlName="city" 
                                              [filter]="true" filterBy="name"
                                              placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="flex items-center justify-end gap-4 pt-8 border-t border-slate-200 dark:border-white/10">
                        <button type="button" [routerLink]="['/rrhh/sedes']" 
                                class="px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold">
                            Cancelar
                        </button>
                        <button type="submit" [disabled]="loading()"
                                class="px-10 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all font-bold shadow-lg shadow-primary/30 flex items-center gap-2">
                            <app-icon *ngIf="!loading()" name="save" size="18"></app-icon>
                            <span *ngIf="!loading()">{{ isEditMode() ? 'Actualizar Sede' : 'Crear Sede' }}</span>
                            <span *ngIf="loading()">Procesando...</span>
                        </button>
                    </div>

                </form>

            </div>
        </div>

        <!-- Address Builder Component -->
        <app-address-builder
            [(visible)]="showAddressBuilder"
            (onConfirm)="handleAddressConfirm($event)">
        </app-address-builder>
    </div>
    `
})
export class LocationFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private locationService = inject(LocationService);
    private profileService = inject(ProfileService);

    isEditMode = signal(false);
    loading = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);
    showAddressBuilder = false;

    countries = signal<any[]>([]);
    states = signal<any[]>([]);
    cities = signal<any[]>([]);

    form!: FormGroup;
    locationId?: string;

    ngOnInit() {
        this.initForm();
        this.loadInitialData();
        this.setupGeographyWatchers();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.locationId = params['id'];
                this.isEditMode.set(true);
                this.loadLocation(params['id']);
            }
        });
    }

    private initForm() {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(150)]],
            address: ['', Validators.required],
            city: ['', Validators.required],
            department: ['', Validators.required],
            country: ['', Validators.required],
            isMain: [false],
            active: [true]
        });
    }

    private loadInitialData() {
        this.profileService.getCountries().subscribe(data => this.countries.set(data));
    }

    private setupGeographyWatchers() {
        // Watch country change to load states
        this.form.get('country')?.valueChanges.subscribe(countryName => {
            if (!countryName) {
                this.states.set([]);
                this.cities.set([]);
                return;
            }
            const country = this.countries().find(c => c.name === countryName);
            if (country && country.id) {
                this.profileService.getStates(country.id).subscribe(data => this.states.set(data));
            }
        });

        // Watch department change to load cities
        this.form.get('department')?.valueChanges.subscribe(stateName => {
            if (!stateName) {
                this.cities.set([]);
                return;
            }
            const state = this.states().find(s => s.name === stateName);
            if (state && state.id) {
                this.profileService.getCities(state.id).subscribe(data => this.cities.set(data));
            }
        });
    }

    private loadLocation(id: string) {
        this.locationService.getById(id).subscribe({
            next: (data) => {
                // Sequentially load geography to avoid empty selects
                if (data.country) {
                    this.profileService.getCountries().subscribe(countries => {
                        this.countries.set(countries);
                        const country = countries.find((c: any) => c.name === data.country);
                        if (country) {
                            this.profileService.getStates(country.id).subscribe(states => {
                                this.states.set(states);
                                if (data.department) {
                                    const state = states.find((s: any) => s.name === data.department);
                                    if (state) {
                                        this.profileService.getCities(state.id).subscribe(cities => {
                                            this.cities.set(cities);
                                            this.form.patchValue(data);
                                        });
                                    } else {
                                        this.form.patchValue(data);
                                    }
                                } else {
                                    this.form.patchValue(data);
                                }
                            });
                        } else {
                            this.form.patchValue(data);
                        }
                    });
                } else {
                    this.form.patchValue(data);
                }
            },
            error: () => this.errorMessage.set('Error al cargar la sede.')
        });
    }

    openAddressBuilder() {
        this.showAddressBuilder = true;
    }

    handleAddressConfirm(address: string) {
        this.form.get('address')?.setValue(address);
    }

    onSubmit() {
        if (this.form.invalid) {
            this.errorMessage.set('Por favor completa los campos requeridos correctamente.');
            return;
        }

        this.loading.set(true);
        const operation = this.isEditMode() && this.locationId
            ? this.locationService.update(this.locationId, this.form.value)
            : this.locationService.create(this.form.value);

        operation.subscribe({
            next: () => {
                this.loading.set(false);
                this.successMessage.set(this.isEditMode() ? 'Sede actualizada exitosamente.' : 'Sede creada exitosamente.');
                setTimeout(() => this.router.navigate(['/rrhh/sedes']), 1500);
            },
            error: (err) => {
                this.loading.set(false);
                this.errorMessage.set(err.error?.message || 'Error al procesar la sede.');
            }
        });
    }
}
