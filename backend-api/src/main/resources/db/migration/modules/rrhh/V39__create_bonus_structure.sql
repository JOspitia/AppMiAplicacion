-- ====================================================================================
-- DDL SEGURO: Creación de Tablas de Compensación (Copiado de la versión previa final)
-- ====================================================================================
-- Crear tabla Maestra de Tipos de Compensación (Salarial vs No Salarial)
CREATE TABLE IF NOT EXISTS business_rrhh.compensation_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    -- Código debe ser NOT NULL para el ON CONFLICT
    description TEXT,
    is_salary BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    is_read_only BOOLEAN DEFAULT FALSE,
    -- Flag para proteger registros del sistema
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_compensation_types_company FOREIGN KEY (company_id) REFERENCES security.companies(id),
    -- **NUEVO:** Índice único por (CODE, COMPANY_ID) para SEEDING seguro
    CONSTRAINT uq_comp_type_code_company UNIQUE (code, company_id)
);
-- Crear tabla de Bonificaciones por Empleado (Detalle)
CREATE TABLE IF NOT EXISTS business_rrhh.employee_bonuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    compensation_type_id UUID NOT NULL,
    cost_center_id UUID,
    amount NUMERIC(19, 2),
    percentage NUMERIC(5, 2),
    currency_id UUID,
    periodicity VARCHAR(50) NOT NULL,
    start_date DATE,
    end_date DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_employee_bonuses_employee FOREIGN KEY (employee_id) REFERENCES business_rrhh.employees(id),
    CONSTRAINT fk_employee_bonuses_type FOREIGN KEY (compensation_type_id) REFERENCES business_rrhh.compensation_types(id),
    CONSTRAINT fk_employee_bonuses_currency FOREIGN KEY (currency_id) REFERENCES configuration.currencies(id),
    -- Usé business_core.cost_centers antes, pero sigo tu última referencia:
    CONSTRAINT fk_employee_bonuses_cost_center FOREIGN KEY (cost_center_id) REFERENCES business_rrhh.cost_centers(id)
);
-- Crear Índices Seguros
CREATE INDEX IF NOT EXISTS idx_compensation_types_company ON business_rrhh.compensation_types(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_bonuses_employee ON business_rrhh.employee_bonuses(employee_id);
-- 3. PERMISOS: Creación de permisos específicos
-- ====================================================================================
WITH module_data AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'MOD_RRHH'
    LIMIT 1
)
INSERT INTO security.permissions (id, name, description, module_id, category)
SELECT gen_random_uuid(),
    'RRHH_COMPENSATION_VIEW',
    'Ver tipos de bonificación',
    id,
    'VIEW'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_COMPENSATION_EDIT',
    'Administrar tipos de bonificación',
    id,
    'ACTION'
FROM module_data ON CONFLICT (name) DO NOTHING;
-- ====================================================================================
-- 4. SCRIPT: Inserción de 'Tipos de Bonos' en el Menú Lateral
-- ====================================================================================
-- 1. Insertar o verificar el Ícono
INSERT INTO configuration.icons (id, name, svg_content)
VALUES (
        gen_random_uuid(),
        'currency-dollar',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>'
    ) ON CONFLICT (name) DO NOTHING;
-- 2. Insertar el Elemento del Menú Lateral
WITH config_parent AS (
    SELECT id
    FROM configuration.sidebar_menu
    WHERE title = 'Configuración'
        AND url = '/rrhh/settings'
    LIMIT 1
), module_id AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'MOD_RRHH'
    LIMIT 1
)
INSERT INTO configuration.sidebar_menu (
        title,
        url,
        parent_id,
        order_index,
        icon,
        module_id,
        permission_required,
        active
    )
SELECT 'Tipos de Bonos',
    '/rrhh/compensation-types',
    cp.id,
    90,
    'currency-dollar',
    m.id,
    'RRHH_COMPENSATION_VIEW',
    true
FROM config_parent cp,
    module_id m ON CONFLICT (title, url) DO NOTHING;