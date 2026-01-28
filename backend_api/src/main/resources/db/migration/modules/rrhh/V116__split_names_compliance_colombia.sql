-- V116__split_names_compliance_colombia.sql
-- Splits name fields into first_name, second_name, first_last_name, second_last_name
-- Compliant with Colombian HR Software Development regulations

-- 1. Update employee_emergency_contacts
DO $$ BEGIN 
    -- Rename generic 'name' to 'first_name' if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='business_rrhh' AND table_name='employee_emergency_contacts' AND column_name='name') THEN
        ALTER TABLE business_rrhh.employee_emergency_contacts RENAME COLUMN name TO first_name;
    END IF;

    -- Add second_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='business_rrhh' AND table_name='employee_emergency_contacts' AND column_name='second_name') THEN
        ALTER TABLE business_rrhh.employee_emergency_contacts ADD COLUMN second_name VARCHAR(100);
    END IF;

    -- Add first_last_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='business_rrhh' AND table_name='employee_emergency_contacts' AND column_name='first_last_name') THEN
        ALTER TABLE business_rrhh.employee_emergency_contacts ADD COLUMN first_last_name VARCHAR(100);
    END IF;

    -- Add second_last_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='business_rrhh' AND table_name='employee_emergency_contacts' AND column_name='second_last_name') THEN
        ALTER TABLE business_rrhh.employee_emergency_contacts ADD COLUMN second_last_name VARCHAR(100);
    END IF;

    -- Handle constraint for first_last_name (initially nullable to avoid migration errors, application should enforce required)
    ALTER TABLE business_rrhh.employee_emergency_contacts ALTER COLUMN first_name TYPE VARCHAR(100);
END $$;

-- 2. Update employee_family_nucleus (already has first_name from V115)
DO $$ BEGIN 
    -- Add second_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='business_rrhh' AND table_name='employee_family_nucleus' AND column_name='second_name') THEN
        ALTER TABLE business_rrhh.employee_family_nucleus ADD COLUMN second_name VARCHAR(100);
    END IF;

    -- Rename last_name to first_last_name if exists (from V115)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='business_rrhh' AND table_name='employee_family_nucleus' AND column_name='last_name') THEN
        ALTER TABLE business_rrhh.employee_family_nucleus RENAME COLUMN last_name TO first_last_name;
    ELSE
        -- If not exists, create it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='business_rrhh' AND table_name='employee_family_nucleus' AND column_name='first_last_name') THEN
            ALTER TABLE business_rrhh.employee_family_nucleus ADD COLUMN first_last_name VARCHAR(100);
        END IF;
    END IF;

    -- Add second_last_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='business_rrhh' AND table_name='employee_family_nucleus' AND column_name='second_last_name') THEN
        ALTER TABLE business_rrhh.employee_family_nucleus ADD COLUMN second_last_name VARCHAR(100);
    END IF;
END $$;
