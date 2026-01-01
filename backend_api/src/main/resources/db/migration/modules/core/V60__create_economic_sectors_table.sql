-- Create Economic Sectors table
CREATE TABLE IF NOT EXISTS configuration.economic_sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    active BOOLEAN DEFAULT TRUE
);
-- Insert initial values
INSERT INTO configuration.economic_sectors (name)
VALUES ('Tecnología / Software'),
    ('Comercio / Retail'),
    ('Salud'),
    ('Construcción'),
    ('Servicios'),
    ('Manufactura'),
    ('Educación'),
    ('Transporte'),
    ('Financiero'),
    ('Otros') ON CONFLICT (name) DO NOTHING;
-- Add sector_id, other_sector, address, and phone to companies
ALTER TABLE security.companies
ADD COLUMN IF NOT EXISTS sector_id UUID REFERENCES configuration.economic_sectors(id),
    ADD COLUMN IF NOT EXISTS other_sector VARCHAR(255),
    ADD COLUMN IF NOT EXISTS address VARCHAR(255),
    ADD COLUMN IF NOT EXISTS phone VARCHAR(50);
-- Change employee_count from INTEGER to VARCHAR to match Java model
DO $$ BEGIN IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'security'
        AND table_name = 'companies'
        AND column_name = 'employee_count'
        AND data_type = 'integer'
) THEN
ALTER TABLE security.companies
ALTER COLUMN employee_count TYPE VARCHAR(50);
END IF;
END $$;