-- ==============================================================================
-- V7__init_core_module_complete.sql
-- DESCRIPCIÓN: Inicialización MAESTRA del Módulo CORE (Plataforma Base).
-- CONTENIDO: Módulo, Permisos, Iconos Base, Menú Principal, Admin User y Suscripción.
-- ==============================================================================
-- ==============================================================================
-- 1. REGISTRO DEL MÓDULO CORE
-- ==============================================================================
INSERT INTO configuration.saas_modules (id, code, name, description, version, is_active)
VALUES (
        gen_random_uuid(),
        'CORE_PLATFORM',
        'Plataforma Base',
        'Gestión de identidad, seguridad, empresas y configuración global.',
        '1.0.0',
        true
    ) ON CONFLICT (code) DO
UPDATE
SET is_active = true,
    version = '1.0.0';
-- ==============================================================================
-- 2. PERMISOS DEL SISTEMA (CORE)
-- ==============================================================================
WITH module_data AS (
    SELECT id
    FROM configuration.saas_modules
    WHERE code = 'CORE_PLATFORM'
    LIMIT 1
)
INSERT INTO security.permissions (id, name, description, module_id, category)
SELECT gen_random_uuid(),
    'CORE_USER_VIEW',
    'Ver lista de usuarios',
    id,
    'VIEW'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_USER_CREATE',
    'Crear nuevos usuarios',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_USER_EDIT',
    'Editar usuarios existentes',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_USER_DELETE',
    'Eliminar/Desactivar usuarios',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_ROLE_VIEW',
    'Ver roles y permisos',
    id,
    'VIEW'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_ROLE_CREATE',
    'Crear roles',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_ROLE_EDIT',
    'Editar roles',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_ROLE_DELETE',
    'Eliminar/Desactivar roles',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_COMPANY_VIEW',
    'Ver empresas',
    id,
    'VIEW'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_COMPANY_CREATE',
    'Crear empresas',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_COMPANY_EDIT',
    'Editar empresas',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_COMPANY_DELETE',
    'Eliminar/Desactivar empresas',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_PERMISSION_VIEW',
    'Ver matriz de permisos',
    id,
    'VIEW'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_PERMISSION_CREATE',
    'Crear permisos',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_PERMISSION_EDIT',
    'Editar permisos',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_PERMISSION_DELETE',
    'Eliminar/Desactivar permisos',
    id,
    'ACTION'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_MANAGEMENT_VIEW',
    'Ver y gestionar configuración del sistema',
    id,
    'VIEW'
FROM module_data
UNION ALL
SELECT gen_random_uuid(),
    'CORE_ADMINISTRATION_VIEW',
    'Ver y gestionar la administración del sistema',
    id,
    'VIEW'
FROM module_data ON CONFLICT (name) DO
UPDATE
SET module_id = EXCLUDED.module_id,
    description = EXCLUDED.description;
-- ==============================================================================
-- 3. ICONOS BASE (Necesarios para el menú Core)
-- ==============================================================================
INSERT INTO configuration.icons (id, name, svg_content)
VALUES (
        gen_random_uuid(),
        'home',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>'
    ),
    (
        gen_random_uuid(),
        'user',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>'
    ),
    (
        gen_random_uuid(),
        'shield',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>'
    ),
    (
        gen_random_uuid(),
        'cog',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>'
    ),
    (
        gen_random_uuid(),
        'briefcase',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>'
    ),
    (
        gen_random_uuid(),
        'gauge',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.5l9 9 9-9M12 21v-8m0-8V3m8.5 6.75a8.25 8.25 0 10-17 0 8.25 8.25 0 0017 0z" /></svg>'
    ),
    (
        gen_random_uuid(),
        'building',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>'
    ),
    (
        gen_random_uuid(),
        'key',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>'
    ) ON CONFLICT (name) DO NOTHING;
-- ==============================================================================
-- 4. MENÚ Y NAVEGACIÓN (Estructura del Core)
-- ==============================================================================
-- 4.1. GARANTIZAR CONSTRAINT ÚNICA EN SIDEBAR
DO $$ BEGIN -- Limpiar duplicados exactos previos si existen
DELETE FROM configuration.sidebar_menu a USING configuration.sidebar_menu b
WHERE a.id < b.id
    AND a.title = b.title
    AND (
        a.url = b.url
        OR (
            a.url IS NULL
            AND b.url IS NULL
        )
    );
