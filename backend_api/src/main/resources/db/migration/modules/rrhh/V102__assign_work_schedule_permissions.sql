-- Migration to assign Work Schedule permissions to the ADMIN role
INSERT INTO security.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM security.roles r
CROSS JOIN security.permissions p
WHERE r.name = 'ADMIN'
  AND r.company_id IS NULL
  AND p.name IN (
    'RRHH_WORK_SCHEDULE_VIEW',
    'RRHH_WORK_SCHEDULE_CREATE',
    'RRHH_WORK_SCHEDULE_EDIT',
    'RRHH_WORK_SCHEDULE_DELETE'
  )
ON CONFLICT DO NOTHING;
