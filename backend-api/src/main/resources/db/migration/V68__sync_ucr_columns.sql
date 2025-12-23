-- Migration V68: Coordinate UserCompanyRole entity fields with database columns
-- Rename assigned_at to created_at to match the JPA entity and system standards
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'security'
        AND table_name = 'user_company_roles'
        AND column_name = 'assigned_at'
)
AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'security'
        AND table_name = 'user_company_roles'
        AND column_name = 'created_at'
) THEN
ALTER TABLE security.user_company_roles
    RENAME COLUMN assigned_at TO created_at;
END IF;
-- Ensure updated_at exists (it was in V1, but checking just in case)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'security'
        AND table_name = 'user_company_roles'
        AND column_name = 'updated_at'
) THEN
ALTER TABLE security.user_company_roles
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END IF;
-- Ensure created_at exists for cases where assigned_at was already missing
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'security'
        AND table_name = 'user_company_roles'
        AND column_name = 'created_at'
) THEN
ALTER TABLE security.user_company_roles
ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
END IF;
END $$;