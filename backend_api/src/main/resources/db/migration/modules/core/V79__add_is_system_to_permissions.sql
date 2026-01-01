-- Add is_system column to security.permissions
ALTER TABLE security.permissions
ADD COLUMN is_system BOOLEAN DEFAULT FALSE;
-- Update existing permissions to mark them as system permissions where appropriate
-- Specifically for Permission Management permissions which should be restricted
UPDATE security.permissions
SET is_system = TRUE
WHERE name IN (
        'CORE_PERMISSION_VIEW',
        'CORE_PERMISSION_CREATE',
        'CORE_PERMISSION_EDIT',
        'CORE_PERMISSION_DELETE'
    );