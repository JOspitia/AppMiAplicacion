-- V55: Add Subscription Fields and Payment History
-- 1. Add subscription_ends_at to Companies
ALTER TABLE security.companies
ADD COLUMN IF NOT EXISTS subscription_ends_at TIMESTAMP;
-- 2. Create Payment History Table
CREATE TABLE IF NOT EXISTS business.payment_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id),
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(19, 2) NOT NULL,
    currency VARCHAR(10),
    status VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payment_history_company ON business.payment_history(company_id);
CREATE INDEX idx_payment_history_transaction ON business.payment_history(transaction_id);