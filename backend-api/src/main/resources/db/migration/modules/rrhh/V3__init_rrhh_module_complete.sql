-- ==============================================================================
-- V3__init_rrhh_module_complete.sql
-- DESCRIPCIÓN: Inicialización COMPLETA y ROBUSTA del Módulo de Recursos Humanos
-- INCLUYE: Estructura Organizacional, Gestión de Talento, Historial Laboral y Contratos
-- AUTOR: Sistema (Refactored)
-- FECHA: 2025-12-05
-- ==============================================================================
CREATE SCHEMA IF NOT EXISTS business_rrhh;
-- ==============================================================================
-- 1. TABLAS MAESTRAS Y CATALOGOS
-- ==============================================================================
-- 1.1 Niveles Organizacionales (Jerarquía: Estratégico, Táctico, Operativo)
CREATE TABLE IF NOT EXISTS business_rrhh.organizational_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    hierarchy_order INTEGER NOT NULL,
    -- 1: CEO, 2: VP, etc.
    description TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID REFERENCES security.users(id),
    updated_by UUID REFERENCES security.users(id),
    CONSTRAINT unique_org_level_name_per_company UNIQUE (company_id, name),
    CONSTRAINT unique_org_level_order_per_company UNIQUE (company_id, hierarchy_order)
);
-- 1.2 Sedes / Ubicaciones (Locations)
CREATE TABLE IF NOT EXISTS business_rrhh.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    department VARCHAR(100),
    -- Estado/Provincia
    country VARCHAR(100),
    is_main BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID REFERENCES security.users(id),
    updated_by UUID REFERENCES security.users(id),
    CONSTRAINT unique_location_name_per_company UNIQUE (company_id, name)
);
-- 1.3 Centros de Costos (Cost Centers) - Eje Financiero
CREATE TABLE IF NOT EXISTS business_rrhh.cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    budget DECIMAL(19, 2),
    -- Presupuesto asignado (opcional)
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID REFERENCES security.users(id),
    updated_by UUID REFERENCES security.users(id),
    CONSTRAINT unique_cost_center_code_per_company UNIQUE (company_id, code)
);
-- 1.4 Centros Operacionales (Operational Centers) - Eje Productivo
CREATE TABLE IF NOT EXISTS business_rrhh.operational_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    location_id UUID REFERENCES business_rrhh.locations(id),
    -- Ubicación física predeterminada
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID REFERENCES security.users(id),
    updated_by UUID REFERENCES security.users(id),
    CONSTRAINT unique_op_center_code_per_company UNIQUE (company_id, code)
);
-- 1.5 Departamentos (Departments) - Eje Funcional
CREATE TABLE IF NOT EXISTS business_rrhh.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id) ON DELETE CASCADE,
    parent_department_id UUID REFERENCES business_rrhh.departments(id),
    -- Jerarquía de departamentos
    cost_center_id UUID REFERENCES business_rrhh.cost_centers(id),
    -- Relación financiera por defecto
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    manager_position_id UUID,
    -- Se definirá FK más adelante (Circular reference handling)
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID REFERENCES security.users(id),
    updated_by UUID REFERENCES security.users(id),
    CONSTRAINT unique_dept_code_per_company UNIQUE (company_id, code)
);
-- 1.6 Cargos / Posiciones (Positions)
CREATE TABLE IF NOT EXISTS business_rrhh.positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id) ON DELETE CASCADE,
    department_id UUID NOT NULL REFERENCES business_rrhh.departments(id),
    organizational_level_id UUID REFERENCES business_rrhh.organizational_levels(id),
    -- Nivel jerárquico del puesto
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    functions TEXT,
    requirements TEXT,
    min_salary DECIMAL(19, 2),
    max_salary DECIMAL(19, 2),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID REFERENCES security.users(id),
    updated_by UUID REFERENCES security.users(id),
    CONSTRAINT unique_position_name_per_department UNIQUE (department_id, name)
);
-- Add circular FK for Department Manager Position
ALTER TABLE business_rrhh.departments
ADD CONSTRAINT fk_departments_manager_position FOREIGN KEY (manager_position_id) REFERENCES business_rrhh.positions(id);
-- 1.7 Tipos de Contrato
CREATE TABLE IF NOT EXISTS business_rrhh.contract_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    has_end_date BOOLEAN DEFAULT TRUE,
    -- Indica si es indefinido o fijo
    default_duration_months INTEGER,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID REFERENCES security.users(id),
    updated_by UUID REFERENCES security.users(id),
    CONSTRAINT unique_contract_type_name_per_company UNIQUE (company_id, name)
);
-- 1.8 Tipos de Documento (Document Types)
CREATE TABLE IF NOT EXISTS business_rrhh.document_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    -- Cédula, Pasaporte, Licencia, Título, Contrato Firmado, etc.
    code VARCHAR(50),
    is_required BOOLEAN DEFAULT FALSE,
    requires_expiration BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT unique_document_type_name_per_company UNIQUE (company_id, name)
);
-- ==============================================================================
-- 2. GESTIÓN DE EMPLEADOS (CORE)
-- ==============================================================================
-- 2.1 Empleados (Perfil Personal)
-- Nota: Se han retirado los campos transaccionales (salary, position, contract)
CREATE TABLE IF NOT EXISTS business_rrhh.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES security.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES security.users(id),
    -- Link opcional a usuario del sistema (Login)
    -- Información Personal
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    identification_type VARCHAR(50),
    -- DNI, Pasaporte, etc (Puede ser FK a document_types o enum simple)
    identification_number VARCHAR(50) NOT NULL,
    birth_date DATE,
    gender VARCHAR(20),
    marital_status VARCHAR(20),
    -- Contacto
    email_personal VARCHAR(150),
    email_corporate VARCHAR(150),
    phone_mobile VARCHAR(20),
    phone_home VARCHAR(20),
    address TEXT,
    -- Emergencia
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(20),
    -- Información Bancaria
    bank_name VARCHAR(100),
    bank_account_type VARCHAR(50),
    -- Ahorros, Corriente
    bank_account_number VARCHAR(50),
    photo_url VARCHAR(255),
    active BOOLEAN DEFAULT TRUE,
    -- Estado general del registro
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID REFERENCES security.users(id),
    updated_by UUID REFERENCES security.users(id),
    CONSTRAINT unique_identification_per_company UNIQUE (company_id, identification_number),
    CONSTRAINT unique_corp_email_per_company UNIQUE (company_id, email_corporate)
);
-- 2.2 Historial de Contratos (Contracts)
CREATE TABLE IF NOT EXISTS business_rrhh.employee_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES business_rrhh.employees(id) ON DELETE CASCADE,
    contract_type_id UUID NOT NULL REFERENCES business_rrhh.contract_types(id),
    start_date DATE NOT NULL,
    end_date DATE,
    -- Null si es indefinido
    contract_number VARCHAR(100),
    contract_document_url VARCHAR(255),
    -- Referencia al archivo firmado
    signed_at TIMESTAMP,
    active BOOLEAN DEFAULT TRUE,
    -- Indica si es el contrato vigente
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID REFERENCES security.users(id),
    updated_by UUID REFERENCES security.users(id)
);
-- 2.3 Historial Laboral / Funcional (Job History)
-- Registra cada cambio de puesto, salario, jefe o ubicación
CREATE TABLE IF NOT EXISTS business_rrhh.employee_job_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES business_rrhh.employees(id) ON DELETE CASCADE,
    position_id UUID NOT NULL REFERENCES business_rrhh.positions(id),
    department_id UUID REFERENCES business_rrhh.departments(id),
    -- Redundante con Position, pero historizable.
    cost_center_id UUID REFERENCES business_rrhh.cost_centers(id),
    location_id UUID REFERENCES business_rrhh.locations(id),
    operational_center_id UUID REFERENCES business_rrhh.operational_centers(id),
    supervisor_id UUID REFERENCES business_rrhh.employees(id),
    -- Jefe Directo
    salary DECIMAL(19, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    start_date DATE NOT NULL,
    end_date DATE,
    -- Null indica que es el puesto actual
    change_reason VARCHAR(150),
    -- Promoción, traslado, ajuste salarial, ingreso
    active BOOLEAN DEFAULT TRUE,
    -- Indica el registro actual vigente
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    created_by UUID REFERENCES security.users(id),
    updated_by UUID REFERENCES security.users(id)
);
-- 2.4 Cargas Familiares
CREATE TABLE IF NOT EXISTS business_rrhh.employee_dependents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES business_rrhh.employees(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    relationship VARCHAR(50) NOT NULL,
    birth_date DATE,
    identification_number VARCHAR(50),
    gender VARCHAR(20),
    is_emergency_contact BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);
