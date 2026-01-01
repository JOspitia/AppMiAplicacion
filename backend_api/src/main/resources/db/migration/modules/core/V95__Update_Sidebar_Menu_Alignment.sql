-- Migration to align Sidebar Menu URLs with requested structure and pattern
-- Pattern: /core/management/companies, /rrhh/operational-centers, /rrhh/sedes
-- 1. Update Companies URL to management subpath
UPDATE configuration.sidebar_menu
SET url = '/core/management/companies'
WHERE url = '/core/companies'
    OR title = 'Empresas';
-- 2. Update Operational Centers URL (translate)
UPDATE configuration.sidebar_menu
SET url = '/rrhh/operational-centers'
WHERE url = '/rrhh/centros-operacionales'
    OR title = 'Centros Operacionales';
-- 3. Ensure Sedes URL is consistent with Angular route /rrhh/sedes
UPDATE configuration.sidebar_menu
SET url = '/rrhh/sedes'
WHERE url = '/rrhh/locations'
    OR title = 'Sedes';