# Employee Creation Wizard: Step 1 - Personal Information

This document outlines the technical implementation and field specifications for the first step of the Employee Creation Wizard.

## Design Philosophy
- **Human-Centric Design**: Referred to as "Colaboradores" instead of employees.
- **Premium Interface**: Glassmorphism sections, rapid navigation search, and intelligent headers.
- **Compliance**: Follows Colombian software development regulations (splitting names into 4 fields).
- **Security**: MinIO integration for private file storage (Photos, PDFs).
- **Auditing**: Full audit trail (created_by, updated_by, timestamps) on all entities.

## Database Entities

### 1. Employees Table (`business_rrhh.employees`)
Stores the main personal and demographic data.
- **Key Fields**:
  - `first_name`, `second_name`, `first_last_name`, `second_last_name`.
  - `identification_number`, `identification_type_id`.
  - `photo_url`: Path to profile photo.
  - `residence_country_id`, `state_id`, `city_id`: Cascading location.
  - `blood_type_id`, `rh_factor_id`, `education_level_id`.

### 2. Education (`business_rrhh.employee_educations`)
Stores academic history.
- **Fields**: `education_level_id`, `institution`, `title_obtained`, `current_semester`, `phone`, `city_id`, `start_year`, `end_year`, `hours`, `attachment_url` (PDF).
- **Interaction**: Inline cards with dedicated geography cascades.

### 3. Work Experience (`business_rrhh.employee_work_experiences`)
Stores professional history.
- **Fields**: `company_name`, `position_held`, `supervisor_name`, `phone`, `start_date`, `end_date`, `attachment_url` (PDF).
- **Interaction**: Inline cards similar to Education.

### 4. Family Nucleus & Emergency Contacts
- **Structure**: Splitting names into 4 fields for full compliance.
- **Logic**: Dynamic addition/removal of list items.

## Frontend Implementation (`step1-personal.component.ts`)

### Visual Features
- **Header**: 
    - Split-color name (White/Primary).
    - Status badges (Active/Inactive).
    - Quick contact tags (Document, Mobile, Email).
- **Search**: `p-autoComplete` that filters form sections for instant access.
- **Sections**:
    - **Demographics**: Uses new catalogs for Marital Status, Blood Type, RH.
    - **Geography**: Multi-level cascades (Country -> State -> City).
    - **Attachments**: Standardized PDF uploads for Experience and Education.

### Validation
- **Reactive Forms**: Strict validation on required fields.
- **Custom Components**: `AddressBuilderComponent` for standardized address formatting.

## Backend Integration (`EmployeeService.java`)
- **Step 1 API**: Handles entity creation/update and management of child collections.
- **MinIO Orchestration**: Handles file persistence with folder isolation: `companies/{cid}/employees/{eid}/{category}/{filename}`.

## UX/UI Patterns & Consistency
- **Visual Feedback**:
    - Pulsing status badges for "Active" collaborators.
    - Inline validation for emails and required fields.
    - Glassmorphism containers for a premium feel.
- **Micro-interactions**:
    - Animated sections (`animate-fade-in`).
    - Hover effects on cards and buttons.
    - Smooth transitions for dynamic list additions.

## Standardized Icons
The component uses `IconComponent` with a mapping to PrimeIcons:
- **Navigation**: `plus`, `x`, `chevron-down`, `search`.
- **Entities**: `building` (Library), `academic-cap` (Book), `user`, `users`.
- **Contact**: `phone`, `mail` (Envelope), `location-marker` (Map Marker).
- **Status**: `check-circle`, `heart`, `shield`.

## SQL Migrations Used
- **V116**: Split Names Compliance.
- **V131**: Work Experience Audit & Fixes.
- **V119**: Recruitment fields (shirt size, etc.).
- **V132**: Employee Education Schema & Catalog.
