# Employee Creation Wizard: Step 3 - Job History & Position

This document outlines the technical implementation and field specifications for the third step of the Employee Creation Wizard.

## Design Philosophy
- **Modular Design**: Separated into 3 main steps (Personal, Contract, Job History).
- **Position Tracking**: Links to Cost Centers, Departments, and Operational Centers.

## Database Entities (Planned/Current)

### 1. Employee Job History (`business_rrhh.employee_job_history`)
Tracks the history of positions held by an employee within the company.
- **Key Fields**:
  - `employee_id` (FK)
  - `position_id` (FK to `business_rrhh.positions`)
  - `department_id` (FK to `business_rrhh.departments`)
  - `cost_center_id` (FK to `business_rrhh.cost_centers`)
  - `location_id` (FK to `business_rrhh.locations` or `operational_centers`)
  - `start_date` (Required)
  - `end_date` (Optional - for position changes)
  - `is_current_position` (Boolean) - Only one true per employee.

### 2. Organizational Structure
- **Cost Center**: Budget allocation.
- **Department**: Organizational hierarchy.
- **Location**: Physical workplace.

## Backend Integration (`JobHistoryService.java`)
- **Validation**:
  - Ensures correct position hierarchy.
  - Validates assignment to valid cost centers and departments.
- **Audit**: Tracks creation/update.

## Frontend Implementation (`step3-job-history.component.ts`)
- **Cascading Selects**:
  - Department -> Position (Potential).
  - Location -> Operational Center.
- **Search**:
  - Position Search with autocomplete.
  - Cost Center Search.
