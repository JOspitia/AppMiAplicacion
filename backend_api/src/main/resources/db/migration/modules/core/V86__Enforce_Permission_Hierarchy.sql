-- Migración V86: Normalización final de la jerarquía Módulo -> Categoría -> Permiso
DO $$
DECLARE core_id UUID;
rrhh_id UUID;
BEGIN -- 1. Obtener IDs correctos de los módulos
SELECT id INTO core_id
FROM configuration.saas_modules
WHERE code = 'CORE'
    OR code = 'ADMIN'
LIMIT 1;
SELECT id INTO rrhh_id
FROM configuration.saas_modules
WHERE code = 'RRHH'
LIMIT 1;
-- 2. Asegurar que TODAS las categorías tengan su module_id poblado
-- Categorías de CORE
UPDATE security.permission_categories
SET module_id = core_id
WHERE name IN (
        'Gestión de Empresas',
        'Gestión de Usuarios',
        'Seguridad y Accesos',
        'Auditoría y Logs'
    )
    AND module_id IS NULL;
-- Categorías de RRHH
UPDATE security.permission_categories
SET module_id = rrhh_id
WHERE name IN (
        'Gestión de Empleados',
        'Configuración General RRHH',
        'Cargos y Posiciones',
        'Compensación y Beneficios'
    )
    AND module_id IS NULL;
-- 3. Fallback: Si hay categorías sin módulo decididas por los permisos que contienen
UPDATE security.permission_categories pc
SET module_id = p.module_id
FROM security.permissions p
WHERE p.category_id = pc.id
    AND pc.module_id IS NULL
    AND p.module_id IS NULL;
END $$;
-- 4. Eliminar la columna module_id de security.permissions 
-- Ya no es necesaria porque el permiso pertenece a una categoría, y la categoría al módulo.
ALTER TABLE security.permissions DROP COLUMN IF EXISTS module_id;
-- 5. Limpiar registros que hayan quedado huérfanos de categoría (opcionamente mover a una categoría 'General')
-- Esto previene errores de visualización en el catálogo.
DO $$
DECLARE gen_cat_id UUID;
core_id UUID;
BEGIN
SELECT id INTO core_id
FROM configuration.saas_modules
WHERE code = 'CORE'
LIMIT 1;
INSERT INTO security.permission_categories (name, module_id, order_index, icon)
VALUES ('Otros Permisos', core_id, 99, 'info-circle') ON CONFLICT DO NOTHING
RETURNING id INTO gen_cat_id;
IF gen_cat_id IS NULL THEN
SELECT id INTO gen_cat_id
FROM security.permission_categories
WHERE name = 'Otros Permisos'
LIMIT 1;
END IF;
UPDATE security.permissions
SET category_id = gen_cat_id
WHERE category_id IS NULL;
END $$;