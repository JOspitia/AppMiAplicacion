-- =====================================================
-- V133__add_audit_user_columns_to_education_levels.sql
-- DESCRIPCIÓN: Agrega columnas de auditoría de usuarios (created_by, updated_by) a la tabla education_levels.
-- =====================================================

-- 1. Agregar columnas
ALTER TABLE business_rrhh.education_levels
    ADD COLUMN IF NOT EXISTS created_by UUID,
    ADD COLUMN IF NOT EXISTS updated_by UUID;

-- 2. Agregar restricciones de llave foránea
ALTER TABLE business_rrhh.education_levels
    ADD CONSTRAINT fk_education_levels_created_by 
        FOREIGN KEY (created_by) REFERENCES security.users(id) ON DELETE SET NULL;

ALTER TABLE business_rrhh.education_levels
    ADD CONSTRAINT fk_education_levels_updated_by 
        FOREIGN KEY (updated_by) REFERENCES security.users(id) ON DELETE SET NULL;

-- 3. Comentarios
COMMENT ON COLUMN business_rrhh.education_levels.created_by IS 'Usuario que creó el registro';
COMMENT ON COLUMN business_rrhh.education_levels.updated_by IS 'Usuario que realizó la última actualización';