-- Crear constraint segura para (title, url) soportando nulos
IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uk_sidebar_menu_title_url'
) THEN
ALTER TABLE configuration.sidebar_menu
ADD CONSTRAINT uk_sidebar_menu_title_url UNIQUE NULLS NOT DISTINCT (title, url);
END IF;
END $$;
-- 4.2. MENÚS RAÍZ (Públicos / Generales)
INSERT INTO configuration.sidebar_menu (
        id,
        title,
        url,
        parent_id,
        order_index,
        icon,
        active,
        module_id,
        permission_required
    )
VALUES (
        gen_random_uuid(),
        'Inicio',
        '/home',
        NULL,
        1,
        'home',
        true,
        NULL,
        NULL
    ),
    (
        gen_random_uuid(),
        'Mi Perfil',
        '/profile',
        NULL,
        90,
        'user',
        true,
        NULL,
        NULL
    ),
    (
        gen_random_uuid(),
        'Seguridad',
        '/profile/change-password',
        NULL,
        91,
        'shield',
        true,
        NULL,
        NULL
    ),
    (
        gen_random_uuid(),
        'Configuración',
        '/settings/general',
        NULL,
        92,
        'cog',
        true,
        NULL,
        NULL
    ) ON CONFLICT (title, url) DO NOTHING;
-- 4.3. BLOQUE "GESTIÓN" (Contenedor Core)
INSERT INTO configuration.sidebar_menu (
        id,
        title,
        url,
        parent_id,
        order_index,
        icon,
        active,
        module_id,
        permission_required
    )
VALUES (
        gen_random_uuid(),
        'Gestión',
        '/core/management',
        (
            SELECT id
            FROM configuration.sidebar_menu
            WHERE url = '/home'
            LIMIT 1
        ), 10, 'briefcase', true,
        (
            SELECT id
            FROM configuration.saas_modules
            WHERE code = 'CORE_PLATFORM'
        ),
        'CORE_MANAGEMENT_VIEW'
    ) ON CONFLICT (title, url) DO
UPDATE
SET module_id = EXCLUDED.module_id;
-- Items hijos de Gestión
INSERT INTO configuration.sidebar_menu (
        id,
        title,
        url,
        parent_id,
        order_index,
        icon,
        active,
        module_id,
        permission_required
    )
VALUES (
        gen_random_uuid(),
        'Usuarios',
        '/users',
        (
            SELECT id
            FROM configuration.sidebar_menu
            WHERE title = 'Gestión'
        ),
        1,
        'user',
        true,
        (
            SELECT id
            FROM configuration.saas_modules
            WHERE code = 'CORE_PLATFORM'
        ),
        'CORE_USER_VIEW'
    ) ON CONFLICT (title, url) DO
UPDATE
SET parent_id = EXCLUDED.parent_id;
INSERT INTO configuration.sidebar_menu (
        id,
        title,
        url,
        parent_id,
        order_index,
        icon,
        active,
        module_id,
        permission_required
    )
VALUES (
        gen_random_uuid(),
        'Roles y Perfiles',
        '/roles',
        (
            SELECT id
            FROM configuration.sidebar_menu
            WHERE title = 'Gestión'
        ),
        2,
        'shield',
        true,
        (
            SELECT id
            FROM configuration.saas_modules
            WHERE code = 'CORE_PLATFORM'
        ),
        'CORE_ROLE_VIEW'
    ) ON CONFLICT (title, url) DO
UPDATE
SET parent_id = EXCLUDED.parent_id;
-- 4.4. BLOQUE "ADMINISTRACIÓN" (Contenedor Core)
INSERT INTO configuration.sidebar_menu (
        id,
        title,
        url,
        parent_id,
        order_index,
        icon,
        active,
        module_id,
        permission_required
    )
VALUES (
        gen_random_uuid(),
        'Administración',
        '/core/administration',
        (
            SELECT id
            FROM configuration.sidebar_menu
            WHERE url = '/home'
            LIMIT 1
        ), 20, 'gauge', true,
        (
            SELECT id
            FROM configuration.saas_modules
            WHERE code = 'CORE_PLATFORM'
        ),
        'CORE_ADMINISTRATION_VIEW'
    ) ON CONFLICT (title, url) DO
UPDATE
SET module_id = EXCLUDED.module_id;
-- Items hijos de Administración
INSERT INTO configuration.sidebar_menu (
        id,
        title,
        url,
        parent_id,
        order_index,
        icon,
        active,
        module_id,
        permission_required
    )
VALUES (
        gen_random_uuid(),
        'Empresas',
        '/companies',
        (
            SELECT id
            FROM configuration.sidebar_menu
            WHERE title = 'Administración'
        ),
        1,
        'building',
        true,
        (
            SELECT id
            FROM configuration.saas_modules
            WHERE code = 'CORE_PLATFORM'
        ),
        'CORE_COMPANY_VIEW'
    ) ON CONFLICT (title, url) DO
