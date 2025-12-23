-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS security.refresh_tokens (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES security.users(id),
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL
);