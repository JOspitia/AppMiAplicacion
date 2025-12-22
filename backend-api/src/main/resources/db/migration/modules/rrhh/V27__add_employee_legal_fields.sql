-- V27: Add additional employee fields for legal compliance
-- Adds fields for: document issuance info, clothing sizes, residence location, education level, etc.
-- 1. Create clothing sizes table
CREATE TABLE IF NOT EXISTS business_rrhh.clothing_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES "security".companies(id),
    code VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    -- 'SHIRT', 'PANTS', 'SHOES'
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- CORRECTION: Add IF NOT EXISTS to prevent SQL Error 42P07
CREATE INDEX IF NOT EXISTS idx_clothing_sizes_company ON business_rrhh.clothing_sizes(company_id);
CREATE INDEX IF NOT EXISTS idx_clothing_sizes_category ON business_rrhh.clothing_sizes(category);
-- 2. Create education levels table
CREATE TABLE IF NOT EXISTS business_rrhh.education_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES "security".companies(id),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- CORRECTION: Add IF NOT EXISTS to prevent SQL Error 42P07
CREATE INDEX IF NOT EXISTS idx_education_levels_company ON business_rrhh.education_levels(company_id);
-- 3. Add new columns to employees table
ALTER TABLE business_rrhh.employees -- Document issuance info (critical for contracts)
ADD COLUMN IF NOT EXISTS identification_issue_date DATE,
    ADD COLUMN IF NOT EXISTS identification_issue_place_id UUID REFERENCES "configuration".cities(id),
    -- Birth place (required for social security affiliation and demographic reports)
ADD COLUMN IF NOT EXISTS birth_place_id UUID REFERENCES "configuration".cities(id),
    -- Alternate phone (optional)
ADD COLUMN IF NOT EXISTS phone_alternate VARCHAR(30),
    -- Residence location (for transport subsidy calculation)
ADD COLUMN IF NOT EXISTS residence_country_id UUID REFERENCES "configuration".countries(id),
    ADD COLUMN IF NOT EXISTS residence_state_id UUID REFERENCES "configuration".states(id),
    ADD COLUMN IF NOT EXISTS residence_city_id UUID REFERENCES "configuration".cities(id),
    -- Socioeconomic stratum (SG-SST Resolution 0312/2019 requirement)
ADD COLUMN IF NOT EXISTS socioeconomic_stratum VARCHAR(10),
    -- '1', '2', '3', '4', '5', '6', 'RURAL'
    -- Clothing sizes (for uniform/dotation)
ADD COLUMN IF NOT EXISTS shirt_size_id UUID REFERENCES business_rrhh.clothing_sizes(id),
    ADD COLUMN IF NOT EXISTS pants_size_id UUID REFERENCES business_rrhh.clothing_sizes(id),
    ADD COLUMN IF NOT EXISTS shoe_size_id UUID REFERENCES business_rrhh.clothing_sizes(id),
    -- Education level
ADD COLUMN IF NOT EXISTS education_level_id UUID REFERENCES business_rrhh.education_levels(id),
    -- PEP - Persona Expuesta Políticamente (SAGRILAFT compliance)
ADD COLUMN IF NOT EXISTS is_pep BOOLEAN DEFAULT FALSE,
    -- Military status (Libreta Militar - optional but tracked)
