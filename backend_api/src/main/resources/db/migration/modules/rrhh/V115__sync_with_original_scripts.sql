-- V115__sync_with_original_scripts.sql
-- Revertimos renombres para usar los nombres de los scripts originales (V22, V27)
-- Y añadimos solo lo que estrictamente hace falta.

-- 1. Regresar a phone_number en contactos de emergencia
DO $$ BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'business_rrhh' 
        AND table_name = 'employee_emergency_contacts' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE business_rrhh.employee_emergency_contacts 
        RENAME COLUMN phone TO phone_number;
    END IF;
END $$;

-- 2. Regresar a first_name/last_name en núcleo familiar
DO $$ BEGIN 
    -- Renombrar name a first_name
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'business_rrhh' 
        AND table_name = 'employee_family_nucleus' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE business_rrhh.employee_family_nucleus 
        RENAME COLUMN name TO first_name;
    END IF;

    -- Asegurar que last_name existe y permite nulos (para compatibilidad con el Wizard)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'business_rrhh' 
        AND table_name = 'employee_family_nucleus' 
        AND column_name = 'last_name'
    ) THEN
        ALTER TABLE business_rrhh.employee_family_nucleus 
        ADD COLUMN last_name VARCHAR(100);
    ELSE
        ALTER TABLE business_rrhh.employee_family_nucleus 
        ALTER COLUMN last_name DROP NOT NULL;
    END IF;

    -- AÑADIR CAMPO QUE HACE FALTA: occupation
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'business_rrhh' 
        AND table_name = 'employee_family_nucleus' 
        AND column_name = 'occupation'
    ) THEN
        ALTER TABLE business_rrhh.employee_family_nucleus 
        ADD COLUMN occupation VARCHAR(100);
    END IF;
END $$;
