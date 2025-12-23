DO $$ BEGIN -- Rename upload_date to created_at
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employee_documents'
        AND column_name = 'upload_date'
) THEN
ALTER TABLE business_rrhh.employee_documents
    RENAME COLUMN upload_date TO created_at;
END IF;
-- Rename file_path to file_key
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employee_documents'
        AND column_name = 'file_path'
) THEN
ALTER TABLE business_rrhh.employee_documents
    RENAME COLUMN file_path TO file_key;
END IF;
-- Rename document_name to file_name
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employee_documents'
        AND column_name = 'document_name'
) THEN
ALTER TABLE business_rrhh.employee_documents
    RENAME COLUMN document_name TO file_name;
END IF;
-- Rename file_size to file_size_bytes
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employee_documents'
        AND column_name = 'file_size'
) THEN
ALTER TABLE business_rrhh.employee_documents
    RENAME COLUMN file_size TO file_size_bytes;
END IF;
-- Rename file_type to mime_type
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employee_documents'
        AND column_name = 'file_type'
) THEN
ALTER TABLE business_rrhh.employee_documents
    RENAME COLUMN file_type TO mime_type;
END IF;
END $$;