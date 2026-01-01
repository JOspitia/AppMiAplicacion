-- Migración V78: Forzar recategorización funcional de permisos (Corrigiendo valores antiguos VIEW/ACTION)
-- Esta migración sobrescribe explícitamente el campo 'category' para que sirva como agrupador en la UI
-- Se basa en los nombres técnicos (core_company_*, core_user_*, etc.)
-- 1. Gestión de Empresas
UPDATE security.permissions
SET category = 'Gestión de Empresas'
WHERE name LIKE '%_COMPANY_%'
    OR name LIKE 'COMPANY_%'
    OR name LIKE '%_EMPRESA_%';
-- 2. Gestión de Usuarios y Perfiles
UPDATE security.permissions
SET category = 'Gestión de Usuarios'
WHERE name LIKE '%_USER_%'
    OR name LIKE 'USER_%'
    OR name LIKE '%_USUARIO_%';
-- 3. Seguridad y Accesos (Roles y Permisos)
UPDATE security.permissions
SET category = 'Seguridad y Accesos'
WHERE name LIKE '%_ROLE_%'
    OR name LIKE 'ROLE_%'
    OR name LIKE '%_PERMISSION_%'
    OR name LIKE 'PERMISSION_%';
-- 4. Configuración del Sistema
UPDATE security.permissions
SET category = 'Configuración del Sistema'
WHERE name LIKE '%_SYSTEM_%'
    OR name LIKE 'SYSTEM_%'
    OR name LIKE '%_CONFIG_%'
    OR name LIKE '%_SETTING_%'
    OR name LIKE '%_MANAGEMENT_%'
    OR name LIKE '%_ADMINISTRATION_%';
-- 5. Módulo de RRHH (Ejemplo de módulo específico)
UPDATE security.permissions
SET category = 'Recursos Humanos'
WHERE name LIKE 'RRHH_%';
-- 6. Auditoría
UPDATE security.permissions
SET category = 'Auditoría y Logs'
WHERE name LIKE '%_AUDIT_%'
    OR name LIKE '%_LOG_%';
-- 7. Fallback para permisos CORE que quedaron sin asignar (posiblemente generales)
UPDATE security.permissions
SET category = 'Plataforma Core'
WHERE category IN ('VIEW', 'ACTION')
    AND name LIKE 'CORE_%';