-- Migration V97: Fix ROOT role to be identified as an admin role
-- Description: Ensures the ROOT (Super Admin) role has the is_admin_role flag active.

UPDATE security.roles
SET is_admin_role = true
WHERE name = 'ROOT' AND is_system_role = true;

-- Also ensure any role named 'SUPER_ADMIN' or similar has it
UPDATE security.roles
SET is_admin_role = true
WHERE name IN ('SUPER_ADMIN', 'SYSTEM_ADMIN') AND is_admin_role = false;
