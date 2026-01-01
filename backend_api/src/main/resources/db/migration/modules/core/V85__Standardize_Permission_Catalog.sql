-- Migración V85: Limpieza profunda y estandarización del Catálogo de Permisos
DO $$
DECLARE core_id UUID;
rrhh_id UUID;
config_cat_id UUID;
security_cat_id UUID;
employees_cat_id UUID;
company_cat_id UUID;
BEGIN -- 1. Obtener IDs de módulos
SELECT id INTO core_id
FROM configuration.saas_modules
WHERE code = 'CORE'
    OR code = 'ADMIN'
LIMIT 1;
SELECT id INTO rrhh_id
FROM configuration.saas_modules
WHERE code = 'RRHH'
LIMIT 1;
-- 2. Asegurar que las categorías clave existan y obtener sus IDs
-- CORE
INSERT INTO security.permission_categories (name, module_id, order_index, icon, description)
VALUES (
        'Gestión de Empresas',
        core_id,
        10,
        'building',
        'Administración de tenants y configuración corporativa'
    ) ON CONFLICT DO NOTHING;
SELECT id INTO company_cat_id
FROM security.permission_categories
WHERE name = 'Gestión de Empresas'
LIMIT 1;
INSERT INTO security.permission_categories (name, module_id, order_index, icon, description)
VALUES (
        'Seguridad y Accesos',
        core_id,
        30,
        'shield-check',
        'Gestión de roles, permisos y políticas de seguridad'
    ) ON CONFLICT DO NOTHING;
SELECT id INTO security_cat_id
FROM security.permission_categories
WHERE name = 'Seguridad y Accesos'
LIMIT 1;
-- RRHH
INSERT INTO security.permission_categories (name, module_id, order_index, icon, description)
VALUES (
        'Gestión de Empleados',
        rrhh_id,
        10,
        'user-group',
        'Administración de fichas y vida laboral de empleados'
    ) ON CONFLICT DO NOTHING;
SELECT id INTO employees_cat_id
FROM security.permission_categories
WHERE name = 'Gestión de Empleados'
LIMIT 1;
INSERT INTO security.permission_categories (name, module_id, order_index, icon, description)
VALUES (
        'Configuración General RRHH',
        rrhh_id,
        20,
        'settings',
        'Catálogos y parámetros maestros del módulo de RRHH'
    ) ON CONFLICT DO NOTHING;
SELECT id INTO config_cat_id
FROM security.permission_categories
WHERE name = 'Configuración General RRHH'
LIMIT 1;
-- 3. Actualizar MASIVAMENTE los permisos según patrones de nombre (más seguro que el string 'category' antiguo)
-- Empresas
UPDATE security.permissions
SET category_id = company_cat_id
WHERE name LIKE '%COMPANY_%'
    OR name LIKE '%EMPRESA_%';
-- Seguridad
UPDATE security.permissions
SET category_id = security_cat_id
WHERE name LIKE '%ROLE_%'
    OR name LIKE '%PERMISSION_%'
    OR name LIKE '%PERMISO_%';
-- Empleados
UPDATE security.permissions
SET category_id = employees_cat_id
WHERE name LIKE 'RRHH_EMPLOYEE_%'
    OR name LIKE 'EE_%';
-- Configuración RRHH (Sedes, Departamentos, etc.)
UPDATE security.permissions
SET category_id = config_cat_id
WHERE name LIKE 'RRHH_CONFIG_%'
    OR name LIKE 'RRHH_LOCATION_%'
    OR name LIKE 'RRHH_POSITION_%';
-- 4. Estandarizar display_name para TODOS los permisos
UPDATE security.permissions
SET display_name = CASE
        WHEN name LIKE 'RRHH_%' THEN INITCAP(REPLACE(REPLACE(name, 'RRHH_', ''), '_', ' '))
        WHEN name LIKE 'CORE_%' THEN INITCAP(REPLACE(REPLACE(name, 'CORE_', ''), '_', ' '))
        ELSE INITCAP(REPLACE(name, '_', ' '))
    END
WHERE display_name IS NULL
    OR display_name = name;
-- 5. Llenar la descripción si está vacía (usando el nombre amigable)
UPDATE security.permissions
SET description = 'Permite realizar operaciones de ' || LOWER(display_name) || ' en la plataforma.'
WHERE description IS NULL
    OR description = '';
END $$;