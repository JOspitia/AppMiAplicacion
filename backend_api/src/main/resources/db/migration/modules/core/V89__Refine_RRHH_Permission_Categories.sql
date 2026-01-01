-- Migración V89: Refinamiento de Categorías RRHH (Limpieza de Duplicados e Idempotencia)
-- Propósito: Nombres limpios e iconos compatibles eliminando duplicados previos
DO $$
DECLARE core_id UUID;
rrhh_id UUID;
cat_sistema UUID;
cat_bonos UUID;
cat_docs UUID;
cat_empleados UUID;
cat_niveles UUID;
cat_horarios UUID;
cat_cargos UUID;
cat_sedes UUID;
BEGIN -- 1. Obtener IDs de módulos
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
-- 2. LIMPIEZA DE DUPLICADOS (Crucial para que el UNIQUE constraint no falle)
-- Si hay varias categorías con el mismo nombre y módulo, consolidamos todo en una
WITH duplicates AS (
    SELECT id,
        ROW_NUMBER() OVER (
            PARTITION BY name,
            module_id
            ORDER BY created_at DESC
        ) as row_num
    FROM security.permission_categories
),
to_delete AS (
    SELECT id
    FROM duplicates
    WHERE row_num > 1
)
UPDATE security.permissions
SET category_id = NULL
WHERE category_id IN (
        SELECT id
        FROM to_delete
    );
DELETE FROM security.permission_categories
WHERE id IN (
        SELECT id
        FROM (
                SELECT id,
                    ROW_NUMBER() OVER (
                        PARTITION BY name,
                        module_id
                        ORDER BY created_at DESC
                    ) as row_num
                FROM security.permission_categories
            ) t
        WHERE t.row_num > 1
    );
-- 3. Asegurar índice único para ON CONFLICT
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_category_name_module'
) THEN
ALTER TABLE security.permission_categories
ADD CONSTRAINT uq_category_name_module UNIQUE (name, module_id);
END IF;
-- 4. Crear o Actualizar categorías con nombres limpios
-- Sistema
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Sistema', rrhh_id, 5, 'settings') ON CONFLICT (name, module_id) DO
UPDATE
SET icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index
RETURNING id INTO cat_sistema;
-- Bonificaciones
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Bonificaciones', rrhh_id, 20, 'gift') ON CONFLICT (name, module_id) DO
UPDATE
SET icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index
RETURNING id INTO cat_bonos;
-- Documentos Soporte
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Documentos Soporte', rrhh_id, 30, 'clipboard') ON CONFLICT (name, module_id) DO
UPDATE
SET icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index
RETURNING id INTO cat_docs;
-- Empleados
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Empleados', rrhh_id, 10, 'users') ON CONFLICT (name, module_id) DO
UPDATE
SET icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index
RETURNING id INTO cat_empleados;
-- Niveles Organizacionales
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES (
        'Niveles Organizacionales',
        rrhh_id,
        40,
        'sitemap'
    ) ON CONFLICT (name, module_id) DO
UPDATE
SET icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index
RETURNING id INTO cat_niveles;
-- Horarios Laborales
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Horarios Laborales', rrhh_id, 50, 'clock') ON CONFLICT (name, module_id) DO
UPDATE
SET icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index
RETURNING id INTO cat_horarios;
-- Cargos y Salarios
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Cargos y Salarios', rrhh_id, 60, 'briefcase') ON CONFLICT (name, module_id) DO
UPDATE
SET icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index
RETURNING id INTO cat_cargos;
-- Sedes
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Sedes', rrhh_id, 70, 'map-pin') ON CONFLICT (name, module_id) DO
UPDATE
SET icon = EXCLUDED.icon,
    order_index = EXCLUDED.order_index
RETURNING id INTO cat_sedes;
-- 5. MOVIMIENTO DE PERMISOS
-- Desvincular de categorías RRHH antiguas que vamos a borrar
UPDATE security.permissions
SET category_id = NULL
WHERE category_id IN (
        SELECT id
        FROM security.permission_categories
        WHERE name LIKE 'RRHH %'
            OR name = 'Sistema RRHH'
            OR name = 'Otros'
    );
-- Mapeo final dinámico
UPDATE security.permissions
SET category_id = cat_bonos
WHERE (
        name LIKE 'RRHH_BONUS%'
        OR name LIKE 'RRHH_COMP_TYPE%'
        OR display_name ILIKE '%bonificaci%'
    );
UPDATE security.permissions
SET category_id = cat_sistema
WHERE (
        name IN (
            'RRHH_CONFIG_VIEW',
            'RRHH_CONFIG_EDIT',
            'MOD_RRHH_ACCESS'
        )
        OR display_name ILIKE '%configuración de RRHH%'
        OR display_name ILIKE '%módulo de RRHH%'
    );
UPDATE security.permissions
SET category_id = cat_docs
WHERE (
        name LIKE 'RRHH_DOC_TYPE%'
        OR display_name ILIKE '%documento/soporte%'
    );
UPDATE security.permissions
SET category_id = cat_empleados
WHERE (
        name LIKE 'EMPLOYEE_%'
        OR name LIKE 'RRHH_EMP_%'
        OR display_name ILIKE '%empleado%'
        OR display_name ILIKE '%directorio%'
    );
UPDATE security.permissions
SET category_id = cat_niveles
WHERE (
        name LIKE 'RRHH_ORG_LEVEL%'
        OR display_name ILIKE '%niveles organizacionales%'
    );
UPDATE security.permissions
SET category_id = cat_horarios
WHERE (
        name LIKE 'RRHH_WORK_%'
        OR display_name ILIKE '%horarios laborales%'
    );
UPDATE security.permissions
SET category_id = cat_cargos
WHERE (
        name LIKE 'RRHH_POS%'
        OR display_name ILIKE '%corporativos (Cargo, Salario)%'
    );
UPDATE security.permissions
SET category_id = cat_sedes
WHERE (
        name LIKE 'RRHH_SED%'
        OR name LIKE 'RRHH_LOC%'
    );
-- 6. LIMPIEZA FINAL
DELETE FROM security.permission_categories
WHERE (
        name LIKE 'RRHH %'
        OR name = 'Sistema RRHH'
        OR name = 'Otros'
    )
    AND id NOT IN (
        SELECT DISTINCT category_id
        FROM security.permissions
        WHERE category_id IS NOT NULL
    );
END $$;