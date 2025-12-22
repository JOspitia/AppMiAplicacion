-- V19__update_menu_and_add_identification.sql
-- DESCRIPCIÓN: Renombrar menú de documentos, agregar tipos de identificación y su icono.
-- 1. Insertar el icono 'identification' PRIMERO
INSERT INTO configuration.icons (id, name, svg_content)
VALUES (
        gen_random_uuid(),
        'identification',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" /></svg>'
    ) ON CONFLICT (name) DO NOTHING;
-- 2. Renombrar el menú existente
UPDATE configuration.sidebar_menu
SET title = 'Tipos de Soporte'
WHERE title = 'Tipos de Documento';
-- 3. Agregar el nuevo ítem de menú usando el icono correcto
DO $$
DECLARE v_module_id UUID;
v_parent_id UUID;
BEGIN -- Buscar el módulo de RRHH
SELECT id INTO v_module_id
FROM configuration.saas_modules
WHERE code = 'MOD_RRHH'
    OR name = 'Recursos Humanos'
LIMIT 1;
-- Si encontramos el módulo, buscamos el menú padre 'Configuración'
IF v_module_id IS NOT NULL THEN
SELECT id INTO v_parent_id
FROM configuration.sidebar_menu
WHERE (
        title = 'Configuración'
        OR title = 'Settings'
    )
    AND module_id = v_module_id
LIMIT 1;
-- Insertar el nuevo menú
IF v_parent_id IS NOT NULL THEN
INSERT INTO configuration.sidebar_menu (
        id,
        module_id,
        parent_id,
        title,
        url,
        icon,
        -- Aquí usamos el nombre correcto
        order_index,
        active,
        permission_required
    )
VALUES (
        gen_random_uuid(),
        v_module_id,
        v_parent_id,
        'Tipos de Identificación',
        '/rrhh/identification-types',
        'identification',
        85,
        -- Un índice alto para que quede al final de la lista
        true,
        'RRHH_CONFIG_VIEW' -- Usando el permiso estándar de configuración
    ) ON CONFLICT (title, url) DO NOTHING;
END IF;
END IF;
END $$;