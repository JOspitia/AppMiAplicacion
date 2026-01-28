CREATE TABLE business_rrhh.employee_work_experiences (
    id UUID PRIMARY KEY,
    employee_id UUID NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    position_held VARCHAR(255) NOT NULL,
    immediate_supervisor VARCHAR(255) NOT NULL,
    company_phone VARCHAR(50),
    start_date DATE NOT NULL,
    end_date DATE,
    functions TEXT,
    attachment_url VARCHAR(500),
    
    -- Audit columns
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT fk_work_exp_employee FOREIGN KEY (employee_id) REFERENCES business_rrhh.employees (id) ON DELETE CASCADE
);

CREATE INDEX idx_work_exp_employee ON business_rrhh.employee_work_experiences(employee_id);
