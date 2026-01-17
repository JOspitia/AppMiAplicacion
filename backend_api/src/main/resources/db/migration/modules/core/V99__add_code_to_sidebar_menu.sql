-- Add 'code' column to sidebar_menu for stable referencing
ALTER TABLE configuration.sidebar_menu ADD COLUMN code VARCHAR(255) UNIQUE;

-- Populate 'code' for the critical Locations (Ubicaciones) menu item
-- Using the URL as identification since ID is UUID and Title is mutable
UPDATE configuration.sidebar_menu 
SET code = 'MENU_LOCATIONS' 
WHERE url = '/core/management/locations';

-- Populate remaining codes
UPDATE configuration.sidebar_menu SET code = 'MENU_HOME' WHERE url = '/home';
UPDATE configuration.sidebar_menu SET code = 'MENU_SETTINGS' WHERE url = '/settings/general';
UPDATE configuration.sidebar_menu SET code = 'MENU_MANAGEMENT' WHERE url = '/core/management';
UPDATE configuration.sidebar_menu SET code = 'MENU_ADMINISTRATION' WHERE url = '/core/administration';
UPDATE configuration.sidebar_menu SET code = 'MENU_RRHH' WHERE url = '/rrhh';
UPDATE configuration.sidebar_menu SET code = 'MENU_RRHH_SETTINGS' WHERE url = '/rrhh/settings';
UPDATE configuration.sidebar_menu SET code = 'MENU_RRHH_DEPARTMENTS' WHERE url = '/rrhh/departments';
UPDATE configuration.sidebar_menu SET code = 'MENU_USERS' WHERE url = '/core/management/users';
UPDATE configuration.sidebar_menu SET code = 'MENU_ROLES' WHERE url = '/core/management/roles';
UPDATE configuration.sidebar_menu SET code = 'MENU_PROFILE' WHERE url = '/core/management/users/profile';
UPDATE configuration.sidebar_menu SET code = 'MENU_SECURITY' WHERE url = '/core/management/users/profile/change-password';
UPDATE configuration.sidebar_menu SET code = 'MENU_ID_TYPES' WHERE url = '/rrhh/identification-types';
UPDATE configuration.sidebar_menu SET code = 'MENU_WORK_SCHEDULES' WHERE url = '/rrhh/settings/work-schedules';
UPDATE configuration.sidebar_menu SET code = 'MENU_COMPENSATION_TYPES' WHERE url = '/rrhh/compensation-types';
UPDATE configuration.sidebar_menu SET code = 'MENU_ORG_LEVELS' WHERE url = '/rrhh/organizational-levels';
UPDATE configuration.sidebar_menu SET code = 'MENU_CONTRACT_TYPES' WHERE url = '/rrhh/contract-types';
UPDATE configuration.sidebar_menu SET code = 'MENU_COST_CENTERS' WHERE url = '/rrhh/cost-centers';
UPDATE configuration.sidebar_menu SET code = 'MENU_POSITIONS' WHERE url = '/rrhh/positions';
UPDATE configuration.sidebar_menu SET code = 'MENU_DOC_TYPES' WHERE url = '/rrhh/document-types';
UPDATE configuration.sidebar_menu SET code = 'MENU_EMPLOYEES' WHERE url = '/rrhh/employees';
UPDATE configuration.sidebar_menu SET code = 'MENU_PERMISSIONS' WHERE url = '/core/permissions/catalog';
UPDATE configuration.sidebar_menu SET code = 'MENU_COMPANIES' WHERE url = '/core/management/companies';
UPDATE configuration.sidebar_menu SET code = 'MENU_OP_CENTERS' WHERE url = '/rrhh/operational-centers';
UPDATE configuration.sidebar_menu SET code = 'MENU_SEDES' WHERE url = '/rrhh/sedes';
