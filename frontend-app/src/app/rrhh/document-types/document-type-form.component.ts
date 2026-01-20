import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule } from 'primeng/select';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { DocumentTypeService, DocumentType } from '../../core/services/document-type.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'app-document-type-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        InputTextModule, ButtonModule, RippleModule, ToggleSwitchModule,
        SelectModule, IconComponent, AlertComponent
    ],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in text-slate-800 dark:text-slate-100 flex justify-center">
        
        <div class="w-full max-w-3xl">
            <app-alert [message]="errorMessage()" type="error" (closed)="errorMessage.set(null)"></app-alert>
            
            <div class="mb-10">
                <a routerLink="/rrhh/document-types" class="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-4 group">
                    <app-icon name="arrow-left" size="14" class="group-hover:-translate-x-1 transition-transform"></app-icon>
                    <span class="text-sm font-bold">Volver a la lista</span>
                </a>
                <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                    {{ isEditMode() ? 'Editar' : 'Nuevo' }} <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">Tipo de Soporte</span>
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2 text-sm leading-relaxed max-w-2xl">
                    {{ isEditMode() ? 'Actualiza la información del requisito documental.' : 'Define un nuevo tipo de soporte o documento cargable para los empleados.' }}
                </p>
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl p-8 md:p-12">
                
                <div class="space-y-8 mb-10">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h3 class="text-xl font-black text-slate-800 dark:text-white">Información General</h3>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Name -->
                        <div class="flex flex-col gap-2 md:col-span-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre del Documento *</label>
                            <div class="relative group">
                                <app-icon name="document" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                <input pInputText formControlName="name" placeholder="Ej: Licencia de Conducción C2" 
                                       style="padding-left: 3.5rem !important;"
                                       class="w-full pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                            </div>
                            <small class="text-rose-500 block mt-1" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
                                El nombre es requerido (max 100 caracteres).
                            </small>
                        </div>

                        <!-- Code -->
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Código de Referencia</label>
                            <div class="relative group">
                                <app-icon name="hash" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                <input pInputText formControlName="code" placeholder="Ej: LIC-C2" 
                                       style="padding-left: 3.5rem !important; text-transform: uppercase;"
                                       class="w-full pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm" />
                            </div>
                        </div>
                    </div>

                    <!-- Toggles Section -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-slate-100">
                        <div class="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-all duration-300">
                            <div class="flex flex-col">
                                <span class="font-bold text-slate-800 dark:text-slate-200 text-sm">¿Es Requerido?</span>
                                <span class="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Obligatorio</span>
                            </div>
                            <p-toggleSwitch formControlName="isRequired"></p-toggleSwitch>
                        </div>

                        <div class="flex items-center justify-between bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm transition-all duration-300">
                            <div class="flex flex-col">
                                <span class="font-bold text-slate-800 dark:text-slate-200 text-sm">Vencimiento</span>
                                <span class="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Control de fecha</span>
                            </div>
                            <p-toggleSwitch formControlName="requiresExpiration"></p-toggleSwitch>
                        </div>

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
                    <button pButton type="button" label="Cancelar" routerLink="/rrhh/document-types" 
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
export class DocumentTypeFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(DocumentTypeService);
    private http = inject(HttpClient);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    form: FormGroup;
    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    errorMessage = signal<string | null>(null);

    constructor() {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            code: ['', [Validators.maxLength(50)]],
            isRequired: [false],
            requiresExpiration: [false],
            active: [true]
        });
    }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.loadData(id);
        }
    }


    loadData(id: string) {
        this.loading.set(true);
        this.service.getById(id).subscribe({
            next: (data) => {
                this.form.patchValue(data);
                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Error al cargar datos del tipo de soporte.');
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
                this.router.navigate(['/rrhh/document-types']);
            },
            error: (err) => {
                const msg = err.error?.message || 'Error al guardar el tipo de soporte.';
                this.errorMessage.set(msg);
                this.loading.set(false);
            }
        });
    }
}
