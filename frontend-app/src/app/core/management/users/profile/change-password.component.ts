import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ProfileService } from '../../../services/profile.service';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { IconComponent } from '../../../../shared/components/icon.component';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonModule, PasswordModule, FloatLabelModule, IconComponent, AlertComponent],
    template: `
    <div class="px-6 py-8 w-full min-h-screen font-sans bg-slate-50/50 dark:bg-transparent animate-fade-in">

        <!-- Header Section -->
        <div class="max-w-4xl mx-auto mb-10">
            <div class="flex items-center justify-between mb-4">
                <div>
                     <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Seguridad de Cuenta</span>
                     <h1 class="text-4xl font-black text-slate-900 dark:text-white">
                        Robustecer <span class="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">Contraseña</span>
                     </h1> 
                </div>
                <button [routerLink]="['/core/management/users/profile']" class="p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-95 group shadow-sm">
                    <app-icon icon="shield" class="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors"></app-icon>
                </button>
            </div>
            <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
                Mantén tu cuenta protegida actualizando tus credenciales periódicamente.
            </p>
        </div>

        <!-- Alerts -->
        <app-alert *ngIf="successMessage()" type="success" [message]="successMessage()" (closed)="successMessage.set(null)"></app-alert>
        <app-alert *ngIf="errorMessage()" type="error" [message]="errorMessage()" (closed)="errorMessage.set(null)"></app-alert>

        <!-- Main Card Container -->
        <div class="max-w-4xl mx-auto">
            <div class="bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl overflow-hidden transition-all duration-500">
                <div class="p-12 md:p-16 lg:p-20">
                    
                    <!-- Change Password Form -->   
                    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-8">
                        
                        <!-- Current Password Field -->
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Contraseña Actual</label>
                            <p-password formControlName="oldPassword" [feedback]="false" [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"></p-password>
                        </div>

                        <!-- New Password & Confirm Password Fields -->
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

                        <div *ngIf="form.errors?.['mismatch'] && (form.get('confirmPassword')?.touched || form.dirty)" class="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-center justify-center gap-2 text-rose-500 animate-bounce">
                            <app-icon icon="shield" class="w-4 h-4"></app-icon>
                            <span class="text-xs font-bold">Las contraseñas no coinciden.</span>
                        </div>

                        <!-- Submit Button -->
                        <div class="flex justify-end pt-6">
                            <button pButton pRipple type="submit" label="Actualizar Contraseña" icon="pi pi-check-circle" class="p-button-lg bg-primary text-white shadow-2xl shadow-primary/30 rounded-[2rem] px-12 py-6 transition-transform hover:scale-105" [loading]="submitting()" [disabled]="form.invalid"></button>
                        </div>

                    </form>

                </div>

            </div>
        </div>

    </div>
    `
})
export class ChangePasswordComponent implements OnInit {
    private fb = inject(FormBuilder);
    private profileService = inject(ProfileService);
    private router = inject(Router);

    form!: FormGroup;
    submitting = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);



    ngOnInit(): void {
        this.form = this.fb.group({
            oldPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordsMatch });

    
    }

    private passwordsMatch(group: FormGroup) {
        const np = group.get('newPassword')?.value;
        const cp = group.get('confirmPassword')?.value;
        return np && cp && np === cp ? null : { mismatch: true };
    }

    onSubmit() {
        if (this.form.invalid) return;
        this.submitting.set(true);
        this.errorMessage.set(null);
        const { oldPassword, newPassword, confirmPassword } = this.form.value;

        // Let the CsrfInterceptor handle any transient 403 by prefetching CSRF and retrying.
        this.profileService.changePassword(oldPassword, newPassword, confirmPassword).subscribe({
            next: () => {
                this.successMessage.set('Contraseña actualizada correctamente. Serás redirigido al perfil.');
                setTimeout(() => this.router.navigate(['/core/management/users/profile']), 1200);
            },
            error: (err) => {
                const msg = err?.error?.message || err?.message || 'Error al cambiar la contraseña';
                this.errorMessage.set(msg);
            }
        }).add(() => this.submitting.set(false));
    }
    private retrySubmit(oldPassword: string, newPassword: string, confirmPassword: string) {
        this.errorMessage.set(null);
        this.profileService.changePassword(oldPassword, newPassword, confirmPassword).subscribe({
            next: () => {
                this.successMessage.set('Contraseña actualizada correctamente. Serás redirigido al perfil.');
                setTimeout(() => this.router.navigate(['/core/management/users/profile']), 1200);
            },
            error: (err) => {
                const msg = err?.error?.message || err?.message || 'Error al cambiar la contraseña';
                this.errorMessage.set(msg);
            }
        }).add(() => this.submitting.set(false));
    }
}
