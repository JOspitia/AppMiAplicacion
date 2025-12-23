ALTER TABLE business_rrhh.employee_job_history
ADD COLUMN IF NOT EXISTS transport_aid BOOLEAN DEFAULT FALSE;