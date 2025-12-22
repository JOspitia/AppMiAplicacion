ALTER TABLE public.document_types
ADD COLUMN IF NOT EXISTS requires_expiration BOOLEAN DEFAULT FALSE;