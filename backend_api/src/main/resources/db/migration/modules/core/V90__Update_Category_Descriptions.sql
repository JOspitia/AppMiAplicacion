-- Migración V90: Catalogación Final de Categorías con Descripciones e Iconos Premium
-- Propósito: Sincronizar nombres, descripciones, iconos y vinculación a módulos (Core y RRHH)
DO $$
DECLARE core_id UUID;
rrhh_id UUID;
BEGIN -- 1. Obtener IDs de módulos reales
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
-- 2. Asegurar el constraint de unicidad (Nombre, Módulo)
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_category_name_module'
) THEN
ALTER TABLE security.permission_categories
ADD CONSTRAINT uq_category_name_module UNIQUE (name, module_id);
END IF;
---------------------------------------------------------------------------
-- BLOQUE 1: CORE PLATFORM
---------------------------------------------------------------------------
INSERT INTO security.permission_categories (name, module_id, description, order_index, icon)
VALUES (
        'Empresas',
        core_id,
        'Gestión de la información corporativa, marcas y configuración base de las compañías.',
        10,
        'building'
    ),
    (
        'Usuarios',
        core_id,
        'Administración de cuentas de usuario, estados de acceso y seguridad de credenciales.',
        20,
        'users'
    ),
    (
        'Roles y Perfiles',
        core_id,
        'Definición de roles de seguridad (RBAC), perfiles de acceso y asignación de capacidades.',
        30,
        'shield'
    ),
    (
        'Permisos',
        core_id,
        'Catálogo maestro de todas las capacidades y acciones granulares del sistema.',
        40,
        'key'
    ),
    (
        'Ubicaciones',
        core_id,
        'Gestión de la estructura física y logística de los puntos de servicio.',
        50,
        'map-marker'
    ),
    (
        'Administración',
        core_id,
        'Herramientas de control técnico y monitoreo operativo de la plataforma básica.',
        60,
        'cog'
    ),
    (
        'Perfil de Usuario',
        core_id,
        'Gestión de identidad, datos personales y preferencias del trabajador.',
        70,
        'user'
    ),
    (
        'Configuración Global',
        core_id,
        'Parámetros transversales y definición de comportamiento de la plataforma.',
        80,
        'wrench'
    ),
    (
        'Tipos de Moneda',
        core_id,
        'Configuración de divisas, símbolos y parámetros monetarios para transacciones.',
        90,
        'money-bill'
    ),
    (
        'Extensiones Telefónicas',
        core_id,
        'Administración de prefijos internacionales, códigos de área y extensiones.',
        100,
        'phone'
    ) ON CONFLICT (name, module_id) DO
UPDATE
SET description = EXCLUDED.description,
    order_index = EXCLUDED.order_index,
    icon = EXCLUDED.icon;
---------------------------------------------------------------------------
-- BLOQUE 2: RECURSOS HUMANOS
---------------------------------------------------------------------------
INSERT INTO security.permission_categories (name, module_id, description, order_index, icon)
VALUES (
        'Empleados',
        rrhh_id,
        'Gestión integral de expedientes, ficha técnica y ciclo de vida laboral.',
        10,
        'users'
    ),
    (
        'Departamentos',
        rrhh_id,
        'Estructura lógica de las áreas funcionales y operativas de la organización.',
        20,
        'briefcase'
    ),
    (
        'Cargos',
        rrhh_id,
        'Definición de roles, responsabilidades y perfiles específicos de puesto.',
        30,
        'tag'
    ),
    (
        'Niveles Organizacionales',
        rrhh_id,
        'Gestión del organigrama, jerarquías y niveles de mando corporativo.',
        40,
        'sitemap'
    ),
    (
        'Cargos y Salarios',
        rrhh_id,
        'Administración de escalas salariales y niveles de compensación por cargo.',
        50,
        'wallet'
    ),
    (
        'Centros de Costos',
        rrhh_id,
        'Configuración de cuentas para la imputación financiera de la nómina.',
        60,
        'percentage'
    ),
    (
        'Centros Operacionales',
        rrhh_id,
        'Puntos de conexión entre la nómina y la ejecución física del trabajo.',
        70,
        'home'
    ),
    (
        'Tipos de Contrato',
        rrhh_id,
        'Modalidades legales de vinculación y parámetros de ley aplicables.',
        80,
        'file-pdf'
    ),
    (
        'Sedes',
        rrhh_id,
        'Gestión de establecimientos físicos y sucursales de operación.',
        90,
        'map'
    ),
    (
        'Tipos de Documento',
        rrhh_id,
        'Requisitos de identificación y soporte para trámites de talento humano.',
        100,
        'book'
    ),
    (
        'Tipos de Identificación',
        rrhh_id,
        'Estandarización de documentos de identidad civil compatibles.',
        110,
        'id-card'
    ),
    (
        'Horarios Laborales',
        rrhh_id,
        'Planificación de turnos, jornadas y disponibilidad horaria del personal.',
        120,
        'clock'
    ),
    (
        'Tipos de Bonos',
        rrhh_id,
        'Definición de incentivos extra-legales y compensaciones variables.',
        130,
        'gift'
    ),
    (
        'Sistema',
        rrhh_id,
        'Configuración técnica exclusiva de los procesos de Recursos Humanos.',
        140,
        'settings'
    ),
    (
        'Bonificaciones',
        rrhh_id,
        'Gestión y auditoría de pagos de bonos e incentivos adicionales.',
        150,
        'money-bill'
    ),
    (
        'Documentos Soporte',
        rrhh_id,
        'Repositorio de evidencias digitales y archivos contractuales del personal.',
        160,
        'folder-open'
    ) ON CONFLICT (name, module_id) DO
UPDATE
SET description = EXCLUDED.description,
    order_index = EXCLUDED.order_index,
    icon = EXCLUDED.icon;
---------------------------------------------------------------------------
-- 3. MAPEADOR FINAL (Víncular permisos huérfanos)
---------------------------------------------------------------------------
-- Limpieza de huerfanos o categorías obsoletas (Otros, RRHH %, etc)
UPDATE security.permissions
SET category_id = (
        SELECT id
        FROM security.permission_categories
        WHERE name = 'Sistema'
            AND module_id = rrhh_id
        LIMIT 1
    )
WHERE category_id IN (
        SELECT id
        FROM security.permission_categories
        WHERE name = 'Otros'
            OR name LIKE 'RRHH %'
    );
-- Mapeo por patrones (Robusto)
UPDATE security.permissions p
SET category_id = c.id
FROM security.permission_categories c
WHERE c.name = 'Bonificaciones'
    AND p.name LIKE 'RRHH_BONUS%';
UPDATE security.permissions p
SET category_id = c.id
FROM security.permission_categories c
WHERE c.name = 'Horarios Laborales'
    AND p.name LIKE 'RRHH_WORK%';
UPDATE security.permissions p
SET category_id = c.id
FROM security.permission_categories c
WHERE c.name = 'Empleados'
    AND p.name LIKE 'EMPLOYEE_%';
UPDATE security.permissions p
SET category_id = c.id
FROM security.permission_categories c
WHERE c.name = 'Sedes'
    AND (
        p.name LIKE 'RRHH_SED%'
        OR p.name LIKE 'RRHH_LOC%'
    );
UPDATE security.permissions p
SET category_id = c.id
FROM security.permission_categories c
WHERE c.name = 'Ubicaciones'
    AND (
        p.name LIKE '%LOCATION%'
        OR p.name LIKE '%COUNTRY%'
        OR p.name LIKE '%CITY%'
    );
END $$;