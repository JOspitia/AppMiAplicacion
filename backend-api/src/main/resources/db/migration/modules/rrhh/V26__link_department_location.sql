-- V26: Create junction table for Department to Location (M:N relationship)
DO $$ BEGIN -- 1. Crear la tabla department_locations de forma segura
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'department_locations'
) THEN CREATE TABLE business_rrhh.department_locations (
    department_id UUID NOT NULL,
    location_id UUID NOT NULL,
    PRIMARY KEY (department_id, location_id)
);
-- 2. Agregar Constraints (FKs) de forma segura
-- FK a Departments
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_dl_department'
) THEN
ALTER TABLE business_rrhh.department_locations
ADD CONSTRAINT fk_dl_department FOREIGN KEY (department_id) REFERENCES business_rrhh.departments (id) ON DELETE CASCADE;
END IF;
-- FK a Locations
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_dl_location'
) THEN
ALTER TABLE business_rrhh.department_locations
ADD CONSTRAINT fk_dl_location FOREIGN KEY (location_id) REFERENCES business_rrhh.locations (id) ON DELETE CASCADE;
END IF;
-- 3. Inserción de Datos Iniciales (para evitar listas vacías en el wizard)
-- Solo se ejecuta si la tabla department_locations estaba vacía o se acaba de crear
IF (
    SELECT COUNT(*)
    FROM business_rrhh.department_locations
) = 0 THEN
INSERT INTO business_rrhh.department_locations (department_id, location_id)
SELECT d.id,
    l.id
FROM business_rrhh.departments d
    JOIN business_rrhh.locations l ON d.company_id = l.company_id;
END IF;
-- Comentarios para documentación
COMMENT ON TABLE business_rrhh.department_locations IS 'Junction table to map which departments are available in which company locations (Sedes).';
END IF;
END $$;