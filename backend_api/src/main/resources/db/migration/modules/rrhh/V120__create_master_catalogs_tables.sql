-- =====================================================
-- V120__create_master_catalogs_tables.sql
-- DESCRIPCIÓN: Crea tablas para catálogos maestros de Estado Civil, Grupo Sanguíneo, Factor RH y Experiencia.
-- =====================================================

-- 1. Estado Civil
CREATE TABLE IF NOT EXISTS public.marital_statuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_marital_status_created_by FOREIGN KEY (created_by) REFERENCES security.users(id),
    CONSTRAINT fk_marital_status_updated_by FOREIGN KEY (updated_by) REFERENCES security.users(id)
);

-- 2. Grupo Sanguíneo
CREATE TABLE IF NOT EXISTS public.blood_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(10) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_blood_type_created_by FOREIGN KEY (created_by) REFERENCES security.users(id),
    CONSTRAINT fk_blood_type_updated_by FOREIGN KEY (updated_by) REFERENCES security.users(id)
);

-- 3. Factor RH
CREATE TABLE IF NOT EXISTS public.rh_factors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(5) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_rh_factor_created_by FOREIGN KEY (created_by) REFERENCES security.users(id),
    CONSTRAINT fk_rh_factor_updated_by FOREIGN KEY (updated_by) REFERENCES security.users(id)
);

-- 4. Rangos de Experiencia
CREATE TABLE IF NOT EXISTS public.experience_ranges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT fk_exp_range_created_by FOREIGN KEY (created_by) REFERENCES security.users(id),
    CONSTRAINT fk_exp_range_updated_by FOREIGN KEY (updated_by) REFERENCES security.users(id)
);

-- Datos iniciales
INSERT INTO public.marital_statuses (code, name, display_order) VALUES
('SINGLE', 'Soltero/a', 1),
('MARRIED', 'Casado/a', 2),
('DIVORCED', 'Divorciado/a', 3),
('WIDOWED', 'Viudo/a', 4),
('UNION_LIBRE', 'Unión Libre', 5);

INSERT INTO public.blood_types (name, display_order) VALUES
('A', 1), ('B', 2), ('AB', 3), ('O', 4);

INSERT INTO public.rh_factors (name, display_order) VALUES
('+', 1), ('-', 2);

INSERT INTO public.experience_ranges (code, name, display_order) VALUES
('0', 'Sin experiencia', 1),
('1-3', '1 - 3 años', 2),
('3-5', '3 - 5 años', 3),
('5-10', '5 - 10 años', 4),
('10+', 'Más de 10 años', 5);

-- Agregar columnas FK a employees
ALTER TABLE business_rrhh.employees
    ADD COLUMN IF NOT EXISTS marital_status_id UUID,
    ADD COLUMN IF NOT EXISTS blood_type_id UUID,
    ADD COLUMN IF NOT EXISTS rh_factor_id UUID,
    ADD COLUMN IF NOT EXISTS experience_range_id UUID;

-- Restricciones FK
ALTER TABLE business_rrhh.employees 
    ADD CONSTRAINT fk_emp_marital_status FOREIGN KEY (marital_status_id) REFERENCES public.marital_statuses(id),
    ADD CONSTRAINT fk_emp_blood_type FOREIGN KEY (blood_type_id) REFERENCES public.blood_types(id),
    ADD CONSTRAINT fk_emp_rh_factor FOREIGN KEY (rh_factor_id) REFERENCES public.rh_factors(id),
    ADD CONSTRAINT fk_emp_experience_range FOREIGN KEY (experience_range_id) REFERENCES public.experience_ranges(id);

-- Comentarios
COMMENT ON TABLE public.marital_statuses IS 'Catálogo de estados civiles';
COMMENT ON TABLE public.blood_types IS 'Catálogo de grupos sanguíneos';
COMMENT ON TABLE public.rh_factors IS 'Catálogo de factores RH';
COMMENT ON TABLE public.experience_ranges IS 'Catálogo de rangos de experiencia laboral';
