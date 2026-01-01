-- Ensure admin has access to all companies if they are super admin or at least Tech Solutions
-- However, UserCompanyRole handles specific access. Let's ensure access to Tech Solutions and Public.
DO $$
DECLARE v_admin_id UUID;
v_tech_solutions_id UUID;
v_public_id UUID;
v_admin_role_id UUID;
v_new_user_role_id UUID;
BEGIN
SELECT id INTO v_admin_id
FROM security.users
WHERE username = 'admin';
SELECT id INTO v_tech_solutions_id
FROM security.companies
WHERE name = 'Tech Solutions';
SELECT id INTO v_public_id
FROM security.companies
WHERE name = 'PUBLIC';
-- Get ADMIN role for Tech Solutions (or create if missing/global)
-- Actually V2 assigns ROOT role. Let's use that.
SELECT id INTO v_admin_role_id
FROM security.roles
WHERE name = 'ROOT'
    AND company_id = v_tech_solutions_id;
-- Assign Tech Solutions access
IF v_admin_id IS NOT NULL
AND v_tech_solutions_id IS NOT NULL
AND v_admin_role_id IS NOT NULL THEN
INSERT INTO security.user_company_roles (user_id, company_id, role_id)
VALUES (v_admin_id, v_tech_solutions_id, v_admin_role_id) ON CONFLICT (user_id, company_id, role_id) DO NOTHING;
END IF;
-- Assign PUBLIC company access (if needed, usually not for admin panel but for consistency)
-- Admin generally doesn't need explicit role in PUBLIC unless testing. 
END $$;