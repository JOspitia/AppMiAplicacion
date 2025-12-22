-- V52__add_missing_employee_view_permissions.sql
-- Description: Add VIEW permissions for Employee Personal, Contract, and Job buckets.
--              Required to satisfy role assignment integrity checks that expect a VIEW permission for every EDIT permission.
WITH module_rrhh AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'MOD_RRHH'
    LIMIT 1
)
INSERT INTO security.permissions (id, name, description, module_id, category)
SELECT gen_random_uuid(),
    'RRHH_EMPLOYEE_PERSONAL_VIEW',
    'Ver datos personales de empleados',
    id,
    'VIEW'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_EMPLOYEE_CONTRACT_VIEW',
    'Ver datos contractuales de empleados',
    id,
    'VIEW'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_EMPLOYEE_JOB_VIEW',
    'Ver datos corporativos de empleados',
    id,
    'VIEW'
FROM module_rrhh ON CONFLICT (name) DO NOTHING;