-- =====================================================
-- V121__drop_deprecated_employee_catalog_columns.sql
-- DESCRIPCIÓN: Elimina las columnas legacy (String) que han sido reemplazadas por catálogos maestros (FK).
-- =====================================================

ALTER TABLE business_rrhh.employees 
    DROP COLUMN IF EXISTS identification_type,
    DROP COLUMN IF EXISTS marital_status,
    DROP COLUMN IF EXISTS blood_type,
    DROP COLUMN IF EXISTS rh_factor,
    DROP COLUMN IF EXISTS years_of_experience;

-- Notas:
-- Se mantienen identification_type_id, marital_status_id, blood_type_id,
-- rh_factor_id y experience_range_id como las fuentes de verdad.
