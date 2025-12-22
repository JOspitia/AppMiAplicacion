-- V23: Add blood type column to employees (Idempotent)
-- Required for occupational health in LATAM countries
ALTER TABLE business_rrhh.employees
ADD COLUMN IF NOT EXISTS blood_type VARCHAR(5);
-- Comentario para documentación (seguro de ejecutar siempre)
COMMENT ON COLUMN business_rrhh.employees.blood_type IS 'Blood type and RH factor (e.g., O+, A-, B+, AB-)';