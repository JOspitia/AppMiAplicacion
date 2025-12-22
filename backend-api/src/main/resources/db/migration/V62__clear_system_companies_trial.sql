-- V62: Remove trial expiration from system companies
-- The logic is now handled in TrialExpirationInterceptor to bypass these companies.
UPDATE security.companies
SET trial_ends_at = NULL,
    subscription_ends_at = NULL
WHERE name IN ('PUBLIC', 'Tech Solutions');