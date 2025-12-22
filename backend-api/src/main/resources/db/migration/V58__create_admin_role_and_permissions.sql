-- Migration V58: Create ADMIN role and default permissions
-- 1. Create the global ADMIN role (system role, no specific company yet)
INSERT INTO security.roles (
        company_id,
        name,
        description,
        is_system_role,
        active
    )
SELECT NULL,
    'ADMIN',
    'Administrador de Empresa',
    TRUE,
    TRUE
WHERE NOT EXISTS (
        SELECT 1
        FROM security.roles
        WHERE name = 'ADMIN'
            AND company_id IS NULL
    );
-- 2. Assign Permissions to ADMIN role
-- Strategy: Assign permissions that are NOT restricted to Super Admin.
-- Since we don't have a strict 'is_root_permission' flag, we will assume:
-- - All permissions associated with a SaaS Module (module_id IS NOT NULL) are safe for Company Admins (assuming subscription check handles visibility).
-- - Core permissions for Users and Roles are needed.
INSERT INTO security.role_permissions (role_id, permission_id)
SELECT r.id,
    p.id
FROM security.roles r
    CROSS JOIN security.permissions p
WHERE r.name = 'ADMIN'
    AND r.company_id IS NULL
    AND (
        -- Include all Module-specific permissions
        p.module_id IS NOT NULL
        OR -- Include specific Core permissions (adjust names based on actual seed data in V7 or similar)
        -- We match commonly used permission patterns for Users, Roles, and Company management.
        -- Assuming patterns like 'USER_%', 'ROLE_%', 'COMPANY_READ', 'COMPANY_UPDATE'
        p.name LIKE 'USER_%'
        OR p.name LIKE 'ROLE_%'
        OR p.name IN (
            'COMPANY_READ',
            'COMPANY_UPDATE',
            'VIEW_COMPANY',
            'EDIT_COMPANY',
            'MANAGE_COMPANY'
        )
    ) -- Exclude clearly Root/System level permissions
    AND p.name NOT LIKE 'SYSTEM_%'
    AND p.name NOT LIKE 'ROOT_%'
    AND p.name NOT IN (
        'CREATE_COMPANY',
        'DELETE_COMPANY',
        'MANAGE_SAAS_MODULES'
    ) ON CONFLICT DO NOTHING;