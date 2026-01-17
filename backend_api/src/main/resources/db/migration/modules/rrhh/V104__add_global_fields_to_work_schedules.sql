-- Migration to add global-ready fields to work_schedules
-- Adds referenceDate (for cyclical rotations) and firstDayOfWeek (for cultural adaptation)

ALTER TABLE business_rrhh.work_schedules
    ADD COLUMN reference_date DATE,
    ADD COLUMN first_day_of_week INTEGER DEFAULT 1;

COMMENT ON COLUMN business_rrhh.work_schedules.reference_date IS 'Reference date for cyclical schedules. Defines when Day 1 of the cycle starts (critical for 4x2, 6x1 rotations). NULL for WEEKLY schedules.';
COMMENT ON COLUMN business_rrhh.work_schedules.first_day_of_week IS 'First day of the week (1=Monday, 7=Sunday). Allows cultural adaptation (US=Sunday, ISO=Monday, Arab=Saturday). Default: 1 (Monday, ISO 8601).';
