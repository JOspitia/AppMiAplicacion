-- Migración V84: Reestructuración de Categorías de Permisos y Catálogo de Permisos
-- 1. Crear tabla de categorías de permisos para permitir organización modulo -> categoria -> permiso
CREATE TABLE security.permission_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES configuration.saas_modules(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    order_index INT DEFAULT 0,
    icon VARCHAR(50),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 2. Agregar campos nuevos a permissions
ALTER TABLE security.permissions
ADD COLUMN category_id UUID REFERENCES security.permission_categories(id),
    ADD COLUMN display_name VARCHAR(150);
-- 3. Crear categorías iniciales basadas en el estado actual
-- Primero necesitamos los IDs de los módulos
-- Asumimos que existen 'core' y 'rrhh' (o similar)
DO $$
DECLARE core_id UUID;
rrhh_id UUID;
cat_id UUID;
BEGIN
SELECT id INTO core_id
FROM configuration.saas_modules
WHERE code = 'CORE'
    OR code = 'ADMIN'
LIMIT 1;
SELECT id INTO rrhh_id
FROM configuration.saas_modules
WHERE code = 'RRHH'
LIMIT 1;
-- Categorías para CORE
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Gestión de Empresas', core_id, 10, 'building')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE category = 'Gestión de Empresas';
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Gestión de Usuarios', core_id, 20, 'users')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE category = 'Gestión de Usuarios';
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES (
        'Seguridad y Accesos',
        core_id,
        30,
        'shield-check'
    )
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE category = 'Seguridad y Accesos';
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Auditoría y Logs', core_id, 40, 'list-ordered')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE category = 'Auditoría y Logs';
-- Categorías para RRHH
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES (
        'Gestión de Empleados',
        rrhh_id,
        10,
        'user-group'
    )
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE category = 'Gestión de Empleados';
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES (
        'Configuración General RRHH',
        rrhh_id,
        20,
        'settings'
    )
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE category = 'Configuración General RRHH';
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Cargos y Posiciones', rrhh_id, 30, 'briefcase')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE category = 'Cargos y Posiciones';
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES (
        'Compensación y Beneficios',
        rrhh_id,
        40,
        'credit-card'
    )
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE category = 'Compensación y Beneficios';
-- Permisos para el nuevo Catálogo de Permisos
INSERT INTO security.permissions (
        id,
        name,
        description,
        display_name,
        category_id,
        is_system,
        module_id
    )
VALUES (
        gen_random_uuid(),
        'CORE_PERMISSIONS_VIEW',
        'Permite ver el catálogo completo de permisos del sistema',
        'Ver Catálogo de Permisos',
        (
            SELECT id
            FROM security.permission_categories
            WHERE name = 'Seguridad y Accesos'
            LIMIT 1
        ), true,
        core_id
    ),
    (
        gen_random_uuid(),
        'CORE_PERMISSIONS_EDIT',
        'Permite editar metadatos del catálogo de permisos',
        'Gestionar Catálogo de Permisos',
        (
            SELECT id
            FROM security.permission_categories
            WHERE name = 'Seguridad y Accesos'
            LIMIT 1
        ), true,
        core_id
    );
-- Asegurar que el menú apunte a la ruta correcta y tenga el permiso
UPDATE configuration.sidebar_menu
SET url = '/core/permissions/catalog',
    permission_required = 'CORE_PERMISSIONS_VIEW',
    icon = 'key'
WHERE title = 'Permisos'
    AND url LIKE '%permissions%';
-- Poblar display_name inicial si está vacío
UPDATE security.permissions
SET display_name = INITCAP(REPLACE(REPLACE(name, 'CORE_', ''), '_', ' '))
WHERE display_name IS NULL;
END $$;
-- 4. Limpiar columna category obsoleta (opcional, la dejamos un tiempo pero la marcamos)
COMMENT ON COLUMN security.permissions.category IS 'Obsoleto: usar category_id de la tabla permission_categories';