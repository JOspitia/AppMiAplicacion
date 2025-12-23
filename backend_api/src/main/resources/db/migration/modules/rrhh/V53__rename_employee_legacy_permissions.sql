-- V53__rename_employee_legacy_permissions.sql
-- Description: Rename legacy EMPLOYEE_* permissions to RRHH_EMPLOYEE_* for consistency.
--              This ensures correct resource grouping in the Role Management UI.
UPDATE security.permissions
SET name = 'RRHH_EMPLOYEE_VIEW'
WHERE name = 'EMPLOYEE_VIEW';
UPDATE security.permissions
SET name = 'RRHH_EMPLOYEE_CREATE'
WHERE name = 'EMPLOYEE_CREATE';
UPDATE security.permissions
SET name = 'RRHH_EMPLOYEE_EDIT'
WHERE name = 'EMPLOYEE_EDIT';
-- Update sidebar menu references
UPDATE configuration.sidebar_menu
SET permission_required = 'RRHH_EMPLOYEE_VIEW'
WHERE permission_required = 'EMPLOYEE_VIEW';
UPDATE configuration.sidebar_menu
SET permission_required = 'RRHH_EMPLOYEE_CREATE'
WHERE permission_required = 'EMPLOYEE_CREATE';
UPDATE configuration.sidebar_menu
SET permission_required = 'RRHH_EMPLOYEE_EDIT'
WHERE permission_required = 'EMPLOYEE_EDIT';