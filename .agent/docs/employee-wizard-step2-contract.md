# Employee Creation Wizard: Step 2 - Contract Information

This document outlines the technical implementation and field specifications for the second step of the Employee Creation Wizard.

## Design Philosophy
- **Modular Design**: Separated into 3 main steps (Personal, Contract, Job History).
- **Compliance**: Follows Colombian labor regulations for various contract types.

## Contract Types Supported
- **Indefinite Term**: Standard, no end date.
- **Fixed Term**: Requires start/end dates.
- **Trial Period**: Integrated into standard contract types.
- **Other**: Freelance/Service Provision.

## Database Entities (Planned/Current)

### 1. Employee Contracts (`business_rrhh.employee_contracts`)
Stores all contract-related data.
- **Key Fields**:
  - `contract_id` (PK)
  - `employee_id` (FK)
  - `contract_type_id` (FK to `public.contract_types`)
  - `start_date` (Required)
  - `end_date` (Required for Fixed Term)
  - `trial_period_days` (Optional)
  - `salary` (Decimal)
  - `is_active` (Boolean) - Only one active contract per employee at a time.

### 2. Benefits & Deductions
- **Health Insurance**: `health_entity_id` (FK)
- **Pension Fund**: `pension_entity_id` (FK)
- **ARL**: `arl_level` (Risk level 1-5).

## Backend Integration (`ContractService.java`)
- **Validation**:
  - Ensures no overlapping active contracts for the same employee.
  - Validates end date > start date.
- **Audit**: Tracks creation/update.

## Frontend Implementation (`step2-contract.component.ts`)
- **Dynamic Fields**: Shows/hides end date based on `contract_type`.
- **Salary Input**: Masked/Formatted input.
- **Validation**: Date range checks.
