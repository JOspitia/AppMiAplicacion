-- Fix audit column types in employee_work_experiences
-- The previous migration V130 used VARCHAR(255) instead of UUID, causing ClassCastException in JPA

ALTER TABLE business_rrhh.employee_work_experiences 
ALTER COLUMN created_by TYPE UUID USING (created_by::uuid),
ALTER COLUMN updated_by TYPE UUID USING (updated_by::uuid);
