-- V24: Separar apellidos en primer y segundo apellido
-- El campo last_name existente se renombra a first_last_name
-- Se agrega second_last_name opcional
DO $$ BEGIN -- 1. RENOMBRAR la columna last_name a first_last_name de forma segura.
-- Se verifica si la columna 'last_name' aún existe. Si existe, la renombra.
IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'employees'
        AND column_name = 'last_name'
) THEN
ALTER TABLE business_rrhh.employees
    RENAME COLUMN last_name TO first_last_name;
END IF;
-- 2. AGREGAR columna para segundo apellido de forma segura.
-- Se utiliza IF NOT EXISTS.
ALTER TABLE business_rrhh.employees
ADD COLUMN IF NOT EXISTS second_last_name VARCHAR(100);
-- 3. Comentarios para documentación (seguros de ejecutar siempre).
COMMENT ON COLUMN business_rrhh.employees.first_last_name IS 'Primer apellido del empleado';
COMMENT ON COLUMN business_rrhh.employees.second_last_name IS 'Segundo apellido del empleado (opcional)';
END $$;