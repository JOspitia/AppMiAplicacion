-- Migration V101: Make hierarchy_order nullable and implement partial unique index
-- This ensures that inactive items don't collide with the active hierarchy order.

-- 1. Quitar la restricción de obligatoriedad
ALTER TABLE business_rrhh.organizational_levels 
ALTER COLUMN hierarchy_order DROP NOT NULL;

-- 2. Limpiar datos existentes para evitar conflictos previos
-- Los elementos inactivos no deben tener un orden jerárquico asignado.
UPDATE business_rrhh.organizational_levels 
SET hierarchy_order = NULL 
WHERE active = FALSE;

-- 3. Eliminar la restricción única anterior para reemplazarla por una parcial
-- Nota: La anterior era (company_id, hierarchy_order)
ALTER TABLE business_rrhh.organizational_levels 
DROP CONSTRAINT IF EXISTS unique_org_level_order_per_company;

-- 4. Crear un índice único parcial (Blindaje Progresivo)
-- Esto asegura que solo los niveles ACTIVOS tengan un orden único por cada COMPAÑÍA.
-- Si el nivel está inactivo, hierarchy_order será NULL y no ocupará espacio en el índice.
DROP INDEX IF EXISTS business_rrhh.unique_active_hierarchy_order_per_company;

CREATE UNIQUE INDEX unique_active_hierarchy_order_per_company 
ON business_rrhh.organizational_levels (company_id, hierarchy_order) 
WHERE (active = TRUE AND hierarchy_order IS NOT NULL);
