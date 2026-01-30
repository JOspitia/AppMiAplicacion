-- =====================================================
-- V137: Add Employee Contract Fields and Documents Table
-- =====================================================
-- Adds contract-related fields to employees table and creates employee_documents table
-- for managing contract support documents (individual or unified)

-- 1. Add contract fields to employees table
DO $$
BEGIN
    -- Contract Type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'business_rrhh' 
                   AND table_name = 'employees' 
                   AND column_name = 'contract_type_id') THEN
        ALTER TABLE business_rrhh.employees 
        ADD COLUMN contract_type_id UUID REFERENCES business_rrhh.contract_types(id);
    END IF;

    -- Contract Number
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'business_rrhh' 
                   AND table_name = 'employees' 
                   AND column_name = 'contract_number') THEN
        ALTER TABLE business_rrhh.employees 
        ADD COLUMN contract_number VARCHAR(100);
    END IF;

    -- Contract Start Date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'business_rrhh' 
                   AND table_name = 'employees' 
                   AND column_name = 'contract_start_date') THEN
        ALTER TABLE business_rrhh.employees 
        ADD COLUMN contract_start_date DATE;
    END IF;

    -- Contract End Date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'business_rrhh' 
                   AND table_name = 'employees' 
                   AND column_name = 'contract_end_date') THEN
        ALTER TABLE business_rrhh.employees 
        ADD COLUMN contract_end_date DATE;
    END IF;

    -- Probation End Date
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'business_rrhh' 
                   AND table_name = 'employees' 
                   AND column_name = 'probation_end_date') THEN
        ALTER TABLE business_rrhh.employees 
        ADD COLUMN probation_end_date DATE;
    END IF;

    -- Work Schedule
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'business_rrhh' 
                   AND table_name = 'employees' 
                   AND column_name = 'work_schedule_id') THEN
        ALTER TABLE business_rrhh.employees 
        ADD COLUMN work_schedule_id UUID REFERENCES business_rrhh.work_schedules(id);
    END IF;

    -- Contract Comments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'business_rrhh' 
                   AND table_name = 'employees' 
                   AND column_name = 'contract_comments') THEN
        ALTER TABLE business_rrhh.employees 
        ADD COLUMN contract_comments TEXT;
    END IF;
END $$;

-- 2. Create employee_documents table
CREATE TABLE IF NOT EXISTS business_rrhh.employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES business_rrhh.employees(id) ON DELETE CASCADE,
    document_type_id UUID REFERENCES business_rrhh.document_types(id),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    expiration_date DATE,
    is_unified BOOLEAN DEFAULT FALSE,
    
    -- Audit fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_at TIMESTAMP,
    updated_by UUID,
    
    CONSTRAINT chk_unified_or_typed CHECK (
        (is_unified = TRUE AND document_type_id IS NULL) OR
        (is_unified = FALSE AND document_type_id IS NOT NULL)
    )
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee 
ON business_rrhh.employee_documents(employee_id);

CREATE INDEX IF NOT EXISTS idx_employee_documents_type 
ON business_rrhh.employee_documents(document_type_id);

CREATE INDEX IF NOT EXISTS idx_employee_documents_expiration 
ON business_rrhh.employee_documents(expiration_date) 
WHERE expiration_date IS NOT NULL;

-- 4. Add index on contract fields for reporting
CREATE INDEX IF NOT EXISTS idx_employees_contract_type 
ON business_rrhh.employees(contract_type_id);

CREATE INDEX IF NOT EXISTS idx_employees_contract_dates 
ON business_rrhh.employees(contract_start_date, contract_end_date);

-- 5. Comment documentation
COMMENT ON TABLE business_rrhh.employee_documents IS 'Stores employee contract support documents (individual or unified)';
COMMENT ON COLUMN business_rrhh.employee_documents.is_unified IS 'TRUE if this is a unified document containing all required docs in one PDF';
COMMENT ON COLUMN business_rrhh.employee_documents.document_type_id IS 'NULL for unified documents, required for individual documents';
COMMENT ON COLUMN business_rrhh.employee_documents.expiration_date IS 'Expiration date for documents that require renewal (licenses, certificates, etc.)';
