-- Migration: Cleanup Companies table and add Economic Sectors
-- Author: System
-- Date: 2025-12-25
-- 1. Create Economic Sectors table
-- 1. Create or Update Economic Sectors table
CREATE TABLE IF NOT EXISTS "configuration".economic_sectors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name varchar(255) NOT NULL UNIQUE,
    active bool DEFAULT true,
    CONSTRAINT economic_sectors_pkey PRIMARY KEY (id)
);
-- Ensure columns from newer version exist and update name length
ALTER TABLE "configuration".economic_sectors
ADD COLUMN IF NOT EXISTS description text NULL;
ALTER TABLE "configuration".economic_sectors
ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "configuration".economic_sectors
ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "configuration".economic_sectors
ALTER COLUMN name TYPE varchar(255);
-- Insert some default sectors
INSERT INTO "configuration".economic_sectors (name, description)
VALUES (
        'Tecnología',
        'Desarrollo de software, hardware y servicios TI'
    ),
    (
        'Salud',
        'Hospitales, clínicas y servicios médicos'
    ),
    (
        'Financiero',
        'Banca, seguros y servicios financieros'
    ),
    (
        'Educación',
        'Instituciones educativas y centros de formación'
    ),
    (
        'Comercio / Retail',
        'Venta al por mayor y menor'
    ),
    ('Manufactura', 'Industria y producción'),
    (
        'Servicios',
        'Servicios generales y profesionales'
    ),
    ('Otro', 'Otros sectores no listados') ON CONFLICT (name) DO
UPDATE
SET description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;
-- 2. Clean up "security".companies table
-- Remove unused/legacy columns
ALTER TABLE "security".companies DROP COLUMN IF EXISTS email_extension,
    DROP COLUMN IF EXISTS business_name,
    DROP COLUMN IF EXISTS sector,
    -- Drop legacy varchar sector
    DROP COLUMN IF EXISTS employee_count,
    -- Will be calculated dynamically
    DROP COLUMN IF EXISTS address,
    -- Legacy address
    DROP COLUMN IF EXISTS phone,
    -- Legacy phone
    DROP COLUMN IF EXISTS website;
-- Moving to company_websites table
-- Add new columns if they don't exist
ALTER TABLE "security".companies
ADD COLUMN IF NOT EXISTS mobile_phone varchar(50),
    ADD COLUMN IF NOT EXISTS sector_id uuid,
    ADD COLUMN IF NOT EXISTS other_sector varchar(255);
-- Add foreign key for sector
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'companies_sector_id_fkey'
) THEN
ALTER TABLE "security".companies
ADD CONSTRAINT companies_sector_id_fkey FOREIGN KEY (sector_id) REFERENCES "configuration".economic_sectors(id);
END IF;
END $$;
-- Create index for sector
CREATE INDEX IF NOT EXISTS idx_companies_sector_id ON "security".companies USING btree (sector_id);