import { Component, OnInit, signal, inject, Input, Output, EventEmitter, effect, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';

import { EmployeeService, EmployeePersonalStepDto } from '../../../../core/services/employee.service';
import { GeographyService, Country, State, City } from '../../../../core/services/geography.service';
import { IdentificationTypeService, IdentificationType } from '../../../../core/services/identification-type.service';
import { GenderService, Gender } from '../../../../core/services/gender.service';
import { IconComponent } from '../../../../shared/components/icon.component';
import { AddressBuilderComponent } from '../../../../shared/components/address-builder/address-builder.component';
import { AlertComponent } from '../../../../shared/components/alert/alert.component';
import { CatalogService, Relationship, Occupation, EducationLevel, MaritalStatus, BloodType, RhFactor, ExperienceRange } from '../../../../core/services/catalog.service';

@Component({
    selector: 'app-employee-personal-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, FormsModule, InputTextModule, SelectModule, DatePickerModule,
        InputMaskModule, ButtonModule, FileUploadModule, TableModule, DialogModule,
        ToastModule, DividerModule, ToggleSwitchModule, InputNumberModule, IconComponent,
        AddressBuilderComponent, AlertComponent, AutoCompleteModule
    ],
    templateUrl: './step1-personal.component.html'
})
export class EmployeePersonalFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private employeeService = inject(EmployeeService);
    private geoService = inject(GeographyService);
    private idTypeService = inject(IdentificationTypeService);
    private genderService = inject(GenderService);
    private messageService = inject(MessageService);
    private catalogService = inject(CatalogService);

    @Input() employeeId: string | null = null;
    @Output() next = new EventEmitter<string>(); // returns Id
    @Output() cancel = new EventEmitter<void>();

    form!: FormGroup;
    loading = signal(false);
    photoPreview = signal<string | null>(null);
    showAddressBuilder = signal(false);

    get firstNamePart(): string {
        const val = this.form?.value;
        if (!val || (!val.firstName && !val.firstLastName)) return 'Nuevo';
        return val.firstName || '';
    }

    get lastNamePart(): string {
        const val = this.form?.value;
        if (!val || (!val.firstName && !val.firstLastName)) return 'Colaborador';
        return val.firstLastName || '';
    }

    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);
    sectionFilter = signal('');

    allSections = [
        'Datos Básicos e Identidad',
        'Información Demográfica y Nacimiento',
        'Contacto y Localización',
        'Contactos de Emergencia',
        'Núcleo Familiar',
        'Experiencia Laboral',
        'Formación Académica',
        'Referencias',
        'Información Complementaria y Salud'
    ];

    filteredSections = signal<string[]>([]);

    searchSection(event: any) {
        const query = event.query.toLowerCase();
        this.filteredSections.set(
            this.allSections.filter(s => s.toLowerCase().includes(query))
        );
    }

    // Catalogs
    identificationTypes = signal<IdentificationType[]>([]);
    countries = signal<Country[]>([]);
    genders = signal<Gender[]>([]);
    relationships = signal<Relationship[]>([]);
    familyRelationships = signal<Relationship[]>([]);
    occupations = signal<Occupation[]>([]);
    educationLevels = signal<EducationLevel[]>([]);
    referenceTypes = signal<{ label: string, value: string }[]>([
        { label: 'Laboral', value: 'LABORAL' },
        { label: 'Personal', value: 'PERSONAL' },
        { label: 'Familiar', value: 'FAMILIAR' }
    ]);

    // Dependent Catalogs
    idIssueStates = signal<State[]>([]);
    idIssueCities = signal<City[]>([]);

    birthStates = signal<State[]>([]);
    birthCities = signal<City[]>([]);

    residenceStates = signal<State[]>([]);
    residenceCities = signal<City[]>([]);

    // Education Geography
    eduStates = signal<State[]>([]);
    eduCities = signal<City[]>([]);

    maritalStatuses = signal<MaritalStatus[]>([]);
    bloodGroups = signal<BloodType[]>([]);
    rhFactors = signal<RhFactor[]>([]);
    experienceOptions = signal<ExperienceRange[]>([]);



    // Removed hardcoded genders




    constructor() {
        this.form = this.fb.group({
            // Basic
            firstName: ['', Validators.required],
            secondName: [''],
            firstLastName: ['', Validators.required],
            secondLastName: [''],

            identificationTypeId: [null, Validators.required],
            identificationNumber: ['', Validators.required],
            identificationIssueDate: [null],
            identificationIssueCountryId: [null],
            identificationIssueStateId: [null],
            identificationIssuePlaceId: [null],

            birthDate: [null],
            birthCountryId: [null],
            birthStateId: [null],
            birthPlaceId: [null],
            genderId: [null],
            maritalStatusId: [null],
            nationalityId: [null],
            bloodTypeId: [null],
            rhFactorId: [null],
            photoUrl: [''],

            // Education (for the main form array)
            educations: this.fb.array([]),

            // Contact
            emailPersonal: ['', [Validators.email]],
            emailCorporate: ['', [Validators.email]],
            phoneMobile: ['', Validators.required],
            phoneHome: [''],
            phoneAlternate: [''],
            address: ['', Validators.required],
            residenceNeighborhood: [''],

            // Residence
            residenceCountryId: [null],
            residenceStateId: [null],
            residenceCityId: [null],

            // Emergency
            emergencyContactName: [''],
            emergencyContactPhone: [''],
            emergencyContacts: this.fb.array([]),

            // Family
            familyNucleus: this.fb.array([]),

            // Work Experience
            workExperiences: this.fb.array([]),

            // References
            references: this.fb.array([]),

            // Bank
            bankName: [''],
            bankAccountType: [''],
            bankAccountNumber: [''],

            // Additional
            militaryStatus: [''],
            socioeconomicStratum: [''],
            educationLevelId: [null],
            experienceRangeId: [null],
            positionApplied: [''],
            isPep: [false],
            active: [true]
        });

        // Listeners for cascades
        // Listeners for cascades
        this.setupCascades();
    }

    get educationsArray() { return this.form.get('educations') as FormArray; }
    get referencesArray() { return this.form.get('references') as FormArray; }

    // Row-specific options for cascades. simple map index -> {states, cities}
    educationRowOptions = signal<{ states: State[], cities: City[] }[]>([]);

    addEducation(data: any = {}) {
        const eduGroup = this.fb.group({
            id: [data.id || null],
            educationLevelId: [data.educationLevelId || null, Validators.required],
            institution: [data.institution || '', Validators.required],
            currentSemester: [data.currentSemester || null],
            phone: [data.phone || ''],
            countryId: [data.countryId || null],
            stateId: [data.stateId || null],
            cityId: [data.cityId || null],
            startYear: [data.startYear || null],
            endYear: [data.endYear || null],
            titleObtained: [data.titleObtained || '', Validators.required],
            hours: [data.hours || null],
            isFinished: [data.isFinished !== undefined ? data.isFinished : true],
            attachmentUrl: [data.attachmentUrl || '']
        });

        // Current index where we are pushing
        const currentIndex = this.educationRowOptions().length;
        this.educationRowOptions.update(opts => [...opts, { states: [], cities: [] }]);
        this.educationsArray.push(eduGroup);

        // Setup listeners
        this.setupEducationRowCascade(eduGroup, currentIndex);

        // Pre-load data if editing
        if (data.countryId) {
            this.geoService.getStates(data.countryId).subscribe(s => {
                this.educationRowOptions.update(opts => {
                    const newOpts = [...opts];
                    if (newOpts[currentIndex]) newOpts[currentIndex].states = s;
                    return newOpts;
                });

                if (data.stateId) {
                    this.geoService.getCities(data.stateId).subscribe(c => {
                        this.educationRowOptions.update(opts => {
                            const newOpts = [...opts];
                            if (newOpts[currentIndex]) newOpts[currentIndex].cities = c;
                            return newOpts;
                        });
                    });
                }
            });
        }
    }

    setupEducationRowCascade(group: FormGroup, index: number) {
        group.get('countryId')?.valueChanges.subscribe(cid => {
            this.educationRowOptions.update(opts => {
                const newOpts = [...opts];
                if (newOpts[index]) {
                    newOpts[index].states = [];
                    newOpts[index].cities = [];
                }
                return newOpts;
            });
            group.get('stateId')?.setValue(null);
            group.get('cityId')?.setValue(null);

            if (cid) {
                this.geoService.getStates(cid).subscribe(s => {
                    this.educationRowOptions.update(opts => {
                        const newOpts = [...opts];
                        if (newOpts[index]) newOpts[index].states = s;
                        return newOpts;
                    });
                });
            }
        });

        group.get('stateId')?.valueChanges.subscribe(sid => {
            this.educationRowOptions.update(opts => {
                const newOpts = [...opts];
                if (newOpts[index]) newOpts[index].cities = [];
                return newOpts;
            });
            group.get('cityId')?.setValue(null);

            if (sid) {
                this.geoService.getCities(sid).subscribe(c => {
                    this.educationRowOptions.update(opts => {
                        const newOpts = [...opts];
                        if (newOpts[index]) newOpts[index].cities = c;
                        return newOpts;
                    });
                });
            }
        });
    }

    removeEducation(index: number) {
        this.educationsArray.removeAt(index);
        this.educationRowOptions.update(opts => opts.filter((_, i) => i !== index));
    }

    toggleEducationFinished(index: number) {
        const control = this.educationsArray.at(index).get('isFinished');
        if (control) {
            control.setValue(!control.value);
            control.markAsDirty();
        }
    }

    toggleFamilyDependent(index: number) {
        const control = this.familyNucleusArray.at(index).get('isDependent');
        if (control) {
            control.setValue(!control.value);
            control.markAsDirty();
        }
    }

    toggleIsPep() {
        const control = this.form.get('isPep');
        if (control) {
            control.setValue(!control.value);
            control.markAsDirty();
        }
    }

    onEducationFileSelected(event: any, index: number) {
        const file = event.files ? event.files[0] : null;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.educationsArray.at(index).get('attachmentUrl')?.setValue(e.target.result);
                this.messageService.add({
                    severity: 'success',
                    summary: 'PDF Cargado',
                    detail: 'El archivo se procesará al guardar el formulario.',
                    life: 3000
                });
            };
            reader.readAsDataURL(file);
        }
    }

    // References Management
    addReference(data: any = {}) {
        const refGroup = this.fb.group({
            id: [data.id || null],
            referenceType: [data.referenceType || 'LABORAL', Validators.required],
            name: [data.name || '', Validators.required],
            occupation: [data.occupation || ''],
            company: [data.company || ''],
            phone: [data.phone || ''],
            mobile: [data.mobile || '', Validators.required],
            attachmentUrl: [data.attachmentUrl || '']
        });

        this.referencesArray.push(refGroup);
    }

    removeReference(index: number) {
        this.referencesArray.removeAt(index);
    }

    onReferenceFileSelected(event: any, index: number) {
        const file = event.files ? event.files[0] : null;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.referencesArray.at(index).get('attachmentUrl')?.setValue(e.target.result);
                this.messageService.add({
                    severity: 'success',
                    summary: 'PDF Cargado',
                    detail: 'El archivo se procesará al guardar el formulario.',
                    life: 3000
                });
            };
            reader.readAsDataURL(file);
        }
    }

    toggleWorkExpCurrent(index: number) {
        const control = this.workExperiencesArray.at(index).get('isCurrent');
        if (control) {
            control.setValue(!control.value);
            control.markAsDirty();
        }
    }

    // Methods removed: openEditEducation, deleteEducation, saveEducation, onEducationFileSelected

    ngOnInit() {
        this.loadCatalogs();
        if (this.employeeId) {
            this.loadEmployeeData();
        }
    }

    get emergencyContactsArray() { return this.form.get('emergencyContacts') as FormArray; }
    get familyNucleusArray() { return this.form.get('familyNucleus') as FormArray; }
    get workExperiencesArray() { return this.form.get('workExperiences') as FormArray; }

    setupCascades() {
        // ID Issue Place
        this.form.get('identificationIssueCountryId')?.valueChanges.subscribe(countryId => {
            this.idIssueStates.set([]);
            this.idIssueCities.set([]);
            if (countryId) this.geoService.getStates(countryId).subscribe(data => this.idIssueStates.set(data));
        });

        this.form.get('identificationIssueStateId')?.valueChanges.subscribe(stateId => {
            this.idIssueCities.set([]);
            if (stateId) this.geoService.getCities(stateId).subscribe(data => this.idIssueCities.set(data));
        });

        // Birth
        this.form.get('birthCountryId')?.valueChanges.subscribe(countryId => {
            this.birthStates.set([]);
            this.birthCities.set([]);
            if (countryId) this.geoService.getStates(countryId).subscribe(data => this.birthStates.set(data));
        });

        this.form.get('birthStateId')?.valueChanges.subscribe(stateId => {
            this.birthCities.set([]);
            if (stateId) this.geoService.getCities(stateId).subscribe(data => this.birthCities.set(data));
        });

        // Residence
        this.form.get('residenceCountryId')?.valueChanges.subscribe(countryId => {
            this.residenceStates.set([]);
            this.residenceCities.set([]);
            if (countryId) this.geoService.getStates(countryId).subscribe(data => this.residenceStates.set(data));
        });

        this.form.get('residenceStateId')?.valueChanges.subscribe(stateId => {
            this.residenceCities.set([]);
            if (stateId) this.geoService.getCities(stateId).subscribe(data => this.residenceCities.set(data));
        });
    }

    loadCatalogs() {
        this.idTypeService.getAll().subscribe(data => this.identificationTypes.set(data));
        this.geoService.getCountries().subscribe(data => this.countries.set(data));
        this.genderService.getAll().subscribe(data => this.genders.set(data));

        this.catalogService.getRelationships().subscribe(data => {
            this.relationships.set(data);
            this.familyRelationships.set(data.filter(r => r.isFamily));
        });

        this.catalogService.getOccupations().subscribe(data => this.occupations.set(data));
        this.catalogService.getEducationLevels().subscribe(data => this.educationLevels.set(data));
        this.catalogService.getMaritalStatuses().subscribe(data => this.maritalStatuses.set(data));
        this.catalogService.getBloodTypes().subscribe(data => this.bloodGroups.set(data));
        this.catalogService.getRhFactors().subscribe(data => this.rhFactors.set(data));
        this.catalogService.getExperienceRanges().subscribe(data => this.experienceOptions.set(data));
    }

    loadEmployeeData() {
        this.loading.set(true);
        this.employeeService.getPersonalData(this.employeeId!).subscribe({
            next: (data) => {
                const patch = {
                    ...data,
                    identificationIssueDate: data.identificationIssueDate ? new Date(data.identificationIssueDate) : null,
                    birthDate: data.birthDate ? new Date(data.birthDate) : null,
                };
                this.form.patchValue(patch);
                this.photoPreview.set(data.photoUrl || null);

                if (data.identificationIssueCountryId) {
                    this.geoService.getStates(data.identificationIssueCountryId).subscribe(s => {
                        this.idIssueStates.set(s);
                        if (data.identificationIssueStateId) {
                            this.geoService.getCities(data.identificationIssueStateId).subscribe(c => this.idIssueCities.set(c));
                        }
                    });
                }

                if (data.residenceCountryId) {
                    this.geoService.getStates(data.residenceCountryId).subscribe(s => {
                        this.residenceStates.set(s);
                        if (data.residenceStateId) {
                            this.geoService.getCities(data.residenceStateId).subscribe(c => this.residenceCities.set(c));
                        }
                    });
                }

                if (data.birthCountryId) {
                    this.geoService.getStates(data.birthCountryId).subscribe(s => {
                        this.birthStates.set(s);
                        if (data.birthStateId) {
                            this.geoService.getCities(data.birthStateId).subscribe(c => this.birthCities.set(c));
                        }
                    });
                }

                data.emergencyContacts?.forEach((c: any) => this.addEmergencyContact(c));
                data.familyNucleus?.forEach((f: any) => this.addFamilyMember(f));
                data.workExperiences?.forEach((w: any) => this.addWorkExperience(w));
                data.educations?.forEach((e: any) => this.addEducation(e));
                data.references?.forEach((r: any) => this.addReference(r));
            },
            complete: () => this.loading.set(false)
        });
    }

    addEmergencyContact(data: any = {}) {
        this.emergencyContactsArray.push(this.fb.group({
            id: [data.id || null],
            firstName: [data.firstName || '', Validators.required],
            secondName: [data.secondName || ''],
            firstLastName: [data.firstLastName || '', Validators.required],
            secondLastName: [data.secondLastName || ''],
            relationshipId: [data.relationshipId || null, Validators.required],
            phone: [data.phone || '', Validators.required]
        }));
    }

    removeEmergencyContact(index: number) {
        this.emergencyContactsArray.removeAt(index);
    }

    addFamilyMember(data: any = {}) {
        this.familyNucleusArray.push(this.fb.group({
            id: [data.id || null],
            firstName: [data.firstName || '', Validators.required],
            secondName: [data.secondName || ''],
            firstLastName: [data.firstLastName || '', Validators.required],
            secondLastName: [data.secondLastName || ''],
            relationshipId: [data.relationshipId || null, Validators.required],
            birthDate: [data.birthDate ? new Date(data.birthDate) : null],
            occupationId: [data.occupationId || null],
            isDependent: [data.isDependent || false]
        }));
    }

    removeFamilyMember(index: number) {
        this.familyNucleusArray.removeAt(index);
    }

    addWorkExperience(data: any = {}) {
        this.workExperiencesArray.push(this.fb.group({
            id: [data.id || null],
            companyName: [data.companyName || '', Validators.required],
            positionHeld: [data.positionHeld || '', Validators.required],
            immediateSupervisor: [data.immediateSupervisor || '', Validators.required],
            companyPhone: [data.companyPhone || ''],
            startDate: [data.startDate ? new Date(data.startDate) : null, Validators.required],
            endDate: [data.endDate ? new Date(data.endDate) : null],
            functions: [data.functions || ''],
            isCurrent: [data.isCurrent || false],
            attachmentUrl: [data.attachmentUrl || '']
        }));
    }

    removeWorkExperience(index: number) {
        this.workExperiencesArray.removeAt(index);
    }

    onPhotoSelected(event: any) {
        const file = event.files ? event.files[0] : event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.photoPreview.set(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    onWorkExpFileSelected(event: any, index: number) {
        const file = event.files ? event.files[0] : null;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.workExperiencesArray.at(index).get('attachmentUrl')?.setValue(e.target.result);
                this.messageService.add({
                    severity: 'success',
                    summary: 'PDF Cargado',
                    detail: 'El archivo se procesará al guardar el formulario.',
                    life: 3000
                });
            };
            reader.readAsDataURL(file);
        }
    }

    shouldShowSection(title: string): boolean {
        const query = this.sectionFilter().toLowerCase().trim();
        if (!query) return true;
        return title.toLowerCase().includes(query);
    }

    onSubmit() {
        this.successMessage.set(null);
        this.errorMessage.set(null);

        if (this.form.invalid) {
            this.errorMessage.set('Por favor completa todos los campos obligatorios resaltados en rojo.');
            this.form.markAllAsTouched();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        this.loading.set(true);
        const val = this.form.value;
        const payload: EmployeePersonalStepDto = {
            ...val,
            photoUrl: this.photoPreview(),
            emergencyContacts: this.emergencyContactsArray.value,
            familyNucleus: this.familyNucleusArray.value,
            workExperiences: this.workExperiencesArray.value,
            educations: this.educationsArray.value,
            references: this.referencesArray.value
        };

        const req = this.employeeId
            ? this.employeeService.updateStep1(this.employeeId, payload)
            : this.employeeService.createStep1(payload);

        req.subscribe({
            next: (res: any) => {
                this.successMessage.set('Información personal guardada correctamente.');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(() => this.next.emit(res.id), 1500);
            },
            error: (err: any) => {
                this.errorMessage.set(err.error?.message || 'Error al guardar los datos. Inténtalo de nuevo.');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                this.loading.set(false);
            }
        });
    }

    onAddressCompleted(addr: string) {
        this.form.get('address')?.setValue(addr);
        this.showAddressBuilder.set(false);
    }

    viewFile(url: string | null) {
        if (url) {
            window.open(url, '_blank');
        }
    }
}
