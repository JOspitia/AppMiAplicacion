-- Add active column to currencies table
ALTER TABLE configuration.currencies ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
UPDATE configuration.currencies SET active = TRUE WHERE active IS NULL;
ALTER TABLE configuration.currencies ALTER COLUMN active SET NOT NULL;