-- 2.5 Documentos del Empleado
CREATE TABLE IF NOT EXISTS business_rrhh.employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES business_rrhh.employees(id) ON DELETE CASCADE,
    document_type_id UUID REFERENCES business_rrhh.document_types(id),
    file_name VARCHAR(150) NOT NULL,
    file_key VARCHAR(255) NOT NULL,
    mime_type VARCHAR(50),
    file_size_bytes BIGINT,
    expiration_date DATE,
    is_unified BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID REFERENCES security.users(id)
);
-- ==============================================================================
-- 3. CONFIGURACIÓN INICIAL (DATA SEEDING)
-- ==============================================================================
-- 3.1 Módulo RRHH
INSERT INTO configuration.saas_modules (id, code, name, description, version, is_active)
VALUES (
        gen_random_uuid(),
        'MOD_RRHH',
        'Recursos Humanos',
        'Gestión integral de talento humano',
        '2.0.0',
        true
    ) ON CONFLICT (code) DO NOTHING;
-- 3.2 Permisos Básicos
WITH module_data AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'MOD_RRHH'
    LIMIT 1
)
INSERT INTO security.permissions (id, name, description, module_id, category)
SELECT gen_random_uuid(),
    'RRHH_VIEW',
    'Acceso al módulo de RRHH',
    id,
    'VIEW'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_CONFIG_VIEW',
    'Ver configuración de RRHH',
    id,
    'VIEW'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_CONFIG_EDIT',
    'Gestionar configuración de RRHH',
    id,
    'ACTION'
