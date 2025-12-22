-- V25: Migración de gender (String) a gender_id (UUID)
-- Asegura que las operaciones DDL no fallen si ya se aplicaron.
DO $$ BEGIN -- 1. Agregar la columna gender_id de forma segura (IF NOT EXISTS)
ALTER TABLE business_rrhh.employees
ADD COLUMN IF NOT EXISTS gender_id UUID;
-- 2. Migrar datos existentes (opcional: solo si la columna 'gender' original existe)
-- Si 'gender_id' se acaba de agregar, intentamos llenarlo.
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employees'
        AND column_name = 'gender'
) THEN -- Intentar migrar datos existentes donde el nombre del string coincide con el catálogo
UPDATE business_rrhh.employees e
SET gender_id = g.id
FROM configuration.genders g
WHERE LOWER(e.gender) = LOWER(g.name)
    AND e.gender_id IS NULL;
-- Solo actualizar si aún no tiene un ID
END IF;
-- 3. Agregar la restricción de clave foránea (FK) de forma segura
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_employees_gender'
) THEN
ALTER TABLE business_rrhh.employees
ADD CONSTRAINT fk_employees_gender FOREIGN KEY (gender_id) REFERENCES configuration.genders (id);
END IF;
-- 4. ELIMINAR la columna gender (VARCHAR) de forma segura
-- Esto es lo más crítico, se debe garantizar que la migración de datos ocurrió antes si es necesario.
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employees'
        AND column_name = 'gender'
) THEN
ALTER TABLE business_rrhh.employees DROP COLUMN gender;
END IF;
-- 5. Comentario de documentación
COMMENT ON COLUMN business_rrhh.employees.gender_id IS 'Foreign key to the Gender catalog.';
END $$;