UPDATE
SET parent_id = EXCLUDED.parent_id;
INSERT INTO configuration.sidebar_menu (
        id,
        title,
        url,
        parent_id,
        order_index,
        icon,
        active,
        module_id,
        permission_required
    )
VALUES (
        gen_random_uuid(),
        'Permisos',
        '/permissions',
        (
            SELECT id
            FROM configuration.sidebar_menu
            WHERE title = 'Administración'
        ),
        2,
        'key',
        true,
        (
            SELECT id
            FROM configuration.saas_modules
            WHERE code = 'CORE_PLATFORM'
        ),
        'CORE_PERMISSION_VIEW'
    ) ON CONFLICT (title, url) DO
UPDATE
SET parent_id = EXCLUDED.parent_id;
-- ==============================================================================
-- 5. DATOS DE ARRANQUE (BOOTSTRAP)
-- ==============================================================================
-- 5.1. EMPRESAS BASE
-- 5.1. EMPRESAS BASE
INSERT INTO security.companies (
        id,
        name,
        nit,
        status
    )
VALUES (
        gen_random_uuid(),
        'PUBLIC',
        '000000000',
        TRUE
    ),
    (
        gen_random_uuid(),
        'Tech Solutions',
        '900123456-7',
        TRUE
    ) ON CONFLICT (nit) DO NOTHING;
-- 5.2. ROLES DEL SISTEMA
-- Rol Público (para auto-registro)
INSERT INTO security.roles (
        id,
        name,
        description,
        company_id,
        is_system_role,
        active
    )
SELECT gen_random_uuid(),
    'NUEVO_USUARIO',
    'Rol para usuarios registrados públicamente',
    id,
    TRUE,
    TRUE
FROM security.companies
WHERE name = 'PUBLIC' ON CONFLICT (name, company_id) DO NOTHING;
-- Rol ROOT (Super Admin de Tech Solutions)
INSERT INTO security.roles (
        id,
        name,
        description,
        company_id,
        is_system_role,
        active
    )
SELECT gen_random_uuid(),
    'ROOT',
    'Super administrador del sistema',
    id,
    TRUE,
    TRUE
FROM security.companies
WHERE name = 'Tech Solutions' ON CONFLICT (name, company_id) DO NOTHING;
-- 5.3. USUARIO ADMINISTRADOR
DO $$
DECLARE v_admin_id UUID;
v_tech_solutions_id UUID;
v_root_role_id UUID;
BEGIN -- Crear o actualizar usuario admin
INSERT INTO security.users (
        username,
        email,
        password,
        first_name,
        first_surname,
        verified,
        is_super_admin
    )
VALUES (
        'admin',
        'admin@techsolutions.com',
        '$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC',
        'Admin',
        'System',
        true,
        true
    ) ON CONFLICT (username) DO
UPDATE
SET is_super_admin = true
RETURNING id INTO v_admin_id;
-- Si no devolvió ID (porque ya existía y no cambió nada crítico), buscarlo
IF v_admin_id IS NULL THEN
SELECT id INTO v_admin_id
FROM security.users
WHERE username = 'admin';
END IF;
-- Obtener IDs auxiliares
SELECT id INTO v_tech_solutions_id
FROM security.companies
WHERE name = 'Tech Solutions';
SELECT id INTO v_root_role_id
FROM security.roles
WHERE name = 'ROOT'
    AND company_id = v_tech_solutions_id;
-- Asignar rol ROOT al admin
INSERT INTO security.user_company_roles (user_id, company_id, role_id)
VALUES (v_admin_id, v_tech_solutions_id, v_root_role_id) ON CONFLICT (user_id, company_id, role_id) DO NOTHING;
END $$;
-- 5.4. ACTIVAR SUSCRIPCIÓN CORE
INSERT INTO security.company_subscriptions (company_id, module_id, status, start_date)
SELECT c.id,
    m.id,
    'ACTIVE',
    CURRENT_TIMESTAMP
FROM security.companies c,
    configuration.saas_modules m
WHERE c.name = 'Tech Solutions'
    AND m.code = 'CORE_PLATFORM' ON CONFLICT (company_id, module_id) DO
UPDATE
SET status = 'ACTIVE';
-- ==============================================================================
-- 6. CONFIGURACIONES GLOBALES Y PLANTILLAS
-- ==============================================================================
-- 6.1. Variables Globales (SESSION_TIMEOUT)
INSERT INTO configuration.global_configurations (id, variable_key, variable_value, description)
VALUES (
        gen_random_uuid(),
        'SESSION_TIMEOUT_MINUTES',
        '30',
        'Tiempo de expiración de la sesión en minutos'
    ) ON CONFLICT (variable_key) DO
