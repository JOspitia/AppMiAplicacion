-- V50__parameterize_remaining_rrhh_permissions.sql
-- Description: Add granular permissions for Contract Types, Cost Centers, Positions, and Document Types.
--              Update sidebar menu to require these new permissions.
WITH module_rrhh AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'MOD_RRHH'
    LIMIT 1
)
INSERT INTO security.permissions (id, name, description, module_id, category)
SELECT gen_random_uuid(),
    'RRHH_CONTRACT_TYPE_VIEW',
    'Ver tipos de contrato',
    id,
    'VIEW'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_CONTRACT_TYPE_EDIT',
    'Gestionar tipos de contrato',
    id,
    'ACTION'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_COST_CENTER_VIEW',
    'Ver centros de costos',
    id,
    'VIEW'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_COST_CENTER_EDIT',
    'Gestionar centros de costos',
    id,
    'ACTION'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_POSITION_VIEW',
    'Ver cargos y posiciones',
    id,
    'VIEW'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_POSITION_EDIT',
    'Gestionar cargos y posiciones',
    id,
    'ACTION'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_DOCTYPE_VIEW',
    'Ver tipos de documento/soporte',
    id,
    'VIEW'
FROM module_rrhh
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_DOCTYPE_EDIT',
    'Gestionar tipos de documento/soporte',
    id,
    'ACTION'
FROM module_rrhh ON CONFLICT (name) DO NOTHING;
-- Update Sidebar Menu Permissions
-- Tipos de Contrato
UPDATE configuration.sidebar_menu
SET permission_required = 'RRHH_CONTRACT_TYPE_VIEW'
WHERE url = '/rrhh/contract-types';
-- Centros de Costos
UPDATE configuration.sidebar_menu
SET permission_required = 'RRHH_COST_CENTER_VIEW'
WHERE url = '/rrhh/cost-centers';
-- Cargos (Positions)
UPDATE configuration.sidebar_menu
SET permission_required = 'RRHH_POSITION_VIEW'
WHERE url = '/rrhh/positions';
-- Tipos de Documento (Tipos de Soporte)
UPDATE configuration.sidebar_menu
SET permission_required = 'RRHH_DOCTYPE_VIEW'
WHERE url = '/rrhh/document-types';