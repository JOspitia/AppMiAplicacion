-- Migration to enable multiple roles per user in the same company
-- This removes the (user_id, company_id) unique constraint and replaces it with (user_id, company_id, role_id)
-- 1. Drop the existing unique constraint
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'uk_user_company_roles_user_company'
        AND table_schema = 'security'
        AND table_name = 'user_company_roles'
) THEN
ALTER TABLE security.user_company_roles DROP CONSTRAINT uk_user_company_roles_user_company;
END IF;
END $$;
-- 2. Add new unique constraint to prevent duplicate role assignments
-- A user can have multiple roles in the same company, but not the same role twice
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'uk_user_company_roles_user_company_role'
        AND table_schema = 'security'
        AND table_name = 'user_company_roles'
) THEN
ALTER TABLE security.user_company_roles
ADD CONSTRAINT uk_user_company_roles_user_company_role UNIQUE (user_id, company_id, role_id);
END IF;
END $$;
-- 3. Create index for better query performance when fetching all roles for a user in a company
CREATE INDEX IF NOT EXISTS idx_user_company_roles_user_company ON security.user_company_roles(user_id, company_id);