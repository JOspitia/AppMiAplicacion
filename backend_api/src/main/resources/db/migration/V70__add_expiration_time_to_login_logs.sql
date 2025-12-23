-- Add expiration_time to login logs to record token expiry
ALTER TABLE security.login_logs ADD COLUMN IF NOT EXISTS expiration_time TIMESTAMP;

-- Optional: populate from recent tokens if available (not applied here)