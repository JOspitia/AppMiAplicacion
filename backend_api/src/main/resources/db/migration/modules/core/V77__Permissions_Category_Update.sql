-- Migración V77: Actualizar categorías de permisos para mejor organización en UI
-- 1. Gestión de Empresas (Company Management)
UPDATE security.permissions
SET category = 'Gestión de Empresas'
WHERE name LIKE 'COMPANY_%'
    OR name LIKE 'EMPRESA_%';
-- 2. Gestión de Usuarios (User Management)
UPDATE security.permissions
SET category = 'Gestión de Usuarios'
WHERE name LIKE 'USER_%'
    OR name LIKE 'USUARIO_%';
-- 3. Seguridad y Accesos (Security & Access)
-- Agrupa Roles y Permisos en una sola categoría administrativa
UPDATE security.permissions
SET category = 'Seguridad y Accesos'
WHERE name LIKE 'ROLE_%'
    OR name LIKE 'ROL_%'
    OR name LIKE 'PERMISSION_%'
    OR name LIKE 'PERMISO_%';
-- 4. Configuración del Sistema (System Configuration)
UPDATE security.permissions
SET category = 'Configuración del Sistema'
WHERE name LIKE 'SYSTEM_%'
    OR name LIKE 'CONFIG_%'
    OR name LIKE 'SETTING_%';
-- 5. Auditoría (Logs & Audit)
UPDATE security.permissions
SET category = 'Auditoría y Logs'
WHERE name LIKE 'AUDIT_%'
    OR name LIKE 'LOG_%';
-- 6. Fallback para permisos "CORE" generales que no cayeron en lo anterior
UPDATE security.permissions
SET category = 'Plataforma Core'
WHERE category IS NULL
    AND name LIKE 'CORE_%';
-- 7. Fallback general para cualquier otro permiso sin categoría
UPDATE security.permissions
SET category = 'Otros Permisos'
WHERE category IS NULL;