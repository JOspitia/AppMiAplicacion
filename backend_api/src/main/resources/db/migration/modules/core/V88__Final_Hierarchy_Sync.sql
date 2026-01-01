-- Migración V88: Reestructuración Detallada de Categorías de RRHH
-- Propósito: Separar la categoría "Otros" en grupos funcionales específicos según la solicitud del usuario
DO $$
DECLARE core_id UUID;
rrhh_id UUID;
cat_id UUID;
BEGIN -- 1. Obtener IDs reales dinámicamente
SELECT id INTO core_id
FROM configuration.saas_modules
WHERE code = 'CORE_PLATFORM'
    OR name ILIKE '%Plataforma%'
LIMIT 1;
SELECT id INTO rrhh_id
FROM configuration.saas_modules
WHERE code = 'MOD_RRHH'
    OR name ILIKE '%Recursos Humanos%'
LIMIT 1;
-- 2. Limpiar categorías anteriores para reconstruir según el nuevo esquema solicitado
UPDATE security.permissions
SET category_id = NULL;
DELETE FROM security.permission_categories;
---------------------------------------------------------------------------
-- CATEGORÍAS CORE
---------------------------------------------------------------------------
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Empresas', core_id, 10, 'building')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE name LIKE 'CORE_COMPANY_%';
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Usuarios', core_id, 20, 'users')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE name LIKE 'CORE_USER_%';
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Roles y Perfiles', core_id, 30, 'shield')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE name LIKE 'CORE_ROLE_%';
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Permisos', core_id, 40, 'key')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE name LIKE 'CORE_PERMISSION%';
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Administración', core_id, 60, 'gauge')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE name IN (
        'CORE_ADMINISTRATION_VIEW',
        'CORE_MANAGEMENT_VIEW'
    );
---------------------------------------------------------------------------
-- CATEGORÍAS RRHH (BASADAS EN SOLICITUD DE USUARIO)
---------------------------------------------------------------------------
-- 1. Sistema RRHH
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Sistema RRHH', rrhh_id, 5, 'cog')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE display_name IN (
        'Ver configuración de RRHH',
        'Gestionar configuración de RRHH',
        'Acceso al módulo de RRHH'
    );
-- 2. RRHH Empleados
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('RRHH Empleados', rrhh_id, 10, 'user-group')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE display_name IN (
        'Ver datos contractuales de empleados',
        'Ver datos corporativos de empleados',
        'Ver datos personales de empleados',
        'Ver directorio de empleados',
        'Gestionar datos contractuales de empleados',
        'Crear registros de empleados',
        'Editar información de empleados',
        'Gestionar datos personales de empleados'
    )
    OR name LIKE 'EMPLOYEE_%';
-- 3. RRHH Bonificaciones
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('RRHH Bonificaciones', rrhh_id, 20, 'gift')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE display_name IN (
        'Ver tipos de bonificación',
        'Administrar tipos de bonificación'
    )
    OR name LIKE 'RRHH_BONUS%'
    OR name LIKE 'RRHH_COMP_TYPE%';
-- 4. RRHH Documentos Soporte
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES (
        'RRHH Documentos Soporte',
        rrhh_id,
        30,
        'clipboard-list'
    )
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE display_name IN (
        'Ver tipos de documento/soporte',
        'Gestionar tipos de documento/soporte'
    )
    OR name LIKE 'RRHH_DOC_TYPE%';
-- 5. RRHH Niveles Organizacionales
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES (
        'RRHH Niveles Organizacionales',
        rrhh_id,
        40,
        'sitemap'
    )
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE display_name IN (
        'Ver niveles organizacionales',
        'Gestionar niveles organizacionales'
    )
    OR name LIKE 'RRHH_ORG_LEVEL%';
-- 6. RRHH Horarios Laborales
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('RRHH Horarios Laborales', rrhh_id, 50, 'clock')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE display_name IN (
        'Ver horarios laborales',
        'Crear horarios laborales',
        'Eliminar horarios laborales',
        'Editar horarios laborales'
    )
    OR name LIKE 'RRHH_WORK_%';
-- 7. RRHH Cargos y Salarios
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES (
        'RRHH Cargos y Salarios',
        rrhh_id,
        60,
        'briefcase'
    )
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE display_name IN (
        'Gestionar datos corporativos (Cargo, Salario) de empleados'
    )
    OR name LIKE 'RRHH_POS%';
-- 8. Sedes / Ubicaciones RRHH
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('RRHH Sedes', rrhh_id, 70, 'map-pin')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE name LIKE 'RRHH_SED%'
    OR name LIKE 'RRHH_LOC%';
-- 9. Otros (Fallback)
IF EXISTS (
    SELECT 1
    FROM security.permissions
    WHERE category_id IS NULL
) THEN
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Otros', core_id, 999, 'dots-horizontal')
RETURNING id INTO cat_id;
UPDATE security.permissions
SET category_id = cat_id
WHERE category_id IS NULL;
END IF;
END $$;