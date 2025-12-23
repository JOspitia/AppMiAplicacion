-- V29: Update employee documents structure
ALTER TABLE business_rrhh.employee_documents
ADD COLUMN IF NOT EXISTS document_type_id UUID REFERENCES public.document_types(id),
    ADD COLUMN IF NOT EXISTS expiration_date DATE,
    ADD COLUMN IF NOT EXISTS is_unified BOOLEAN DEFAULT FALSE;