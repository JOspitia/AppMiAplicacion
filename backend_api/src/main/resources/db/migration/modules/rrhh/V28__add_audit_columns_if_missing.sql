-- V28__add_audit_columns_if_missing.sql
DO $$ BEGIN -- For business_rrhh.employees
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employees'
        AND column_name = 'created_at'
) THEN
ALTER TABLE business_rrhh.employees
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employees'
        AND column_name = 'updated_at'
) THEN
ALTER TABLE business_rrhh.employees
ADD COLUMN updated_at TIMESTAMP;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employees'
        AND column_name = 'created_by'
) THEN
ALTER TABLE business_rrhh.employees
ADD COLUMN created_by UUID;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employees'
        AND column_name = 'updated_by'
) THEN
ALTER TABLE business_rrhh.employees
ADD COLUMN updated_by UUID;
END IF;
-- For business_rrhh.employee_family_nucleus
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employee_family_nucleus'
        AND column_name = 'created_at'
) THEN
ALTER TABLE business_rrhh.employee_family_nucleus
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employee_family_nucleus'
        AND column_name = 'updated_at'
) THEN
ALTER TABLE business_rrhh.employee_family_nucleus
ADD COLUMN updated_at TIMESTAMP;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employee_family_nucleus'
        AND column_name = 'created_by'
) THEN
ALTER TABLE business_rrhh.employee_family_nucleus
ADD COLUMN created_by UUID;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employee_family_nucleus'
        AND column_name = 'updated_by'
) THEN
ALTER TABLE business_rrhh.employee_family_nucleus
ADD COLUMN updated_by UUID;
END IF;
END $$;