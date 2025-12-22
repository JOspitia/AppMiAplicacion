-- ==============================================================================
-- V1__initial_schema.sql
-- DESCRIPCIÓN: Esquema Inicial Unificado de la Plataforma (CORE).
-- CONTIENE: DDL completo (Tablas, Constraints, Índices) para Configuration y Security.
-- NOTA: No contiene datos (INSERTs), esos van en V7.
-- ==============================================================================
-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- ==============================================================================
-- 1. CREACIÓN DE ESQUEMAS
-- ==============================================================================
CREATE SCHEMA IF NOT EXISTS configuration;
CREATE SCHEMA IF NOT EXISTS security;
CREATE SCHEMA IF NOT EXISTS business;
CREATE SCHEMA IF NOT EXISTS public_access;
-- ==============================================================================
-- 2. ESQUEMA DE CONFIGURACIÓN (Catálogos y Sistema)
-- ==============================================================================
-- 2.1 Módulos SaaS
CREATE TABLE IF NOT EXISTS configuration.saas_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    version VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 2.2 Géneros
CREATE TABLE IF NOT EXISTS configuration.genders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE
);
-- 2.3 Tipos de Dirección
CREATE TABLE IF NOT EXISTS configuration.address_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE
);
-- 2.4 Iconos del Sistema
CREATE TABLE IF NOT EXISTS configuration.icons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    svg_content TEXT NOT NULL
);
-- 2.5 Configuraciones Globales
CREATE TABLE IF NOT EXISTS configuration.global_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variable_key VARCHAR(100) NOT NULL UNIQUE,
    variable_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 2.6 Plantillas de Email
CREATE TABLE IF NOT EXISTS configuration.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    html_content TEXT,
    plain_text_content TEXT,
    available_placeholders TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 2.7 Menú Lateral (Sidebar)
CREATE TABLE IF NOT EXISTS configuration.sidebar_menu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES configuration.saas_modules(id),
    title VARCHAR(255) NOT NULL,
    url VARCHAR(512),
    parent_id UUID REFERENCES configuration.sidebar_menu(id) ON DELETE CASCADE,
    order_index INT NOT NULL,
    icon VARCHAR(100),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    permission_required VARCHAR(100),
    -- Permiso necesario para ver este item
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_sidebar_menu_title_url UNIQUE NULLS NOT DISTINCT (title, url)
);
CREATE INDEX idx_sidebar_parent ON configuration.sidebar_menu(parent_id);
CREATE INDEX idx_sidebar_order ON configuration.sidebar_menu(order_index);
-- ==============================================================================
-- 3. ESQUEMA DE SEGURIDAD (Usuarios, Empresas y Accesos)
-- ==============================================================================
-- 3.1 Empresas (Tenants)
CREATE TABLE IF NOT EXISTS security.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    nit VARCHAR(50) UNIQUE,
    status BOOLEAN DEFAULT TRUE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 3.2 Usuarios (Tabla Maestra)
CREATE TABLE IF NOT EXISTS security.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(255) NOT NULL,
    first_surname VARCHAR(255) NOT NULL,
    second_surname VARCHAR(255),
    gender_id UUID REFERENCES configuration.genders(id),
    date_of_birth DATE,
    age INTEGER,
    phone_number VARCHAR(20),
    phone_extension VARCHAR(10),
    address VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    department VARCHAR(100),
    verified BOOLEAN DEFAULT FALSE,
    is_super_admin BOOLEAN DEFAULT FALSE NOT NULL,
    pending_email VARCHAR(255),
    pending_email_token VARCHAR(255),
    password_expiry_date TIMESTAMP,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_username ON security.users(username);
CREATE INDEX idx_users_email ON security.users(email);
-- 3.3 Roles
CREATE TABLE IF NOT EXISTS security.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES security.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT FALSE,
    -- Roles que no se pueden borrar (ROOT, PUBLIC)
    active BOOLEAN DEFAULT TRUE,
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_role_per_company UNIQUE (name, company_id)
);
-- 3.4 Permisos
CREATE TABLE IF NOT EXISTS security.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES configuration.saas_modules(id),
    company_id UUID REFERENCES security.companies(id) ON DELETE CASCADE,
    -- Opcional: para permisos custom por empresa
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50),
    -- VIEW, ACTION, etc.
    created_by UUID,
    updated_by UUID,
    deleted_by UUID,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 3.5 Relación Roles <-> Permisos
CREATE TABLE IF NOT EXISTS security.role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES security.roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES security.permissions(id) ON DELETE CASCADE
);
-- 3.6 Relación Usuario <-> Empresa <-> Rol (Multitenancy)
CREATE TABLE IF NOT EXISTS security.user_company_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ucr_user FOREIGN KEY (user_id) REFERENCES security.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ucr_company FOREIGN KEY (company_id) REFERENCES security.companies(id) ON DELETE CASCADE,
    CONSTRAINT fk_ucr_role FOREIGN KEY (role_id) REFERENCES security.roles(id) ON DELETE CASCADE,
    CONSTRAINT unique_user_company_role UNIQUE (user_id, company_id, role_id)
);
-- 3.7 Suscripciones de Empresa a Módulos
CREATE TABLE IF NOT EXISTS security.company_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id),
    module_id UUID NOT NULL REFERENCES configuration.saas_modules(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ACTIVE', 'SUSPENDED', 'EXPIRED')),
    start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(company_id, module_id)
);
-- ==============================================================================
-- 4. SEGURIDAD OPERATIVA Y AUDITORÍA
-- ==============================================================================
-- 4.1 Tokens de Verificación (Email/Password)
CREATE TABLE IF NOT EXISTS security.verification_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_verification_tokens_user FOREIGN KEY (user_id) REFERENCES security.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_verification_tokens_token ON security.verification_tokens(token);
-- 4.2 Logs de Inicio de Sesión
CREATE TABLE IF NOT EXISTS security.login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token VARCHAR(255),
    login_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiration_time TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_login_logs_user FOREIGN KEY (user_id) REFERENCES security.users(id) ON DELETE CASCADE
);
CREATE INDEX idx_login_logs_user_id ON security.login_logs(user_id);
CREATE INDEX idx_login_logs_active ON security.login_logs(active);
-- 4.3 Logs de Auditoría General
CREATE TABLE IF NOT EXISTS security.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID NOT NULL,
    -- Quién hizo la acción (puede ser system o user)
    target_id UUID NOT NULL,
    -- ID del registro afectado
    action_type VARCHAR(255) NOT NULL,
    -- CREATE, UPDATE, DELETE, LOGIN, etc.
    previous_company_id UUID,
    new_company_id UUID,
    details JSONB,
    -- Opcional: Para guardar detalles del cambio
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_actor_id ON security.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_target_id ON security.audit_logs(target_id);
CREATE INDEX idx_audit_logs_timestamp ON security.audit_logs(timestamp);