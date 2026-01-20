import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { IdentificationTypeService, IdentificationType } from '../../core/services/identification-type.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
    selector: 'app-identification-type-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        InputTextModule, ButtonModule, RippleModule, ToggleSwitchModule,
        SelectModule, MenuModule, IconComponent, AlertComponent
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in text-slate-800 dark:text-slate-100 flex justify-center">
        
        <div class="w-full max-w-3xl">
            <app-alert [message]="errorMessage()" type="error" (closed)="errorMessage.set(null)"></app-alert>
            
            <div class="mb-10">
                <a routerLink="/rrhh/identification-types" class="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 group">
                    <app-icon name="arrow-left" size="14" class="group-hover:-translate-x-1 transition-transform"></app-icon>
                    <span class="text-sm font-bold">Volver a la lista</span>
                </a>
                <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                    {{ isEditMode() ? 'Editar' : 'Nuevo' }} <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">Tipo de Identificación</span>
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">
                    {{ isEditMode() ? 'Actualiza la información del tipo de documento.' : 'Registra un nuevo tipo de documento de identidad para empleados.' }}
                </p>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl p-8 md:p-12">
                
                <div class="space-y-8 mb-10">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h3 class="text-xl font-black text-slate-800 dark:text-white">Información del Documento</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Name -->
                        <div class="flex flex-col gap-2 md:col-span-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre *</label>
                            <div class="relative group">
                                <app-icon name="id-card" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                <input pInputText formControlName="name" placeholder="Ej: Cédula de Ciudadanía" 
                                       style="padding-left: 3.5rem !important;"
                                       class="w-full pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                            </div>
                            <small class="text-rose-500 block mt-1" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
                                El nombre es requerido (max 100 caracteres).
                            </small>
                        </div>

                        <!-- Code -->
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Código (Opcional)</label>
                            <div class="relative group">
                                <app-icon name="hash" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                <input pInputText formControlName="code" placeholder="Ej: CC, TI, PASS" 
                                       style="padding-left: 3.5rem !important; text-transform: uppercase;"
                                       class="w-full pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                            </div>
                            <small class="text-slate-400 block mt-1 text-[10px] italic">Código corto único (se convierte a mayúsculas).</small>
                        </div>

                        <!-- Country -->
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">País</label>
                            <p-select [options]="countries()" optionLabel="name" optionValue="id" formControlName="countryId" 
                                      [filter]="true" filterBy="name"
                                      placeholder="Seleccionar..." class="w-full" styleClass="w-full" appendTo="body"></p-select>
                            <small class="text-slate-400 block mt-1 text-[10px] italic">Dejar vacío si aplica globalmente.</small>
                        </div>

                        <!-- Validation Regex -->
                        <div class="flex flex-col gap-2 md:col-span-2">
                            <div class="flex items-center justify-between">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Expresión Regular (Opcional)</label>
                                <p-menu #menu [model]="regexMenuItems" [popup]="true" appendTo="body" 
                                        styleClass="dark:bg-slate-900/90 dark:backdrop-blur-xl dark:border-white/10 dark:text-white rounded-2xl shadow-2xl border-slate-200 shadow-slate-900/20"></p-menu>
                                <button pButton type="button" (click)="menu.toggle($event)"
                                        class="p-button-text p-button-sm p-0 h-6 flex items-center gap-1.5 text-primary hover:text-primary-dark transition-colors no-underline border-none bg-transparent">
                                    <app-icon name="sparkles" size="14"></app-icon>
                                    <span class="text-[10px] font-bold uppercase tracking-wider">Asistente</span>
                                </button>
                            </div>
                            <div class="relative group">
                                <app-icon name="shield-check" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                <input pInputText formControlName="validationRegex" placeholder="Ej: ^[0-9]{8,12}$" 
                                       style="padding-left: 3.5rem !important; font-family: monospace;"
                                       class="w-full pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                            </div>
                            <small class="text-slate-400 block mt-1 text-[10px] italic">Define el formato permitido para el número de documento.</small>
                        </div>
                    </div>

                    <!-- Toggles Section -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        <div class="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-all duration-300">
                            <div class="flex flex-col">
                                <span class="font-bold text-slate-800 dark:text-slate-200 text-sm">Estado Activo</span>
                                <span class="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Visible</span>
                            </div>
                            <p-toggleSwitch formControlName="active"></p-toggleSwitch>
                        </div>
                    </div>
                </div>

                <div class="flex items-center justify-end gap-4 pt-8 border-t border-slate-200 dark:border-white/10">
                    <button pButton type="button" label="Cancelar" routerLink="/rrhh/identification-types" 
                            class="px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold p-button-text p-button-secondary"></button>
                    <button pButton type="submit" [label]="loading() ? 'Procesando...' : (isEditMode() ? 'Actualizar' : 'Crear Tipo')" 
                            [loading]="loading()" 
                            [disabled]="form.invalid"
                            class="px-10 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-bold shadow-lg shadow-primary/30"></button>
                </div>
            </form>
        </div>
    </div>
    `
})
export class IdentificationTypeFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(IdentificationTypeService);
    private profileService = inject(ProfileService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    form: FormGroup;
    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    errorMessage = signal<string | null>(null);
    countries = signal<any[]>([]);

    regexMenuItems: MenuItem[] = [
        {
            label: 'Solo Números',
            icon: 'pi pi-hashtag',
            command: () => this.applyRegex('^[0-9]+$')
        },
        {
            label: 'Alfanumérico',
            icon: 'pi pi-clone',
            command: () => this.applyRegex('^[a-zA-Z0-9]+$')
        },
        {
            label: 'Cédula (8-10 números)',
            icon: 'pi pi-id-card',
            command: () => this.applyRegex('^[0-9]{8,10}$')
        },
        {
            label: 'NIT (9-11 números)',
            icon: 'pi pi-briefcase',
            command: () => this.applyRegex('^[0-9]{9,11}$')
        },
        {
            label: 'Pasaporte (Internacional)',
            icon: 'pi pi-globe',
            command: () => this.applyRegex('^[A-Z0-9]{6,20}$')
        }
    ];

    constructor() {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            code: ['', [Validators.maxLength(50)]],
            countryId: [null],
            validationRegex: ['', [Validators.maxLength(255)]],
            active: [true]
        });
    }

    ngOnInit() {
        this.loadInitialData();
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.loadData(id);
        }
    }

    private applyRegex(pattern: string) {
        this.form.get('validationRegex')?.setValue(pattern);
    }

    private loadInitialData() {
        this.profileService.getCountries().subscribe(data => this.countries.set(data));
    }

    loadData(id: string) {
        this.loading.set(true);
        this.service.getById(id).subscribe({
            next: (data) => {
                this.form.patchValue(data);
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Error al cargar datos del tipo de identificación.');
                this.loading.set(false);
            }
        });
    }

    onSubmit() {
        if (this.form.invalid) return;

        this.loading.set(true);
        const data = this.form.value;
        const id = this.route.snapshot.paramMap.get('id');

        const request$ = this.isEditMode() && id
            ? this.service.update(id, data)
            : this.service.create(data);

        request$.subscribe({
            next: () => {
                this.router.navigate(['/rrhh/identification-types']);
            },
            error: (err) => {
                const msg = err.error?.message || 'Error al guardar el tipo de identificación.';
                this.errorMessage.set(msg);
                this.loading.set(false);
            }
        });
    }
}
