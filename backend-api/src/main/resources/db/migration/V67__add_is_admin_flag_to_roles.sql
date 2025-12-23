-- Migration V67: Add is_admin_role flag to roles for safer permission handling
ALTER TABLE security.roles
ADD COLUMN is_admin_role BOOLEAN DEFAULT false;
-- Mark the system ADMIN role as an admin role
UPDATE security.roles
SET is_admin_role = true
WHERE name = 'ADMIN'
    AND is_system_role = true;
-- Ensure existing user_company_roles that were 'ADMIN' are linked to a role with this flag
-- (This assumes the role_name was standardized)
UPDATE security.roles r
SET is_admin_role = true
FROM security.user_company_roles ucr
WHERE r.id = ucr.role_id
    AND ucr.role_name IN ('ADMIN', 'ADMINISTRADOR');