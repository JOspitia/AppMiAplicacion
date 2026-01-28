-- Ensure education_levels exists (Fix for missing table)
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

CREATE INDEX IF NOT EXISTS idx_education_levels_company ON business_rrhh.education_levels(company_id);

-- Insert default values if empty
DO $$
DECLARE v_company_id UUID;
BEGIN 
    FOR v_company_id IN SELECT id FROM "security".companies LOOP 
        INSERT INTO business_rrhh.education_levels (company_id, code, name, sort_order)
        VALUES 
            (v_company_id, 'PRIMARIA', 'Primaria', 1),
            (v_company_id, 'BACHILLER', 'Bachillerato', 2),
            (v_company_id, 'TECNICO', 'Técnico', 3),
            (v_company_id, 'TECNOLOGO', 'Tecnólogo', 4),
            (v_company_id, 'PROFESIONAL', 'Profesional', 5),
            (v_company_id, 'ESPECIALIZACION', 'Especialización', 6),
            (v_company_id, 'MAESTRIA', 'Maestría', 7),
            (v_company_id, 'DOCTORADO', 'Doctorado', 8) 
        ON CONFLICT DO NOTHING;
    END LOOP;
END $$;

-- Create employee_educations table
CREATE TABLE business_rrhh.employee_educations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    education_level_id UUID NOT NULL,
    institution VARCHAR(255) NOT NULL,
    title_obtained VARCHAR(255) NOT NULL,
    current_semester INTEGER,
    phone VARCHAR(50),
    city_id UUID,
    start_year INTEGER,
    end_year INTEGER,
    hours INTEGER,
    attachment_url VARCHAR(500),
    
    -- Audit columns
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT fk_employee_edu_employee FOREIGN KEY (employee_id) REFERENCES business_rrhh.employees (id) ON DELETE CASCADE,
    CONSTRAINT fk_employee_edu_level FOREIGN KEY (education_level_id) REFERENCES business_rrhh.education_levels (id),
    CONSTRAINT fk_employee_edu_city FOREIGN KEY (city_id) REFERENCES "configuration".cities (id)
);

CREATE INDEX idx_employee_edu_employee ON business_rrhh.employee_educations(employee_id);
CREATE INDEX idx_employee_edu_level ON business_rrhh.employee_educations(education_level_id);

COMMENT ON TABLE business_rrhh.employee_educations IS 'Stores academic history/degrees of an employee';
