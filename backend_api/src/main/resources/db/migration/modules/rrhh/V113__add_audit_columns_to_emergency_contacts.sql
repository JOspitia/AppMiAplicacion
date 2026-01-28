-- V113__add_audit_columns_to_emergency_contacts.sql
-- Fixes auditing error: column ec1_0.created_by does not exist
DO $$ BEGIN 
    -- For business_rrhh.employee_emergency_contacts
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'business_rrhh'
            AND table_name = 'employee_emergency_contacts'
            AND column_name = 'created_by'
    ) THEN
        ALTER TABLE business_rrhh.employee_emergency_contacts
        ADD COLUMN created_by UUID;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'business_rrhh'
            AND table_name = 'employee_emergency_contacts'
            AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE business_rrhh.employee_emergency_contacts
        ADD COLUMN updated_by UUID;
    END IF;

    -- Also check created_at and updated_at just in case
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'business_rrhh'
            AND table_name = 'employee_emergency_contacts'
            AND column_name = 'created_at'
    ) THEN
        ALTER TABLE business_rrhh.employee_emergency_contacts
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'business_rrhh'
            AND table_name = 'employee_emergency_contacts'
            AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE business_rrhh.employee_emergency_contacts
        ADD COLUMN updated_at TIMESTAMP;
    END IF;

END $$;
