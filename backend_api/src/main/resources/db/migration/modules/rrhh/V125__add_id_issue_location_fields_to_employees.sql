-- =====================================================
-- V125__add_id_issue_location_fields_to_employees.sql
-- DESCRIPCIÓN: Añade campos de País y Departamento para el lugar de expedición
--              del documento de identidad.
-- =====================================================

ALTER TABLE business_rrhh.employees 
    ADD COLUMN IF NOT EXISTS identification_issue_country_id UUID REFERENCES configuration.countries(id),
    ADD COLUMN IF NOT EXISTS identification_issue_state_id UUID REFERENCES configuration.states(id);

-- Comentarios
COMMENT ON COLUMN business_rrhh.employees.identification_issue_country_id IS 'País de expedición del documento';
COMMENT ON COLUMN business_rrhh.employees.identification_issue_state_id IS 'Departamento de expedición del documento';
