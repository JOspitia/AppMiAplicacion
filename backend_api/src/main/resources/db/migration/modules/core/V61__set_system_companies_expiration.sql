-- V61: Set system companies to never expire
-- These columns were added in V54 and V55, but V2 (where these companies are created) 
-- cannot refer to them due to migration order.
UPDATE security.companies
SET trial_ends_at = TIMESTAMP '9999-12-31 23:59:59'
WHERE name = 'PUBLIC'
    AND trial_ends_at IS NULL;
UPDATE security.companies
SET trial_ends_at = TIMESTAMP '9999-12-31 23:59:59',
    subscription_ends_at = TIMESTAMP '9999-12-31 23:59:59'
WHERE name = 'Tech Solutions';