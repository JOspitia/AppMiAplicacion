-- Refactor Document Schema to PUBLIC and Implement Context Categories
-- 1. Move Tables to Public if they exist in business_rrhh
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'document_categories'
) THEN
ALTER TABLE business_rrhh.document_categories
SET SCHEMA public;
END IF;
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'document_types'
) THEN
ALTER TABLE business_rrhh.document_types
SET SCHEMA public;
END IF;
END $$;
-- 2. Ensure table exists in PUBLIC (if it didn't exist before)
CREATE TABLE IF NOT EXISTS public.document_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id),
    code VARCHAR(50),
    -- Initially nullable to allow adding column if missing
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);
-- 3. Add 'code' column if it was missing (from old table version)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'document_categories'
        AND column_name = 'code'
) THEN
ALTER TABLE public.document_categories
ADD COLUMN code VARCHAR(50);
END IF;
END $$;
-- 4. Clean up old data without code (optional, but safer for constraints)
DELETE FROM public.document_categories
WHERE code IS NULL;
-- 5. Set Code NOT NULL and Add Constraint
ALTER TABLE public.document_categories
ALTER COLUMN code
SET NOT NULL;
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = 'public'
        AND table_name = 'document_categories'
        AND constraint_name = 'unique_cat_code_company'
) THEN
ALTER TABLE public.document_categories
ADD CONSTRAINT unique_cat_code_company UNIQUE (company_id, code);
END IF;
END $$;
-- 6. Ensure document_types has category_id pointing to PUBLIC table
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
        AND table_name = 'document_types'
        AND column_name = 'category_id'
) THEN
ALTER TABLE public.document_types
ADD COLUMN category_id UUID REFERENCES public.document_categories(id);
END IF;
END $$;
-- 7. Seed Context Categories
INSERT INTO public.document_categories (company_id, code, name, description)
SELECT id,
    'RRHH_DOCUMENT',
    'Documentos de Gestión Humana',
    'Contexto exclusivo de RRHH'
FROM security.companies ON CONFLICT (company_id, code) DO NOTHING;
INSERT INTO public.document_categories (company_id, code, name, description)
SELECT id,
    'STORE_DOCUMENT',
    'Documentos de Bodega/Almacén',
    'Contexto exclusivo de Bodega'
FROM security.companies ON CONFLICT (company_id, code) DO NOTHING;
INSERT INTO public.document_categories (company_id, code, name, description)
SELECT id,
    'ACCOUNTING_DOCUMENT',
    'Documentos Contables',
    'Contexto exclusivo de Contabilidad'
FROM security.companies ON CONFLICT (company_id, code) DO NOTHING;