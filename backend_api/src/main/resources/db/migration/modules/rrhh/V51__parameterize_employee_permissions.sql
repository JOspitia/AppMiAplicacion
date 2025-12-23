-- V51__parameterize_employee_permissions.sql
-- Description: Parameterize Employee permissions into Personal, Contract, and Corporate buckets.
--              Add granular permissions and update role mappings.
WITH module_rrhh AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'MOD_RRHH'
    LIMIT 1
)
INSERT INTO security.permissions (id, name, description, module_id, category)
SELECT gen_random_uuid(),
    'RRHH_EMPLOYEE_PERSONAL_EDIT',
    'Gestionar datos personales de empleados',
    id,
    'ACTION'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_EMPLOYEE_CONTRACT_EDIT',
    'Gestionar datos contractuales de empleados',
    id,
    'ACTION'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_EMPLOYEE_JOB_EDIT',
    'Gestionar datos corporativos (Cargo, Salario) de empleados',
    id,
    'ACTION'
FROM module_rrhh ON CONFLICT (name) DO NOTHING;
-- Note: We are keeping generic RRHH_EMPLOYEE_VIEW/CREATE/EDIT for backward compatibility or high-level access if needed,
-- but the specific buckets below will be enforced in the Wizard steps.