FROM module_data
UNION ALL
-- Permisos de Empleados
SELECT gen_random_uuid(),
    'EMPLOYEE_VIEW',
    'Ver directorio de empleados',
    id,
    'VIEW'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'EMPLOYEE_CREATE',
    'Crear registros de empleados',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'EMPLOYEE_EDIT',
    'Editar información de empleados',
    id,
    'ACTION'
FROM module_data
UNION ALL
-- Permisos de Departamentos y Estructura
SELECT gen_random_uuid(),
    'RRHH_DEPT_VIEW',
    'Ver departamentos y estructura',
    id,
    'VIEW'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_DEPT_EDIT',
    'Gestionar estructura organizacional',
    id,
    'ACTION'
FROM module_data
UNION ALL
-- Permisos Centros Operacionales
SELECT gen_random_uuid(),
    'RRHH_OPCENTER_VIEW',
    'Ver centros operacionales',
    id,
    'VIEW'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'RRHH_OPCENTER_EDIT',
    'Gestionar centros operacionales',
    id,
    'ACTION'
FROM module_data ON CONFLICT (name) DO NOTHING;
-- 3.3 Menú de Navegación
WITH rrhh_module AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'MOD_RRHH'
    LIMIT 1
), home_menu AS (
    SELECT id
    FROM configuration.sidebar_menu
    WHERE url = '/home'
    LIMIT 1
) -- Insertar Menú Padre si no existe
INSERT INTO configuration.sidebar_menu (
        id,
        title,
        url,
        icon,
        order_index,
        module_id,
        permission_required,
        active,
        parent_id
    )
VALUES (
        gen_random_uuid(),
        'Recursos Humanos',
        '/rrhh',
        'users',
        20,
        (
            SELECT id
            FROM rrhh_module
        ),
        'RRHH_VIEW',
        true,
        (
            SELECT id
            FROM home_menu
        )
    ) ON CONFLICT (title, url) DO NOTHING;
-- Insertar Submenús
WITH parent_menu AS (
    SELECT id
    FROM configuration.sidebar_menu
    WHERE title = 'Recursos Humanos'
    LIMIT 1
), module_id AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'MOD_RRHH'
    LIMIT 1
)
INSERT INTO configuration.sidebar_menu (
        id,
        title,
        url,
        parent_id,
        order_index,
        icon,
        module_id,
        permission_required,
        active
    )
VALUES (
        gen_random_uuid(),
        'Empleados',
        '/rrhh/employees',
        (
            SELECT id
            FROM parent_menu
        ),
        1,
        'user-group',
        (
            SELECT id
            FROM module_id
        ),
        'EMPLOYEE_VIEW',
        true
    ),
    (
        gen_random_uuid(),
        'Configuración',
        '/rrhh/settings',
        (
            SELECT id
            FROM parent_menu
        ),
        99,
        'cog',
        (
            SELECT id
            FROM module_id
        ),
        'RRHH_CONFIG_VIEW',
        true
    ) ON CONFLICT (title, url) DO NOTHING;
