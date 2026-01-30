---
description: [Workflow for the Employee Contract step (Step 2) including fields, document management, and MinIO storage logic]
---

# Employee Step 2: Contract Information Workflow

This workflow details the implementation, fields, and document management for the second step of the Employee Creation Wizard.

## Frontend: Step 2 Component
- **Component**: `frontend-app/src/app/rrhh/employees/wizard/steps/step2-contract.component.ts`
- **Template**: `frontend-app/src/app/rrhh/employees/wizard/steps/step2-contract.component.html`

### 1. Information Loaded (Catalogs)
On initialization, the following catalogs are fetched from the backend:
- **Contract Types**: `CatalogService.getContractTypes()`
- **Work Schedules**: `CatalogService.getWorkSchedules()`
- **Document Types**: `CatalogService.getDocumentTypes()` (Used for mandatory individual uploads).
- **Existing Documents**: `EmployeeService.getEmployeeDocuments(employeeId)`

### 2. Fields and Validations

| Field | Type | Validation | Description |
| :--- | :--- | :--- | :--- |
| `contractTypeId` | Select | `Validators.required` | Type of employment contract. |
| `contractNumber` | Text | `Validators.required` | Unique internal contract reference. |
| `startDate` | Date | `Validators.required` | Official hiring date. |
| `endDate` | Date | Optional | Required only for fixed-term contracts. |
| `probationEndDate`| Date | Optional | End of the trial period. |
| `workScheduleId` | Select | `Validators.required` | Assigned weekly schedule template. |
| `comments` | Textarea | Optional | General contract observations. |

### 3. Document Management Logic
The system supports two modes for document submission:

- **Unified Mode (`isUnified`)**:
    - A single PDF containing all required documents.
    - Path: `companies/{cid}/employees/{eid}/documents/unified/{filename}`.
    - Database: `is_unified = true`, `document_type_id = NULL`.
- **Individual Mode**:
    - Separate uploads for each mandatory document type (e.g., ID, Social Security, CV).
    - Path: `companies/{cid}/employees/{eid}/documents/{documentTypeId}/{filename}`.
    - Database: `is_unified = false`, `document_type_id = {UUID}`.

#### Special Features:
- **Unified Switch Persistence**: The component automatically detects if a unified document exists (via flag or path) and activates the `isUnified` switch on load.
- **Expiration Alerts**: Displays an Amber alert with slow-pulse animation if a document's `expirationDate` has passed.
- **File Viewing**: Integrated "Eye" icon for instant preview of newly uploaded or existing documents.
- **Filenames**: Displays the actual filename and a success check-mark once a file is selected or already exists.

## Backend: Step 2 API
- **Endpoint**: `POST /api/rrhh/employees/{id}/step2`
- **Controller**: `EmployeeController.java` (Uses `MultipartHttpServletRequest`).
- **Service**: `EmployeeService.java`
    - `updateStep2`: Updates employee contract fields and processes files.
    - `saveDocument`: Handles MinIO upload and `employee_documents` record creation/update.

### Storage Standard (MinIO)
- **Bucket**: `private-assets`
- **Naming Pattern**: Standardized folder structure per employee to ensure multi-tenant isolation.
- **Auditing**: Records `created_by`, `updated_by`, `created_at`, `updated_at` for every document entry.

### Database Constraints
- **Table**: `business_rrhh.employee_documents`
- **Integrity**: `chk_unified_or_typed` ensures that a document is either unified (No Type) or typed (Not Unified).

## 4. UI/UX Standards
- **Buttons**: `REGRESAR` (Ghost/Slate) vs `GUARDAR Y CONTINUAR` (Primary esmerald). Rounded `3rem` (pill shape).
- **Validation**: Fields marked with red border on focus out if required and empty. 
- **Global Error**: *"Por favor completa todos los campos obligatorios resaltados en rojo."*
- **Icons**: Use of Lucide/PrimeIcons for visual cues (`file-text`, `upload-cloud`, `eye`, etc.).