UPDATE
SET variable_value = EXCLUDED.variable_value;
-- ==============================================================================
-- 6.2. PLANTILLAS DE EMAIL (Se agregan ambas: Verificación y Cuenta Creada)
-- ==============================================================================
INSERT INTO configuration.email_templates (
        id,
        template_key,
        name,
        subject,
        html_content,
        plain_text_content,
        available_placeholders,
        active
    )
VALUES -- ==============================================================================
    -- Template 1: Verificación de Email
    -- ==============================================================================
    (
        gen_random_uuid(),
        'EMAIL_VERIFICATION',
        'Verificación de Email',
        'Verifica tu cuenta en {{appName}}',
        '<!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background-color:#f5f7fa; font-family:Arial, Helvetica, sans-serif;">
        <div style="margin:0;padding:0;background-color:#f5f7fa;font-family:Arial,Helvetica,sans-serif">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f5f7fa;padding:40px 0">
                <tbody>
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:90%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
                                <tbody>
                                    <tr>
                                        <td align="center" style="background:linear-gradient(135deg,#0ea5e9 0%,#a855f7 100%);padding:40px 30px">
                                            <div style="width:60px;height:60px;background-color:rgba(255,255,255,0.2);border-radius:50%;text-align:center;line-height:60px;font-size:30px;margin:0 auto 20px">
                                                ✉️
                                            </div>
                                            <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold">
                                                {{appName}}
                                            </h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:40px 30px;color:#1f2937">
                                            <p style="font-size:18px;font-weight:600;margin:0 0 20px">
                                                ¡Hola {{userName}}!
                                            </p>
                                            <p style="font-size:16px;color:#4b5563;line-height:1.6;margin-bottom:20px">
                                                Gracias por registrarte en <strong>{{appName}}</strong>. Estamos emocionados de tenerte con nosotros.
                                            </p>
                                            <p style="font-size:16px;color:#4b5563;line-height:1.6;margin-bottom:30px">
                                                Para completar tu registro y activar tu cuenta, por favor haz clic en el siguiente botón:
                                            </p>
                                            <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin:30px 0">
                                                <tbody>
                                                    <tr>
                                                        <td align="center" style="background:linear-gradient(135deg,#0ea5e9 0%,#a855f7 100%);padding:16px 40px;border-radius:8px">
                                                            <a href="{{verificationLink}}" style="color:#ffffff;text-decoration:none;font-size:16px;font-weight:600" target="_blank">
                                                                Verificar mi cuenta
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                            <div style="background-color:#f9fafb;border-left:4px solid #0ea5e9;padding:20px;border-radius:8px">
                                                <p style="margin:0 0 10px 0;font-size:14px;color:#6b7280">
                                                    <strong>¿El botón no funciona?</strong>
                                                </p>
                                                <p style="margin:0 0 10px 0;font-size:14px;color:#6b7280">
                                                    Copia y pega el siguiente enlace en tu navegador:
                                                </p>
                                                <a href="{{verificationLink}}" style="color:#0ea5e9;font-size:13px;word-break:break-all" target="_blank">
                                                    {{verificationLink}}
                                                </a>
                                            </div>
                                            <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:15px 20px;margin-top:30px;border-radius:8px">
                                                <p style="margin:0;font-size:14px;color:#92400e">
                                                    <strong>⚠️ Nota de seguridad:</strong> Este enlace expirará en 24 horas. Si no solicitaste esta verificación, puedes ignorar este email de forma segura.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="background-color:#f9fafb;padding:30px;border-top:1px solid #e5e7eb">
                                            <p style="margin:5px 0;font-size:13px;color:#6b7280">
                                                <strong>{{appName}}</strong>
                                            </p>
                                            <p style="margin:20px 0 0 0;font-size:13px;color:#6b7280">
                                                © 2025 {{appName}}. Todos los derechos reservados.
                                            </p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </body>
    </html>',
        'Hola {{userName}}, verifica tu cuenta en {{appName}} copiando este enlace: {{verificationLink}}',
        'userName,verificationLink,appName',
        TRUE
    ),
    -- ==============================================================================
    -- Template 2: Credenciales de Cuenta Nueva
    -- ==============================================================================
    (
        gen_random_uuid(),
        'USER_ACCOUNT_CREATED',
        'Cuenta de Usuario Creada',
        'Bienvenido a {{appName}} - Credenciales de Acceso',
        '<!DOCTYPE html>
    <html>
    <body style="margin:0; padding:0; background-color:#f5f7fa; font-family:Arial, Helvetica, sans-serif;">
        <div style="margin:0;padding:0;background-color:#f5f7fa;font-family:Arial,Helvetica,sans-serif">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f5f7fa;padding:40px 0">
                <tbody>
                    <tr>
                        <td align="center">
                            <table width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:90%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.1)">
                                <tbody>
                                    <tr>
                                        <td align="center" style="background:linear-gradient(135deg,#0ea5e9 0%,#a855f7 100%);padding:40px 30px">
                                            <div style="width:60px;height:60px;background-color:rgba(255,255,255,0.2);border-radius:50%;text-align:center;line-height:60px;font-size:30px;margin:0 auto 20px">
                                                👤
                                            </div>
                                            <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:bold">
                                                Bienvenido a {{appName}}
                                            </h1>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding:40px 30px;color:#1f2937">
                                            <p style="font-size:18px;font-weight:600;margin:0 0 20px">
                                                ¡Hola {{username}}!
                                            </p>
                                            <p style="font-size:16px;color:#4b5563;line-height:1.6;margin-bottom:20px">
                                                Tu cuenta ha sido creada exitosamente.
                                            </p>
                                            
                                            <div style="background-color:#f9fafb;border-left:4px solid #0ea5e9;padding:20px;border-radius:8px;margin-bottom:30px">
                                                <h3 style="margin:0 0 15px 0;font-size:16px;color:#1f2937">Tus Credenciales de Acceso:</h3>
                                                <p style="margin:0 0 10px 0;font-size:15px;color:#4b5563">
                                                    <strong>Usuario:</strong> <span style="color:#111827">{{username}}</span>
                                                </p>
                                                <p style="margin:0;font-size:15px;color:#4b5563">
                                                    <strong>Contraseña:</strong> <span style="font-family:monospace,sans-serif;background-color:#e5e7eb;padding:2px 6px;border-radius:4px;color:#111827">{{password}}</span>
                                                </p>
                                            </div>

                                            <p style="font-size:16px;color:#4b5563;line-height:1.6;margin-bottom:20px;text-align:center">
                                                Para acceder a la plataforma, haz clic aquí:
                                            </p>
                                            <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin:0 0 30px 0">
                                                <tbody>
                                                    <tr>
                                                        <td align="center" style="background:linear-gradient(135deg,#0ea5e9 0%,#a855f7 100%);padding:16px 40px;border-radius:8px">
                                                            <a href="{{loginLink}}" style="color:#ffffff;text-decoration:none;font-size:16px;font-weight:600" target="_blank">
                                                                Iniciar Sesión
                                                            </a>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:15px 20px;border-radius:8px">
                                                <p style="margin:0;font-size:14px;color:#92400e">
                                                    <strong>⚠️ Importante:</strong> Por motivos de seguridad, te recomendamos cambiar tu contraseña inmediatamente después de tu primer inicio de sesión.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="center" style="background-color:#f9fafb;padding:30px;border-top:1px solid #e5e7eb">
                                            <p style="margin:5px 0;font-size:13px;color:#6b7280">
                                                <strong>{{appName}}</strong>
                                            </p>
                                            <p style="margin:5px 0;font-size:13px;color:#6b7280">
                                                Este es un correo automático, por favor no respondas a este mensaje.
                                            </p>
                                            <p style="margin:20px 0 0 0;font-size:13px;color:#6b7280">
                                                © 2025 {{appName}}. Todos los derechos reservados.
                                            </p>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </body>
    </html>',
        'Bienvenido a {{appName}}. Tu usuario: {{username}}, Contraseña: {{password}}. Ingresa aquí: {{loginLink}}',
        'appName,loginLink,username,password',
        TRUE
    ) ON CONFLICT (template_key) DO
UPDATE
SET html_content = EXCLUDED.html_content,
    available_placeholders = EXCLUDED.available_placeholders,
    plain_text_content = EXCLUDED.plain_text_content;
INSERT INTO "configuration".address_types (id, "name")
VALUES (gen_random_uuid(), 'Avenida'),
    (gen_random_uuid(), 'Calle'),
    (gen_random_uuid(), 'Carrera'),
    (gen_random_uuid(), 'Transversal'),
    (gen_random_uuid(), 'Diagonal'),
    (gen_random_uuid(), 'Circular'),
    (gen_random_uuid(), 'Vía');
INSERT INTO "configuration".genders (id, "name")
VALUES (gen_random_uuid(), 'Femenino'),
    (gen_random_uuid(), 'Masculino'),
    (gen_random_uuid(), 'Otro'),
    (gen_random_uuid(), 'Prefiero no especificar');