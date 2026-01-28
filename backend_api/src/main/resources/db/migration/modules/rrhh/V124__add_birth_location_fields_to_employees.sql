-- =====================================================
-- V124__add_birth_location_fields_to_employees.sql
-- DESCRIPCIÓN: Añade campos detallados de lugar de nacimiento (País y Estado/Depto)
--              para complementar la ciudad de nacimiento existente.
-- =====================================================

ALTER TABLE business_rrhh.employees 
    ADD COLUMN IF NOT EXISTS birth_country_id UUID REFERENCES configuration.countries(id),
    ADD COLUMN IF NOT EXISTS birth_state_id UUID REFERENCES configuration.states(id);

-- Comentarios
COMMENT ON COLUMN business_rrhh.employees.birth_country_id IS 'País de nacimiento del empleado';
COMMENT ON COLUMN business_rrhh.employees.birth_state_id IS 'Departamento/Estado de nacimiento del empleado';
