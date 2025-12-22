-- ==============================================================================
-- V5__update_sidebar_menu_urls.sql
-- DESCRIPCIÓN: Actualiza las URLs del menú lateral para reflejar la nueva estructura de rutas
-- ==============================================================================
-- Actualizar URL de Usuarios
UPDATE configuration.sidebar_menu
SET url = '/core/management/users'
WHERE title = 'Usuarios'
    AND url = '/users';
-- Actualizar URL de Roles y Perfiles
UPDATE configuration.sidebar_menu
SET url = '/core/management/roles'
WHERE title = 'Roles y Perfiles'
    AND url = '/roles';
-- Actualizar URL de Empresas (Maneja ambos casos posibles)
UPDATE configuration.sidebar_menu
SET url = '/core/companies'
WHERE title = 'Empresas'
    AND (
        url = '/companies'
        OR url = '/core/administration/companies'
    );
-- Actualizar URL de Permisos
UPDATE configuration.sidebar_menu
SET url = '/core/permissions/catalog'
WHERE title = 'Permisos'
    AND url = '/permissions';
-- Actualizar URL de Mi Perfil
UPDATE configuration.sidebar_menu
SET url = '/core/management/users/profile'
WHERE title = 'Mi Perfil'
    AND url = '/profile';
-- Actualizar URL de Seguridad
UPDATE configuration.sidebar_menu
SET url = '/core/management/users/profile/change-password'
WHERE title = 'Seguridad'
    AND url = '/profile/change-password';