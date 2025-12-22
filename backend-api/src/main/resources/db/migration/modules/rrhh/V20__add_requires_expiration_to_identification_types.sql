-- V20: Add requires_expiration column to document_types table
-- This column indicates if the document type requires an expiration date
-- Examples: Driver's license, Medical certificate, Passport
DO $$ BEGIN -- Verificar si la tabla document_types existe en el esquema business_rrhh
IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'document_types'
) THEN -- 1. Añadir la columna de expiración de forma segura (IF NOT EXISTS)
ALTER TABLE business_rrhh.document_types
ADD COLUMN IF NOT EXISTS requires_expiration BOOLEAN DEFAULT FALSE;
-- 2. Actualizar los registros existentes para tener un valor explícito (si la columna se acaba de añadir)
-- Esta sentencia solo se ejecuta si la tabla existe
UPDATE business_rrhh.document_types
SET requires_expiration = FALSE
WHERE requires_expiration IS NULL;
-- 3. Añadir comentario para documentación
COMMENT ON COLUMN business_rrhh.document_types.requires_expiration IS 'Indicates if documents of this type require an expiration date (e.g., licenses, certificates)';
END IF;
END $$;