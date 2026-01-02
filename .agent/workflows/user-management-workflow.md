---
description: Documentación de la implementación del módulo de Gestión de Usuarios (User System) con diseño premium.
---

# Gestión de Usuarios (HR-Tech System)

Este documento detalla la implementación del módulo de gestión de usuarios, integrando el backend legacy con la nueva interfaz SPA construida en Angular bajo el estándar **High-Aesthetic / Human-Centric Design**.

## 1. Estándares Visuales (UI/UX)

Siguiendo el sistema de diseño premium, la lista de usuarios y el formulario deben cumplir con:

### Listado de Usuarios (Directory)
- **Glassmorphism**: La tabla se presenta sobre un contenedor con `backdrop-blur` y bordes sutiles.
- **Identidad Premium**: Cada usuario muestra un avatar (Identidad Premium) generado con sus iniciales y un degradado dinámico (`from-primary to-primary-dark`), escalable al pasar el ratón (`group-hover:scale-110`).
- **Estados (Badges)**:
  - **Activo**: `bg-green-500/10 text-green-600` (Verde esmeralda).
  - **Inactivo**: `bg-red-500/10 text-red-600` (Rojo/Rosa).
- **[NUEVO] Filtro de Estado**: Se implementó un switch de alternancia (`p-toggleSwitch`) en la cabecera para filtrar entre usuarios Activos e Inactivos sin recargar la página.
- **Búsqueda**: Filtro global superior integrado.

### Formulario de Usuario (Creation/Edit)
- **Secciones Claras**: Dividido en "Credenciales de Acceso", "Perfil Personal" y "Asignación de Roles".
- **Generación Automática**: Contraseñas generadas por sistema para usuarios nuevos creados por admin.
- **Flujo de Seguridad Obligatorio**: Si un usuario entra con contraseña temporal, el sistema bloquea el acceso y lo redirige a la pantalla de cambio de contraseña obligatoria.
- **Inputs Premium**: 
    - **Multi-Role**: Uso de `p-multiSelect` altamente personalizado para permitir la asignación de varios roles por usuario.
    - **Visualización**: Se muestran "chips" o "tags" para cada rol asignado tanto en la lista como en el formulario.
    - **Validación**: Los roles deshabilitados o de sistema están protegidos.
- **[NUEVO] Feedback de Operación**: Implementación obligatoria de spinners en botones de acción. El botón de "Crear" o "Actualizar" debe permanecer bloqueado y procesando hasta que el sistema navegue fuera de la vista, asegurando que el usuario perciba una transición limpia.

## 2. Integración Backend (API)

El sistema se conecta a los endpoints de gestión corporativa:

### DTOs de Transferencia
- **UserManagementDto**: Contiene la información necesaria para el listado y detalle. 
- **[UPDATED]** `roleIds` y `roleNames`: Ahora retorna listas para soportar la asignación múltiple.

### Endpoints (Nuevos Mapeos)
- `GET /api/core/management/users`: Retorna la lista de usuarios asociados a la empresa seleccionada en el contexto del admin.
- `PATCH /api/core/management/users/{id}/toggle`: Cambia el estado `isActive` en la tabla `security.user_company_roles`.
- `PATCH /api/core/management/users/{id}/roles`: Actualiza la lista de roles asignados a un usuario mediante una estrategia de sincronización eficiente (Add/Remove).
- `POST /api/core/management/users`: Registro de nuevos usuarios y asociación automática.
- `GET /api/core/management/users/profile/me`: Obtiene el perfil del usuario autenticado.

### Servicios Java (Refactorizados)
- `com.project.backend_api.service.core.management.UserService`: Centraliza la lógica de registro y conversión a DTOs de gestión. Envía `EMAIL_VERIFICATION`. Maneja transacciones atómicas para la actualización de roles múltiples.
- `com.project.backend_api.service.core.ProfileService`: Gestiona el cambio de contraseña y limpia la bandera `requirePasswordChange`.
- `com.project.backend_api.repository.core.management.UserCompanyRoleRepository`: Gestiona los vínculos entre usuarios, empresas y roles.

## 3. Estructura de Rutas (Angular)

Las rutas están organizadas bajo el prefijo corporativo:

```typescript
{ path: 'core/management/users', component: UserListComponent },
{ path: 'core/management/users/create', component: UserFormComponent },
{ path: 'core/management/users/edit/:id', component: UserFormComponent }
```

## 4. Workflow de Implementación (Paso a Paso)

// turbo
1. **Modelado de Datos**: Asegurar que `UserCompanyRole` tiene los campos `isActive` y `role_id` mapeados.
2. **Backend**: Implementar `UserManagementController` con los permisos `CORE_USER_VIEW` y `CORE_USER_EDIT`.
3. **Servicio Angular**: Crear `UserService.ts` con métodos `getAll()` y `toggleActive()`.
// turbo
4. **Vista de Lista**: Crear `UserListComponent` importando `TableModule` y los componentes de UI compartidos (`app-icon`, `app-alert`, `app-confirm-dialog`).
5. **Vista de Formulario**: Crear `UserFormComponent` usando `ReactiveFormsModule` y vinculando con `RoleService` para cargar los roles disponibles de la empresa.
6. **Política de Contraseñas**: Implementar el flag `require_password_change` en el DTO de Login y el redireccionamiento en `LoginComponent` y `SelectCompanyComponent`.
7. **Navegación**: Verificar que el sidebar (`MainLayout`) apunte correctamente a `/core/management/users`.

## 5. Próximos Pasos & Mejoras
- Implementar histórico de contraseñas para evitar reutilización.
- Integrar auditoría de cambios en el estatus del usuario.
- Extender el formulario para capturar datos de perfil adicionales (Avatar, Teléfono, etc.).
