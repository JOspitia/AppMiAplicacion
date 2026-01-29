-- Add is_current to employee_work_experiences
ALTER TABLE business_rrhh.employee_work_experiences
ADD COLUMN is_current BOOLEAN DEFAULT FALSE;

-- Create employee_references table
CREATE TABLE business_rrhh.employee_references (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    reference_type VARCHAR(50) NOT NULL, -- 'LABORAL', 'PERSONAL', etc.
    name VARCHAR(255) NOT NULL,
    occupation VARCHAR(255), -- 'Cargo' or 'Título'
    company VARCHAR(150),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    attachment_url VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_employee_references_employee FOREIGN KEY (employee_id) REFERENCES business_rrhh.employees (id) ON DELETE CASCADE
);

CREATE INDEX idx_employee_references_employee_id ON business_rrhh.employee_references (employee_id);
