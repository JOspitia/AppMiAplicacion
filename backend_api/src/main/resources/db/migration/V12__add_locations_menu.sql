-- 1. Agregar icono de mapa/mundo
INSERT INTO configuration.icons (id, name, svg_content)
VALUES (
        gen_random_uuid(),
        'globe',
        '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.413 1.68l-1.225.956a1.5 1.5 0 00-.499 1.177v.163c0 .643.375 1.222.961 1.48l.143.061a1.107 1.107 0 001.422-.376L15.833 12c.166-.25.383-.46.64-.616l.262-.158a1.5 1.5 0 00.75-1.3v-.753a1.5 1.5 0 00-1.5-1.5v-.262c0-.827-.349-1.623-.966-2.205l-1.343-1.243a1.5 1.5 0 00-1.807-.106l-.05.039c.415.472.461 1.163.088 1.67z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 19.5a4.5 4.5 0 01-6-6c2.485 0 4.5 2.015 4.5 4.5a4.5 4.5 0 014.5 4.5c0 2.485-2.015 4.5-4.5 4.5z" /><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
    ) ON CONFLICT (name) DO NOTHING;
-- 2. Agregar menú "Ubicaciones" bajo "Administración"
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
        'Ubicaciones',
        '/core/management/locations',
        (
            SELECT id
            FROM configuration.sidebar_menu
            WHERE title = 'Administración'
            LIMIT 1
        ), 3, -- Después de Permisos (que es 2)
        'globe', true,
        (
            SELECT id
            FROM configuration.saas_modules
            WHERE code = 'CORE_PLATFORM'
        ),
        'CORE_ADMINISTRATION_VIEW'
    ) ON CONFLICT (title, url) DO NOTHING;