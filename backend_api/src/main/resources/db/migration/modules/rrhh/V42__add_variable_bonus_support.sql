-- ====================================================================================
-- 1. DDL: AÑADIR CAMPO DE TIPO DE CÁLCULO (is_variable)
-- ====================================================================================
-- 1.1 Agregar is_variable a compensation_types (debe ser individual)
ALTER TABLE business_rrhh.compensation_types
ADD COLUMN IF NOT EXISTS is_variable BOOLEAN DEFAULT FALSE;
-- 1.2 Actualizar 'COMISION_VTAS' para que sea variable
-- Este UPDATE es seguro y solo afectará filas existentes.
UPDATE business_rrhh.compensation_types
SET is_variable = TRUE
WHERE code = 'COMISION_VTAS';
-- ====================================================================================
-- 2. DDL: AÑADIR CAMPOS ESPECÍFICOS DE BONIFICACIÓN VARIABLE (RQ-3)
-- ====================================================================================
-- 2.1 Agregar calculation_base a employee_bonuses
-- Define sobre qué se calcula el porcentaje (Bruto, Neto, KPI, etc.)
ALTER TABLE business_rrhh.employee_bonuses
ADD COLUMN IF NOT EXISTS calculation_base VARCHAR(50);
-- 2.2 Agregar target_value a employee_bonuses
-- Define el valor meta que se debe alcanzar (meta de ventas)
ALTER TABLE business_rrhh.employee_bonuses
ADD COLUMN IF NOT EXISTS target_value NUMERIC(19, 2);