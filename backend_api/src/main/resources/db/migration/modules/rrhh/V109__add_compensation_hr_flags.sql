/*
 * Migration V109: Add HR Compliance flags to Compensation Types table
 */

ALTER TABLE business_rrhh.compensation_types
ADD COLUMN affects_social_security BOOLEAN DEFAULT FALSE,
ADD COLUMN affects_parafiscals BOOLEAN DEFAULT FALSE,
ADD COLUMN affects_benefits BOOLEAN DEFAULT FALSE,
ADD COLUMN affects_arl BOOLEAN DEFAULT FALSE,
ADD COLUMN external_code VARCHAR(50); -- Código de reporte (UGPP, Nómina Electrónica, etc)
