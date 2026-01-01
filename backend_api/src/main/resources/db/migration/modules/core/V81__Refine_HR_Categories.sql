-- Migración para refinar las categorías de permisos de RRHH
-- Basado en la estructura de menú deseada por el usuario
-- 1. Estructura Organizacional (Departamentos y Jerarquías)
UPDATE security.permissions
SET category = 'Estructura Organizacional'
WHERE name LIKE 'RRHH_DEPT_%'
    OR name LIKE 'RRHH_ORGLEVEL_%';
-- 2. Infraestructura y Sedes
UPDATE security.permissions
SET category = 'Sedes y Ubicaciones'
WHERE name LIKE 'RRHH_LOCATION_%';
-- 3. Gestión Financiera (Centros de Costos)
UPDATE security.permissions
SET category = 'Centros de Costos'
WHERE name LIKE 'RRHH_COST_CENTER_%';
-- 4. Gestión Operativa (Centros Operacionales)
UPDATE security.permissions
SET category = 'Centros Operacionales'
WHERE name LIKE 'RRHH_OPCENTER_%';
-- 5. Gestión de Tiempos (Horarios)
UPDATE security.permissions
SET category = 'Tiempos y Turnos'
WHERE name LIKE 'RRHH_WORK_SCHEDULE_%';
-- 6. Contratación (Tipos de Contrato)
UPDATE security.permissions
SET category = 'Gestión de Contratación'
WHERE name LIKE 'RRHH_CONTRACT_TYPE_%';
-- 7. Compensación (Bonificaciones)
UPDATE security.permissions
SET category = 'Compensación y Beneficios'
WHERE name LIKE 'RRHH_COMPENSATION_%';
-- 8. Gestión de Empleados (Expediente Digital)
UPDATE security.permissions
SET category = 'Gestión de Empleados'
WHERE name LIKE 'RRHH_EMPLOYEE_%'
    OR name LIKE 'RRHH_PERSONAL_INFO_%'
    OR name LIKE 'RRHH_CORPORATE_INFO_%'
    OR name LIKE 'RRHH_CONTRACTUAL_INFO_%'
    OR name LIKE 'RRHH_DIRECTORY_%';
-- 9. Configuración General (Solo Configuración)
UPDATE security.permissions
SET category = 'Configuración General RRHH'
WHERE name LIKE 'RRHH_CONFIG_%';
-- 9.1 Tipos de Documento/Soporte
UPDATE security.permissions
SET category = 'Tipos de Soporte'
WHERE name LIKE 'RRHH_SUPPORT_TYPE_%';
-- 10. Departamentos (Solo estructura)
UPDATE security.permissions
SET category = 'Departamentos y Estructura'
WHERE name LIKE 'RRHH_DEPT_%';
-- 10.1 Niveles Organizacionales
UPDATE security.permissions
SET category = 'Niveles Organizacionales'
WHERE name LIKE 'RRHH_ORGLEVEL_%';
-- 10.2 Cargos y Posiciones
UPDATE security.permissions
SET category = 'Cargos y Posiciones'
WHERE name LIKE 'RRHH_POSITION_%';
-- 12. Acceso Módulo (Permiso base)
UPDATE security.permissions
SET category = 'Acceso Recursos Humanos'
WHERE name = 'RRHH_VIEW';
-- 11. Acceso a Gestión del Sistema
UPDATE security.permissions
SET category = 'Acceso Gestión del Sistema'
WHERE name = 'CORE_MANAGEMENT_VIEW';
-- 11.1 Acceso a Administración del Sistema
UPDATE security.permissions
SET category = 'Acceso Administración del Sistema'
WHERE name = 'CORE_ADMINISTRATION_VIEW';
-- 13. Gestión de Usuarios
UPDATE security.permissions
SET category = 'Gestión de Usuarios'
WHERE name LIKE 'CORE_USER_%';
-- 14. Roles y Perfiles
UPDATE security.permissions
SET category = 'Roles y Perfiles'
WHERE name LIKE 'CORE_ROLE_%';
-- 15. Matriz de Permisos
UPDATE security.permissions
SET category = 'Matriz de Permisos'
WHERE name LIKE 'CORE_PERMISSION_%';