-- Migration: Add new fields and tables for enhanced company management
-- Author: System
-- Date: 2025-12-25
-- 1. Create entity_types table for company types parametrization
CREATE TABLE IF NOT EXISTS "configuration".entity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Insert default entity types
INSERT INTO "configuration".entity_types (name, description)
VALUES (
        'Persona Jurídica',
        'Entidad con personalidad jurídica propia'
    ),
    ('Persona Natural', 'Persona física individual'),
    ('Sociedad Anónima', 'S.A. - Sociedad de capital'),
    (
        'Sociedad Limitada',
        'S.L. - Sociedad de responsabilidad limitada'
    ),
    ('Cooperativa', 'Asociación autónoma de personas'),
    ('Fundación', 'Organización sin ánimo de lucro'),
    ('ONG', 'Organización No Gubernamental'),
    ('Otro', 'Otro tipo de entidad') ON CONFLICT (name) DO NOTHING;
-- 2. Create company_websites table for multiple websites per company
CREATE TABLE IF NOT EXISTS "security".company_websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES "security".companies(id) ON DELETE CASCADE,
    url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_company_websites_company_id ON "security".company_websites(company_id);
-- 3. Alter companies table to add new fields
ALTER TABLE "security".companies -- Business Information
ADD COLUMN IF NOT EXISTS legal_name VARCHAR(255),
    -- Razón Social
ADD COLUMN IF NOT EXISTS commercial_name VARCHAR(255),
    -- Nombre Comercial
ADD COLUMN IF NOT EXISTS entity_type_id UUID REFERENCES "configuration".entity_types(id),
    ADD COLUMN IF NOT EXISTS notification_email VARCHAR(255),
    -- Correo institucional
ADD COLUMN IF NOT EXISTS main_phone VARCHAR(50),
    -- Teléfono principal
ADD COLUMN IF NOT EXISTS phone_extension VARCHAR(20),
    -- Extensión telefónica
    -- Address Fields (detailed)
ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES "configuration".countries(id),
    ADD COLUMN IF NOT EXISTS state_id UUID REFERENCES "configuration".states(id),
    ADD COLUMN IF NOT EXISTS city_id UUID REFERENCES "configuration".cities(id),
    ADD COLUMN IF NOT EXISTS street_address VARCHAR(255),
    -- Dirección completa
ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20),
    -- Branding
ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500),
    -- URL del logo en MinIO
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7),
    -- Color primario en formato #RRGGBB
    -- Operational Parameters
ADD COLUMN IF NOT EXISTS allowed_domain VARCHAR(255),
    -- Dominio permitido (ej: miempresa.com)
    -- SEO/Marketing
ADD COLUMN IF NOT EXISTS website VARCHAR(255),
    -- Sitio web principal (deprecated - usar company_websites)
ADD COLUMN IF NOT EXISTS description TEXT;
-- Descripción de la empresa
-- 4. Add comments for documentation
COMMENT ON COLUMN "security".companies.legal_name IS 'Razón Social - Nombre legal completo registrado ante las autoridades';
COMMENT ON COLUMN "security".companies.commercial_name IS 'Nombre Comercial - Cómo se conoce a la empresa';
COMMENT ON COLUMN "security".companies.entity_type_id IS 'Tipo de entidad jurídica';
COMMENT ON COLUMN "security".companies.notification_email IS 'Correo electrónico institucional para notificaciones';
COMMENT ON COLUMN "security".companies.logo_url IS 'Ruta del logo en MinIO (private-assets/{company-id}/images/)';
COMMENT ON COLUMN "security".companies.primary_color IS 'Color primario de la marca en formato hexadecimal';
COMMENT ON COLUMN "security".companies.allowed_domain IS 'Dominio permitido para registro de usuarios';
-- 5. Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';
-- Apply trigger to companies table
DROP TRIGGER IF EXISTS update_companies_updated_at ON "security".companies;
CREATE TRIGGER update_companies_updated_at BEFORE
UPDATE ON "security".companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Apply trigger to company_websites table
DROP TRIGGER IF EXISTS update_company_websites_updated_at ON "security".company_websites;
CREATE TRIGGER update_company_websites_updated_at BEFORE
UPDATE ON "security".company_websites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- 6. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_entity_type ON "security".companies(entity_type_id);
CREATE INDEX IF NOT EXISTS idx_companies_country ON "security".companies(country_id);
CREATE INDEX IF NOT EXISTS idx_companies_state ON "security".companies(state_id);
CREATE INDEX IF NOT EXISTS idx_companies_city ON "security".companies(city_id);
CREATE INDEX IF NOT EXISTS idx_companies_allowed_domain ON "security".companies(allowed_domain);