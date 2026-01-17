import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { DepartmentService, Department } from '../../core/services/department.service';
import { CostCenterService } from '../../core/services/cost-center.service';
import { OrganizationalLevelService } from '../../core/services/organizational-level.service';
import { LocationService } from '../../core/services/location.service';

@Component({
    selector: 'app-department-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        InputTextModule, ButtonModule, RippleModule, ToggleSwitchModule,
        TextareaModule, SelectModule, MultiSelectModule,
        IconComponent, AlertComponent
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in text-slate-800 dark:text-slate-100 flex justify-center">
        
        <div class="w-full max-w-4xl">
            <app-alert [message]="errorMessage()" type="error" (closed)="errorMessage.set(null)"></app-alert>
            
            <div class="mb-10">
                <a routerLink="/rrhh/departments" class="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 group">
                    <app-icon name="arrow-left" size="14" class="group-hover:-translate-x-1 transition-transform"></app-icon>
                    <span class="text-sm font-bold">Volver a la lista</span>
                </a>
                <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                    {{ isEditMode() ? 'Editar' : 'Nuevo' }} <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">Departamento</span>
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">
                    {{ isEditMode() ? 'Actualiza la información y relaciones del departamento.' : 'Registra una nueva área funcional para la empresa.' }}
                </p>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl p-8 md:p-12">
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                    <!-- Basic Info -->
                    <div class="space-y-8">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h3 class="text-xl font-black text-slate-800 dark:text-white">Información Básica</h3>
                        </div>
                        
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Código *</label>
                            <div class="relative group">
                                <app-icon name="id-card" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                <input pInputText formControlName="code" placeholder="Ej: TIC-001" 
                                       style="padding-left: 3.5rem !important;"
                                       class="w-full pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                            </div>
                            <small class="text-rose-500 block mt-1" *ngIf="form.get('code')?.invalid && form.get('code')?.touched">
                                El código es requerido (max 50 caracteres).
                            </small>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre *</label>
                            <div class="relative group">
                                <app-icon name="building" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                <input pInputText formControlName="name" placeholder="Ej: Tecnología e Informática" 
                                       style="padding-left: 3.5rem !important;"
                                       class="w-full pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                            </div>
                            <small class="text-rose-500 block mt-1" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
                                El nombre es requerido.
                            </small>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descripción (Opcional)</label>
                            <textarea pTextarea formControlName="description" rows="3" placeholder="Breve descripción de las funciones..." 
                                      class="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm resize-none"></textarea>
                        </div>
                    </div>

                    <!-- Relations -->
                    <div class="space-y-8">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h3 class="text-xl font-black text-slate-800 dark:text-white">Estructura y Relaciones</h3>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Departamento Padre</label>
                            <p-select [options]="parentOptions()" formControlName="parentId" 
                                      optionLabel="name" optionValue="id" 
                                      placeholder="Seleccionar padre (Opcional)" 
                                      [showClear]="true"
                                      [filter]="true" filterBy="name"
                                      appendTo="body"
                                      styleClass="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"></p-select>
                             <small class="text-slate-400 block mt-1 text-[10px] italic">Dejar vacío si es un departamento de primer nivel.</small>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nivel Organizacional</label>
                            <p-select [options]="orgLevelOptions()" formControlName="organizationalLevelId" 
                                      optionLabel="name" optionValue="id" 
                                      placeholder="Seleccionar nivel" 
                                      [showClear]="true"
                                      [filter]="true" filterBy="name"
                                      appendTo="body"
                                      styleClass="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"></p-select>
                        </div>

                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Centro de Costos</label>
                            <p-select [options]="costCenterOptions()" formControlName="costCenterId" 
                                      optionLabel="name" optionValue="id" 
                                      placeholder="Seleccionar centro de costos" 
                                      [showClear]="true"
                                      [filter]="true" filterBy="name"
                                      appendTo="body"
                                      styleClass="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"></p-select>
                        </div>

                         <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Sedes Asignadas</label>
                            
                            <!-- ÁREA DE CHIPS EXTERNA -->
                            <div class="flex flex-wrap gap-2 mb-2 min-h-[32px] max-h-32 overflow-y-auto pr-1 premium-scrollbar" *ngIf="form.get('locationIds')?.value?.length > 0">
                                <div *ngFor="let loc of form.get('locationIds')?.value" 
                                     class="group flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-default animate-fade-in text-slate-700 dark:text-slate-200 font-bold text-xs">
                                    <div class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary-rgb),0.6)]"></div>
                                    <span>{{ loc.name }}</span>
                                    <button (click)="removeLocation(loc)" type="button" 
                                            class="ml-1 p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-danger transition-colors">
                                        <app-icon name="x" class="w-3.5 h-3.5"></app-icon>
                                    </button>
                                </div>
                            </div>

                            <p-multiSelect [options]="locationOptions()" formControlName="locationIds" 
                                         optionLabel="name"
                                         defaultLabel="Seleccionar sedes..." 
                                         [filter]="true" filterBy="name"
                                         dataKey="id"
                                         styleClass="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
                                         appendTo="body"
                                         [showHeader]="true">
                                <ng-template let-value pTemplate="selectedItems">
                                    <div *ngIf="!value || value.length === 0" class="py-1">
                                        <span class="text-slate-500 dark:text-slate-400 text-sm">Seleccionar sedes...</span>
                                    </div>
                                    <div *ngIf="value && value.length > 0" class="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center gap-2 py-1">
                                        <span class="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold">{{ value.length }}</span>
                                        <span>sedes asignadas</span>
                                    </div>
                                </ng-template>
                                <ng-template let-loc pTemplate="item">
                                    <div class="flex flex-col py-1">
                                        <span class="font-bold text-sm text-slate-700 dark:text-slate-200">{{loc.name}}</span>
                                        <span class="text-xs text-slate-400" *ngIf="loc.address">{{loc.address}}</span>
                                    </div>
                                </ng-template>
                            </p-multiSelect>
                        </div>

                        <div class="pt-4">
                            <div class="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-all duration-300">
                                <div class="flex flex-col">
                                    <span class="font-bold text-slate-800 dark:text-slate-200">Estado Activo</span>
                                    <span class="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Visible en selectores</span>
                                </div>
                                <p-toggleSwitch formControlName="active"></p-toggleSwitch>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-4 pt-8 border-t border-slate-200 dark:border-white/10">
                    <button pButton type="button" label="Cancelar" routerLink="/rrhh/departments" 
                            class="px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold p-button-text p-button-secondary"></button>
                    <button pButton type="submit" [label]="loading() ? 'Procesando...' : (isEditMode() ? 'Actualizar ' : 'Crear Departamento')" 
                            [loading]="loading()" 
                            [disabled]="form.invalid"
                            class="px-10 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-primary/30"></button>
                </div>
            </form>
        </div>
    </div>
    `
})
export class DepartmentFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(DepartmentService);
    private costCenterService = inject(CostCenterService);
    private orgLevelService = inject(OrganizationalLevelService);
    private locationService = inject(LocationService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    form: FormGroup;
    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    errorMessage = signal<string | null>(null);

    // Options
    parentOptions = signal<any[]>([]);
    costCenterOptions = signal<any[]>([]);
    orgLevelOptions = signal<any[]>([]);
    locationOptions = signal<any[]>([]);

    constructor() {
        this.form = this.fb.group({
            code: ['', [Validators.required, Validators.maxLength(50)]],
            name: ['', [Validators.required, Validators.maxLength(150)]],
            description: [''],
            parentId: [null],
            costCenterId: [null],
            organizationalLevelId: [null],
            locationIds: [[]],
            active: [true]
        });
    }

    ngOnInit() {
        this.loadOptions();

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.loadData(id);
        }
    }

    loadOptions() {
        // Load dependencies concurrently-ish
        this.service.getActive().subscribe(data => {
            // Filter out self in edit mode handled in template/logic? 
            // Better to filter when setting.
            this.parentOptions.set(data);
        });

        this.costCenterService.getActive().subscribe(data => this.costCenterOptions.set(data));
        this.orgLevelService.getActive().subscribe(data => this.orgLevelOptions.set(data));
        this.locationService.getActive().subscribe(data => this.locationOptions.set(data));
    }

    loadData(id: string) {
        this.loading.set(true);
        this.service.getById(id).subscribe({
            next: (data) => {
                // Conver locationIds (array of strings) to objects for the MultiSelect
                const patchedData = { ...data };
                if (data.locationIds && data.locationIds.length > 0) {
                    patchedData.locationIds = this.locationOptions().filter(l => data.locationIds?.includes(l.id));
                } else {
                    patchedData.locationIds = [];
                }

                this.form.patchValue(patchedData);

                // Remove self from parent options to avoid circular ref in UI
                const currentParents = this.parentOptions().filter(p => p.id !== id);
                this.parentOptions.set(currentParents);

                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Error al cargar datos del departamento.');
                this.loading.set(false);
            }
        });
    }

    removeLocation(locToRemove: any) {
        const currentLocs = this.form.get('locationIds')?.value || [];
        const updatedLocs = currentLocs.filter((l: any) => l.id !== locToRemove.id);
        this.form.patchValue({ locationIds: updatedLocs });
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.loading.set(true);
        const data = { ...this.form.value };
        const id = this.route.snapshot.paramMap.get('id');

        // Extract IDs from location objects
        if (data.locationIds && Array.isArray(data.locationIds)) {
            data.locationIds = data.locationIds.map((l: any) => l.id);
        }

        const request$ = this.isEditMode() && id
            ? this.service.update(id, data)
            : this.service.create(data);

        request$.subscribe({
            next: () => {
                this.router.navigate(['/rrhh/departments']);
            },
            error: (err) => {
                const msg = err.error?.message || 'Error al guardar el departamento.';
                this.errorMessage.set(msg);
                this.loading.set(false);
            }
        });
    }
}
