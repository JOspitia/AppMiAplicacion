DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_schedule_days_header'
) THEN
ALTER TABLE business_rrhh.work_schedule_days
ADD CONSTRAINT fk_schedule_days_header FOREIGN KEY (work_schedule_id) REFERENCES business_rrhh.work_schedules(id) ON DELETE CASCADE;
-- Ensure optional cleanup
END IF;
END $$;