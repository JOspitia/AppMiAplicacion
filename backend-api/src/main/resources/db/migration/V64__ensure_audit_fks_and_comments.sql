-- V64__ensure_audit_fks_and_comments.sql
-- DESCRIPCIÓN: Asegurar integridad referencial en campos de auditoría y agregar comentarios faltantes.
-- ==============================================================================
-- 1. ForeignKey para created/updated_by en security.users
-- ==============================================================================
DO $$ BEGIN -- created_by
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_users_created_by'
) THEN BEGIN
ALTER TABLE security.users
ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES security.users(id) ON DELETE
SET NULL;
EXCEPTION
WHEN foreign_key_violation THEN RAISE NOTICE 'No se pudo crear fk_users_created_by debido a datos inconsistentes (IDs de usuario no encontrados).';
END;
END IF;
-- updated_by
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_users_updated_by'
) THEN BEGIN
ALTER TABLE security.users
ADD CONSTRAINT fk_users_updated_by FOREIGN KEY (updated_by) REFERENCES security.users(id) ON DELETE
SET NULL;
EXCEPTION
WHEN foreign_key_violation THEN RAISE NOTICE 'No se pudo crear fk_users_updated_by debido a datos inconsistentes.';
END;
END IF;
-- deleted_by
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_users_deleted_by'
) THEN BEGIN
ALTER TABLE security.users
ADD CONSTRAINT fk_users_deleted_by FOREIGN KEY (deleted_by) REFERENCES security.users(id) ON DELETE
SET NULL;
EXCEPTION
WHEN foreign_key_violation THEN RAISE NOTICE 'No se pudo crear fk_users_deleted_by debido a datos inconsistentes.';
END;
END IF;
END $$;
-- ==============================================================================
-- 2. ForeignKey para created/updated_by en security.companies
-- ==============================================================================
DO $$ BEGIN -- created_by
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_companies_created_by'
) THEN BEGIN
ALTER TABLE security.companies
ADD CONSTRAINT fk_companies_created_by FOREIGN KEY (created_by) REFERENCES security.users(id) ON DELETE
SET NULL;
EXCEPTION
WHEN foreign_key_violation THEN RAISE NOTICE 'No se pudo crear fk_companies_created_by debido a datos inconsistentes.';
END;
END IF;
-- updated_by
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_companies_updated_by'
) THEN BEGIN
ALTER TABLE security.companies
ADD CONSTRAINT fk_companies_updated_by FOREIGN KEY (updated_by) REFERENCES security.users(id) ON DELETE
SET NULL;
EXCEPTION
WHEN foreign_key_violation THEN RAISE NOTICE 'No se pudo crear fk_companies_updated_by debido a datos inconsistentes.';
END;
END IF;
END $$;
-- ==============================================================================
-- 3. Comentarios en tablas principales
-- ==============================================================================
COMMENT ON TABLE security.users IS 'Tabla maestra de usuarios del sistema.';
COMMENT ON COLUMN security.users.username IS 'Nombre de usuario único para login.';
COMMENT ON COLUMN security.users.password IS 'Hash de contraseña (BCrypt).';
COMMENT ON COLUMN security.users.is_super_admin IS 'Indica si el usuario tiene privilegios de Super Admin global.';
COMMENT ON TABLE security.companies IS 'Tabla de empresas (tenants) del sistema.';
COMMENT ON COLUMN security.companies.nit IS 'Número de Identificación Tributaria o Fiscal.';
COMMENT ON TABLE security.roles IS 'Roles definidos por empresa o globales.';
COMMENT ON COLUMN security.roles.is_system_role IS 'Si es TRUE, el rol no debe ser eliminado ni editado drásticamente.';
COMMENT ON TABLE security.permissions IS 'Permisos granulares del sistema asignables a roles.';