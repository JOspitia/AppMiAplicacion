-- Move Document tables to PUBLIC schema to share them across modules
-- 1. Move Document Categories (if it exists in business_rrhh)
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'document_categories'
) THEN
ALTER TABLE business_rrhh.document_categories
SET SCHEMA public;
END IF;
END $$;
-- 2. Move Document Types
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'document_types'
) THEN
ALTER TABLE business_rrhh.document_types
SET SCHEMA public;
END IF;
END $$;
-- 3. Ensure tables exist in public (creation if previous step didn't move them because they didn't exist)
-- Note: V15 created document_categories, so it should exist there if V15 ran.
-- If V15 didn't run, this migration might fail if we assume tables exist? 
-- No, if V15 didn't run, V15 will run first creating them in business_rrhh, then V16 moves them. Correct.
-- 4. Update References?
-- Postgres automatically updates FKs when table schema is changed.
-- e.g. business_rrhh.employee_documents.document_type_id will point to public.document_types.
-- 5. Seed logic update? 
-- The previous seeds were inserted into business_rrhh.document_categories.
-- They are moved with the table.
-- 6. Future inserts must target public.
-- V18: Refactor contract_types duration field for flexibility
-- Renames default_duration_months to default_duration and adds duration_unit (MONTHS/DAYS/YEARS).
DO $$ BEGIN -- 1. RENOMBRAR la columna 'default_duration_months' a 'default_duration' de forma segura.
-- Se verifica si la columna antigua existe antes de intentar renombrar.
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'contract_types'
        AND column_name = 'default_duration_months'
) THEN
ALTER TABLE business_rrhh.contract_types
    RENAME COLUMN default_duration_months TO default_duration;
END IF;
-- 2. AGREGAR la columna 'duration_unit' de forma segura (IF NOT EXISTS).
ALTER TABLE business_rrhh.contract_types
ADD COLUMN IF NOT EXISTS duration_unit VARCHAR(20) DEFAULT 'MONTHS';
-- 3. Actualizar Comentarios para documentación.
COMMENT ON COLUMN business_rrhh.contract_types.default_duration IS 'Default duration value for fixed-term contracts.';
COMMENT ON COLUMN business_rrhh.contract_types.duration_unit IS 'Unit of the default_duration (MONTHS, DAYS, or YEARS).';
END $$;