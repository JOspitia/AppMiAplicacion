-- Audit and Cleanup of Employee Tables and Dependencies
-- ==========================================
-- 1. CLEANUP REDUNDANT COLUMNS
-- ==========================================
DO $$ BEGIN -- 1.1 employee_bonuses cleanup
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employee_bonuses'
        AND column_name = 'periodicity'
) THEN
ALTER TABLE business_rrhh.employee_bonuses DROP COLUMN periodicity;
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employee_bonuses'
        AND column_name = 'calculation_base'
) THEN
ALTER TABLE business_rrhh.employee_bonuses DROP COLUMN calculation_base;
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employee_bonuses'
        AND column_name = 'periodicity_id'
) THEN
ALTER TABLE business_rrhh.employee_bonuses
ALTER COLUMN periodicity_id
SET NOT NULL;
END IF;
-- 1.2 compensation_types cleanup (Simulated string vs ID redundancy)
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'compensation_types'
        AND column_name = 'periodicity'
) THEN
ALTER TABLE business_rrhh.compensation_types DROP COLUMN periodicity;
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'compensation_types'
        AND column_name = 'calculation_base'
) THEN
ALTER TABLE business_rrhh.compensation_types DROP COLUMN calculation_base;
END IF;
-- 1.3 employees cleanup (Legacy identification_type string if exists alongside ID)
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employees'
        AND column_name = 'identification_type'
        AND column_name = 'identification_type_id'
) THEN
ALTER TABLE business_rrhh.employees DROP COLUMN identification_type;
END IF;
-- 1.4 operational_centers cleanup (ensure location_id is used correctly, if redundancy exists check it first)
-- checking for potential 'location' string column vs 'location_id'
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'operational_centers'
        AND column_name = 'location'
) THEN
ALTER TABLE business_rrhh.operational_centers DROP COLUMN location;
END IF;
END $$;
-- ==========================================
-- 2. DOCUMENTATION & COMMENTS
-- ==========================================
-- ----------------------------
-- CORE EMPLOYEE TABLES
-- ----------------------------
-- Employees Table
COMMENT ON TABLE business_rrhh.employees IS 'Main registry of employees. Contains personal data, identification, and current status.';
COMMENT ON COLUMN business_rrhh.employees.user_id IS 'Link to the system user for authentication and self-service portal access.';
COMMENT ON COLUMN business_rrhh.employees.active IS 'Soft delete status. If false, the employee is considered terminated or deleted.';
COMMENT ON COLUMN business_rrhh.employees.first_name IS 'Employee first name(s).';
COMMENT ON COLUMN business_rrhh.employees.first_last_name IS 'Employee first surname (paternal).';
COMMENT ON COLUMN business_rrhh.employees.second_last_name IS 'Employee second surname (maternal).';
COMMENT ON COLUMN business_rrhh.employees.identification_type_id IS 'Reference to the type of identification document (CC, CE, Passport, etc).';
COMMENT ON COLUMN business_rrhh.employees.identification_number IS 'Unique identification number within the company context.';
COMMENT ON COLUMN business_rrhh.employees.identification_issue_date IS 'Date when the ID was issued. Critical for contract validation.';
COMMENT ON COLUMN business_rrhh.employees.identification_issue_place_id IS 'City where the identification document was issued.';
COMMENT ON COLUMN business_rrhh.employees.birth_date IS 'Date of birth for age calculation and legal requirements.';
COMMENT ON COLUMN business_rrhh.employees.birth_place_id IS 'City of birth.';
COMMENT ON COLUMN business_rrhh.employees.gender_id IS 'Gender identity.';
COMMENT ON COLUMN business_rrhh.employees.marital_status IS 'Civil status (Single, Married, Divorced, etc).';
COMMENT ON COLUMN business_rrhh.employees.blood_type IS 'Blood group and Rh factor (e.g., O+, A-).';
COMMENT ON COLUMN business_rrhh.employees.nationality_id IS 'Country of nationality.';
COMMENT ON COLUMN business_rrhh.employees.email_personal IS 'Personal email address for communications.';
COMMENT ON COLUMN business_rrhh.employees.email_corporate IS 'Official company email (Login username usually).';
COMMENT ON COLUMN business_rrhh.employees.phone_mobile IS 'Primary mobile contact number.';
COMMENT ON COLUMN business_rrhh.employees.phone_home IS 'Landline or secondary contact number.';
COMMENT ON COLUMN business_rrhh.employees.phone_alternate IS 'Emergency or alternative contact number.';
COMMENT ON COLUMN business_rrhh.employees.address IS 'Residential address.';
COMMENT ON COLUMN business_rrhh.employees.residence_country_id IS 'Country of residence.';
COMMENT ON COLUMN business_rrhh.employees.residence_state_id IS 'State/Department of residence.';
COMMENT ON COLUMN business_rrhh.employees.residence_city_id IS 'City of residence (Basis for transport tax calculation).';
COMMENT ON COLUMN business_rrhh.employees.photo_url IS 'Object storage key for the employee profile picture.';
COMMENT ON COLUMN business_rrhh.employees.bank_name IS 'Name of the bank for payroll deposits.';
COMMENT ON COLUMN business_rrhh.employees.bank_account_type IS 'Type of bank account (Savings, Checking).';
COMMENT ON COLUMN business_rrhh.employees.bank_account_number IS 'Bank account number.';
COMMENT ON COLUMN business_rrhh.employees.education_level_id IS 'Highest level of education achieved.';
COMMENT ON COLUMN business_rrhh.employees.shirt_size_id IS 'Shirt size for uniform dotation.';
COMMENT ON COLUMN business_rrhh.employees.pants_size_id IS 'Pants size for uniform dotation.';
COMMENT ON COLUMN business_rrhh.employees.shoe_size_id IS 'Shoe size for uniform dotation.';
COMMENT ON COLUMN business_rrhh.employees.is_pep IS 'Compliance flag: Politically Exposed Person (SAGRILAFT).';
COMMENT ON COLUMN business_rrhh.employees.military_status IS 'Status of military card (Libreta Militar).';
COMMENT ON COLUMN business_rrhh.employees.socioeconomic_stratum IS 'Housing stratum (1-6) required for SG-SST reports (Resolution 0312/2019).';
COMMENT ON TABLE business_rrhh.employee_job_history IS 'Tracks the history of an employee positions, salaries, and cost centers. The entry with active=true is the current state.';
COMMENT ON COLUMN business_rrhh.employee_job_history.active IS 'Only one record per employee should be active true, representing the current job.';
COMMENT ON COLUMN business_rrhh.employee_job_history.transport_aid IS 'Automatic flag indicating if the employee is eligible for Legal Transport Aid (Auxilio de Transporte).';
COMMENT ON COLUMN business_rrhh.employee_job_history.change_reason IS 'Reason for this job history entry (e.g., Promotion, Salary Increase, Transfer).';
COMMENT ON TABLE business_rrhh.employee_contracts IS 'Legal contracts associated with the employee.';
COMMENT ON COLUMN business_rrhh.employee_contracts.contract_document_url IS 'Link to the signed digital contract file.';
COMMENT ON COLUMN business_rrhh.employee_contracts.probation_end_date IS 'Calculated date for the end of the probation period.';
COMMENT ON COLUMN business_rrhh.employee_contracts.work_schedule_id IS 'Assigned work shift/schedule for this contract.';
COMMENT ON TABLE business_rrhh.employee_documents IS 'Digital repository for employee files (ID copies, certificates, etc).';
COMMENT ON COLUMN business_rrhh.employee_documents.is_unified IS 'Flag indicating a single PDF containing multiple physical documents (optimization).';
COMMENT ON TABLE business_rrhh.employee_family_nucleus IS 'Unified registry for family members, dependents, and contacts. Single source of truth for beneficiaries and emergency contacts.';
COMMENT ON COLUMN business_rrhh.employee_family_nucleus.is_beneficiary IS 'If true, qualifies for social security (Caja de Compensación) benefits.';
COMMENT ON COLUMN business_rrhh.employee_family_nucleus.is_dependent IS 'If true, qualifies as a financial dependent for tax/subsidy purposes.';
COMMENT ON COLUMN business_rrhh.employee_family_nucleus.is_emergency_contact IS 'If true, this person is contacted in emergencies.';
COMMENT ON COLUMN business_rrhh.employee_family_nucleus.relationship IS 'Nature of relationship (SPOUSE, CHILD, PARENT, SIBLING, OTHER).';
-- ----------------------------
-- PAYROLL & COMPENSATION
-- ----------------------------
COMMENT ON TABLE business_rrhh.employee_bonuses IS 'Recurring or one-time payroll concepts assigned to an employee (Novedades de Nómina).';
COMMENT ON COLUMN business_rrhh.employee_bonuses.compensation_type_id IS 'FK to the catalog of payroll concepts.';
COMMENT ON COLUMN business_rrhh.employee_bonuses.periodicity_id IS 'Frequency of the payment (Monthly, Bi-weekly, etc). NOW REQUIRED.';
COMMENT ON COLUMN business_rrhh.employee_bonuses.target_value IS 'For goal-based bonuses, the target amount to reach.';
COMMENT ON TABLE business_rrhh.compensation_types IS 'Catalog of all payroll concepts (Earnings, Deductions, Liabilities).';
COMMENT ON COLUMN business_rrhh.compensation_types.code IS 'Unique code for payroll integration or accounting software.';
COMMENT ON COLUMN business_rrhh.compensation_types.is_variable IS 'If true, the amount is a percentage or calculated, not a fixed value.';
COMMENT ON COLUMN business_rrhh.compensation_types.category IS 'Grouping: EARNING (Devengado), DEDUCTION (Deducción), LIABILITY (Pasivo).';
COMMENT ON COLUMN business_rrhh.compensation_types.is_taxable IS 'Indicates if this concept constitutes salary for tax calculation purposes (IBC).';
COMMENT ON TABLE business_rrhh.calculation_bases IS 'Reference values for calculations (e.g., SMMLV - Minimum Wage, UIT - Tax Unit).';
-- ----------------------------
-- ORGANIZATIONAL STRUCTURE
-- ----------------------------
COMMENT ON TABLE "security".companies IS 'SaaS Tenant / Company entity. Root of isolation.';
COMMENT ON TABLE business_rrhh.cost_centers IS 'Financial grouping for expenses and budgets.';
COMMENT ON COLUMN business_rrhh.cost_centers.transport_aid_threshold IS 'Custom threshold to determine who gets transport aid in this center (defaults to 2 SMMLV usually).';
COMMENT ON COLUMN business_rrhh.cost_centers.budget IS 'Estimated budget for this C.C.';
COMMENT ON TABLE business_rrhh.departments IS 'Functional areas / departments within the structure.';
COMMENT ON COLUMN business_rrhh.departments.manager_position_id IS 'Head of the department (Position ID).';
COMMENT ON TABLE business_rrhh.department_locations IS 'Join table linking Departments to Locations (Many-to-Many usually, or restriction of Dept visibility).';
COMMENT ON TABLE business_rrhh.locations IS 'Geographical locations or main offices / Branches.';
COMMENT ON COLUMN business_rrhh.locations.is_main IS 'Flag for the Headquarters location.';
COMMENT ON TABLE business_rrhh.operational_centers IS 'Specific physical worksites within a Location (e.g., "Warehouse A" inside "Bogota Branch").';
COMMENT ON TABLE business_rrhh.organizational_levels IS 'Hierarchy levels matrix (e.g., Delta Level, C-Level, VP, Director, Analyst). Used for salary bands.';
COMMENT ON TABLE business_rrhh.positions IS 'Job definitions / Roles catalogs.';
COMMENT ON COLUMN business_rrhh.positions.risk_level IS 'ARL Risk Level (1-5) associated with this job for occupational hazard contributions.';
COMMENT ON COLUMN business_rrhh.positions.min_salary IS 'Salary Band Minimum.';
COMMENT ON COLUMN business_rrhh.positions.max_salary IS 'Salary Band Maximum.';
-- ----------------------------
-- CATALOGS & CONFIG
-- ----------------------------
COMMENT ON TABLE business_rrhh.contract_types IS 'Types of employment contracts (Indefinite, Fixed Term, Apprenticeship).';
COMMENT ON COLUMN business_rrhh.contract_types.has_end_date IS 'If true, the contract wizard validates End Date is present.';
COMMENT ON TABLE business_rrhh.education_levels IS 'Standard education levels (High School, Bachelor, PhD).';
COMMENT ON TABLE business_rrhh.clothing_sizes IS 'Sizes for dotation/uniforms (Shirt, Pants, Shoes). Managed per company.';
COMMENT ON TABLE business_rrhh.periodicities IS 'Payment frequencies (Monthly, Bi-weekly, Weekly).';
COMMENT ON COLUMN business_rrhh.periodicities.days_interval IS 'Number of days in the period (e.g., 30 for Monthly).';
COMMENT ON TABLE business_rrhh.work_schedules IS 'Shift definitions and weekly hour limits.';
COMMENT ON COLUMN business_rrhh.work_schedules.cycle_length_days IS 'Length of the shift cycle (e.g., 7 for weekly standard, 14 for 2-week rotation).';
COMMENT ON TABLE business_rrhh.work_schedule_days IS 'Definition of daily shifts within a Work Schedule.';
-- ----------------------------
-- TALENT & DEVELOPMENT
-- ----------------------------
COMMENT ON TABLE business_rrhh.position_experience IS 'Experience requirements (Years) for a position.';
COMMENT ON TABLE business_rrhh.position_functions IS 'List of responsibilities/tasks for a position.';
COMMENT ON TABLE business_rrhh.position_requirements IS 'Specific requirements (Certifications, Languages, etc) for a position.';
COMMENT ON TABLE business_rrhh.position_skills IS 'Required soft/hard skills for a position.';
COMMENT ON TABLE business_rrhh.skill_levels IS 'Proficiency levels for skills (Beginner, Intermediate, Expert).';
-- ----------------------------
-- DEPRECATED / LEGACY
-- ----------------------------
COMMENT ON TABLE business_rrhh.employee_emergency_contacts IS 'LEGACY/SYNC. Read-only copy of emergency contacts derived from employee_family_nucleus. Kept for backward compatibility but should be treated as deprecated.';
COMMENT ON TABLE business_rrhh.employee_dependents IS 'DEPRECATED. Redundant. Replaced by employee_family_nucleus with is_dependent=true. Candidate for removal in future versions.';