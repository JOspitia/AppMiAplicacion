-- =====================================================
-- V138: Fix audit columns and naming for employee_documents
-- =====================================================
-- Ensures that employee_documents table has all columns expected by 
-- the AuditableEntity class and the current naming convention (file_path, file_size)

DO $$
BEGIN
    -- 1. Audit Columns
    
    -- Rename uploaded_by to created_by if it exists (legacy from V3)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'business_rrhh' 
               AND table_name = 'employee_documents' 
               AND column_name = 'uploaded_by') THEN
        ALTER TABLE business_rrhh.employee_documents 
        RENAME COLUMN uploaded_by TO created_by;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_schema = 'business_rrhh' 
                    AND table_name = 'employee_documents' 
                    AND column_name = 'created_by') THEN
        ALTER TABLE business_rrhh.employee_documents 
        ADD COLUMN created_by UUID;
    END IF;

    -- Add updated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'business_rrhh' 
                   AND table_name = 'employee_documents' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE business_rrhh.employee_documents 
        ADD COLUMN updated_at TIMESTAMP;
    END IF;

    -- Add updated_by if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'business_rrhh' 
                   AND table_name = 'employee_documents' 
                   AND column_name = 'updated_by') THEN
        ALTER TABLE business_rrhh.employee_documents 
        ADD COLUMN updated_by UUID;
    END IF;

    -- 2. Naming Convention Fixes to match Java Entity

    -- Rename file_key to file_path if it exists (legacy from V3/V30)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'business_rrhh' 
               AND table_name = 'employee_documents' 
               AND column_name = 'file_key') THEN
        ALTER TABLE business_rrhh.employee_documents 
        RENAME COLUMN file_key TO file_path;
        
        -- Also increase length to match entity/V137
        ALTER TABLE business_rrhh.employee_documents
        ALTER COLUMN file_path TYPE VARCHAR(500);
    END IF;

    -- Rename file_size_bytes to file_size if it exists (legacy from V3/V30)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'business_rrhh' 
               AND table_name = 'employee_documents' 
               AND column_name = 'file_size_bytes') THEN
        ALTER TABLE business_rrhh.employee_documents 
        RENAME COLUMN file_size_bytes TO file_size;
    END IF;

    -- Update mime_type length if needed
    ALTER TABLE business_rrhh.employee_documents
    ALTER COLUMN mime_type TYPE VARCHAR(100);

END $$;
