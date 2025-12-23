-- Fix missing columns for work_schedules if V32 was already executed
ALTER TABLE business_rrhh.work_schedules
ADD COLUMN IF NOT EXISTS max_weekly_hours INT DEFAULT 46;
ALTER TABLE business_rrhh.work_schedules
ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';