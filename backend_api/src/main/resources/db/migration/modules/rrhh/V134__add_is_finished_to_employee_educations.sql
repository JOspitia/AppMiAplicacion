-- =====================================================
-- V134__add_is_finished_to_employee_educations.sql
-- DESCRIPCIÓN: Agrega la columna is_finished para indicar si la formación está completa o en curso.
-- =====================================================

ALTER TABLE business_rrhh.employee_educations
ADD COLUMN IF NOT EXISTS is_finished BOOLEAN DEFAULT TRUE;

COMMENT ON COLUMN business_rrhh.employee_educations.is_finished IS 'Indica si la formación académica ha sido finalizada (true) o si está en curso (false)';
