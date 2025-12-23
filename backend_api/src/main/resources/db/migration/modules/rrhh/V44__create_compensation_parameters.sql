-- 1. Crear tabla de Periodicidades
CREATE TABLE business_rrhh.periodicities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    days_interval INTEGER,
    -- Opcional: para cálculos automáticos de fecha
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    created_by UUID,
    updated_by UUID
);
-- 2. Crear tabla de Bases de Cálculo
CREATE TABLE business_rrhh.calculation_bases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE,
    created_by UUID,
    updated_by UUID
);
-- 3. Insertar datos iniciales - Periodicidades
INSERT INTO business_rrhh.periodicities (code, name, days_interval)
VALUES ('MENSUAL', 'Mensual', 30),
    ('BIMESTRAL', 'Bimestral', 60),
    ('TRIMESTRAL', 'Trimestral', 90),
    ('SEMESTRAL', 'Semestral', 180),
    ('ANUAL', 'Anual', 365),
    ('UNICA_VEZ', 'Única Vez', 0);
-- 4. Insertar datos iniciales - Bases de Cálculo
INSERT INTO business_rrhh.calculation_bases (code, name, description)
VALUES (
        'SALARIO_BASE',
        'Salario Base',
        'Calculado sobre el salario base del empleado'
    ),
    (
        'MONTO_FIJO',
        'Monto Fijo',
        'Valor monetario fijo sin cálculo porcentual'
    ),
    (
        'INGRESOS_NETOS',
        'Ingresos Netos',
        'Calculado sobre los ingresos netos de la compañía o centro de costos'
    ),
    (
        'MARGEN_BRUTO',
        'Margen Bruto',
        'Base sobre el margen bruto'
    ),
    ('EBITDA', 'EBITDA', 'Calculado sobre el EBITDA'),
    (
        'KPI_INDIVIDUAL',
        'KPI Individual',
        'Basado en cumplimiento de objetivos personales'
    ),
    (
        'KPI_GRUPAL',
        'KPI Grupal',
        'Basado en cumplimiento de objetivos de equipo'
    ),
    (
        'UTILIDAD_NETA',
        'Utilidad Neta',
        'Calculado sobre la utilidad final'
    );
-- 5. Actualizar tabla compensation_types
ALTER TABLE business_rrhh.compensation_types
ADD COLUMN periodicity_id UUID,
    ADD COLUMN calculation_base_id UUID;
ALTER TABLE business_rrhh.compensation_types
ADD CONSTRAINT fk_compensation_types_periodicity FOREIGN KEY (periodicity_id) REFERENCES business_rrhh.periodicities(id);
ALTER TABLE business_rrhh.compensation_types
ADD CONSTRAINT fk_compensation_types_calculation_base FOREIGN KEY (calculation_base_id) REFERENCES business_rrhh.calculation_bases(id);
-- 6. Migrar datos existentes (Best Effort)
-- Periodicidad
UPDATE business_rrhh.compensation_types ct
SET periodicity_id = p.id
FROM business_rrhh.periodicities p
WHERE UPPER(ct.periodicity) = p.code;
-- Base Cálculo
UPDATE business_rrhh.compensation_types ct
SET calculation_base_id = cb.id
FROM business_rrhh.calculation_bases cb
WHERE UPPER(ct.calculation_base) = cb.code;
-- 7. Actualizar tabla employee_bonuses (Si aplica, según el modelo Java visto)
ALTER TABLE business_rrhh.employee_bonuses
ADD COLUMN periodicity_id UUID,
    ADD COLUMN calculation_base_id UUID;
ALTER TABLE business_rrhh.employee_bonuses
ADD CONSTRAINT fk_employee_bonuses_periodicity FOREIGN KEY (periodicity_id) REFERENCES business_rrhh.periodicities(id);
ALTER TABLE business_rrhh.employee_bonuses
ADD CONSTRAINT fk_employee_bonuses_calculation_base FOREIGN KEY (calculation_base_id) REFERENCES business_rrhh.calculation_bases(id);
-- Migrar bonos empleados
UPDATE business_rrhh.employee_bonuses eb
SET periodicity_id = p.id
FROM business_rrhh.periodicities p
WHERE UPPER(eb.periodicity) = p.code;
UPDATE business_rrhh.employee_bonuses eb
SET calculation_base_id = cb.id
FROM business_rrhh.calculation_bases cb
WHERE UPPER(eb.calculation_base) = cb.code;
-- NOTA: No borramos las columnas viejas (periodicity, calculation_base) todavía 
-- para evitar romper el código Java existente mientras se refactoriza. 
-- Se pueden marcar como DEPRECATED o borrar en un script V45.