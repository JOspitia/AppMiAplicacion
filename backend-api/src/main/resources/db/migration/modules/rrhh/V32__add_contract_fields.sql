-- 1. CREATE TABLES & COLUMNS 
-- Crear tabla work_schedules
CREATE TABLE IF NOT EXISTS business_rrhh.work_schedules (
    id UUID PRIMARY KEY,
    company_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schedule_type VARCHAR(50) NOT NULL,
    -- 'WEEKLY', 'CYCLICAL'
    cycle_length_days INT DEFAULT 7,
    tolerance_minutes INT DEFAULT 0,
    -- NEW: Grace period
    color VARCHAR(7) DEFAULT '#3B82F6',
    -- NEW: Hex color for calendar visualization
    max_weekly_hours INT DEFAULT 46,
    -- NEW: Target legal hours for this schedule
    total_weekly_hours NUMERIC(5, 2),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_work_schedules_company FOREIGN KEY (company_id) REFERENCES security.companies(id)
);
-- Crear tabla work_schedule_days
CREATE TABLE IF NOT EXISTS business_rrhh.work_schedule_days (
    id UUID PRIMARY KEY,
    work_schedule_id UUID NOT NULL,
    day_number INT NOT NULL,
    is_rest_day BOOLEAN DEFAULT FALSE,
    start_time TIME,
    end_time TIME,
    is_next_day BOOLEAN DEFAULT FALSE,
    -- NEW: Overnight shift flag
    break_minutes INT DEFAULT 60,
    CONSTRAINT fk_schedule_days_header FOREIGN KEY (work_schedule_id) REFERENCES business_rrhh.work_schedules(id)
);
-- Agregar columnas a employee_contracts
ALTER TABLE business_rrhh.employee_contracts
ADD COLUMN IF NOT EXISTS probation_end_date DATE,
    ADD COLUMN IF NOT EXISTS execution_city VARCHAR(255),
    ADD COLUMN IF NOT EXISTS work_schedule_id UUID;
-- Agregar Constraint
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_contract_work_schedule'
) THEN
ALTER TABLE business_rrhh.employee_contracts
ADD CONSTRAINT fk_contract_work_schedule FOREIGN KEY (work_schedule_id) REFERENCES business_rrhh.work_schedules(id);
END IF;
END $$;
-- 2. PERMISSIONS
WITH module_data AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'MOD_RRHH'
    LIMIT 1
)
INSERT INTO security.permissions (id, name, description, module_id, category)
SELECT gen_random_uuid(),
    'RRHH_WORK_SCHEDULE_VIEW',
    'Ver horarios laborales',
    id,
    'VIEW'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_WORK_SCHEDULE_CREATE',
    'Crear horarios laborales',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_WORK_SCHEDULE_EDIT',
    'Editar horarios laborales',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_WORK_SCHEDULE_DELETE',
    'Eliminar horarios laborales',
    id,
    'ACTION'
FROM module_data ON CONFLICT (name) DO NOTHING;
-- 3. ICONS
INSERT INTO configuration.icons (id, name, svg_content)
VALUES (
        gen_random_uuid(),
        'clock',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
    ) ON CONFLICT (name) DO NOTHING;
-- 4. SIDEBAR MENU
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
        id,
        title,
        url,
        parent_id,
        order_index,
        icon,
        module_id,
        permission_required,
        active
    )
VALUES (
        gen_random_uuid(),
        'Horarios Laborales',
        '/rrhh/settings/work-schedules',
        (
            SELECT id
            FROM config_parent
        ),
        75,
        'clock',
        (
            SELECT id
            FROM module_id
        ),
        'RRHH_WORK_SCHEDULE_VIEW',
        true
    ) ON CONFLICT (title, url) DO
UPDATE
SET parent_id = EXCLUDED.parent_id,
    module_id = EXCLUDED.module_id,
    permission_required = EXCLUDED.permission_required;