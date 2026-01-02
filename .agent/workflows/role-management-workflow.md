---
description: Documentación completa de la implementación del módulo de Gestión de Roles y Permisos (RBAC System).
---

# Implementación del Módulo de Gestión de Roles y Permisos

Este documento detalla la implementación técnica, arquitectura y decisiones de diseño del módulo de Gestión de Roles y Permisos (RBAC - Role-Based Access Control), actualizado con el nuevo sistema de agrupación por categorías funcionales y visualización de tipos de acción.

## 1. Arquitectura Backend: Modelos & Servicios

### 1.1 Modelo de Datos Mejorado

#### `Role` (Entidad JPA)
- **Tabla**: `security.roles`
- **Campos Principales**:
  - `id`, `name`, `description`, `company_id`, `active`
  - **[UPDATED]** `createdBy`, `updatedBy`, `deletedBy`: Cambiados de `String` a `UUID` para consistencia con el esquema de base de datos.
  - `is_system_role`: Protege roles críticos del sistema.
  - `permissions`: Relación Many-to-Many.

#### `UserCompanyRole` (Relación M:N)
- **[CRITICAL UPDATE]** Soporte para **Múltiples Roles por Usuario**:
  - Se modificó la restricción única de `(user_id, company_id)` a `(user_id, company_id, role_id)`.
  - Esto permite que un usuario acumule permisos de varios roles simultáneamente dentro de la misma empresa.

#### `PermissionCategory` (Entidad JPA)
- **Tabla**: `security.permission_categories`
- **Campos**: `id`, `name`, `description`, `module_id`, `order_index`, `icon`.
- **Propósito**: Categorización jerárquica (Módulo -> Categoría -> Permiso) para organizar los permisos en grupos lógicos y navegables.

#### `Permission` (Entidad JPA)
- **Tabla**: `security.permissions`
- **Campos Clave**:
  - `category_id`: **[NUEVO]** Relación con `permission_categories` (reemplaza el campo de texto `category`).
  - `display_name`: **[NUEVO]** Nombre legible para humanos (ej: "Gestionar Usuarios").
  - `module_id`: Relación con `saas_modules` (para facturación/suscripción).
  - `name`: Identificador técnico (ej: `COMPANY_CREATE`).

### 1.2 `RoleService` (Lógica de Negocio)
- **Ubicación**: `com.project.backend_api.service.core.management.RoleService`
- **Auditoría Estricta**: Los métodos `create` y `update` ahora rastrean el `UUID` del usuario que realiza la acción.
- **Validación de Dependencias**: Asegura que `CREATE/EDIT` requieran `VIEW`.
- **Scope Multi-Tenant**: Inyección automática del `companyId` del usuario autenticado.

### 1.3 `RoleManagementController` (API REST)
- **Ubicación**: `com.project.backend_api.controller.core.management.RoleManagementController`
- **Endpoints**:
    - `GET /api/core/management/roles`: Listado resumido (usa `RoleDto`).
    - `GET /api/core/management/roles/{id}`: Detalle completo (usa `RoleDetailDto` con IDs de permisos).
    - `GET /api/core/management/roles/permissions/grouped`: Catálogo de permisos agrupados por Módulo y Categoría.
    - `POST /api/core/management/roles`: Crear nuevo rol.
    - `PUT /api/core/management/roles/{id}`: Actualizar rol existente.
    - `PATCH /api/core/management/roles/{id}/toggle`: Activar/Desactivar rol (Estándar del proyecto).

1.  **Agrupación Jerárquica (Module -> Category -> Permission)**:
    - Agrupa los permisos primeramente por **Módulo SaaS** (`SaasModule`).
    - Segundo nivel por **Categoría** (`PermissionCategory`) dentro del módulo.
    - Este árbol se construye en el backend para optimizar el rendimiento de la UI.

2.  **Extracción de Metadatos (`PermissionDto`)**:
    - `actionType`: Extrae automáticamente el tipo de acción (`VIEW`, `CREATE`, `EDIT`, `DELETE`, `ACTION`) del nombre del permiso para uso en iconos UI.

3.  **Lógica de Dependencias (Business Rules)**:
    - Se implementó una regla donde cualquier acción de escritura (`CREATE`, `EDIT`, `DELETE`) depende de la existencia del permiso de lectura (`VIEW`) para ese recurso.

