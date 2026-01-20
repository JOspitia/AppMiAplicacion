/*
 * Migration V110: Add statutory limit percentage to Cost Centers
 */

ALTER TABLE business_rrhh.cost_centers
ADD COLUMN statutory_limit_percentage NUMERIC(5, 2) DEFAULT 40.00;
