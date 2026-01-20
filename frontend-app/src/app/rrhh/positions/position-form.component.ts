import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { IconComponent } from '../../shared/components/icon.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { PositionService, Position, PositionFunction, PositionSkill, PositionRequirement, PositionExperience, SkillLevelService } from '../../core/services/position.service';
import { DepartmentService } from '../../core/services/department.service';
import { OrganizationalLevelService } from '../../core/services/organizational-level.service';
import { CostCenterService, CostCenter } from '../../core/services/cost-center.service';
import { take } from 'rxjs';

@Component({
    selector: 'app-position-form',
    standalone: true,
    imports: [
        CommonModule, ReactiveFormsModule, RouterModule,
        InputTextModule, ButtonModule, RippleModule, ToggleSwitchModule,
        TextareaModule, SelectModule, InputNumberModule, DialogModule,
        AutoCompleteModule,
        IconComponent, AlertComponent
    ],
    templateUrl: './position-form.component.html'
})
export class PositionFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private service = inject(PositionService);
    private departmentService = inject(DepartmentService);
    private orgLevelService = inject(OrganizationalLevelService);
    private skillLevelService = inject(SkillLevelService);
    private costCenterService = inject(CostCenterService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    form: FormGroup;
    isEditMode = signal<boolean>(false);
    loading = signal<boolean>(false);
    errorMessage = signal<string | null>(null);

    // Options
    departmentOptions = signal<any[]>([]);
    orgLevelOptions = signal<any[]>([]);
    skillLevelOptions = signal<any[]>([]);
    costCenters = signal<CostCenter[]>([]);

    // Modal states
    showFunctionModal = signal<boolean>(false);
    showSkillModal = signal<boolean>(false);
    showRequirementModal = signal<boolean>(false);
    showExperienceModal = signal<boolean>(false);

    // Autocomplete suggestions
    filteredSkills = signal<string[]>([]);
    filteredAreas = signal<string[]>([]);

    commonSkills = [
        'Liderazgo', 'Comunicación Asertiva', 'Trabajo en Equipo', 'Resolución de Problemas',
        'Excel Avanzado', 'Inglés B2', 'Inglés C1', 'Gestión de Proyectos', 'Metodologías Ágiles',
        'Análisis de Datos', 'Atención al Cliente', 'Negociación', 'Pensamiento Estratégico'
    ];

    commonAreas = [
        'Recursos Humanos', 'Tecnología de la Información', 'Administración', 'Ventas',
        'Marketing', 'Finanzas', 'Contabilidad', 'Operaciones', 'Logística',
        'Servicio al Cliente', 'Legal', 'Producción', 'Calidad'
    ];

    // Temp form data for modals
    functionForm: FormGroup;
    skillForm: FormGroup;
    requirementForm: FormGroup;
    experienceForm: FormGroup;

    // Risk levels
    riskLevels = [
        { value: 'I', label: 'I - Riesgo Mínimo' },
        { value: 'II', label: 'II - Riesgo Bajo' },
        { value: 'III', label: 'III - Riesgo Medio' },
        { value: 'IV', label: 'IV - Riesgo Alto' },
        { value: 'V', label: 'V - Riesgo Máximo' }
    ];

    // Requirement types
    requirementTypes = [
        { value: 'EDUCATION', label: 'Educación' },
        { value: 'CERTIFICATION', label: 'Certificación' },
        { value: 'LICENSE', label: 'Licencia' },
        { value: 'OTHER', label: 'Otro' }
    ];

    // Localization & State
    selectedCurrencyCode = signal<string>('COP');

    constructor() {
        this.form = this.fb.group({
            code: ['', [Validators.required, Validators.maxLength(50)]],
            name: ['', [Validators.required, Validators.maxLength(150)]],
            description: [''],
            minSalary: [null],
            maxSalary: [null],
            riskLevel: [null],
            departmentId: [null, Validators.required],
            organizationalLevelId: [null, Validators.required],
            functions: this.fb.array([]),
            skills: this.fb.array([]),
            requirements: this.fb.array([]),
            experiences: this.fb.array([]),
            active: [true]
        });

        // Listen for department changes to inherit currency
        this.form.get('departmentId')?.valueChanges.subscribe(deptId => this.handleDepartmentChange(deptId));

        // Modal forms
        this.functionForm = this.fb.group({
            description: ['', Validators.required]
        });

        this.skillForm = this.fb.group({
            skillName: ['', Validators.required],
            skillLevelId: [null],
            isMandatory: [true],
            description: ['']
        });

        this.requirementForm = this.fb.group({
            requirementType: ['', Validators.required],
            description: ['', Validators.required],
            isMandatory: [true]
        });

        this.experienceForm = this.fb.group({
            area: ['', Validators.required],
            minYears: [0, [Validators.min(0)]],
            maxYears: [null],
            isMandatory: [true],
            description: ['']
        });
    }

    private handleDepartmentChange(deptId: string | null) {
        if (!deptId) {
            this.selectedCurrencyCode.set('COP');
            return;
        }

        const dept = this.departmentOptions().find(d => d.id === deptId);
        if (dept && dept.costCenterId) {
            const cc = this.costCenters().find(c => c.id === dept.costCenterId);
            if (cc && cc.currencyCode) {
                this.selectedCurrencyCode.set(cc.currencyCode);
            }
        }
    }

    ngOnInit() {
        this.loadOptions();

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditMode.set(true);
            this.loadData(id);
        }
    }

    loadOptions() {
        this.departmentService.getActive().subscribe(data => {
            this.departmentOptions.set(data);
            this.updateCurrencyFromCurrentDept();
        });
        this.orgLevelService.getActive().subscribe(data => this.orgLevelOptions.set(data));
        this.skillLevelService.getActive().subscribe(data => this.skillLevelOptions.set(data));
        this.costCenterService.getActive().subscribe(data => {
            this.costCenters.set(data);
            this.updateCurrencyFromCurrentDept();
        });
    }

    private updateCurrencyFromCurrentDept() {
        const deptId = this.form.get('departmentId')?.value;
        if (deptId) {
            this.handleDepartmentChange(deptId);
        }
    }

    loadData(id: string) {
        this.loading.set(true);
        this.service.getById(id).subscribe({
            next: (data) => {
                this.form.patchValue(data);

                // Load collections
                if (data.functions) {
                    data.functions.forEach(f => this.addFunctionFromData(f));
                }
                if (data.skills) {
                    data.skills.forEach(s => this.addSkillFromData(s));
                }
                if (data.requirements) {
                    data.requirements.forEach(r => this.addRequirementFromData(r));
                }
                if (data.experiences) {
                    data.experiences.forEach(e => this.addExperienceFromData(e));
                }

                this.loading.set(false);
            },
            error: () => {
                this.errorMessage.set('Error al cargar datos del cargo.');
                this.loading.set(false);
            }
        });
    }

    // Functions management
    get functions(): FormArray {
        return this.form.get('functions') as FormArray;
    }

    openFunctionModal() {
        this.functionForm.reset();
        this.showFunctionModal.set(true);
    }

    saveFunction() {
        if (this.functionForm.invalid) return;

        const functionGroup = this.fb.group({
            description: [this.functionForm.value.description],
            displayOrder: [this.functions.length + 1]
        });

        this.functions.push(functionGroup);
        this.showFunctionModal.set(false);
    }

    addFunctionFromData(func: PositionFunction) {
        const functionGroup = this.fb.group({
            id: [func.id],
            description: [func.description],
            displayOrder: [func.displayOrder]
        });
        this.functions.push(functionGroup);
    }

    removeFunction(index: number) {
        this.functions.removeAt(index);
    }

    // Skills management
    get skills(): FormArray {
        return this.form.get('skills') as FormArray;
    }

    openSkillModal() {
        this.skillForm.reset({ isMandatory: true });
        this.showSkillModal.set(true);
    }

    saveSkill() {
        if (this.skillForm.invalid) return;

        const skillGroup = this.fb.group({
            skillName: [this.skillForm.value.skillName],
            skillLevelId: [this.skillForm.value.skillLevelId],
            isMandatory: [this.skillForm.value.isMandatory],
            description: [this.skillForm.value.description],
            displayOrder: [this.skills.length + 1]
        });

        this.skills.push(skillGroup);
        this.showSkillModal.set(false);
    }

    addSkillFromData(skill: PositionSkill) {
        const skillGroup = this.fb.group({
            id: [skill.id],
            skillName: [skill.skillName],
            skillLevelId: [skill.skillLevelId],
            isMandatory: [skill.isMandatory],
            description: [skill.description],
            displayOrder: [skill.displayOrder]
        });
        this.skills.push(skillGroup);
    }

    removeSkill(index: number) {
        this.skills.removeAt(index);
    }

    getSkillLevelName(id: string | null): string {
        if (!id) return 'Sin nivel';
        const level = this.skillLevelOptions().find(l => l.id === id);
        return level ? level.name : 'Sin nivel';
    }

    // Requirements management
    get requirements(): FormArray {
        return this.form.get('requirements') as FormArray;
    }

    openRequirementModal() {
        this.requirementForm.reset({ isMandatory: true });
        this.showRequirementModal.set(true);
    }

    saveRequirement() {
        if (this.requirementForm.invalid) return;

        const reqGroup = this.fb.group({
            requirementType: [this.requirementForm.value.requirementType],
            description: [this.requirementForm.value.description],
            isMandatory: [this.requirementForm.value.isMandatory],
            displayOrder: [this.requirements.length + 1]
        });

        this.requirements.push(reqGroup);
        this.showRequirementModal.set(false);
    }

    addRequirementFromData(req: PositionRequirement) {
        const reqGroup = this.fb.group({
            id: [req.id],
            requirementType: [req.requirementType],
            description: [req.description],
            isMandatory: [req.isMandatory],
            displayOrder: [req.displayOrder]
        });
        this.requirements.push(reqGroup);
    }

    removeRequirement(index: number) {
        this.requirements.removeAt(index);
    }

    getRequirementTypeLabel(type: string): string {
        const reqType = this.requirementTypes.find(t => t.value === type);
        return reqType ? reqType.label : type;
    }

    // Experiences management
    get experiences(): FormArray {
        return this.form.get('experiences') as FormArray;
    }

    openExperienceModal() {
        this.experienceForm.reset({ minYears: 0, isMandatory: true });
        this.showExperienceModal.set(true);
    }

    saveExperience() {
        if (this.experienceForm.invalid) return;

        const expGroup = this.fb.group({
            area: [this.experienceForm.value.area],
            minYears: [this.experienceForm.value.minYears],
            maxYears: [this.experienceForm.value.maxYears],
            isMandatory: [this.experienceForm.value.isMandatory],
            description: [this.experienceForm.value.description],
            displayOrder: [this.experiences.length + 1]
        });

        this.experiences.push(expGroup);
        this.showExperienceModal.set(false);
    }

    addExperienceFromData(exp: PositionExperience) {
        const expGroup = this.fb.group({
            id: [exp.id],
            area: [exp.area],
            minYears: [exp.minYears],
            maxYears: [exp.maxYears],
            isMandatory: [exp.isMandatory],
            description: [exp.description],
            displayOrder: [exp.displayOrder]
        });
        this.experiences.push(expGroup);
    }

    removeExperience(index: number) {
        this.experiences.removeAt(index);
    }

    getExperienceYearsText(exp: any): string {
        const minYears = exp.get('minYears')?.value || 0;
        const maxYears = exp.get('maxYears')?.value;

        if (maxYears) {
            return `${minYears} - ${maxYears} años`;
        }
        return `${minYears}+ años`;
    }

    onSubmit() {
        if (this.form.invalid) {
            this.errorMessage.set('Por favor completa todos los campos requeridos.');
            return;
        }

        // Validate salaries
        const minSalary = this.form.value.minSalary;
        const maxSalary = this.form.value.maxSalary;
        if (minSalary && maxSalary && minSalary > maxSalary) {
            this.errorMessage.set('El salario mínimo no puede ser mayor que el salario máximo.');
            return;
        }

        this.loading.set(true);
        const data = { ...this.form.value };
        const id = this.route.snapshot.paramMap.get('id');

        const request$ = this.isEditMode() && id
            ? this.service.update(id, data)
            : this.service.create(data);

        request$.subscribe({
            next: () => {
                this.router.navigate(['/rrhh/positions']);
            },
            error: (err) => {
                const msg = err.error?.message || 'Error al guardar el cargo.';
                this.errorMessage.set(msg);
                this.loading.set(false);
            }
        });
    }
    searchSkill(event: any) {
        const query = event.query.toLowerCase();
        this.filteredSkills.set(
            this.commonSkills.filter(s => s.toLowerCase().includes(query))
        );
    }

    searchArea(event: any) {
        const query = event.query.toLowerCase();
        this.filteredAreas.set(
            this.commonAreas.filter(a => a.toLowerCase().includes(query))
        );
    }
}