### 1.4 Catálogo de Permisos (Centralización)
**URL (Frontend)**: `/core/permissions/catalog`
**URL (Backend)**: `/api/core/administration/permissions`
**Componente**: `PermissionCatalogComponent`
- Permite la administración global de los metadatos de los permisos (nombres visuales y categorías).
- **Control de Jerarquía**: Asegura que cada permiso esté correctamente clasificado bajo una `PermissionCategory` y un `Module`.

## 2. Arquitectura Frontend: Componentes & Servicios

### 2.1 `RoleManagementService` (Servicio Angular)
- **API URL**: `/api/core/management/roles`
- **Interfaces**:
  - `Permission`: Incluye metadata extendida (`category`, `moduleName`, `actionType`).
  - `RoleDetail`: Contiene el `Role` y el array `assignedPermissionIds`.
  - `PermissionsGrouped`: Mapa jerárquico `{[module: string]: {[category: string]: Permission[]}}`.

### 2.2 `RoleListComponent` (Listado Premium)
- **Diseño**: Tabla PrimeNG con estética Glassmorphism y avatares con gradiente dinámico.
- **[NUEVO] Filtro de Estado**: Switch de alternancia (Status Toggle) que permite filtrar instantáneamente entre roles "Activos" e "Inactivos" mediante señales reactivas (`signal` + `computed`).
- **Acciones**: Edición y Toggle de activo/inactivo (protegido para roles de sistema).

### 2.3 `RoleFormComponent` (Formulario Avanzado)
Este componente ha sido rediseñado para máxima estabilidad y UX:

- **Manejo Manual de Checkboxes (Performance Fix)**:
  - Se eliminó el uso de `formControlName` dentro de bucles `*ngFor` para evitar conflictos de recursión en PrimeNG.
  - Implementación de `isPermissionSelected(id)` y `togglePermission(id)` para control total del estado.
  - Uso de `[ngModelOptions]="{standalone: true}"` para desacoplar la vista del `FormGroup`.

- **Organización Visual**:
  - Los permisos se renderizan agrupados por **Categoría Funcional** (ej: Seguridad, HR-Tech, etc.).
  - Selectores masivos por Recurso ("Seleccionar todo Usuario") y por Módulo/Suscripción.

- **[NEW] Lógica de Cascada en Permisos**:
  - **Auto-Selección**: Al marcar una acción (ej: Crear), el sistema selecciona automáticamente el permiso "Ver" del mismo recurso.
  - **Auto-Desactivación**: Al desmarcar "Ver", todas las acciones dependientes del mismo recurso se desmarcan automáticamente.
  - **Protección de Estado**: Las acciones de escritura permanecen bloqueadas/deshabilitadas visualmente si no se tiene seleccionado el permiso "Ver".

## 3. Base de Datos y Migraciones

### 3.1 Flyway V77 y V80: Mejoras Estructurales
- **V77 (Categorización)**: Clasifica permisos en categorías legibles (HR-Tech, Seguridad, etc.).
- **V80 (Multi-Role)**: Modifica `user_company_roles` para permitir múltiples entradas por usuario/empresa.

## 4. Workflow de Implementación (Paso a Paso)

// turbo
1. **Database - Migration**: Ejecutar V84 para habilitar la tabla `permission_categories` y reestructurar `permissions`.
2. **Backend - Maintenance**: Ejecutar scripts de sincronización de jerarquía para asignar permisos a sus categorías correctas.
3. **Frontend - UI Implementation**: Implementar `PermissionCatalogComponent` para la gestión administrativa de permisos.
4. **Frontend - Form Update**: Actualizar `RoleFormComponent` para consumir la jerarquía desde las nuevas tablas de categorías.

## 5. Estándares de Diseño (UI/UX)

- **Categorías Claras**: El usuario ya no ve "Plataforma Base" para todo, sino secciones funcionales claras.
- **Asignación Flexible**: Capacidad de componer perfiles de seguridad complejos mediante la asignación de múltiples roles pequeños (principio de menor privilegio).
- **Estabilidad**: El formulario es robusto ante miles de permisos.
- **[NUEVO] Feedback de Guardado**: Mantener el spinner y el botón deshabilitado hasta que la navegación a la lista sea efectiva, garantizando una UX fluida y sin clics repetidos.
- **Validación Cruzada**: Recordar que la lógica de cascada (VIEW -> EDIT) debe estar sincronizada entre el `RoleFormComponent` y la validación en el `RoleService` de Java.

---

**Última Actualización**: 2025-12-31
**Estado**: ✅ Producción (Multi-Role Support & UUID Audit)
