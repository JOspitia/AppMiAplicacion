# Sistema de Catálogo de Permisos

Este documento detalla el funcionamiento del sistema centralizado de gestión de permisos, accesible en `/core/permissions/catalog`.

## 1. Visión General

A diferencia del formulario de Roles (donde se *asignan* permisos), el **Catálogo de Permisos** es una herramienta administrativa para *configurar* la metadata de los permisos. Su objetivo es permitir que los nombres técnicos (ej: `CORE_USER_CREATE`) tengan una representación amigable y estén organizados lógicamente para el usuario final.

## 2. Estructura de Datos (Jerarquía)

El catálogo gestiona una jerarquía de tres niveles:

1.  **Módulo (SaaS Module)**: El nivel más alto (ej: Core, RRHH, Nómina). Define la disponibilidad del permiso según la suscripción de la empresa.
2.  **Categoría (`PermissionCategory`)**: Agrupadores lógicos dentro de un módulo (ej: "Gestión de Empresas", "Seguridad"). Cada categoría tiene un icono y un orden específico.
3.  **Permiso (`Permission`)**: La acción atómica. Se le asigna un `display_name` y una categoría.

## 3. Funcionalidades Principales

### 3.1 Gestión de Categorías
- Creación y edición de categorías funcionales.
- Asignación de iconos del sistema (usando `app-icon`).
- Control de orden (`order_index`) para organizar la visualización en el formulario de roles.

### 3.2 Edición de Metadatos de Permisos
- **Nombre Visual**: Modificar el `display_name` que verá el usuario en toda la plataforma.
- **Categorización**: Mover permisos entre categorías para ajustar la navegación.
- **Estado**: Activar/Desactivar permisos globalmente.

## 4. Implementación Técnica

### 4.1 Frontend (`PermissionCatalogComponent`)
- **Ruta**: `/core/permissions/catalog`
- **Componentes**: Utiliza `p-table` para el listado y diálogos (`p-dialog`) para la edición rápida de categorías y permisos.
- **Servicio**: `PermissionCatalogService` gestiona las llamadas al backend para categorías y permisos.

### 4.2 Backend
- **Controlador**: `com.project.backend_api.controller.core.administration.PermissionController`
- **Endpoints**:
  - `GET /api/core/permissions/catalog`: Listado completo de categorías y sus permisos asociados.
  - `GET /api/core/permissions`: Listado plano de permisos.
- **Entidades**:
  - `PermissionCategory`: Mapea la tabla `security.permission_categories`.
  - `Permission`: Mapea la tabla `security.permissions`.
- **Reglas**: Los cambios en el catálogo afectan inmediatamente a todos los roles que utilicen dichos permisos.

## 5. Casos de Uso

1.  **Renombrar Permisos**: Si una funcionalidad cambia de nombre comercial, se actualiza en el catálogo para que en la gestión de roles se vea el nombre correcto.
2.  **Recategorización**: Si se crea un nuevo módulo, se pueden mover permisos de una categoría genérica a una específica del nuevo módulo.
3.  **Habilitar Nuevas Funcionalidades**: Al añadir nuevas capacidades al backend, el desarrollador registra el permiso y el administrador lo categoriza a través de esta interfaz.
