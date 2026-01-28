import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { MenuItem, MessageService } from 'primeng/api';
import { EmployeePersonalFormComponent } from './steps/step1-personal.component';

@Component({
    selector: 'app-employee-wizard',
    standalone: true,
    imports: [CommonModule, StepsModule, ToastModule, EmployeePersonalFormComponent],
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

        <!-- Step 2: Contract (Placeholder) -->
        <div *ngIf="activeIndex === 1" class="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700">
            <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-200">Paso 2: Contratación</h2>
            <p class="text-slate-500 mt-2">Próximamente...</p>
            <button (click)="activeIndex = 0" class="mt-4 text-primary font-bold hover:underline">Volver</button>
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

        // Handle query params for step navigation if needed
    }

    onNext(createdId: string) {
        if (!this.employeeId()) {
            this.employeeId.set(createdId);
            // Update URL without reload logic? Or just move to next step
            // Ideally router.navigate to edit/id
        }
        this.activeIndex = 1;
    }

    onCancel() {
        this.router.navigate(['/rrhh/employees']);
    }
}
