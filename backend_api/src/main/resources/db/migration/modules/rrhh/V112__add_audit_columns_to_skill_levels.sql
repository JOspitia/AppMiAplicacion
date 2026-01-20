-- Migration to fix missing audit columns in skill_levels table
-- This resolves the JDBC exception: "column sl1_0.created_by does not exist"

-- 1. Ensure created_by exists
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'business_rrhh' 
        AND table_name = 'skill_levels' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE business_rrhh.skill_levels ADD COLUMN created_by UUID;
    END IF;
END $$;

-- 2. Ensure updated_by exists
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'business_rrhh' 
        AND table_name = 'skill_levels' 
        AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE business_rrhh.skill_levels ADD COLUMN updated_by UUID;
    END IF;
END $$;
