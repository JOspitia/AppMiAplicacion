-- Migración para corregir la distinción entre Ubicaciones (Sync) y Sedes (Gestión RRHH)
-- Ubicaciones (Administración) -> /core/management/locations (GeoSyncComponent)
-- Sedes (Recursos Humanos) -> /rrhh/sedes (LocationListComponent)
-- 1. Asegurar que "Ubicaciones" bajo Administración apunte al componente de Sync
UPDATE configuration.sidebar_menu
SET url = '/core/management/locations',
    title = 'Ubicaciones',
    icon = 'globe'
WHERE title = 'Ubicaciones'
    OR url = '/core/management/locations';
-- 2. Asegurar que existe "Sedes" bajo Recursos Humanos -> Configuración
-- Primero buscamos el ID de Recursos Humanos -> Configuración
DO $$
DECLARE rrhh_id UUID;
config_id UUID;
mod_id UUID;
BEGIN -- Obtener ID del módulo RRHH
SELECT id INTO mod_id
FROM configuration.saas_modules
WHERE code = 'MOD_RRHH'
LIMIT 1;
-- Obtener ID del menú Recursos Humanos
SELECT id INTO rrhh_id
FROM configuration.sidebar_menu
WHERE title = 'Recursos Humanos'
    AND parent_id IS NOT NULL
LIMIT 1;
-- Obtener o Crear ID del menú Configuración bajo RRHH
SELECT id INTO config_id
FROM configuration.sidebar_menu
WHERE title = 'Configuración'
    AND parent_id = rrhh_id
LIMIT 1;
IF config_id IS NULL THEN
INSERT INTO configuration.sidebar_menu (
        id,
        title,
        url,
        parent_id,
        order_index,
        icon,
        active,
        module_id,
        permission_required
    )
VALUES (
        gen_random_uuid(),
        'Configuración',
        '/rrhh/settings',
        rrhh_id,
        99,
        'cog',
        true,
        mod_id,
        'RRHH_CONFIG_VIEW'
    )
RETURNING id INTO config_id;
END IF;
-- Actualizar o Insertar "Sedes"
-- Si ya existe una "Sedes" o "Ubicaciones" errónea bajo RRHH, la corregimos
IF EXISTS (
    SELECT 1
    FROM configuration.sidebar_menu
    WHERE (
            title = 'Sedes'
            OR title = 'Ubicaciones'
        )
        AND (
            parent_id = config_id
            OR parent_id = rrhh_id
        )
) THEN
UPDATE configuration.sidebar_menu
SET title = 'Sedes',
    url = '/rrhh/sedes',
    parent_id = config_id,
    icon = 'map-pin',
    permission_required = 'RRHH_CONFIG_VIEW'
WHERE (
        title = 'Sedes'
        OR title = 'Ubicaciones'
    )
    AND (
        parent_id = config_id
        OR parent_id = rrhh_id
    );
ELSE
INSERT INTO configuration.sidebar_menu (
        id,
        title,
        url,
        parent_id,
        order_index,
        icon,
        active,
        module_id,
        permission_required
    )
VALUES (
        gen_random_uuid(),
        'Sedes',
        '/rrhh/sedes',
        config_id,
        10,
        'map-pin',
        true,
        mod_id,
        'RRHH_CONFIG_VIEW'
    );
END IF;
END $$;