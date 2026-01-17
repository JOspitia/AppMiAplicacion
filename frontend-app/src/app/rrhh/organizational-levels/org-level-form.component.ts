import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { OrganizationalLevelService } from '../../core/services/organizational-level.service';

@Component({
    selector: 'app-org-level-form',
    standalone: true,
    imports: [
        CommonModule, RouterModule, ReactiveFormsModule,
        InputText, Textarea, ToggleSwitch,
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
                        {{ isEditMode() ? 'Editar' : 'Nuevo' }} <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark">Nivel Organizacional</span>
                    </h1>
                </div>
                <button [routerLink]="['/rrhh/organizational-levels']" class="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm">
                    <app-icon name="arrow-left" class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors"></app-icon>
                </button>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Configura los detalles del nivel jerárquico. El orden determina la autoridad (1 = Máximo Nivel).
            </p>
        </div>

        <div class="max-w-4xl mx-auto">
            <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden p-8 md:p-12">
                
                <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-10">
                    
                    <div>
                        <div class="flex items-center gap-3 mb-6">
                            <div class="w-1.5 h-6 bg-primary rounded-full"></div>
                            <h2 class="text-xl font-black text-slate-800 dark:text-white">Información General</h2>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <!-- Nombre -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nombre *</label>
                                <div class="relative group">
                                    <app-icon name="sitemap" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors z-10"></app-icon>
                                    <input pInputText formControlName="name" placeholder="Ej: Dirección Estratégica" 
                                           style="padding-left: 3.5rem !important;"
                                           class="w-full pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                                </div>
                            </div>

                            <!-- Estado -->
                            <div class="flex flex-col gap-2">
                                <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Estado Operativo</label>
                                <div class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 h-[52px]">
                                    <span class="text-sm font-bold ml-1">{{ form.get('active')?.value ? 'Activo' : 'Inactivo' }}</span>
                                    <p-toggleswitch formControlName="active"></p-toggleswitch>
                                </div>
                            </div>
                        </div>

                        <!-- Descripción -->
                        <div class="flex flex-col gap-2 mt-6">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Descripción (Opcional)</label>
                            <textarea pInputTextarea formControlName="description" rows="3" 
                                      placeholder="Detalles sobre las responsabilidades de este nivel..."
                                      class="w-full p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl !w-full"></textarea>
                        </div>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="flex items-center justify-end gap-4 pt-8 border-t border-slate-200 dark:border-white/10">
                        <button type="button" [routerLink]="['/rrhh/organizational-levels']" 
                                class="px-8 py-3 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-bold">
                            Cancelar
                        </button>
                        <button type="submit" [disabled]="loading()"
                                class="px-10 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all font-bold shadow-lg shadow-primary/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2">
                             <app-icon *ngIf="!loading()" icon="save" size="18"></app-icon>
                             <app-icon *ngIf="loading()" icon="pi-spin pi-spinner" size="18"></app-icon>
                             <span>{{ loading() ? 'Procesando...' : (isEditMode() ? 'Actualizar Nivel' : 'Crear Nivel') }}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `
})
export class OrganizationalLevelFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(OrganizationalLevelService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    form: FormGroup;
    loading = signal(false);
    isEditMode = signal(false);
    levelId = signal<string | null>(null);

    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    constructor() {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.maxLength(100)]],
            description: [''],
            active: [true]
        });
    }

    ngOnInit() {
        this.checkEditMode();
    }

    checkEditMode() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.levelId.set(id);
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
                this.errorMessage.set('Error al cargar la información del nivel.');
                this.loading.set(false);
            }
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            this.errorMessage.set('Por favor completa los campos requeridos.');
            return;
        }

        this.loading.set(true);
        const data = this.form.value;

        const request = this.isEditMode()
            ? this.service.update(this.levelId()!, data)
            : this.service.create(data);

        request.subscribe({
            next: () => {
                this.successMessage.set(this.isEditMode() ? 'Nivel actualizado exitosamente.' : 'Nivel creado exitosamente.');
                setTimeout(() => this.router.navigate(['/rrhh/organizational-levels']), 1500);
            },
            error: (err) => {
                this.loading.set(false);
                this.errorMessage.set(err.error?.message || 'Error al procesar la solicitud.');
            }
        });
    }
}
