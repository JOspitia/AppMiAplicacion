-- V17__create_identification_types.sql
-- 1. Crear tabla en esquema PUBLIC (Datos Maestros Transversales)
CREATE TABLE IF NOT EXISTS public.identification_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL,
    -- Ej: 'CC', 'DNI', 'PASS'
    name VARCHAR(100) NOT NULL,
    -- Ej: 'Cédula de Ciudadanía'
    country_code VARCHAR(3),
    -- Ej: 'COL', 'ESP', 'MEX'. NULL si es global
    validation_regex VARCHAR(100),
    -- Para validaciones futuras
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_id_type_code UNIQUE (code, country_code)
);
-- 2. Sembrar Datos Iniciales (Colombia y Globales como ejemplo)
INSERT INTO public.identification_types (code, name, country_code, validation_regex)
VALUES -- Colombia
    (
        'CC',
        'Cédula de Ciudadanía',
        'COL',
        '^[0-9]{3,10}$'
    ),
    (
        'CE',
        'Cédula de Extranjería',
        'COL',
        '^[0-9]{3,10}$'
    ),
    (
        'TI',
        'Tarjeta de Identidad',
        'COL',
        '^[0-9]{3,11}$'
    ),
    (
        'NIT',
        'Número de Identificación Tributaria',
        'COL',
        '^[0-9]{9,10}$'
    ),
    -- Global / Otros
    (
        'PASSPORT',
        'Pasaporte',
        NULL,
        '^[A-Z0-9]{6,20}$'
    ),
    (
        'DNI',
        'Documento Nacional de Identidad',
        'ESP',
        '^[0-9]{8}[A-Z]$'
    ),
    (
        'NIE',
        'Número de Identidad de Extranjero',
        'ESP',
        '^[XYZ][0-9]{7}[A-Z]$'
    ),
    (
        'SSN',
        'Social Security Number',
        'USA',
        '^[0-9]{3}-[0-9]{2}-[0-9]{4}$'
    ) ON CONFLICT (code, country_code) DO NOTHING;
-- 3. Modificar tabla Employees para usar la nueva relación
-- Primero añadimos la columna
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employees'
        AND column_name = 'identification_type_id'
) THEN
ALTER TABLE business_rrhh.employees
ADD COLUMN identification_type_id UUID REFERENCES public.identification_types(id);
END IF;
END $$;
-- Opcional: Migrar datos existentes? 
-- Si hay datos en 'document_type' (string/enum) habría que mapearlos. 
-- Por ahora asumiremos que es seguro dejarla nula o migrar manualmente si es producción.
-- ALTER TABLE business_rrhh.employees DROP COLUMN document_type; -- Se puede borrar luego.