-- Submenús de Configuración (Virtual hierarchy in logic, or actual hierarchy if supported)
-- Aquí asumimos que /rrhh/settings es una página que lista las opciones, o insertamos más niveles si el sidebar lo soporta.
-- Insertamos accesos directos si es necesario, pero el usuario pidió "Configuración" linkeando a /settings.
-- Iconos requeridos
INSERT INTO configuration.icons (id, name, svg_content)
VALUES (
        gen_random_uuid(),
        'archive',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>'
    ) ON CONFLICT (name) DO NOTHING;
-- ==============================================================================
-- 4. ADICIÓN DE ESTRUCTURA Y NAVEGACIÓN COMPLETA
-- ==============================================================================
-- 4.1. ICONOS FALTANTES (Asegurando la existencia para los nuevos menús)
INSERT INTO configuration.icons (id, name, svg_content)
VALUES (
        gen_random_uuid(),
        'map-pin',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>'
    ),
    (
        gen_random_uuid(),
        'building',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21H21m-18 0V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5V21m-18 0V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25V21M7.5 7.5h.008v.008H7.5V7.5zm.008 3.75H7.5V11.25h.008v.008zM12 7.5h.008v.008H12V7.5zm.008 3.75H12V11.25h.008v.008zM16.5 7.5h.008v.008h-.008V7.5zm.008 3.75h-.008V11.25h.008v.008z" /></svg>'
    ),
    (
        gen_random_uuid(),
        'briefcase',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.75a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25V7.5a2.25 2.25 0 012.25-2.25h10.5a2.25 2.25 0 012.25 2.25v7.25z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 18v3m4.5-3H7.5" /></svg>'
    ),
    (
        gen_random_uuid(),
        'sitemap',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21V9.375C3.75 8.163 4.708 7.218 5.92 7.218h4.568v3.31a.75.75 0 00.75.75h4.125m-10.963-3.85c-.068-.068-.142-.128-.221-.18l-.517-.386m6.442-.442a1.253 1.253 0 001.67-.181l1.107-1.107a1.253 1.253 0 00.181-1.67L15 8.25m-5.337-3.371a1.25 1.25 0 11-1.67-.18l-1.107-1.107a1.25 1.25 0 11.18-1.67l.517.386m6.442-.442a1.253 1.253 0 001.67-.181l1.107-1.107a1.253 1.253 0 00.181-1.67L15 8.25M17.625 21h.75a2.25 2.25 0 002.25-2.25v-13.5a2.25 2.25 0 00-2.25-2.25h-5.25v16.5M12.375 21h-.75a2.25 2.25 0 01-2.25-2.25v-13.5a2.25 2.25 0 012.25-2.25h5.25v16.5m-5.25 0h.75" /></svg>'
    ),
    (
        gen_random_uuid(),
        'calculator',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10.5 18a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm4.5 1.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15 10.5h.008v.008H15v-.008zM15 16.5h.008v.008H15v-.008zM10.5 10.5h.008v.008H10.5v-.008zM10.5 16.5h.008v.008H10.5v-.008zM19.5 7.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 7.5v9a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 16.5v-9z"/></svg>'
    ),
    (
        gen_random_uuid(),
        'document',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v2.625m.75 3h13.5c.621 0 1.125-.504 1.125-1.125v-4.875a1.125 1.125 0 00-1.125-1.125H5.25a1.125 1.125 0 00-1.125 1.125v4.875c0 .621.504 1.125 1.125 1.125zM12 21.75V15"/></svg>'
    ),
    (
        gen_random_uuid(),
        'clipboard',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 7.5a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 7.5v9a2.25 2.25 0 002.25 2.25h9.563M16.5 4.5h2.25M17.25 7.5v9M4.5 7.5h10.5"/></svg>'
    ) ON CONFLICT (name) DO NOTHING;
-- 4.2. INSERTAR SUBMENÚS DE CONFIGURACIÓN
WITH config_parent AS (
    SELECT id
    FROM configuration.sidebar_menu
    WHERE title = 'Configuración'
        AND url = '/rrhh/settings'
    LIMIT 1
), module_id AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'MOD_RRHH'
    LIMIT 1
)
INSERT INTO configuration.sidebar_menu (
        id,
        title,
        url,
        parent_id,
        order_index,
        icon,
        module_id,
        permission_required,
        active
    )
