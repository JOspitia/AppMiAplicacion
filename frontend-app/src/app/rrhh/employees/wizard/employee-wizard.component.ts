import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';
import { EmployeePersonalFormComponent } from './steps/step1-personal.component';
import { EmployeeContractFormComponent } from './steps/step2-contract.component';

@Component({
    selector: 'app-employee-wizard',
    standalone: true,
    imports: [
        CommonModule, StepsModule, ToastModule,
        EmployeePersonalFormComponent, EmployeeContractFormComponent
    ],
    providers: [MessageService],
    template: `
    <div class="min-h-screen bg-slate-50/50 dark:bg-transparent pb-20">
      <div class="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="py-4">
                <p-steps [model]="items" [(activeIndex)]="activeIndex" [readonly]="false"></p-steps>
            </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        
        <!-- Step 1: Personal Data -->
        <div *ngIf="activeIndex === 0">
           <app-employee-personal-form 
                [employeeId]="employeeId()" 
                (next)="onNext($event)"
                (cancel)="onCancel()">
           </app-employee-personal-form>
        </div>

        <!-- Step 2: Contract -->
        <div *ngIf="activeIndex === 1">
            <app-employee-contract-form
                *ngIf="employeeId()"
                [employeeId]="employeeId()!"
                (next)="onContractSaved()"
                (back)="activeIndex = 0">
            </app-employee-contract-form>
            <div *ngIf="!employeeId()" class="glass p-12 text-center rounded-3xl border border-white/10 shadow-xl">
                <p class="text-slate-400">Debe completar la información personal antes de continuar.</p>
                <button (click)="activeIndex = 0" class="mt-4 text-primary font-bold hover:underline flex items-center gap-2 mx-auto transition-all hover:scale-105 active:scale-95">
                    <span class="pi pi-arrow-left"></span> Volver al Paso 1
                </button>
            </div>
        </div>

        <!-- Step 3: Jobs (Placeholder) -->
        <div *ngIf="activeIndex === 2" class="glass p-20 text-center rounded-3xl border border-white/10 shadow-xl">
            <h2 class="text-2xl font-bold text-white">Paso 3: Información Corporativa</h2>
            <p class="text-slate-400 mt-2">Próximamente...</p>
            <button (click)="activeIndex = 1" class="mt-4 text-primary font-bold hover:underline transition-all hover:scale-105 active:scale-95">Volver</button>
        </div>
      </div>
    </div>
  `
})
export class EmployeeWizardComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    items: MenuItem[] = [
        { label: 'Información Personal', command: () => this.activeIndex = 0 },
        { label: 'Contratación', command: () => this.activeIndex = 1 },
        { label: 'Datos Corporativos', command: () => this.activeIndex = 2 },
    ];

    activeIndex = 0;
    employeeId = signal<string | null>(null);

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.employeeId.set(id);
            }
        });
    }

    onNext(createdId: string) {
        if (!this.employeeId()) {
            this.employeeId.set(createdId);
        }
        this.activeIndex = 1;
    }

    onContractSaved() {
        this.activeIndex = 2;
    }

    onCancel() {
        this.router.navigate(['/rrhh/employees']);
    }
}
