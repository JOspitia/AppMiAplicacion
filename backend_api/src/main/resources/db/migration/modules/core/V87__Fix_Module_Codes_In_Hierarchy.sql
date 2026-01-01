-- Migración V87: Corrección de códigos de módulo y restauración de visibilidad
DO $$
DECLARE core_id UUID;
rrhh_id UUID;
BEGIN -- 1. Obtener IDs usando los códigos REALES registrados en el sistema
SELECT id INTO core_id
FROM configuration.saas_modules
WHERE code = 'CORE_PLATFORM'
LIMIT 1;
SELECT id INTO rrhh_id
FROM configuration.saas_modules
WHERE code = 'MOD_RRHH'
LIMIT 1;
-- Si por alguna razón no los encuentra por esos códigos, buscar por nombre (fallback)
IF core_id IS NULL THEN
SELECT id INTO core_id
FROM configuration.saas_modules
WHERE name LIKE '%Plataforma%'
LIMIT 1;
END IF;
IF rrhh_id IS NULL THEN
SELECT id INTO rrhh_id
FROM configuration.saas_modules
WHERE name LIKE '%Recursos Humanos%'
LIMIT 1;
END IF;
-- 2. Corregir las categorías con los IDs correctos
UPDATE security.permission_categories
SET module_id = core_id
WHERE name IN (
        'Gestión de Empresas',
        'Gestión de Usuarios',
        'Seguridad y Accesos',
        'Auditoría y Logs',
        'Otros Permisos'
    );
UPDATE security.permission_categories
SET module_id = rrhh_id
WHERE name IN (
        'Gestión de Empleados',
        'Configuración General RRHH',
        'Cargos y Posiciones',
        'Compensación y Beneficios'
    );
-- 3. Asegurar que los permisos tengan category_id (Limpiar cualquier NULL remanente)
-- Si hay permisos de Core sin categoría, moverlos a 'Seguridad y Accesos' o 'Otros Permisos'
UPDATE security.permissions
SET category_id = (
        SELECT id
        FROM security.permission_categories
        WHERE name = 'Otros Permisos'
        LIMIT 1
    )
WHERE category_id IS NULL;
END $$;