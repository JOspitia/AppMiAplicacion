---
description: [implementation and maintenance of the Employee Management System]
---

# Employee Management System Workflow

This workflow describes the process for implementing and maintaining the Employee Management System, particularly the Employee Creation Wizard.

## Overview
The Employee Management System handles the creation, updating, and management of employee records. It follows a **Human-Centric Design** philosophy (referring to users as "Colaboradores") and uses a premium interface with wizard steps.

## Module Structure

The wizard is divided into three main steps:

1.  **Personal Information** (`docs/rrhh/employee-wizard/step1-personal.md`):
    - **Header**: Premium design with split-color name, status badges, and contact info shortcuts.
    - **Search**: Full-width autocomplete to filter form sections.
    - **Sections**:
        - Basic Data & Identity (Split Name, ID).
        - Demographics & Birth.
        - Contact & Location (Address Builder).
        - Emergency Contacts.
        - Family Nucleus.
        - Work Experience (PDF Upload).
        - **Academic Information** (New: Degrees, Certifications, PDF Upload).
        - Complementary Info & Health (Sizes, Legal, PEP).
    - **MinIO**: Photo upload with auto-resize.
2.  **Contract Information** (`docs/rrhh/employee-wizard/step2-contract.md`):
    - Contract Type.
    - Start/End Dates.
    - Salary & Benefits.
3.  **Job History & Position** (`docs/rrhh/employee-wizard/step3-job-history.md`):
    - Position & Department.
    - Cost Center.
    - Location/Operational Center.

## Implementation Steps

### 1. Database Schema
- **Review Migrations**: Always check `backend_api/src/main/resources/db/migration/modules/rrhh/` for the latest schema changes.
- **Key Tables**: `employees`, `employee_emergency_contacts`, `employee_family_nucleus`, `employee_work_experiences`, `employee_educations`, `employee_contracts`, `employee_positions`.
- **Master Catalogs**:
    - **Core**: `public.relationships`, `public.occupations`, `public.identification_types`.
    - **Demographics**: `public.marital_statuses`, `public.blood_types`, `public.rh_factors`, `public.experience_ranges`.
    - **RRHH Specific**: `business_rrhh.clothing_sizes`, `business_rrhh.education_levels`.
- **Naming Convention**: Use snake_case for DB columns. Special attention to name splitting (e.g., `first_name`, `first_last_name`).

### 2. Backend (Java/Spring Boot)
- **Service**: `EmployeeService.java` handles core logic.
- **DTOs**: `EmployeePersonalStepDto.java` handles Step 1 data transfer.
- **Controller**: `EmployeeController.java` exposes REST endpoints.
- **MinIO**: Use `MinioService.java` for file uploads (photos, documents). ensuring proper folder structure: `companies/{companyId}/employees/{employeeId}/{category}/{fileName}`.

### 3. Frontend (Angular)
- **Wizard**: Located in `frontend-app/src/app/rrhh/employees/wizard/`.
- **Components**: `step1-personal.component.ts` (now includes Academic, Search, Split Name), `step2-contract.component.ts`, etc.
- **Visuals**:
    - **Header**: "Colaborador" terminology, status badges.
    - **Search**: `p-autoComplete` for rapid section navigation.
    - **Cards**: Elegant card design for list items (Education, Work Exp).
- **Validation**: Strict validation on required fields.
- **UX**: Use PrimeNG components (`p-select`, `p-inputNumber`, `p-fileUpload`), proper loading states, and clear error messages.

## Common Tasks

### Adding a New Field
1.  **Database**: Create a Flyway migration (`V__add_field.sql`).
2.  **Entity**: Update the corresponding Java Entity (`Employee.java`, etc.).
3.  **DTO**: Update the DTO (`EmployeeDto.java` or specific step DTO).
4.  **Mapper**: Update the mapping logic in `EmployeeService.java`.
5.  **Frontend**: Add the field to the Angular form and template.

### Updating Validation Logic
1.  **Backend**: Add validation annotations (`@NotNull`, `@Size`) or custom logic in Service.
2.  **Frontend**: Update Angular Validators in the component class (`Validators.required`, etc.).

### Troubleshooting
- **Audit Errors**: Check for missing `created_by`/`updated_by` columns. Run migration `V113` or similar if needed.
- **Column Mismatches**: Check if entity field names match DB column names. Use `@Column(name="...")` if they differ. (See `V114`/`V115` for history).
- **MinIO Issues**: Verify bucket permissions and folder paths.
