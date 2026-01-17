-- Migration V98: Add robust boolean flags for Root and Admin security

-- 1. Add checks to ROLES table
-- is_admin_role already exists from V67
ALTER TABLE security.roles 
ADD COLUMN is_root_role BOOLEAN DEFAULT FALSE;

-- 2. Add checks to USERS table
-- is_super_admin likely exists (standard field), adding granular checks
ALTER TABLE security.users 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

ALTER TABLE security.users 
ADD COLUMN is_root BOOLEAN DEFAULT FALSE;

-- 3. DATA MIGRATION

-- 3.1 Roles: Set is_root_role for the 'ROOT' system role
UPDATE security.roles 
SET is_root_role = TRUE, is_admin_role = TRUE 
WHERE name = 'ROOT';

-- Ensure ADMIN name also has is_admin_role (redundant but safe)
UPDATE security.roles 
SET is_admin_role = TRUE 
WHERE name = 'ADMIN';

-- 3.2 Users: Backfill based on is_super_admin or specific conventions
-- If a user is is_super_admin (old flag), they are effectively ROOT in the new system
UPDATE security.users
SET is_root = TRUE, is_admin = TRUE
WHERE is_super_admin = TRUE;

-- If there are users who should be admins but not root, we can't easily guess without more info,
-- but relying on the Role assignments (UserCompanyRole) logic handled in the code is cleaner.
-- The is_admin and is_root flags on User are for *global* platform privileges usually.

-- Optional: If you had specific usernames hardcoded as superadmins in the past, update them here.
-- e.g. WHERE username = 'admin' ... but is_super_admin check covers the standardized ones.
