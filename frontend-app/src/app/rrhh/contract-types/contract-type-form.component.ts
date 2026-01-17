import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { ContractTypeService } from '../../core/services/contract-type.service';

@Component({
    selector: 'app-contract-type-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        InputTextModule, ButtonModule, SelectModule, TextareaModule,
        ToggleSwitchModule, InputNumberModule, CheckboxModule,
        IconComponent, AlertComponent
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in text-slate-800 dark:text-slate-100">
        
        <!-- Alerts -->
        <app-alert *ngIf="errorMessage()" type="error" [message]="errorMessage()" (closed)="errorMessage.set(null)"></app-alert>
        
        <!-- Header Section -->
        <div class="max-w-4xl mx-auto mb-10">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Recursos Humanos</span>
                    <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                        {{ isEditMode() ? 'Editar' : 'Nuevo' }} <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">Tipo de Contrato</span>
                    </h1>
                </div>
                <button [routerLink]="['/rrhh/contract-types']" class="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm">
                    <app-icon name="arrow-left" class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors"></app-icon>
                </button>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Define las reglas y duración para este tipo de acuerdo laboral.
            </p>
        </div>

        <!-- Form Container -->
        <div class="max-w-4xl mx-auto">
            <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-500 p-8 md:p-12">
                
                <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-12">
                    
                    <!-- Sección 1: Información General -->
                    <div>
                        <div class="flex items-center gap-3 mb-8">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 class="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                <app-icon name="document" size="20" class="text-slate-400"></app-icon>
                                Información General
                            </h2>
                        </div>
                        
                        <div class="space-y-6">
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre del Tipo *</label>
                                <div class="relative group">
                                    <app-icon name="document" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                    <input pInputText formControlName="name" 
                                           placeholder="Ej: Término Fijo, Indefinido, Prácticas..." 
                                           style="padding-left: 3.5rem !important;"
                                           class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm">
                                </div>
                                <small *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="text-rose-500 text-[10px] font-bold ml-1">El nombre es obligatorio</small>
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descripción (Opcional)</label>
                                <textarea pTextarea formControlName="description" rows="3" 
                                          placeholder="Describe las características principales de este tipo de contrato..."
                                          class="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm resize-none"></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Sección 2: Reglas y Duración -->
                    <div>
                        <div class="flex items-center gap-3 mb-8">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 class="text-xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                <app-icon name="cog" size="20" class="text-slate-400"></app-icon>
                                Reglas y Duración
                            </h2>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                            <div class="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6">
                                <div class="flex items-center justify-between">
                                    <div class="flex flex-col gap-1">
                                        <span class="text-sm font-bold text-slate-800 dark:text-white italic">¿Tiene fecha de finalización?</span>
                                        <span class="text-[11px] text-slate-500">Habilita esta opción si el contrato tiene un fin definido.</span>
                                    </div>
                                    <p-toggleSwitch formControlName="hasEndDate"></p-toggleSwitch>
                                </div>

                                <div *ngIf="form.get('hasEndDate')?.value" class="animate-fade-in pt-6 border-t border-slate-200 dark:border-slate-700/50">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div class="flex flex-col gap-2">
                                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Duración Default</label>
                                            <p-inputNumber formControlName="defaultDuration" mode="decimal" [min]="1" [showButtons]="true" 
                                                           inputStyleClass="w-full font-bold text-center !bg-transparent" 
                                                           styleClass="w-full" class="w-full"></p-inputNumber>
                                        </div>
                                        <div class="flex flex-col gap-2">
                                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Unidad</label>
                                            <p-select formControlName="durationUnit" [options]="unitOptions" optionLabel="label" optionValue="value" 
                                                      styleClass="w-full" appendTo="body"></p-select>
                                        </div>
                                    </div>
                                </div>

                                <div *ngIf="!form.get('hasEndDate')?.value" class="animate-fade-in text-center py-4 text-[11px] text-primary font-bold bg-primary/5 rounded-xl border border-primary/10">
                                    Configurado como Contrato Indefinido
                                </div>
                            </div>

                            <div class="p-6 border border-dashed border-slate-300 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center text-center space-y-3">
                                <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                    <app-icon name="info" size="24"></app-icon>
                                </div>
                                <p class="text-[11px] text-slate-500 max-w-[200px] leading-relaxed italic">
                                    La duración por defecto se utilizará para pre-llenar la fecha de fin al crear un contrato nuevo.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="flex items-center justify-end gap-4 pt-10 border-t border-slate-200 dark:border-white/10">
                        <button type="button" [routerLink]="['/rrhh/contract-types']" 
                                class="px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold">
                            Cancelar
                        </button>
                        <button type="submit" [disabled]="form.invalid || loading()"
                                class="px-10 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-primary/30 flex items-center gap-3">
                            <app-icon *ngIf="!loading()" name="save" size="18"></app-icon>
                            <app-icon *ngIf="loading()" icon="pi-spin pi-spinner" size="18"></app-icon>
                            <span>{{ loading() ? 'Procesando...' : (isEditMode() ? 'Actualizar Tipo' : 'Crear Tipo') }}</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </div>
    `
})
export class ContractTypeFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(ContractTypeService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    form: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(100)]],
        description: [''],
        hasEndDate: [true],
        defaultDuration: [12],
        durationUnit: ['MONTHS'],
        active: [true]
    });

    isEditMode = signal(false);
    itemId = signal<string | null>(null);
    loading = signal(false);
    errorMessage = signal<string | null>(null);

    unitOptions = [
        { label: 'Meses', value: 'MONTHS' },
        { label: 'Días', value: 'DAYS' },
        { label: 'Años', value: 'YEARS' }
    ];

    ngOnInit() {
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.isEditMode.set(true);
            this.itemId.set(id);
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
                this.errorMessage.set('Error al cargar la información.');
                this.loading.set(false);
                setTimeout(() => this.router.navigate(['/rrhh/contract-types']), 1500);
            }
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.loading.set(true);
        const data = this.form.value;

        if (!data.hasEndDate) {
            data.defaultDuration = null;
            data.durationUnit = null;
        }

        const request = this.isEditMode()
            ? this.service.update(this.itemId()!, data)
            : this.service.create(data);

        request.subscribe({
            next: () => {
                this.router.navigate(['/rrhh/contract-types']);
            },
            error: (err) => {
                this.loading.set(false);
                this.errorMessage.set(err.error?.message || (this.isEditMode()
                    ? 'Error al actualizar el tipo de contrato.'
                    : 'Error al crear el tipo de contrato.'));
            }
        });
    }
}
