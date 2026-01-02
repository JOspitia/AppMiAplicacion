-- Migración V96: Refinamiento de Clasificación de Permisos RRHH
-- Propósito: Mover permisos de configuración y acceso desde "Otros" a sus categorías correspondientes en el módulo de RRHH.
DO $$
DECLARE rrhh_id UUID;
cat_sistema UUID;
cat_bonos UUID;
cat_docs UUID;
cat_niveles UUID;
BEGIN -- 1. Obtener ID del módulo de Recursos Humanos
SELECT id INTO rrhh_id
FROM configuration.saas_modules
WHERE code = 'MOD_RRHH'
    OR name ILIKE '%Recursos Humanos%'
LIMIT 1;
-- 2. Asegurar la existencia de las categorías y obtener sus IDs
-- Estas categorías fueron definidas en V90, las recuperamos para vinculación.
-- Sistema (Acceso General)
SELECT id INTO cat_sistema
FROM security.permission_categories
WHERE name = 'Sistema'
    AND module_id = rrhh_id
LIMIT 1;
-- Tipos de Bonos (Configuración de Bonificaciones)
SELECT id INTO cat_bonos
FROM security.permission_categories
WHERE name = 'Tipos de Bonos'
    AND module_id = rrhh_id
LIMIT 1;
-- Tipos de Documento (Configuración de Documentos/Soportes)
SELECT id INTO cat_docs
FROM security.permission_categories
WHERE name = 'Tipos de Documento'
    AND module_id = rrhh_id
LIMIT 1;
-- Niveles Organizacionales (Estructura Jerárquica)
SELECT id INTO cat_niveles
FROM security.permission_categories
WHERE name = 'Niveles Organizacionales'
    AND module_id = rrhh_id
LIMIT 1;
-- 3. Actualización Granular de Permisos (Mapeo por Nombre Único)
-- A. Clasificación de Acceso y Sistema
UPDATE security.permissions
SET category_id = cat_sistema
WHERE name IN (
        'RRHH_VIEW',
        'RRHH_CONFIG_VIEW',
        'RRHH_CONFIG_EDIT'
    )
    OR (display_name ILIKE '%Acceso al módulo de RRHH%');
-- B. Clasificación de Configuración de Bonificaciones
UPDATE security.permissions
SET category_id = cat_bonos
WHERE name IN (
        'RRHH_COMPENSATION_VIEW',
        'RRHH_COMPENSATION_EDIT'
    )
    OR (display_name ILIKE '%tipos de bonificación%');
-- C. Clasificación de Configuración de Documentos / Soporte
UPDATE security.permissions
SET category_id = cat_docs
WHERE name IN ('RRHH_DOCTYPE_VIEW', 'RRHH_DOCTYPE_EDIT')
    OR (
        display_name ILIKE '%tipos de documento/soporte%'
    );
-- D. Clasificación de Niveles Organizacionales
UPDATE security.permissions
SET category_id = cat_niveles
WHERE name IN ('RRHH_ORGLEVEL_VIEW', 'RRHH_ORGLEVEL_EDIT')
    OR (display_name ILIKE '%niveles organizacionales%');
-- 4. Limpieza final: Sincronizar descripciones faltantes para estos permisos
UPDATE security.permissions
SET description = display_name
WHERE (
        description IS NULL
        OR description = ''
    )
    AND (
        category_id IN (cat_sistema, cat_bonos, cat_docs, cat_niveles)
    );
END $$;