VALUES -- Sedes (Locations)
    (
        gen_random_uuid(),
        'Sedes',
        '/rrhh/locations',
        (
            SELECT id
            FROM config_parent
        ),
        10,
        'map-pin',
        (
            SELECT id
            FROM module_id
        ),
        'RRHH_CONFIG_VIEW',
        -- Usar permiso general de VIEW para configuración
        true
    ),
    -- Departamentos (Departments)
    (
        gen_random_uuid(),
        'Departamentos',
        '/rrhh/departments',
        (
            SELECT id
            FROM config_parent
        ),
        20,
        'building',
        (
            SELECT id
            FROM module_id
        ),
        'RRHH_DEPT_VIEW',
        true
    ),
    -- Cargos (Positions)
    (
        gen_random_uuid(),
        'Cargos',
        '/rrhh/positions',
        (
            SELECT id
            FROM config_parent
        ),
        30,
        'briefcase',
        (
            SELECT id
            FROM module_id
        ),
        'RRHH_DEPT_VIEW',
        -- Usar el mismo permiso de estructura
        true
    ),
    -- Niveles Organizacionales
    (
        gen_random_uuid(),
        'Niveles Organizacionales',
        '/rrhh/organizational-levels',
        (
            SELECT id
            FROM config_parent
        ),
        40,
        'sitemap',
        (
            SELECT id
            FROM module_id
        ),
        'RRHH_DEPT_VIEW',
        true
    ),
    -- Centros de Costos
    (
        gen_random_uuid(),
        'Centros de Costos',
        '/rrhh/cost-centers',
        (
            SELECT id
            FROM config_parent
        ),
        50,
        'calculator',
        -- Asumiendo que 'calculator' o similar existe o se debe añadir
        (
            SELECT id
            FROM module_id
        ),
        'RRHH_CONFIG_VIEW',
        true
    ),
    -- Centros Operacionales
    (
        gen_random_uuid(),
        'Centros Operacionales',
        '/rrhh/operational-centers',
        (
            SELECT id
            FROM config_parent
        ),
        60,
        'archive',
        (
            SELECT id
            FROM module_id
        ),
        'RRHH_OPCENTER_VIEW',
        true
    ),
    -- Tipos de Contrato
    (
        gen_random_uuid(),
        'Tipos de Contrato',
        '/rrhh/contract-types',
        (
            SELECT id
            FROM config_parent
        ),
        70,
        'document',
        -- Asumiendo que 'document' o similar existe o se debe añadir
        (
            SELECT id
            FROM module_id
        ),
        'RRHH_CONFIG_VIEW',
        true
    ),
    -- Tipos de Documento
    (
        gen_random_uuid(),
        'Tipos de Documento',
        '/rrhh/document-types',
        (
            SELECT id
            FROM config_parent
        ),
        80,
        'clipboard',
        -- Asumiendo que 'clipboard' o similar existe o se debe añadir
        (
            SELECT id
            FROM module_id
        ),
        'RRHH_CONFIG_VIEW',
        true
    ) ON CONFLICT (title, url) DO
UPDATE
SET parent_id = EXCLUDED.parent_id,
    module_id = EXCLUDED.module_id,
    permission_required = EXCLUDED.permission_required;
-- 1. Añadir la columna organizational_level_id si no existe
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'departments'
        AND column_name = 'organizational_level_id'
) THEN
ALTER TABLE business_rrhh.departments
ADD COLUMN organizational_level_id UUID;
END IF;
END $$;
-- 2. Añadir la clave foránea a organizational_levels
DO $$ BEGIN -- Comprobar si la restricción ya existe antes de añadirla
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'fk_departments_organizational_level'
) THEN
ALTER TABLE business_rrhh.departments
ADD CONSTRAINT fk_departments_organizational_level FOREIGN KEY (organizational_level_id) REFERENCES business_rrhh.organizational_levels(id);
END IF;
END $$;
-- 1. Añadir la columna risk_level si no existe
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'positions'
        AND column_name = 'risk_level'
) THEN
ALTER TABLE business_rrhh.positions
ADD COLUMN risk_level VARCHAR(20) DEFAULT 'LOW';
-- Asumimos un DEFAULT 'LOW' o el valor que consideres apropiado
END IF;
END $$;
-- ==============================================================================
-- 5. GESTIÓN DE MONEDAS (CURRENCIES)
-- ==============================================================================
-- Creación de la tabla de monedas en el esquema de configuración
CREATE TABLE IF NOT EXISTS configuration.currencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),
    native_symbol VARCHAR(10)
);
-- Añadir relación con monedas en Centros de Costos
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'business_rrhh'
        AND table_name = 'cost_centers'
        AND column_name = 'currency_id'
) THEN
ALTER TABLE business_rrhh.cost_centers
ADD COLUMN currency_id UUID REFERENCES configuration.currencies(id);
END IF;
END $$;