import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { OperationalCenterService, OperationalCenter } from '../../core/services/operational-center.service';
import { LocationService, Location } from '../../core/services/location.service';

@Component({
    selector: 'app-op-center-form',
    standalone: true,
    imports: [
        CommonModule, RouterModule, ReactiveFormsModule, InputText,
        Textarea, ToggleSwitch, Select,
        IconComponent, AlertComponent
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in">
        
        <app-alert [message]="successMessage()" type="success" (closed)="successMessage.set(null)"></app-alert>
        <app-alert [message]="errorMessage()" type="error" (closed)="errorMessage.set(null)"></app-alert>

        <div class="max-w-4xl mx-auto mb-10">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Recursos Humanos</span>
                    <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                        {{ isEditMode() ? 'Editar' : 'Nuevo' }} <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">Centro Operacional</span>
                    </h1>
                </div>
                <button [routerLink]="['/rrhh/operational-centers']" class="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm">
                    <app-icon name="arrow-left" class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors"></app-icon>
                </button>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Define los parámetros de identificación y ubicación para este centro operacional.
            </p>
        </div>

        <div class="max-w-4xl mx-auto">
            <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden p-8 md:p-12">
                
                <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-10">
                    
                    <div>
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 class="text-xl font-black text-slate-800 dark:text-white">Identificación y Ubicación</h2>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Código -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Código del Centro *</label>
                                <div class="relative group">
                                    <app-icon name="id-card" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                    <input pInputText formControlName="code" placeholder="Ej: COP-001" 
                                           style="padding-left: 3.5rem !important;"
                                           class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                                </div>
                            </div>

                            <!-- Nombre -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre del Centro *</label>
                                <div class="relative group">
                                    <app-icon name="archive" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                    <input pInputText formControlName="name" placeholder="Ej: Centro de Operación Norte" 
                                           style="padding-left: 3.5rem !important;"
                                           class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                                </div>
                            </div>

                            <!-- Sede Relacionada -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Sede Relacionada</label>
                                <p-select [options]="locations()" optionLabel="name" optionValue="id" formControlName="locationId" 
                                          [filter]="true" filterBy="name"
                                          placeholder="Seleccionar Sede..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                            </div>

                            <!-- Estado -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Estado Operativo</label>
                                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 h-[52px]">
                                    <span class="text-sm font-bold ml-1">{{ form.get('active')?.value ? 'Activo' : 'Inactivo' }}</span>
                                    <p-toggleSwitch formControlName="active"></p-toggleSwitch>
                                </div>
                            </div>
                        </div>

                        <!-- Descripción -->
                        <div class="flex flex-col gap-2 mt-6">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descripción (Opcional)</label>
                            <textarea pTextarea formControlName="description" rows="3" 
                                      placeholder="Detalles adicionales sobre el centro operacional..."
                                      class="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl"></textarea>
                        </div>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="flex items-center justify-end gap-4 pt-8 border-t border-slate-200 dark:border-white/10">
                        <button type="button" [routerLink]="['/rrhh/operational-centers']" 
                                class="px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold">
                            Cancelar
                        </button>
                        <button type="submit" [disabled]="loading()"
                                class="px-10 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all font-bold shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                             <app-icon *ngIf="!loading()" icon="save" size="18"></app-icon>
                             <app-icon *ngIf="loading()" icon="pi-spin pi-spinner" size="18"></app-icon>
                             <span>{{ loading() ? 'Procesando...' : (isEditMode() ? 'Actualizar Centro' : 'Crear Centro') }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `
})
export class OperationalCenterFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(OperationalCenterService);
    private locationService = inject(LocationService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    form: FormGroup;
    loading = signal(false);
    isEditMode = signal(false);
    opCenterId = signal<string | null>(null);
    locations = signal<Location[]>([]);

    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    constructor() {
        this.form = this.fb.group({
            code: ['', [Validators.required, Validators.maxLength(50)]],
            name: ['', [Validators.required, Validators.maxLength(150)]],
            description: [''],
            locationId: [null],
            active: [true]
        });
    }

    ngOnInit() {
        this.loadLocations();
        this.checkEditMode();
    }

    loadLocations() {
        this.locationService.getAll().subscribe({
            next: (data) => this.locations.set(data.filter(l => l.active))
        });
    }

    checkEditMode() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.opCenterId.set(id);
            this.loadItem(id);
        }
    }

    loadItem(id: string) {
        this.loading.set(true);
        this.service.getById(id).subscribe({
            next: (data) => {
                this.form.patchValue(data);
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Error al cargar la información del centro operacional.');
                this.loading.set(false);
            }
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.errorMessage.set('Por favor completa los campos requeridos correctamente.');
            return;
        }

        this.loading.set(true);
        const data = this.form.value;

        const request = this.isEditMode()
            ? this.service.update(this.opCenterId()!, data)
            : this.service.create(data);

        request.subscribe({
            next: () => {
                // We DON'T set loading to false here to maintain the button state until navigation
                this.successMessage.set(this.isEditMode() ? 'Centro operacional actualizado exitosamente.' : 'Centro operacional creado exitosamente.');
                setTimeout(() => this.router.navigate(['/rrhh/operational-centers']), 1500);
            },
            error: (err) => {
                this.loading.set(false);
                this.errorMessage.set(err.error?.message || 'Error al procesar la solicitud.');
            }
        });
    }
}
