-- V114__fix_mismatched_rrhh_columns.sql
-- Fixes mismatches between Java Entities/UI and Database schema

-- 1. employee_emergency_contacts: phone_number -> phone
DO $$ BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'business_rrhh' 
        AND table_name = 'employee_emergency_contacts' 
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE business_rrhh.employee_emergency_contacts 
        RENAME COLUMN phone_number TO phone;
    END IF;
END $$;

-- 2. employee_family_nucleus: first_name -> name, drop last_name
DO $$ BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'business_rrhh' 
        AND table_name = 'employee_family_nucleus' 
        AND column_name = 'first_name'
    ) THEN
        -- Merge if both exist, but simple rename is safer for dev
        ALTER TABLE business_rrhh.employee_family_nucleus 
        RENAME COLUMN first_name TO name;
        
        -- Increasing length to match entity potentially
        ALTER TABLE business_rrhh.employee_family_nucleus 
        ALTER COLUMN name TYPE VARCHAR(150);
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'business_rrhh' 
        AND table_name = 'employee_family_nucleus' 
        AND column_name = 'last_name'
    ) THEN
        ALTER TABLE business_rrhh.employee_family_nucleus 
        DROP COLUMN last_name;
    END IF;
END $$;
