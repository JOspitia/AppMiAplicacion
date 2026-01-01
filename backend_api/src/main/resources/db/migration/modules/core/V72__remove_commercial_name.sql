-- Migration: Remove commercial_name column and use name field instead
-- Author: System
-- Date: 2025-12-25
-- Drop commercial_name column since we'll use 'name' for commercial name
ALTER TABLE "security".companies DROP COLUMN IF EXISTS commercial_name;
-- Update comment for name field to clarify it's the commercial name
COMMENT ON COLUMN "security".companies.name IS 'Nombre Comercial - Cómo se conoce a la empresa';
COMMENT ON COLUMN "security".companies.legal_name IS 'Razón Social - Nombre legal completo registrado ante las autoridades';