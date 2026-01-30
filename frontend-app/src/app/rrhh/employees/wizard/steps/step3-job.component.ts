import { Component, OnInit, signal, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';

import { EmployeeService, EmployeeJobStepDto } from '../../../../core/services/employee.service';
import { CatalogService, CostCenter, Department, Location, OperationalCenter, Position } from '../../../../core/services/catalog.service';
import { IconComponent } from '../../../../shared/components/icon.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { CurrencyService, Currency } from '../../../../core/services/currency.service';

@Component({
    selector: 'app-employee-job-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, InputTextModule, SelectModule, ButtonModule,
        InputNumberModule, CheckboxModule, IconComponent, AlertComponent
    ],
    templateUrl: './step3-job.component.html',
    styles: [`
        :host ::ng-deep .icon-padding-left {
            padding-left: 3.5rem !important;
        }
        :host ::ng-deep .select-with-icon .p-select-label {
            padding-left: 3.5rem !important;
        }
    `]
})
export class EmployeeJobFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private employeeService = inject(EmployeeService);
    private catalogService = inject(CatalogService);
    private currencyService = inject(CurrencyService);
    private messageService = inject(MessageService);

    @Input() employeeId!: string;
    @Output() next = new EventEmitter<void>();
    @Output() back = new EventEmitter<void>();

    form!: FormGroup;
    loading = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    // Catalogs
    costCenters = signal<CostCenter[]>([]);
    allDepartments = signal<Department[]>([]);
    filteredDepartments = signal<Department[]>([]);

    // Metadata for Email Generation
    firstName = signal<string | null>(null);
    lastName = signal<string | null>(null);
    companyDomain = signal<string | null>(null);
    allLocations = signal<Location[]>([]);
    filteredLocations = signal<Location[]>([]);
    allOperationalCenters = signal<OperationalCenter[]>([]);
    filteredOperationalCenters = signal<OperationalCenter[]>([]);
    allPositions = signal<Position[]>([]);
    filteredPositions = signal<Position[]>([]);
    managers = signal<any[]>([]);
    currencies = signal<Currency[]>([]);

    // Transport Aid Logic
    transportAidThreshold = signal<number | null>(null);
    showTransportAidWarning = signal(false);
    private transportAidManualOverride = false;

    constructor() {
        this.form = this.fb.group({
            costCenterId: [null, Validators.required],
            departmentId: [null, Validators.required],
            locationId: [null],
            operationalCenterId: [null],
            positionId: [null, Validators.required],
            managerId: [null],
            salary: [null, [Validators.required, Validators.min(0)]],
            currencyCode: ['COP', Validators.required],
            transportAid: [false],
            email: ['', [Validators.required, Validators.email]]
        });
    }

    ngOnInit() {
        this.loadCatalogs();
        if (this.employeeId) {
            this.loadJobData();
        }

        // Cascading dropdowns
        this.form.get('costCenterId')?.valueChanges.subscribe(costCenterId => {
            this.onCostCenterChange(costCenterId);
        });

        this.form.get('departmentId')?.valueChanges.subscribe(departmentId => {
            this.onDepartmentChange(departmentId);
        });

        this.form.get('locationId')?.valueChanges.subscribe(locationId => {
            this.onLocationChange(locationId);
        });

        // Transport Aid Logic Subscriptions
        this.form.get('salary')?.valueChanges.subscribe(() => {
            this.checkTransportAidLogic();
        });

        this.form.get('transportAid')?.valueChanges.subscribe(() => {
            this.checkTransportAidLogic(true);
        });
    }

    loadCatalogs() {
        this.catalogService.getCostCenters().subscribe(data => {
            this.costCenters.set(data);
        });

        this.catalogService.getDepartments().subscribe(data => {
            this.allDepartments.set(data);
        });

        this.catalogService.getLocations().subscribe(data => {
            this.allLocations.set(data);
        });

        this.catalogService.getOperationalCenters().subscribe(data => {
            this.allOperationalCenters.set(data);
        });

        this.catalogService.getPositions().subscribe(data => {
            this.allPositions.set(data);
        });

        this.currencyService.getAll(true).subscribe(data => {
            this.currencies.set(data);
        });

        // TODO: Load managers (employees with managerial positions)
        // this.employeeService.getManagers().subscribe(data => {
        //     this.managers.set(data);
        // });
    }

    loadJobData() {
        this.loading.set(true);
        this.employeeService.getJobData(this.employeeId).subscribe({
            next: (data) => {
                this.form.patchValue(data);

                // Store metadata for email generation
                this.firstName.set(data.firstName || null);
                this.lastName.set(data.lastName || null);
                this.companyDomain.set(data.companyDomain || null);

                // Trigger cascades
                if (data.costCenterId) {
                    this.onCostCenterChange(data.costCenterId);
                }
                if (data.departmentId) {
                    this.onDepartmentChange(data.departmentId);
                }
                if (data.locationId) {
                    this.onLocationChange(data.locationId);
                }

                this.loading.set(false);
            },
            error: (err) => {
                console.error('Error loading job data:', err);
                this.errorMessage.set('Error al cargar los datos corporativos');
                this.loading.set(false);
            }
        });
    }

    onCostCenterChange(costCenterId: string | null) {
        if (!costCenterId) {
            this.filteredDepartments.set([]);
            this.form.patchValue({
                departmentId: null,
                locationId: null,
                operationalCenterId: null,
                positionId: null
            });
            return;
        }

        // Filter departments by cost center
        const filtered = this.allDepartments().filter(d => d.costCenterId === costCenterId);
        this.filteredDepartments.set(filtered);

        // Auto-select currency and set threshold from cost center if available
        const costCenter = this.costCenters().find(cc => cc.id === costCenterId);
        if (costCenter) {
            if (costCenter.currencyCode) {
                this.form.patchValue({ currencyCode: costCenter.currencyCode });
            }
            this.transportAidThreshold.set(costCenter.transportAidThreshold || null);
            this.checkTransportAidLogic();
        } else {
            this.transportAidThreshold.set(null);
        }

        // Reset dependent fields if current selection is invalid
        const currentDeptId = this.form.get('departmentId')?.value;
        if (currentDeptId && !filtered.find(d => d.id === currentDeptId)) {
            this.form.patchValue({
                departmentId: null,
                locationId: null,
                operationalCenterId: null,
                positionId: null
            });
        }
    }

    onDepartmentChange(departmentId: string | null) {
        if (!departmentId) {
            this.filteredPositions.set([]);
            this.filteredLocations.set([]);
            this.form.patchValue({
                positionId: null,
                locationId: null,
                operationalCenterId: null
            });
            return;
        }

        // Filter positions by department
        const filteredPos = this.allPositions().filter(p => p.departmentId === departmentId);
        this.filteredPositions.set(filteredPos);

        // Filter locations by department
        const department = this.allDepartments().find(d => d.id === departmentId);
        if (department && department.locationIds && department.locationIds.length > 0) {
            const filteredLoc = this.allLocations().filter(l => department.locationIds!.includes(l.id));
            this.filteredLocations.set(filteredLoc);
        } else {
            this.filteredLocations.set(this.allLocations());
        }

        // Reset dependent fields if current selection is invalid
        const currentPosId = this.form.get('positionId')?.value;
        if (currentPosId && !filteredPos.find(p => p.id === currentPosId)) {
            this.form.patchValue({ positionId: null });
        }
    }

    onLocationChange(locationId: string | null) {
        if (!locationId) {
            this.filteredOperationalCenters.set([]);
            this.form.patchValue({ operationalCenterId: null });
            return;
        }

        // Filter operational centers by location
        const filtered = this.allOperationalCenters().filter(oc => oc.locationId === locationId);
        this.filteredOperationalCenters.set(filtered);

        // Reset if current selection is invalid
        const currentOcId = this.form.get('operationalCenterId')?.value;
        if (currentOcId && !filtered.find(oc => oc.id === currentOcId)) {
            this.form.patchValue({ operationalCenterId: null });
        }
    }

    checkTransportAidLogic(isManualToggle = false) {
        if (isManualToggle) {
            this.transportAidManualOverride = true;
        }

        const salary = this.form.get('salary')?.value || 0;
        const transportAid = this.form.get('transportAid')?.value;
        const threshold = this.transportAidThreshold();

        if (threshold !== null) {
            // 1. Auto-check if below threshold and not manually overridden
            if (!this.transportAidManualOverride && salary > 0 && salary <= threshold) {
                this.form.get('transportAid')?.setValue(true, { emitEvent: false });
            }

            // 2. Warning if checked AND exceeds threshold
            const isExceeded = transportAid && salary > threshold;
            this.showTransportAidWarning.set(isExceeded);
        } else {
            this.showTransportAidWarning.set(false);
        }
    }

    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            this.errorMessage.set('Por favor completa todos los campos obligatorios resaltados en rojo.');
            return;
        }

        this.loading.set(true);
        this.errorMessage.set(null);

        const formData: EmployeeJobStepDto = {
            employeeId: this.employeeId,
            ...this.form.value
        };

        this.employeeService.updateStep3(this.employeeId, formData).subscribe({
            next: () => {
                this.successMessage.set('Datos corporativos guardados exitosamente');
                this.loading.set(false);
                setTimeout(() => {
                    this.successMessage.set(null);
                    this.next.emit();
                }, 1500);
            },
            error: (err) => {
                console.error('Error saving job data:', err);
                this.errorMessage.set(err.error?.message || 'Error al guardar los datos corporativos');
                this.loading.set(false);
            }
        });
    }

    getCurrencyDisplay(code: string): string {
        const currency = this.currencies().find(c => c.code === code);
        if (!currency) return code;
        return `(${currency.code}) - ${currency.name}`;
    }

    generateCorporateEmail() {
        if (!this.employeeId) return;

        this.employeeService.suggestCorporateEmail(this.employeeId).subscribe({
            next: (email) => {
                this.form.patchValue({ email: email });
                this.messageService.add({
                    severity: 'info',
                    summary: 'Correo Sugerido',
                    detail: `Se ha generado un correo único: ${email}`
                });
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo generar la sugerencia de correo.'
                });
            }
        });
    }

    onBack() {
        this.back.emit();
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.form.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.form.get(fieldName);
        if (field?.hasError('required')) return 'Este campo es requerido';
        if (field?.hasError('email')) return 'Email inválido';
        if (field?.hasError('min')) return 'El valor debe ser mayor a 0';
        return '';
    }
}
