-- V21: Add nationality and emergency contact relationship to employees table (Idempotent)
-- Enhance employee record for better onboarding process
-- 1. Agregar columna nationality_id de forma segura
ALTER TABLE business_rrhh.employees
ADD COLUMN IF NOT EXISTS nationality_id UUID;
-- 2. Agregar la restricción de llave foránea (FK) de forma segura
-- Verificamos si la constraint ya existe antes de intentarla crear
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_employee_nationality'
) THEN
ALTER TABLE business_rrhh.employees
ADD CONSTRAINT fk_employee_nationality FOREIGN KEY (nationality_id) REFERENCES "configuration".countries (id);
END IF;
END $$;
-- 3. Agregar columna emergency_contact_relationship de forma segura
ALTER TABLE business_rrhh.employees
ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(50);
-- 4. Comentarios (Estos son seguros de ejecutar siempre)
COMMENT ON COLUMN business_rrhh.employees.nationality_id IS 'Employee nationality (Country)';
COMMENT ON COLUMN business_rrhh.employees.emergency_contact_relationship IS 'Relationship with the emergency contact (e.g., Mother, Spouse)';