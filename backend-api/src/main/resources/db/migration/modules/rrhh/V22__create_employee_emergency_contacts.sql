-- V22: Create separate table for multiple emergency contacts
-- This replaces the single fields in employees table
CREATE TABLE IF NOT EXISTS business_rrhh.employee_emergency_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES business_rrhh.employees(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    -- Nombre del contacto
    relationship VARCHAR(50) NOT NULL,
    -- Parentesco (Madre, Padre, Cónyuge)
    phone_number VARCHAR(50) NOT NULL,
    -- Teléfono
    email VARCHAR(100),
    -- Email (Opcional)
    address TEXT,
    -- Dirección (Opcional)
    is_primary BOOLEAN DEFAULT FALSE,
    -- Para marcar a quién llamar primero
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- MODIFICACIÓN: Índice para búsquedas rápidas por empleado
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_employee ON business_rrhh.employee_emergency_contacts(employee_id);
-- Comentarios
COMMENT ON TABLE business_rrhh.employee_emergency_contacts IS 'Stores multiple emergency contacts for a single employee';
-- (Opcional) Limpiar columnas viejas si ya no se usarán, para evitar confusión
ALTER TABLE business_rrhh.employees DROP COLUMN IF EXISTS emergency_contact_name;
ALTER TABLE business_rrhh.employees DROP COLUMN IF EXISTS emergency_contact_phone;
ALTER TABLE business_rrhh.employees DROP COLUMN IF EXISTS emergency_contact_relationship;