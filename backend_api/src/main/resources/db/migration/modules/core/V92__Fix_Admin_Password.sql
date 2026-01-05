CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE security.users 
SET password = configuration.crypt('admin123', configuration.gen_salt('bf'))
WHERE username = 'admin';