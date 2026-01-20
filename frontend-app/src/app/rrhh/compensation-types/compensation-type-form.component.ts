import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { CompensationTypeService, OptionDto, CompensationCategory } from '../../core/services/compensation-type.service';
import { CostCenterService, CostCenter } from '../../core/services/cost-center.service';
import { CurrencyService, Currency } from '../../core/services/currency.service';
import { effect } from '@angular/core';

@Component({
    selector: 'app-compensation-type-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        InputTextModule, ButtonModule, RippleModule, ToggleSwitchModule,
        SelectModule, InputNumberModule, TextareaModule, IconComponent, AlertComponent
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in text-slate-800 dark:text-slate-100 flex justify-center">
        
        <div class="w-full max-w-4xl">
            <app-alert [message]="errorMessage()" type="error" (closed)="errorMessage.set(null)"></app-alert>
            
            <div class="mb-10">
                <a routerLink="/rrhh/compensation-types" class="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 group">
                    <app-icon name="arrow-left" size="14" class="group-hover:-translate-x-1 transition-transform"></app-icon>
                    <span class="text-sm font-bold">Volver a la lista</span>
                </a>
                <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                    {{ isEditMode() ? 'Editar' : 'Nuevo' }} <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">Concepto</span>
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">
                    {{ isEditMode() ? 'Actualiza la configuración del concepto de nómina.' : 'Crea un nuevo concepto de ingreso o deducción para la nómina.' }}
                </p>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl p-8 md:p-12">
                
                <div class="space-y-10 mb-10">
                    
                    <!-- General Information -->
                    <div class="space-y-6">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h3 class="text-xl font-black text-slate-800 dark:text-white">Información General</h3>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <!-- Name -->
                            <div class="flex flex-col gap-2 md:col-span-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre del Concepto *</label>
                                <div class="relative group">
                                    <app-icon name="document" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                    <input pInputText formControlName="name" placeholder="Ej: Bonificación por cumplimiento" 
                                           style="padding-left: 3.5rem !important;"
                                           class="w-full pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                                </div>
                            </div>

                            <!-- Code -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Código (Único)</label>
                                <div class="relative group">
                                    <app-icon name="hash" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                    <input pInputText formControlName="code" placeholder="Ej: BN-001" 
                                           style="padding-left: 3.5rem !important; text-transform: uppercase;"
                                           class="w-full pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                                </div>
                            </div>

                            <!-- Category -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Categoría *</label>
                                <p-select formControlName="category" [options]="categoryOptions" optionLabel="label" optionValue="value" 
                                          [filter]="true" [showClear]="false"
                                          placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                            </div>

                             <!-- Cost Center -->
                             <div class="flex flex-col gap-2 md:col-span-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Centro de Costos (Opcional)</label>
                                <p-select formControlName="costCenterId" [options]="costCenters()" optionLabel="name" optionValue="id" 
                                          [filter]="true" [showClear]="false"
                                          placeholder="Asociar a un centro de costos..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descripción</label>
                            <textarea pTextarea formControlName="description" rows="3" placeholder="Detalles adicionales sobre este concepto..." 
                                      class="w-full p-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm resize-none"></textarea>
                        </div>
                    </div>

                    <hr class="border-slate-100 dark:border-slate-800" />

                    <!-- Calculation Configuration -->
                    <div class="space-y-6">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                            <h3 class="text-xl font-black text-slate-800 dark:text-white">Cálculo y Valores</h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Is Variable Toggle -->
                            <div class="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm md:col-span-2">
                                <div class="flex flex-col">
                                    <span class="font-bold text-slate-800 dark:text-slate-200 text-sm">¿Es un valor variable?</span>
                                    <span class="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Si es activo, se calcula por porcentaje. Si no, es valor fijo.</span>
                                </div>
                                <p-toggleSwitch formControlName="isVariable"></p-toggleSwitch>
                            </div>

                            <!-- Fixed Amount (Show if NOT Variable) -->
                            <div class="flex flex-col gap-2" *ngIf="!form.get('isVariable')?.value">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Monto Fijo ({{ selectedCurrencyCode() }})</label>
                                <p-inputNumber formControlName="fixedAmount" mode="currency" [currency]="selectedCurrencyCode()" locale="es-CO" 
                                               placeholder="$0.00" class="w-full" styleClass="w-full" 
                                               [inputStyleClass]="'w-full py-3 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'"></p-inputNumber>
                            </div>

                            <!-- Percentage (Show if Variable) -->
                            <div class="flex flex-col gap-2" *ngIf="form.get('isVariable')?.value">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Porcentaje</label>
                                <p-inputNumber formControlName="percentage" suffix="%" [min]="0" [max]="100" [minFractionDigits]="2"
                                               placeholder="0.00%" class="w-full" styleClass="w-full"
                                               [inputStyleClass]="'w-full py-3 rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10'"></p-inputNumber>
                            </div>
                            
                             <!-- Calculation Base (Show if Variable) -->
                             <div class="flex flex-col gap-2" *ngIf="form.get('isVariable')?.value">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Base de Cálculo</label>
                                 <p-select formControlName="calculationBaseId" [options]="calculationBases()" optionLabel="name" optionValue="id" 
                                           [filter]="true" [showClear]="false"
                                           placeholder="Seleccionar Base..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                            </div>

                            <!-- Periodicity -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Periodicidad</label>
                                <p-select formControlName="periodicityId" [options]="periodicities()" optionLabel="name" optionValue="id" 
                                          [filter]="true" [showClear]="false"
                                          placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                            </div>
                        </div>
                    </div>

                    <!-- Compliance & Reporting -->
                    <div class="space-y-6 pt-6 border-t border-slate-200 dark:border-white/10">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h3 class="text-xl font-black text-slate-800 dark:text-white">Cumplimiento Legal y Reportes</h3>
                        </div>

                        <!-- External Code -->
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{{ externalCodeLabel() }}</label>
                            <div class="relative group">
                                <app-icon name="shield" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                <input pInputText formControlName="externalCode" placeholder="Identificador para reportes..." 
                                    style="padding-left: 3.5rem !important;"
                                    class="w-full pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4" *ngIf="form.get('category')?.value === 'EARNING'">
                            <!-- Is Salary -->
                            <div class="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-all duration-300 hover:border-primary/20 dark:hover:border-primary/30">
                                <div class="flex flex-col">
                                    <span class="font-bold text-slate-800 dark:text-slate-200 text-sm">Es Salarial</span>
                                    <span class="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Base para prestaciones sociales</span>
                                </div>
                                <p-toggleSwitch formControlName="isSalary"></p-toggleSwitch>
                            </div>
                        </div>
                        
                        <!-- Affectations Grid -->
                        <div class="bg-primary/5 dark:bg-primary/5 rounded-3xl p-6 border border-primary/10 dark:border-primary/20" *ngIf="form.get('category')?.value === 'EARNING'">
                            <h4 class="text-[10px] font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                                <app-icon name="check-circle" size="12"></app-icon>
                                <span>Afectaciones a Bases</span>
                            </h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                <!-- Social Security -->
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Seguridad Social</span>
                                    <p-toggleSwitch formControlName="affectsSocialSecurity"></p-toggleSwitch>
                                </div>
                                <!-- Parafiscals -->
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Parafiscales</span>
                                    <p-toggleSwitch formControlName="affectsParafiscals"></p-toggleSwitch>
                                </div>
                                <!-- Benefits -->
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Prestaciones Sociales</span>
                                    <p-toggleSwitch formControlName="affectsBenefits"></p-toggleSwitch>
                                </div>
                                <!-- ARL -->
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Riesgos Laborales (ARL)</span>
                                    <p-toggleSwitch formControlName="affectsArl"></p-toggleSwitch>
                                </div>
                                <!-- Taxable -->
                                <div class="flex items-center justify-between">
                                    <span class="text-sm font-bold text-slate-700 dark:text-slate-300">Retención en la Fuente</span>
                                    <p-toggleSwitch formControlName="isTaxable"></p-toggleSwitch>
                                </div>
                            </div>
                        </div>

                         <!-- Active Flag (Separate) -->
                        <div class="flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm mt-4">
                            <div class="flex flex-col">
                                <span class="font-bold text-emerald-800 dark:text-emerald-400 text-sm">Estado Operativo</span>
                                <span class="text-[9px] text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mt-0.5">Concepto habilitado en nómina</span>
                            </div>
                            <p-toggleSwitch formControlName="active"></p-toggleSwitch>
                        </div>
                    </div>

                </div>

                <div class="flex items-center justify-end gap-4 pt-8 border-t border-slate-200 dark:border-white/10">
                    <button pButton type="button" label="Cancelar" routerLink="/rrhh/compensation-types" 
                            class="px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold p-button-text p-button-secondary"></button>
                    <button pButton type="submit" [label]="loading() ? 'Procesando...' : (isEditMode() ? 'Actualizar' : 'Guardar')" 
                            [loading]="loading()" 
                            [disabled]="form.invalid"
                            class="px-10 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-primary/30"></button>
                </div>
            </form>
        </div>
    </div>
    `
})
export class CompensationTypeFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(CompensationTypeService);
    private costCenterService = inject(CostCenterService);
    private currencyService = inject(CurrencyService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    form: FormGroup;
    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    errorMessage = signal<string | null>(null);

    // Dropdown Data
    periodicities = signal<OptionDto[]>([]);
    calculationBases = signal<OptionDto[]>([]);
    costCenters = signal<CostCenter[]>([]);
    currencies = signal<Currency[]>([]);

    // Localization & State
    selectedCurrencyCode = signal<string>('---');

    categoryOptions = [
        { label: 'Ingreso', value: CompensationCategory.EARNING },
        { label: 'Deducción', value: CompensationCategory.DEDUCTION }
    ];

    // Localization / Business Rules Abstraction
    externalCodeLabel = signal<string>('Código de reporte gubernamental');

    constructor() {
        // In a real SaaS, labels could be loaded based on Country
        this.externalCodeLabel.set('Código Nómina Electrónica / UGPP');

        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(255)]],
            code: ['', [Validators.maxLength(50)]],
            description: [''],
            category: [CompensationCategory.EARNING, Validators.required],
            costCenterId: [null],

            isVariable: [false],
            fixedAmount: [null],
            percentage: [null],
            calculationBaseId: [null],
            currencyId: [null],

            periodicityId: [null],

            isSalary: [false],
            isTaxable: [false],

            // HR Compliance Flags
            affectsSocialSecurity: [false],
            affectsParafiscals: [false],
            affectsBenefits: [false],
            affectsArl: [false],
            externalCode: [''],

            isReadOnly: [false],
            active: [true]
        });

        // Listen for isVariable changes to update validation
        this.form.get('isVariable')?.valueChanges.subscribe(isVar => this.updateCalculationValidators(isVar));

        // Listen for costCenterId changes to inherit currency
        this.form.get('costCenterId')?.valueChanges.subscribe(ccId => this.handleCostCenterChange(ccId));
    }

    private updateCalculationValidators(isVariable: boolean) {
        const fixedAmt = this.form.get('fixedAmount');
        const percentage = this.form.get('percentage');
        const calcBase = this.form.get('calculationBaseId');

        if (isVariable) {
            fixedAmt?.clearValidators();
            percentage?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
            calcBase?.setValidators([Validators.required]);
        } else {
            fixedAmt?.setValidators([Validators.required, Validators.min(0)]);
            percentage?.clearValidators();
            calcBase?.clearValidators();
        }

        fixedAmt?.updateValueAndValidity();
        percentage?.updateValueAndValidity();
        calcBase?.updateValueAndValidity();
    }

    private handleCostCenterChange(ccId: string | null) {
        if (!ccId) {
            this.selectedCurrencyCode.set('---');
            this.form.get('currencyId')?.setValue(null);
            return;
        }

        const cc = this.costCenters().find(c => c.id === ccId);
        if (cc && cc.currencyCode) {
            this.selectedCurrencyCode.set(cc.currencyCode);
            this.form.get('currencyId')?.setValue(cc.currencyId);
        }
    }

    ngOnInit() {
        this.loadOptions();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.loadData(id);
        } else {
            // Initial validation state for creation
            this.updateCalculationValidators(false);
        }
    }

    loadOptions() {
        this.service.getPeriodicityOptions().subscribe(data => this.periodicities.set(data));
        this.service.getCalculationBaseOptions().subscribe(data => this.calculationBases.set(data));
        this.costCenterService.getActive().subscribe(data => this.costCenters.set(data));
        this.currencyService.getAll(true).subscribe(data => this.currencies.set(data));
    }

    loadData(id: string) {
        this.loading.set(true);
        this.service.getById(id).subscribe({
            next: (data) => {
                this.form.patchValue(data);
                if (data.currencyCode) {
                    this.selectedCurrencyCode.set(data.currencyCode);
                }
                this.updateCalculationValidators(data.isVariable);
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Error al cargar datos.');
                this.loading.set(false);
            }
        });
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.loading.set(true);
        const data = this.form.value;
        const id = this.route.snapshot.paramMap.get('id');

        // Logic for cleaning data based on isVariable
        if (data.isVariable) {
            data.fixedAmount = null;
        } else {
            data.percentage = null;
            data.calculationBaseId = null;
        }

        // Cleanup HR flags if it's a Deduction
        if (data.category === 'DEDUCTION') {
            data.isSalary = false;
            data.affectsSocialSecurity = false;
            data.affectsParafiscals = false;
            data.affectsBenefits = false;
            data.affectsArl = false;
            data.isTaxable = false;
        }

        const request$ = this.isEditMode() && id
            ? this.service.update(id, data)
            : this.service.create(data);

        request$.subscribe({
            next: () => {
                this.router.navigate(['/rrhh/compensation-types']);
            },
            error: (err) => {
                const msg = err.error?.message || 'Error al guardar.';
                this.errorMessage.set(msg);
                this.loading.set(false);
            }
        });
    }
}
