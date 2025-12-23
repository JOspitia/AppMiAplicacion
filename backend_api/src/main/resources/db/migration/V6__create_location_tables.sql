-- Create Location Tables in Configuration Schema
CREATE TABLE IF NOT EXISTS configuration.countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    -- ISO code like CO, US
    phone_code VARCHAR(10) -- +57, +1
);
CREATE TABLE IF NOT EXISTS configuration.states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_id UUID NOT NULL REFERENCES configuration.countries(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10),
    CONSTRAINT unique_state_per_country UNIQUE (name, country_id)
);
CREATE TABLE IF NOT EXISTS configuration.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state_id UUID NOT NULL REFERENCES configuration.states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT unique_city_per_state UNIQUE (name, state_id)
);
-- Insert some initial data (Example: Colombia)
INSERT INTO configuration.countries (name, code, phone_code)
VALUES ('Colombia', 'CO', '+57'),
    ('Estados Unidos', 'US', '+1'),
    ('México', 'MX', '+52'),
    ('España', 'ES', '+34') ON CONFLICT DO NOTHING;
-- Insert Departments for Colombia (Example)
DO $$
DECLARE co_id UUID;
BEGIN
SELECT id INTO co_id
FROM configuration.countries
WHERE code = 'CO';
IF co_id IS NOT NULL THEN
INSERT INTO configuration.states (country_id, name)
VALUES (co_id, 'Antioquia'),
    (co_id, 'Bogotá D.C.'),
    (co_id, 'Cundinamarca'),
    (co_id, 'Valle del Cauca'),
    (co_id, 'Atlántico') ON CONFLICT DO NOTHING;
END IF;
END $$;
-- Insert Cities for Bogotá (Example)
DO $$
DECLARE state_id UUID;
BEGIN
SELECT s.id INTO state_id
FROM configuration.states s
    JOIN configuration.countries c ON s.country_id = c.id
WHERE c.code = 'CO'
    AND s.name = 'Bogotá D.C.';
IF state_id IS NOT NULL THEN
INSERT INTO configuration.cities (state_id, name)
VALUES (state_id, 'Bogotá') ON CONFLICT DO NOTHING;
END IF;
END $$;