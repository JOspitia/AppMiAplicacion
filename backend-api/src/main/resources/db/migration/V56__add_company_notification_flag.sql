-- Migration V56: Add notification flag to Company
ALTER TABLE security.companies
ADD COLUMN IF NOT EXISTS subscription_notification_pending BOOLEAN DEFAULT FALSE;