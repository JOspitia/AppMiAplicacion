-- ====================================================================================
-- Migración: Agregar campos de liquidación a compensation_types (RQ-1, RQ-2, RQ-3)
-- ====================================================================================
-- 1. Agregar campos de liquidación base (RQ-1)
DO $$ BEGIN -- cost_center_id
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'compensation_types'
        AND column_name = 'cost_center_id'
) THEN
ALTER TABLE business_rrhh.compensation_types
ADD COLUMN cost_center_id UUID;
END IF;
-- currency_id
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'compensation_types'
        AND column_name = 'currency_id'
) THEN
ALTER TABLE business_rrhh.compensation_types
ADD COLUMN currency_id UUID;
END IF;
-- periodicity
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'compensation_types'
        AND column_name = 'periodicity'
) THEN
ALTER TABLE business_rrhh.compensation_types
ADD COLUMN periodicity VARCHAR(50);
END IF;
-- fixed_amount
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'compensation_types'
        AND column_name = 'fixed_amount'
) THEN
ALTER TABLE business_rrhh.compensation_types
ADD COLUMN fixed_amount NUMERIC(19, 2);
END IF;
-- percentage
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'compensation_types'
        AND column_name = 'percentage'
) THEN
ALTER TABLE business_rrhh.compensation_types
ADD COLUMN percentage NUMERIC(5, 2);
END IF;
END $$;
-- 2. Agregar campos para bonos variables (RQ-3)
DO $$ BEGIN -- calculation_base
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'compensation_types'
        AND column_name = 'calculation_base'
) THEN
ALTER TABLE business_rrhh.compensation_types
ADD COLUMN calculation_base VARCHAR(100);
END IF;
-- target_value
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'compensation_types'
        AND column_name = 'target_value'
) THEN
ALTER TABLE business_rrhh.compensation_types
ADD COLUMN target_value NUMERIC(19, 2);
END IF;
END $$;
-- 3. Agregar constraints de foreign keys
DO $$ BEGIN -- FK cost_center
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'business_rrhh'
        AND table_name = 'compensation_types'
        AND constraint_name = 'fk_compensation_types_cost_center'
) THEN
ALTER TABLE business_rrhh.compensation_types
ADD CONSTRAINT fk_compensation_types_cost_center FOREIGN KEY (cost_center_id) REFERENCES business_rrhh.cost_centers(id);
END IF;
-- FK currency
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'business_rrhh'
        AND table_name = 'compensation_types'
        AND constraint_name = 'fk_compensation_types_currency'
) THEN
ALTER TABLE business_rrhh.compensation_types
ADD CONSTRAINT fk_compensation_types_currency FOREIGN KEY (currency_id) REFERENCES configuration.currencies(id);
END IF;
-- Check constraint
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'business_rrhh'
        AND table_name = 'compensation_types'
        AND constraint_name = 'chk_amount_or_percentage'
) THEN
ALTER TABLE business_rrhh.compensation_types
ADD CONSTRAINT chk_amount_or_percentage CHECK (
        (
            fixed_amount IS NOT NULL
            AND percentage IS NULL
        )
        OR (
            fixed_amount IS NULL
            AND percentage IS NOT NULL
        )
        OR (
            fixed_amount IS NULL
            AND percentage IS NULL
        )
    );
END IF;
END $$;
-- 4. Comentarios para documentación
COMMENT ON COLUMN business_rrhh.compensation_types.cost_center_id IS 'Centro de costos que paga la bonificación';
COMMENT ON COLUMN business_rrhh.compensation_types.currency_id IS 'Moneda del pago (se carga del centro de costos)';
COMMENT ON COLUMN business_rrhh.compensation_types.periodicity IS 'Frecuencia: MENSUAL, ANUAL, UNICA_VEZ';
COMMENT ON COLUMN business_rrhh.compensation_types.fixed_amount IS 'Monto fijo (para bonos no variables)';
COMMENT ON COLUMN business_rrhh.compensation_types.percentage IS 'Porcentaje (para bonos variables)';
COMMENT ON COLUMN business_rrhh.compensation_types.calculation_base IS 'Base de cálculo para bonos variables (ej: INGRESOS_NETOS, MARGEN, KPI)';
COMMENT ON COLUMN business_rrhh.compensation_types.target_value IS 'Valor meta para activar el bono variable';