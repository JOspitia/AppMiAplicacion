-- V45: Transformar Compensation Types en Motor de Conceptos (Ingresos/Egresos)
-- 1. Agregar columna CATEGORY (EARNING / DEDUCTION)
ALTER TABLE business_rrhh.compensation_types
ADD COLUMN category VARCHAR(20) DEFAULT 'EARNING' NOT NULL;
-- 2. Agregar columna IS_TAXABLE (Base de Impuestos)
ALTER TABLE business_rrhh.compensation_types
ADD COLUMN is_taxable BOOLEAN DEFAULT FALSE;
-- 3. Comentarios para documentación de esquema
COMMENT ON COLUMN business_rrhh.compensation_types.category IS 'Clasificación contable: EARNING (Ingreso) o DEDUCTION (Deducción)';
COMMENT ON COLUMN business_rrhh.compensation_types.is_taxable IS 'Indica si el concepto hace base para cálculo de retención en la fuente o impuestos locales';