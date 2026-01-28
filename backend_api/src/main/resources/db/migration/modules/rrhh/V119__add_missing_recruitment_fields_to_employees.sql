-- =====================================================
-- V119__add_missing_recruitment_fields_to_employees.sql
-- DESCRIPCIÓN: Agrega campos faltantes basados en el formulario de reclutamiento (Barrio, RH, Experiencia, Cargo Aplicado).
-- =====================================================

ALTER TABLE business_rrhh.employees 
    ADD COLUMN IF NOT EXISTS residence_neighborhood VARCHAR(150),
    ADD COLUMN IF NOT EXISTS rh_factor VARCHAR(5),
    ADD COLUMN IF NOT EXISTS years_of_experience VARCHAR(50),
    ADD COLUMN IF NOT EXISTS position_applied VARCHAR(150);

-- Comentarios
COMMENT ON COLUMN business_rrhh.employees.residence_neighborhood IS 'Barrio de residencia del empleado';
COMMENT ON COLUMN business_rrhh.employees.rh_factor IS 'Factor RH (+ o -)';
COMMENT ON COLUMN business_rrhh.employees.years_of_experience IS 'Años de experiencia laboral (Rango o valor)';
COMMENT ON COLUMN business_rrhh.employees.position_applied IS 'Cargo al que aplicó inicialmente el empleado';
