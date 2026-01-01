-- Allow anonymous login logs and add status/failure reason columns
ALTER TABLE security.login_logs ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE security.login_logs ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE security.login_logs ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Optional: set default for existing rows
UPDATE security.login_logs SET status = 'UNKNOWN' WHERE status IS NULL;