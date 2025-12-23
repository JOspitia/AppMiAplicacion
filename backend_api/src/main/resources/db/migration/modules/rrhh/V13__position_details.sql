-- =====================================================
-- V4 - Position Details: Functions, Skills, Requirements, Experience
-- =====================================================
-- This migration adds detailed information tables for positions
-- including functions, skills (with levels), requirements, and experience
-- =====================================================
-- POSITION FUNCTIONS (Responsabilidades y funciones del cargo)
-- =====================================================
CREATE TABLE IF NOT EXISTS business_rrhh.position_functions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL REFERENCES business_rrhh.positions(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    display_order INT DEFAULT 0,
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);
CREATE INDEX IF NOT EXISTS idx_position_functions_position ON business_rrhh.position_functions(position_id);
-- =====================================================
-- SKILL LEVELS (Niveles de dominio de competencias)
-- =====================================================
CREATE TABLE IF NOT EXISTS business_rrhh.skill_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    -- Avanzado, Intermedio, Básico, Bajo
    code VARCHAR(20) NOT NULL,
    -- ADVANCED, INTERMEDIATE, BASIC, LOW
    weight INT DEFAULT 1,
    -- Peso para evaluaciones (4=Avanzado, 3=Intermedio, 2=Básico, 1=Bajo)
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    -- Auditoría  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_skill_level_company_code UNIQUE (company_id, code)
);
-- Insertar niveles de habilidad por defecto para cada compañía existente
INSERT INTO business_rrhh.skill_levels (company_id, name, code, weight, description)
SELECT c.id,
    skill.name,
    skill.code,
    skill.weight,
    skill.description
FROM security.companies c
    CROSS JOIN (
        VALUES (
                'Avanzado',
                'ADVANCED',
                4,
                'Dominio experto, puede enseñar a otros'
            ),
            (
                'Intermedio',
                'INTERMEDIATE',
                3,
                'Buen dominio, trabaja de forma independiente'
            ),
            (
                'Básico',
                'BASIC',
                2,
                'Conocimiento funcional, requiere supervisión ocasional'
            ),
            (
                'Bajo',
                'LOW',
                1,
                'Conocimiento inicial, requiere capacitación'
            )
    ) AS skill(name, code, weight, description) ON CONFLICT (company_id, code) DO NOTHING;
-- =====================================================
-- POSITION SKILLS (Habilidades/Conocimientos requeridos)
-- =====================================================
CREATE TABLE IF NOT EXISTS business_rrhh.position_skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL REFERENCES business_rrhh.positions(id) ON DELETE CASCADE,
    skill_name VARCHAR(200) NOT NULL,
    -- Nombre de la habilidad (ej: "Excel", "Java", "Liderazgo")
    skill_level_id UUID REFERENCES business_rrhh.skill_levels(id),
    is_mandatory BOOLEAN DEFAULT TRUE,
    -- ¿Es obligatoria?
    description TEXT,
    -- Descripción adicional
    display_order INT DEFAULT 0,
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);
CREATE INDEX IF NOT EXISTS idx_position_skills_position ON business_rrhh.position_skills(position_id);
-- =====================================================
-- POSITION REQUIREMENTS (Requisitos del cargo)
-- =====================================================
CREATE TABLE IF NOT EXISTS business_rrhh.position_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL REFERENCES business_rrhh.positions(id) ON DELETE CASCADE,
    requirement_type VARCHAR(50) NOT NULL,
    -- EDUCATION, CERTIFICATION, LICENSE, OTHER
    description TEXT NOT NULL,
    -- Descripción del requisito
    is_mandatory BOOLEAN DEFAULT TRUE,
    -- ¿Es obligatorio?
    display_order INT DEFAULT 0,
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);
CREATE INDEX IF NOT EXISTS idx_position_requirements_position ON business_rrhh.position_requirements(position_id);
-- =====================================================
-- POSITION EXPERIENCE (Experiencia requerida)
-- =====================================================
CREATE TABLE IF NOT EXISTS business_rrhh.position_experience (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL REFERENCES business_rrhh.positions(id) ON DELETE CASCADE,
    area VARCHAR(200) NOT NULL,
    -- Área de experiencia (ej: "Desarrollo de Software", "Gestión de proyectos")
    min_years INT DEFAULT 0,
    -- Años mínimos de experiencia
    max_years INT,
    -- Años máximos (opcional, para rangos)
    is_mandatory BOOLEAN DEFAULT TRUE,
    -- ¿Es obligatoria?
    description TEXT,
    -- Descripción adicional
    display_order INT DEFAULT 0,
    -- Auditoría
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);
CREATE INDEX IF NOT EXISTS idx_position_experience_position ON business_rrhh.position_experience(position_id);
-- =====================================================
-- UPDATE POSITIONS TABLE (agregar campos faltantes si no existen)
-- =====================================================
DO $$ BEGIN -- Agregar description si no existe
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'positions'
        AND column_name = 'description'
) THEN
ALTER TABLE business_rrhh.positions
ADD COLUMN description TEXT;
END IF;
-- Agregar currency_id si no existe (para el símbolo de moneda en salarios)
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'positions'
        AND column_name = 'currency_id'
) THEN
ALTER TABLE business_rrhh.positions
ADD COLUMN currency_id UUID REFERENCES configuration.currencies(id);
END IF;
END $$;
-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE business_rrhh.position_functions IS 'Funciones y responsabilidades asociadas a cada cargo';
COMMENT ON TABLE business_rrhh.skill_levels IS 'Niveles de dominio de competencias/habilidades';
COMMENT ON TABLE business_rrhh.position_skills IS 'Habilidades y conocimientos requeridos para cada cargo';
COMMENT ON TABLE business_rrhh.position_requirements IS 'Requisitos adicionales (educación, certificaciones, etc.)';
COMMENT ON TABLE business_rrhh.position_experience IS 'Experiencia laboral requerida para cada cargo';
-- ==============================================================================
-- CORRECCIÓN: Agregar created_by y updated_by a document_types de forma segura
-- ==============================================================================
-- 1. Verificar y añadir la columna created_by
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'document_types'
        AND column_name = 'created_by'
) THEN
ALTER TABLE business_rrhh.document_types
ADD COLUMN created_by UUID REFERENCES security.users(id);
END IF;
END $$;
-- 2. Verificar y añadir la columna updated_by
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'document_types'
        AND column_name = 'updated_by'
) THEN
ALTER TABLE business_rrhh.document_types
ADD COLUMN updated_by UUID REFERENCES security.users(id);
END IF;
END $$;