-- =====================================================
-- V136__fix_catalog_schemas_and_foreign_keys.sql
-- DESCRIPCIÓN: Borrado de tablas duplicadas y recreación global en public.
-- =====================================================

-- 1. ELIMINAR RESTRICCIONES DEPENDIENTES
ALTER TABLE business_rrhh.employees DROP CONSTRAINT IF EXISTS employees_education_level_id_fkey;
ALTER TABLE business_rrhh.employees DROP CONSTRAINT IF EXISTS fk_employees_education_level;
ALTER TABLE business_rrhh.employees DROP CONSTRAINT IF EXISTS employees_shirt_size_id_fkey;
ALTER TABLE business_rrhh.employees DROP CONSTRAINT IF EXISTS employees_pants_size_id_fkey;
ALTER TABLE business_rrhh.employees DROP CONSTRAINT IF EXISTS employees_shoe_size_id_fkey;
ALTER TABLE business_rrhh.employee_educations DROP CONSTRAINT IF EXISTS fk_employee_edu_level;

-- 1.1 Quitar NOT NULL temporalmente para permitir el reset
ALTER TABLE business_rrhh.employee_educations ALTER COLUMN education_level_id DROP NOT NULL;

-- 2. LIMPIEZA ABSOLUTA (Borrar tablas en ambos esquemas para resetear)
DROP TABLE IF EXISTS business_rrhh.education_levels CASCADE;
DROP TABLE IF EXISTS business_rrhh.clothing_sizes CASCADE;
DROP TABLE IF EXISTS public.education_levels CASCADE;
DROP TABLE IF EXISTS public.clothing_sizes CASCADE;

-- 3. CREACIÓN LIMPIA EN public (Sin company_id, catálogo global)
CREATE TABLE public.education_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

CREATE TABLE public.clothing_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'SHIRT', 'PANTS', 'SHOES'
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT uq_clothing_sizes_global UNIQUE (code, category)
);

-- 4. REPARAR COLUMNAS EN TABLAS DE NEGOCIO
-- Ponemos en NULL los campos de los empleados ya que sus IDs viejos ya no existen.
UPDATE business_rrhh.employees SET education_level_id = NULL, shirt_size_id = NULL, pants_size_id = NULL, shoe_size_id = NULL;
UPDATE business_rrhh.employee_educations SET education_level_id = NULL;

-- 5. RE-VINCULAR LLAVES FORÁNEAS (Hacia las nuevas tablas en public)
ALTER TABLE business_rrhh.employees ADD CONSTRAINT fk_employees_education_level FOREIGN KEY (education_level_id) REFERENCES public.education_levels(id);
ALTER TABLE business_rrhh.employees ADD CONSTRAINT fk_employees_shirt_size FOREIGN KEY (shirt_size_id) REFERENCES public.clothing_sizes(id);
ALTER TABLE business_rrhh.employees ADD CONSTRAINT fk_employees_pants_size FOREIGN KEY (pants_size_id) REFERENCES public.clothing_sizes(id);
ALTER TABLE business_rrhh.employees ADD CONSTRAINT fk_employees_shoe_size FOREIGN KEY (shoe_size_id) REFERENCES public.clothing_sizes(id);
ALTER TABLE business_rrhh.employee_educations ADD CONSTRAINT fk_employee_edu_level FOREIGN KEY (education_level_id) REFERENCES public.education_levels(id);

-- 6. SEED DE DATOS GLOBALES
INSERT INTO public.education_levels (code, name, sort_order) VALUES 
    ('PRIMARIA', 'Primaria', 1), ('BACHILLER', 'Bachillerato', 2), ('TECNICO', 'Técnico', 3), 
    ('TECNOLOGO', 'Tecnólogo', 4), ('PROFESIONAL', 'Profesional', 5), ('ESPECIALIZACION', 'Especialización', 6), 
    ('MAESTRIA', 'Maestría', 7), ('DOCTORADO', 'Doctorado', 8);

INSERT INTO public.clothing_sizes (code, name, category, sort_order) VALUES 
    ('XS', 'Extra Small', 'SHIRT', 1), ('S', 'Small', 'SHIRT', 2), ('M', 'Medium', 'SHIRT', 3), ('L', 'Large', 'SHIRT', 4), ('XL', 'Extra Large', 'SHIRT', 5),
    ('28', 'Talla 28', 'PANTS', 1), ('30', 'Talla 30', 'PANTS', 2), ('32', 'Talla 32', 'PANTS', 3), ('34', 'Talla 34', 'PANTS', 4), ('36', 'Talla 36', 'PANTS', 5),
    ('36', 'Talla 36', 'SHOES', 1), ('37', 'Talla 37', 'SHOES', 2), ('38', 'Talla 38', 'SHOES', 3), ('39', 'Talla 39', 'SHOES', 4), ('40', 'Talla 40', 'SHOES', 5);
