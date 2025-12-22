-- Add new fields for Pricing and Free Trial support
-- 1. Business Name (Nombre Comercial/Marca)
ALTER TABLE security.companies
ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);
-- 2. Economic Sector (Tecnología, Salud, etc.)
ALTER TABLE security.companies
ADD COLUMN IF NOT EXISTS sector VARCHAR(100);
-- 3. Estimated Employee Count
ALTER TABLE security.companies
ADD COLUMN IF NOT EXISTS employee_count INTEGER;
-- 4. Trial Expiration Date (Kill Switch)
ALTER TABLE security.companies
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;
-- 5. Insert Default Trial Duration into Global Configurations
INSERT INTO configuration.global_configurations (variable_key, variable_value, description)
VALUES (
        'TRIAL_DURATION_DAYS',
        '14',
        'Default duration in days for free trial companies'
    ) ON CONFLICT (variable_key) DO NOTHING;
-- 6. Set default trial date for existing companies based on global configuration
-- Exclude 'PUBLIC' (System Company) and 'Tech Solutions' (Demo/Paid Company)
UPDATE security.companies
SET trial_ends_at = NOW() + (
        CAST(
            (
                SELECT variable_value
                FROM configuration.global_configurations
                WHERE variable_key = 'TRIAL_DURATION_DAYS'
            ) AS INTEGER
        ) * INTERVAL '1 day'
    )
WHERE trial_ends_at IS NULL
    AND name NOT IN ('PUBLIC', 'Tech Solutions');