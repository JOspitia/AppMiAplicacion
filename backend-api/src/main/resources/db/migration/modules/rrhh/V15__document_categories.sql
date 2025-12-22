-- ==============================================================================
-- V15__add_document_categorization.sql
-- DESCRIPCIÓN: Añade la tabla maestra de Categorías de Documentos y relaciona
--              document_types a estas categorías.
-- ==============================================================================
-- 1. Crear la Tabla de Categorías de Documentos (business_rrhh.document_categories)
CREATE TABLE IF NOT EXISTS business_rrhh.document_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES security.users(id),
    -- Asegurar FK
    updated_by UUID REFERENCES security.users(id),
    -- Asegurar FK
    CONSTRAINT unique_doc_category_name_per_company UNIQUE (company_id, name)
);
-- 2. Añadir la Columna 'category_id' a business_rrhh.document_types
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'document_types'
        AND column_name = 'category_id'
) THEN
ALTER TABLE business_rrhh.document_types
ADD COLUMN category_id UUID;
END IF;
END $$;
-- 3. Añadir Clave Foránea a business_rrhh.document_types
DO $$ BEGIN -- Comprobar si la restricción ya existe antes de añadirla
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_document_types_category'
) THEN
ALTER TABLE business_rrhh.document_types
ADD CONSTRAINT fk_document_types_category FOREIGN KEY (category_id) REFERENCES business_rrhh.document_categories(id);
END IF;
END $$;
-- 4. Seed initial categories for existing companies
INSERT INTO business_rrhh.document_categories (company_id, name, description)
SELECT c.id,
    names.name,
    names.description
FROM security.companies c
    CROSS JOIN (
        VALUES (
                'Identificación y Legales',
                'Documentos que comprueban la identidad o el estado legal (Cédula, Pasaporte, Visa, RUC).'
            ),
            (
                'Contratación',
                'Documentos específicos del proceso de ingreso (Contrato Laboral, Examen Médico Ocupacional).'
            ),
            (
                'Académicos y Profesionales',
                'Documentos que acreditan formación (Títulos, Certificaciones).'
            ),
            (
                'Registro de Nómina',
                'Documentos internos o financieros (Certificado Bancario, Formulario de Retención).'
            )
    ) AS names(name, description) ON CONFLICT (company_id, name) DO NOTHING;