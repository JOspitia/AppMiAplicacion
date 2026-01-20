-- Migration to ensure basic skill levels exist for all existing companies
-- This fixes the empty "Skill Levels" dropdown in the Positions module

-- 1. Ensure the table exists (it should, but safety first)
CREATE TABLE IF NOT EXISTS business_rrhh.skill_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    weight INT DEFAULT 0,
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    CONSTRAINT uq_skill_level_company_code_v2 UNIQUE (company_id, code)
);

-- 2. Insert default levels for companies that don't have them
INSERT INTO business_rrhh.skill_levels (company_id, name, code, weight, description)
SELECT c.id, skill.name, skill.code, skill.weight, skill.description
FROM security.companies c
CROSS JOIN (
    VALUES 
        ('Avanzado', 'ADVANCED', 4, 'Dominio experto, puede enseñar a otros'),
        ('Intermedio', 'INTERMEDIATE', 3, 'Buen dominio, trabaja de forma independiente'),
        ('Básico', 'BASIC', 2, 'Dominio inicial, requiere supervisión ocasional'),
        ('Bajo', 'LOW', 1, 'Conocimiento nulo o muy limitado')
) AS skill(name, code, weight, description)
WHERE NOT EXISTS (
    SELECT 1 FROM business_rrhh.skill_levels sl 
    WHERE sl.company_id = c.id AND sl.code = skill.code
);

-- 3. Add commentary for documentation
COMMENT ON TABLE business_rrhh.skill_levels IS 'Niveles de dominio de competencias/habilidades (Básico, Intermedio, Avanzado, Experto)';
