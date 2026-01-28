-- V117__add_second_name_to_employees.sql
-- Adds second_name column to employees table to allow for fully split names

DO $$ BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'business_rrhh' 
        AND table_name = 'employees' 
        AND column_name = 'second_name'
    ) THEN
        ALTER TABLE business_rrhh.employees 
        ADD COLUMN second_name VARCHAR(100);
    END IF;
END $$;
