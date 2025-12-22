-- V49__parameterize_rrhh_permissions.sql
-- Description: Separate permissions for Locations (Sedes) and Organizational Levels for granular control.
-- 1. Insert New Permissions for Locations (Sedes)
WITH module_rrhh AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'MOD_RRHH'
    LIMIT 1
)
INSERT INTO security.permissions (id, name, description, module_id, category)
SELECT gen_random_uuid(),
    'RRHH_LOCATION_VIEW',
    'Ver sedes y ubicaciones',
    id,
    'VIEW'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_LOCATION_EDIT',
    'Gestionar (Crear/Editar) sedes',
    id,
    'ACTION'
FROM module_rrhh ON CONFLICT (name) DO NOTHING;
-- 2. Insert New Permissions for Organizational Levels
WITH module_rrhh AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'MOD_RRHH'
    LIMIT 1
)
INSERT INTO security.permissions (id, name, description, module_id, category)
SELECT gen_random_uuid(),
    'RRHH_ORGLEVEL_VIEW',
    'Ver niveles organizacionales',
    id,
    'VIEW'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_ORGLEVEL_EDIT',
    'Gestionar niveles organizacionales',
    id,
    'ACTION'
FROM module_rrhh ON CONFLICT (name) DO NOTHING;
-- 3. Update Sidebar Menu to require specific permissions
-- Update 'Sedes' menu to require RRHH_LOCATION_VIEW
UPDATE configuration.sidebar_menu
SET permission_required = 'RRHH_LOCATION_VIEW'
WHERE url = '/rrhh/locations';
-- Update 'Niveles Organizacionales' menu to require RRHH_ORGLEVEL_VIEW
UPDATE configuration.sidebar_menu
SET permission_required = 'RRHH_ORGLEVEL_VIEW'
WHERE url = '/rrhh/organizational-levels';