-- V94__Clean_Orphaned_User_Company_Roles.sql
-- Cleanup for User Management System stabilization
-- 1. Remove orphaned records that don't have a role assigned
-- (These cause confusion and duplicate rows in some views)
DELETE FROM security.user_company_roles
WHERE role_id IS NULL
    AND (
        role_name IS NULL
        OR role_name = ''
        OR role_name = 'EMPLOYEE'
    );
-- 2. Remove exact duplicates (same user, same company, same role)
-- Keeping only the most recently updated one
WITH ucr_duplicates AS (
    SELECT id,
        ROW_NUMBER() OVER (
            PARTITION BY user_id,
            company_id,
            role_id
            ORDER BY updated_at DESC,
                created_at DESC,
                id DESC
        ) as rank
    FROM security.user_company_roles
    WHERE role_id IS NOT NULL
)
DELETE FROM security.user_company_roles
WHERE id IN (
        SELECT id
        FROM ucr_duplicates
        WHERE rank > 1
    );
-- 3. Ensure unique constraint exists at DB level
-- This prevents the issue from recurring in production
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uk_user_company_role'
) THEN
ALTER TABLE security.user_company_roles
ADD CONSTRAINT uk_user_company_role UNIQUE (user_id, company_id, role_id);
END IF;
END $$;