-- 1. Ensure columns added in my previous attempts exist (if any)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'security'
        AND table_name = 'user_company_roles'
        AND column_name = 'is_active'
) THEN
ALTER TABLE security.user_company_roles
ADD COLUMN is_active BOOLEAN DEFAULT true;
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'security'
        AND table_name = 'user_company_roles'
        AND column_name = 'role_name'
) THEN
ALTER TABLE security.user_company_roles
ADD COLUMN role_name VARCHAR(50);
END IF;
END $$;
-- 2. Update existing rows in user_company_roles to set role_name based on role_id if possible
UPDATE security.user_company_roles ucr
SET role_name = r.name
FROM security.roles r
WHERE ucr.role_id = r.id
    AND ucr.role_name IS NULL;
-- 3. Ensure the unique constraint (user_id, company_id) exists for our multi-tenant logic
-- Note: V1 has (user_id, company_id, role_id), but we want (user_id, company_id) 
-- to ensure a user is only assigned once to a company (with a specific role).
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'uk_user_company_roles_user_company'
        AND table_schema = 'security'
        AND table_name = 'user_company_roles'
) THEN
ALTER TABLE security.user_company_roles
ADD CONSTRAINT uk_user_company_roles_user_company UNIQUE (user_id, company_id);
END IF;
END $$;
-- 4. Create indexes safely
CREATE INDEX IF NOT EXISTS idx_user_company_roles_user_id ON security.user_company_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_company_id ON security.user_company_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_company_roles_active ON security.user_company_roles(is_active);
-- 5. Initial Grant for the Super Admin
DO $$
DECLARE admin_user_id UUID;
system_company_id UUID;
admin_role_id UUID;
BEGIN -- A. Find first super admin user
SELECT id INTO admin_user_id
FROM security.users
WHERE is_super_admin = true
LIMIT 1;
-- B. Find first company
SELECT id INTO system_company_id
FROM security.companies
WHERE status = true
LIMIT 1;
-- C. Find the ADMIN role (created in V58)
SELECT id INTO admin_role_id
FROM security.roles
WHERE name = 'ADMIN'
    AND company_id IS NULL
LIMIT 1;
-- D. Create relationship if all exist
IF admin_user_id IS NOT NULL
AND system_company_id IS NOT NULL
AND admin_role_id IS NOT NULL THEN
INSERT INTO security.user_company_roles (
        user_id,
        company_id,
        role_id,
        role_name,
        is_active
    )
VALUES (
        admin_user_id,
        system_company_id,
        admin_role_id,
        'ADMIN',
        true
    ) ON CONFLICT (user_id, company_id) DO NOTHING;
END IF;
END $$;