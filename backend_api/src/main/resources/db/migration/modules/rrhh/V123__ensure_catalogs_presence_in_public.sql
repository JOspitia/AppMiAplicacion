-- =====================================================
-- V123__ensure_catalogs_presence_in_public.sql
-- DESCRIPCIÓN: Mueve definitivamente education_levels y clothing_sizes a public
--              y asegura que tengan las columnas de auditoría.
-- =====================================================

-- 1. Intentar mover education_levels si todavía está en business_rrhh
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'business_rrhh' AND table_name = 'education_levels') THEN
        ALTER TABLE business_rrhh.education_levels SET SCHEMA public;
    END IF;
END $$;

-- 2. Intentar mover clothing_sizes si todavía está en business_rrhh
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'business_rrhh' AND table_name = 'clothing_sizes') THEN
        ALTER TABLE business_rrhh.clothing_sizes SET SCHEMA public;
    END IF;
END $$;

-- 3. Asegurar columnas de auditoría en public.education_levels
ALTER TABLE public.education_levels 
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 4. Asegurar columnas de auditoría en public.clothing_sizes
ALTER TABLE public.clothing_sizes 
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 5. Asegurar auditoría en public.identification_types (por si acaso)
ALTER TABLE public.identification_types 
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 6. Re-vincular Foreign Keys de auditoría a la tabla de usuarios
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_education_levels_users_created') THEN
        ALTER TABLE public.education_levels ADD CONSTRAINT fk_education_levels_users_created FOREIGN KEY (created_by) REFERENCES security.users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_clothing_sizes_users_created') THEN
        ALTER TABLE public.clothing_sizes ADD CONSTRAINT fk_clothing_sizes_users_created FOREIGN KEY (created_by) REFERENCES security.users(id);
    END IF;
END $$;
