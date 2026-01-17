-- Migration to add support for split shifts (jornada partida)
-- Creates work_schedule_time_slots table for multiple time blocks per day

CREATE TABLE business_rrhh.work_schedule_time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    work_schedule_day_id UUID NOT NULL,
    slot_order INTEGER NOT NULL DEFAULT 1,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_next_day BOOLEAN DEFAULT FALSE,
    break_minutes INTEGER DEFAULT 0,
    
    CONSTRAINT fk_time_slot_day FOREIGN KEY (work_schedule_day_id) 
        REFERENCES business_rrhh.work_schedule_days(id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX idx_time_slots_day ON business_rrhh.work_schedule_time_slots(work_schedule_day_id);
CREATE INDEX idx_time_slots_order ON business_rrhh.work_schedule_time_slots(work_schedule_day_id, slot_order);

COMMENT ON TABLE business_rrhh.work_schedule_time_slots IS 'Time slots for split shifts (jornada partida). Multiple time blocks can exist for a single work day.';
COMMENT ON COLUMN business_rrhh.work_schedule_time_slots.slot_order IS 'Order of the time slot within the day (1, 2, 3...). Used for sorting.';
COMMENT ON COLUMN business_rrhh.work_schedule_time_slots.is_next_day IS 'True if the end time is on the next calendar day (overnight shift).';
COMMENT ON COLUMN business_rrhh.work_schedule_time_slots.break_minutes IS 'Break time in minutes within this specific time slot.';
