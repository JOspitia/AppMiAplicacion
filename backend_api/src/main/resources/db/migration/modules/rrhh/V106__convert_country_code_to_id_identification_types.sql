-- V106: Add company_id, audit fields, and convert country_code to country_id in identification_types
-- Strategy: Records without company_id = Global (read-only), with company_id = Company-specific (editable)

DO $$ 
BEGIN 
    -- 1. Add company_id (NULLABLE - for global catalog)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'identification_types' 
        AND column_name = 'company_id'
    ) THEN
        ALTER TABLE public.identification_types ADD COLUMN company_id UUID;
        
        -- Add FK (nullable to allow global records)
        ALTER TABLE public.identification_types 
            ADD CONSTRAINT fk_identification_types_company 
            FOREIGN KEY (company_id) REFERENCES security.companies(id) ON DELETE CASCADE;
            
        COMMENT ON COLUMN public.identification_types.company_id IS 'NULL = Global catalog (read-only). UUID = Company-specific (editable).';
    END IF;

    -- 2. Add created_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'identification_types' 
        AND column_name = 'created_by'
    ) THEN
        ALTER TABLE public.identification_types ADD COLUMN created_by UUID;
        ALTER TABLE public.identification_types 
            ADD CONSTRAINT fk_identification_types_created_by 
            FOREIGN KEY (created_by) REFERENCES security.users(id);
    END IF;

    -- 3. Add updated_by if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'identification_types' 
        AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE public.identification_types ADD COLUMN updated_by UUID;
        ALTER TABLE public.identification_types 
            ADD CONSTRAINT fk_identification_types_updated_by 
            FOREIGN KEY (updated_by) REFERENCES security.users(id);
    END IF;

    -- 4. Add country_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'identification_types' 
        AND column_name = 'country_id'
    ) THEN
        ALTER TABLE public.identification_types ADD COLUMN country_id UUID;
        
        -- Add foreign key constraint
        ALTER TABLE public.identification_types 
            ADD CONSTRAINT fk_identification_types_country 
            FOREIGN KEY (country_id) REFERENCES configuration.countries(id);
        
        COMMENT ON COLUMN public.identification_types.country_id IS 'Foreign key to Country. NULL = Global/applies to all countries.';
    END IF;

    -- 5. Migrate data from country_code to country_id (match by country code)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'identification_types' 
        AND column_name = 'country_code'
    ) THEN
        -- Update country_id based on country_code matching
        UPDATE public.identification_types it
        SET country_id = c.id
        FROM configuration.countries c
        WHERE UPPER(it.country_code) = UPPER(c.code)
        AND it.country_code IS NOT NULL
        AND it.country_id IS NULL;
        
        -- Drop the old country_code column
        ALTER TABLE public.identification_types DROP COLUMN country_code;
    END IF;

END $$;

-- Mark existing records as global (company_id = NULL)
-- Companies can add their own custom identification types
COMMENT ON TABLE public.identification_types IS 'Hybrid catalog: Global types (company_id IS NULL) + Company-specific types';
