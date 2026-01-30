import { Component, OnInit, signal, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageService } from 'primeng/api';

import { EmployeeService, EmployeeContractStepDto, EmployeeDocumentDto } from '../../../../core/services/employee.service';
import { CatalogService, ContractType, WorkSchedule, DocumentType } from '../../../../core/services/catalog.service';
import { environment } from '../../../../../environments/environment';
import { IconComponent } from '../../../../shared/components/icon.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';

@Component({
    selector: 'app-employee-contract-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, FormsModule, InputTextModule, SelectModule, DatePickerModule,
        ButtonModule, FileUploadModule, TableModule, ToastModule, DividerModule, ToggleSwitchModule,
        IconComponent, AlertComponent
    ],
    templateUrl: './step2-contract.component.html'
})
export class EmployeeContractFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private employeeService = inject(EmployeeService);
    private catalogService = inject(CatalogService);
    private messageService = inject(MessageService);

    @Input() employeeId!: string;
    @Output() next = new EventEmitter<void>();
    @Output() back = new EventEmitter<void>();

    form!: FormGroup;
    loading = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    // Catalogs
    contractTypes = signal<ContractType[]>([]);
    workSchedules = signal<WorkSchedule[]>([]);
    documentTypes = signal<DocumentType[]>([]);

    // Document Management
    isUnified = signal(false);
    unifiedFile = signal<File | null>(null);
    individualFiles = new Map<string, File>();
    documentExpiries = new Map<string, string>();
    existingDocuments = signal<EmployeeDocumentDto[]>([]);

    constructor() {
        this.form = this.fb.group({
            contractTypeId: [null, Validators.required],
            contractNumber: ['', Validators.required],
            startDate: [null, Validators.required],
            endDate: [null],
            probationEndDate: [null],
            workScheduleId: [null, Validators.required],
            comments: ['']
        });
    }

    ngOnInit() {
        this.loadCatalogs();
        if (this.employeeId) {
            this.loadContractData();
            this.loadExistingDocuments();
        }

        // Auto-calculate dates when contract type or start date changes
        this.form.get('contractTypeId')?.valueChanges.subscribe(() => {
            this.handleEndDateState();
            this.calculateEndDate();
        });
        this.form.get('startDate')?.valueChanges.subscribe(() => this.calculateEndDate());
    }

    loadCatalogs() {
        this.catalogService.getContractTypes().subscribe(data => this.contractTypes.set(data));
        this.catalogService.getWorkSchedules().subscribe(data => this.workSchedules.set(data));
        this.catalogService.getHRDocumentTypes().subscribe(data => this.documentTypes.set(data));
    }

    loadContractData() {
        this.loading.set(true);
        this.employeeService.getContractData(this.employeeId).subscribe({
            next: (data) => {
                this.form.patchValue({
                    ...data,
                    startDate: data.startDate ? new Date(data.startDate) : null,
                    endDate: data.endDate ? new Date(data.endDate) : null,
                    probationEndDate: data.probationEndDate ? new Date(data.probationEndDate) : null
                });
            },
            complete: () => this.loading.set(false)
        });
    }

    loadExistingDocuments() {
        this.employeeService.getEmployeeDocuments(this.employeeId).subscribe(docs => {
            this.existingDocuments.set(docs);
            // Check if any existing doc is unified
            const unified = docs.find(d => d.isUnified);
            if (unified) {
                this.isUnified.set(true);
            } else if (docs.length > 0) {
                this.isUnified.set(false);
            }
        });
    }

    handleEndDateState() {
        const typeId = this.form.get('contractTypeId')?.value;
        const type = this.contractTypes().find(t => t.id === typeId);
        const endDateControl = this.form.get('endDate');

        if (type && !type.hasEndDate) {
            endDateControl?.disable();
            endDateControl?.setValue(null);
        } else {
            endDateControl?.enable();
        }
    }

    calculateEndDate() {
        const typeId = this.form.get('contractTypeId')?.value;
        const startDate = this.form.get('startDate')?.value;

        if (!typeId || !startDate) return;

        const type = this.contractTypes().find(t => t.id === typeId);
        if (!type || !type.hasEndDate || !type.defaultDuration) return;

        const end = new Date(startDate);
        if (type.durationUnit === 'MONTHS') {
            end.setMonth(end.getMonth() + type.defaultDuration);
        } else if (type.durationUnit === 'YEARS') {
            end.setFullYear(end.getFullYear() + type.defaultDuration);
        } else if (type.durationUnit === 'DAYS') {
            end.setDate(end.getDate() + type.defaultDuration);
        }

        this.form.get('endDate')?.setValue(end);

        // Probation end date logic
        const probation = new Date(startDate);
        probation.setMonth(probation.getMonth() + 2);
        if (probation > end) {
            this.form.get('probationEndDate')?.setValue(end);
        } else {
            this.form.get('probationEndDate')?.setValue(probation);
        }
    }

    onUnifiedFileSelected(event: any) {
        const file = event.files ? event.files[0] : null;
        if (file) {
            this.unifiedFile.set(file);
            this.messageService.add({ severity: 'success', summary: 'Archivo Cargado', detail: file.name });
        }
    }

    onIndividualFileSelected(event: any, documentTypeId: string) {
        const file = event.files ? event.files[0] : null;
        if (file) {
            this.individualFiles.set(documentTypeId, file);
            this.messageService.add({ severity: 'success', summary: 'Archivo Cargado', detail: file.name });
        }
    }

    onExpirationChange(documentTypeId: string, date: Date | null) {
        if (date) {
            // Keep the date as local ISO string (YYYY-MM-DD) to avoid timezone shifts
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const iso = `${year}-${month}-${day}`;
            this.documentExpiries.set(documentTypeId, iso);
        } else {
            this.documentExpiries.delete(documentTypeId);
        }
    }

    getExpiry(typeId: string): Date | null {
        // Local change takes precedence
        if (this.documentExpiries.has(typeId)) {
            const dateStr = this.documentExpiries.get(typeId);
            return dateStr ? new Date(dateStr + 'T00:00:00') : null;
        }

        // Fallback to existing
        const existing = this.getExistingDoc(typeId)?.expirationDate;
        return existing ? new Date(existing + 'T00:00:00') : null;
    }

    isExpired(dateStr?: string): boolean {
        if (!dateStr) return false;
        // Compare dates only (ignoring time)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expiry = new Date(dateStr + 'T00:00:00');
        return expiry < today;
    }

    toggleUnified() {
        this.isUnified.set(!this.isUnified());
        if (this.isUnified()) {
            this.individualFiles.clear();
            this.documentExpiries.clear();
        } else {
            this.unifiedFile.set(null);
        }
    }

    onSubmit() {
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (this.form.invalid || !this.isDocumentsValid()) {
            this.form.markAllAsTouched();
            this.errorMessage.set('Por favor completa todos los campos obligatorios resaltados en rojo.');
            return;
        }

        this.loading.set(true);
        this.errorMessage.set(null);

        const val = this.form.value;
        const dto: EmployeeContractStepDto = {
            ...val,
            startDate: val.startDate ? val.startDate.toISOString().split('T')[0] : null,
            endDate: val.endDate ? val.endDate.toISOString().split('T')[0] : null,
            probationEndDate: val.probationEndDate ? val.probationEndDate.toISOString().split('T')[0] : null
        };

        this.employeeService.updateStep2(this.employeeId, dto, this.individualFiles, this.documentExpiries, this.unifiedFile() || undefined).subscribe({
            next: () => {
                this.successMessage.set('Información de contrato guardada correctamente.');
                setTimeout(() => this.next.emit(), 1500);
            },
            error: (err) => {
                this.errorMessage.set(err.error?.message || 'Error al guardar. Inténtalo de nuevo.');
                this.loading.set(false);
            }
        });
    }

    getExistingDoc(typeId: string): EmployeeDocumentDto | undefined {
        return this.existingDocuments().find(d => d.documentTypeId === typeId);
    }

    isDocumentsValid(): boolean {
        if (this.isUnified()) {
            return !!(this.unifiedFile() || this.getUnifiedDoc());
        }

        const missing = this.documentTypes()
            .filter(dt => dt.isRequired)
            .some(dt => !this.individualFiles.has(dt.id) && !this.getExistingDoc(dt.id));

        return !missing;
    }

    isDocTypeInvalid(docTypeId: string): boolean {
        const docType = this.documentTypes().find(dt => dt.id === docTypeId);
        if (!docType || !docType.isRequired || this.isUnified()) return false;

        // Only show red if user tried to submit
        if (!this.errorMessage()) return false;

        return !this.individualFiles.has(docTypeId) && !this.getExistingDoc(docTypeId);
    }

    isUnifiedInvalid(): boolean {
        if (!this.isUnified() || !this.errorMessage()) return false;
        return !this.unifiedFile() && !this.getUnifiedDoc();
    }

    getUnifiedDoc(): EmployeeDocumentDto | undefined {
        return this.existingDocuments().find(d => d.isUnified);
    }

    viewFile(input: string | File | null | undefined) {
        if (!input) return;
        if (typeof input === 'string') {
            let url = input;
            if (url.startsWith('private-assets/')) {
                url = `${environment.apiUrl}/${url}`;
            }
            window.open(url, '_blank');
        } else {
            const url = URL.createObjectURL(input);
            window.open(url, '_blank');
            // Clean up the URL after a delay
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }
    }
}
