-- =====================================================
-- V122__move_catalogs_to_public_and_add_audit.sql
-- DESCRIPCIÓN: Mueve education_levels y clothing_sizes a public para consistencia
--              y añade columnas de auditoría faltantes.
-- =====================================================

-- 1. Mover tablas a esquema public (para estandarizar catálogos maestros)
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'business_rrhh' AND table_name = 'education_levels') THEN
        ALTER TABLE business_rrhh.education_levels SET SCHEMA public;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'business_rrhh' AND table_name = 'clothing_sizes') THEN
        ALTER TABLE business_rrhh.clothing_sizes SET SCHEMA public;
    END IF;
END $$;

-- 2. Añadir columnas de auditoría a identification_types (public)
ALTER TABLE public.identification_types 
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 3. Añadir columnas de auditoría a education_levels (public)
ALTER TABLE public.education_levels 
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 4. Añadir columnas de auditoría a clothing_sizes (public)
ALTER TABLE public.clothing_sizes 
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 5. Añadir columnas de auditoría a document_types (este se queda en business_rrhh porque es específico del módulo)
ALTER TABLE business_rrhh.document_types 
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 6. Agregar Constraints de FK para auditoría
-- (Usamos el esquema public para las tablas movidas)
DO $$ 
BEGIN
    -- education_levels
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_education_levels_created_by') THEN
        ALTER TABLE public.education_levels ADD CONSTRAINT fk_education_levels_created_by FOREIGN KEY (created_by) REFERENCES security.users(id);
    END IF;
    
    -- clothing_sizes
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_clothing_sizes_created_by') THEN
        ALTER TABLE public.clothing_sizes ADD CONSTRAINT fk_clothing_sizes_created_by FOREIGN KEY (created_by) REFERENCES security.users(id);
    END IF;
END $$;

-- Comentarios
COMMENT ON COLUMN public.education_levels.created_by IS 'Usuario que creó el registro';
COMMENT ON COLUMN public.clothing_sizes.created_by IS 'Usuario que creó el registro';
