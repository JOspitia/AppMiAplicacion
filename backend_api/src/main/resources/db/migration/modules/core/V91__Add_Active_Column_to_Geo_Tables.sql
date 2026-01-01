-- Migración V91: Añadir columna 'active' a tablas geográficas
-- Propósito: Sincronizar el modelo JPA con la base de datos para permitir el filtrado de estados y ciudades activos.
DO $$ BEGIN -- 1. Añadir columna active a countries (Opcional, pero recomendado por consistencia)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'configuration'
        AND table_name = 'countries'
        AND column_name = 'active'
) THEN
ALTER TABLE configuration.countries
ADD COLUMN active BOOLEAN DEFAULT TRUE;
END IF;
-- 2. Añadir columna active a states (REQUERIDO por el error reportado)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'configuration'
        AND table_name = 'states'
        AND column_name = 'active'
) THEN
ALTER TABLE configuration.states
ADD COLUMN active BOOLEAN DEFAULT TRUE;
END IF;
-- 3. Añadir columna active a cities (REQUERIDO para consistencia con el modelo)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'configuration'
        AND table_name = 'cities'
        AND column_name = 'active'
) THEN
ALTER TABLE configuration.cities
ADD COLUMN active BOOLEAN DEFAULT TRUE;
END IF;
END $$;