---
description: [Workflow for the Employee Personal Information step (Step 1) including fields, validations, and catalogs]
---

# Employee Step 1: Personal Information Workflow

This workflow details the implementation, fields, and validations for the first step of the Employee Creation Wizard.

## Frontend: Step 1 Component
- **Component**: `frontend-app/src/app/rrhh/employees/wizard/steps/step1-personal.component.ts`
- **Template**: `frontend-app/src/app/rrhh/employees/wizard/steps/step1-personal.component.html`

### 1. Information Loaded (Catalogs)
On initialization, the following catalogs are fetched from the backend:
- **Identification Types**: `IdentificationTypeService.getAll()`
- **Geography**: `GeographyService.getCountries()` (triggers cascades for States and Cities).
- **Genders**: `GenderService.getAll()`
- **Relationships**: `CatalogService.getRelationships()` (Filtered by `isFamily` for Family Nucleus).
- **Occupations**: `CatalogService.getOccupations()`
- **Dynamic Catalogs** (New):
    - **Marital Status**: `CatalogService.getMaritalStatuses()`
    - **Blood Types**: `CatalogService.getBloodTypes()`
    - **RH Factors**: `CatalogService.getRhFactors()`
    - **Experience Ranges**: `CatalogService.getExperienceRanges()`
    - **Education Levels**: `CatalogService.getEducationLevels()`

### 2. Fields and Validations

| Group | Field | Type | Validation |
| :--- | :--- | :--- | :--- |
| **Basic Info** | `firstName` | Text | `Validators.required` |
| | `secondName` | Text | Optional |
| | `firstLastName` | Text | `Validators.required` (Backend fallback to lastName) |
| | `secondLastName` | Text | Optional |
| | `identificationTypeId` | Select | `Validators.required` |
| | `identificationNumber`| Text | `Validators.required` |
| | `identificationIssueDate` | Date | Optional |
| | `identificationIssueCountry/State/Place` | Select | Optional (Cascades) |
| | `birthDate` | Date | Optional |
| | `birthCountry/State/Place` | Select | Optional (Cascades) |
| | `genderId` | Select | Optional |
| | `maritalStatusId` | Select | Optional |
| | `nationalityId` | Select | Optional |
| **Contact** | `emailPersonal` | Text | `Validators.email` |
| | `emailCorporate` | Text | `Validators.email` |
| | `phoneMobile` | Text | `Validators.required` |
| | `phoneHome/Alternate` | Text | Optional |
| | `address` | Text | `Validators.required` (AddressBuilder) |
| | `residenceNeighborhood` | Text | Optional |
| **Residence** | `residenceCountry/State/City` | Select | Optional (Cascades) |
| **Emergency** | `emergencyContacts` | Array | Items: Name, Relationship, Phone. |
| **Family** | `familyNucleus` | Array | Items: Name, Relationship, BirthDate, Occupation, Dependent. |
| **Work Experience** | `workExperiences` | Array | Company, Position, Supervisor, Dates, **PDF Upload**. |
| **Education** | `educations` | Array | **Inline Cards**: Level, Institution, Title, Year, **Location (Cascade)**, Phone, Hours, PDF. |
| **Sizes** | `shirtSizeId`, `pantsSizeId`, `shoeSizeId` | Select | Optional |
| **Legal/Health** | `bloodTypeId`, `rhFactorId` | Select | Optional |
| | `educationLevelId` | Select | Optional (Max Level) |
| | `isPep` | Boolean | Default False |
| | `socioeconomicStratum` | Text | Optional |
| | `militaryStatus` | Text | Optional |
| | `experienceRangeId` | Select | Optional |
| | `positionApplied` | Text | Optional |

### 3. Special Logic
- **Header Design**: 
    - **Split Name**: Displays "First Name" (White) + "First Last Name" (Primary Color).
    - **Badges**: 
        - **Status**: Active (Green/Pulsing) / Inactive (Red).
        - **Contact**: Document, Mobile, Email icons with quick values.
    - **Search**: Full-width `p-autoComplete` to filter visible sections dynamically.
- **Inline Lists**:
    - **Work Experience & Education**: Managed via inline cards with "Add" button and "Remove" (X) actions. No modals.
    - **Education Cascades**: Each education card handles its own Country -> State -> City cascade independently.
- **Photo Upload**: Handled via `FileUploadModule`.
    - **MinIO**: Uploads to `companies/{cid}/employees/{eid}/photo/profile`.
    - **Optimization**: Backend resizes to 200x200px.
- **Address Builder**: Uses `AddressBuilderComponent` for standardized formatting.
- **PDF Uploads**:
    - **Work Experience**: `companies/{cid}/employees/{eid}/work_experience/certification_{timestamp}.pdf`
    - **Education**: `companies/{cid}/employees/{eid}/education/education_{timestamp}.pdf`

## Backend: Step 1 API
- **DTO**: `EmployeePersonalStepDto.java` containing all new fields and nested lists (`educations`, `workExperiences`).
- **Service**: `EmployeeService.java`
    - `createStep1`: First pass creates entity, second pass updates IDs/Photos/Collections.
    - `updateStep1`: Updates entity and replaces collections (`clear()` -> `addAll()`).
    - `updateEducations`: Handles logic for academic records and file uploads.

### Validations (Service Level)
- **Unique Identification**: Checks `existsByCompanyIdAndIdentificationNumber`.
- **Unique Corporate Email**: Checks `existsByCompanyIdAndEmailCorporate`.