ADD COLUMN IF NOT EXISTS military_status VARCHAR(30);
-- 'PRIMERA_CLASE', 'SEGUNDA_CLASE', 'PROVISIONAL', 'NO_APLICA', 'PENDIENTE'
-- 3.1 Create employee family nucleus table (for Caja de Compensación benefits)
CREATE TABLE IF NOT EXISTS business_rrhh.employee_family_nucleus (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES business_rrhh.employees(id) ON DELETE CASCADE,
    -- Basic info
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    -- Relationship to employee
    relationship VARCHAR(30) NOT NULL,
    -- 'SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER'
    -- Identification (required for benefits affiliation)
    identification_type_id UUID REFERENCES public.identification_types(id),
    identification_number VARCHAR(30),
    -- Birth info
    birth_date DATE,
    birth_place_id UUID REFERENCES "configuration".cities(id),
    -- Gender
    gender_id UUID REFERENCES "configuration".genders(id),
    -- Status for benefits
    is_beneficiary BOOLEAN DEFAULT FALSE,
    -- Applies for Caja de Compensación benefits
    is_dependent BOOLEAN DEFAULT FALSE,
    -- Financial dependent for tax purposes
    is_emergency_contact BOOLEAN DEFAULT FALSE,
    -- Also serves as emergency contact
    is_primary_contact BOOLEAN DEFAULT FALSE,
    -- Primary emergency contact
    -- Required for affiliation
    affiliation_date DATE,
    affiliation_document_url VARCHAR(500),
    -- MinIO key for supporting doc (civil registry, marriage cert, etc.)
    -- Contact info
    phone VARCHAR(30),
    email VARCHAR(100),
    -- Status
    active BOOLEAN DEFAULT TRUE,
    -- Audit
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);
-- CORRECTION: Add IF NOT EXISTS to prevent SQL Error 42P07
CREATE INDEX IF NOT EXISTS idx_family_nucleus_employee ON business_rrhh.employee_family_nucleus(employee_id);
CREATE INDEX IF NOT EXISTS idx_family_nucleus_relationship ON business_rrhh.employee_family_nucleus(relationship);
CREATE INDEX IF NOT EXISTS idx_family_nucleus_beneficiary ON business_rrhh.employee_family_nucleus(is_beneficiary)
WHERE is_beneficiary = TRUE;
-- 4. Insert default clothing sizes (Colombia standard)
DO $$
DECLARE v_company_id UUID;
BEGIN -- Get first company or create for all companies
FOR v_company_id IN
SELECT id
FROM "security".companies LOOP -- Shirt sizes
INSERT INTO business_rrhh.clothing_sizes (company_id, code, name, category, sort_order)
VALUES (v_company_id, 'XS', 'Extra Small', 'SHIRT', 1),
    (v_company_id, 'S', 'Small', 'SHIRT', 2),
    (v_company_id, 'M', 'Medium', 'SHIRT', 3),
    (v_company_id, 'L', 'Large', 'SHIRT', 4),
    (v_company_id, 'XL', 'Extra Large', 'SHIRT', 5),
    (
        v_company_id,
        'XXL',
        'Doble Extra Large',
        'SHIRT',
        6
    ),
    (
        v_company_id,
        '3XL',
        'Triple Extra Large',
        'SHIRT',
        7
    ) ON CONFLICT DO NOTHING;
-- Pants sizes (Colombia: 28-44)
INSERT INTO business_rrhh.clothing_sizes (company_id, code, name, category, sort_order)
VALUES (v_company_id, '28', 'Talla 28', 'PANTS', 1),
    (v_company_id, '30', 'Talla 30', 'PANTS', 2),
    (v_company_id, '32', 'Talla 32', 'PANTS', 3),
    (v_company_id, '34', 'Talla 34', 'PANTS', 4),
    (v_company_id, '36', 'Talla 36', 'PANTS', 5),
    (v_company_id, '38', 'Talla 38', 'PANTS', 6),
    (v_company_id, '40', 'Talla 40', 'PANTS', 7),
    (v_company_id, '42', 'Talla 42', 'PANTS', 8),
    (v_company_id, '44', 'Talla 44', 'PANTS', 9) ON CONFLICT DO NOTHING;
-- Shoe sizes (Colombia: 35-46)
INSERT INTO business_rrhh.clothing_sizes (company_id, code, name, category, sort_order)
VALUES (v_company_id, '35', 'Talla 35', 'SHOES', 1),
    (v_company_id, '36', 'Talla 36', 'SHOES', 2),
    (v_company_id, '37', 'Talla 37', 'SHOES', 3),
    (v_company_id, '38', 'Talla 38', 'SHOES', 4),
    (v_company_id, '39', 'Talla 39', 'SHOES', 5),
    (v_company_id, '40', 'Talla 40', 'SHOES', 6),
    (v_company_id, '41', 'Talla 41', 'SHOES', 7),
    (v_company_id, '42', 'Talla 42', 'SHOES', 8),
    (v_company_id, '43', 'Talla 43', 'SHOES', 9),
    (v_company_id, '44', 'Talla 44', 'SHOES', 10),
    (v_company_id, '45', 'Talla 45', 'SHOES', 11),
    (v_company_id, '46', 'Talla 46', 'SHOES', 12) ON CONFLICT DO NOTHING;
-- Education levels
INSERT INTO business_rrhh.education_levels (company_id, code, name, sort_order)
VALUES (v_company_id, 'PRIMARIA', 'Primaria', 1),
    (v_company_id, 'BACHILLER', 'Bachillerato', 2),
    (v_company_id, 'TECNICO', 'Técnico', 3),
    (v_company_id, 'TECNOLOGO', 'Tecnólogo', 4),
    (v_company_id, 'PROFESIONAL', 'Profesional', 5),
    (
        v_company_id,
        'ESPECIALIZACION',
        'Especialización',
        6
    ),
    (v_company_id, 'MAESTRIA', 'Maestría', 7),
    (v_company_id, 'DOCTORADO', 'Doctorado', 8) ON CONFLICT DO NOTHING;
END LOOP;
END $$;