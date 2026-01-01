# Sistema de Formulario de Roles y Permisos

Este documento detalla la arquitectura técnica y la lógica de negocio del módulo de Gestión de Seguridad (RBAC - Role-Based Access Control) ubicado en `/core/management/roles`.

## 1. Visión General

El formulario de Roles y Permisos es una herramienta crítica para la seguridad del sistema. Permite definir perfiles de acceso mediante la agrupación de permisos granulares organizados jerárquicamente.

## 2. Gestión de Permisos Agrupados

### 2.1 Estructura Jerárquica
El sistema organiza los cientos de permisos del SaaS en tres niveles:
1.  **Categoría Funcional**: **[NEW]** Agrupación lógica por área de negocio (ej: Seguridad, Recursos Humanos, Configuración).
2.  **Módulo/Suscripción**: El contenedor de facturación (ej: Plataforma Base, Gestión de Nómina).
3.  **Recurso**: La entidad sobre la que se actúa (ej: Usuarios, Empresas, Roles).
4.  **Acción**: El permiso específico (ej: VER, CREAR, EDITAR, ELIMINAR).

### 2.2 Motor de Selección Masiva
Para mejorar la usabilidad (UX), el formulario incluye:
- **Selección por Módulo/Suscripción**: Selección rápida de todos los permisos dentro de un paquete contratado.
- **Selección por Recurso**: Un checkbox en cada tarjeta de recurso permite seleccionar/deseleccionar todas las acciones asociadas a ese recurso de una sola vez.
- **"Toggle All"**: Acciones globales para borrar la selección o seleccionar la totalidad de los permisos del sistema.

### 2.3 Lógica de Dependencias en UI (Cascading Selection)
El frontend implementa una lógica de protección activa:
- **Auto-Selección**: Marcar una acción de escritura (Crear/Editar) selecciona automáticamente el permiso de "Ver".
- **Cascada Inversa**: Desmarcar "Ver" desmarca automáticamente todas las acciones del mismo recurso.
- **Estado Visual**: Las acciones dependientes aparecen deshabilitadas si "Ver" no está activo.

## 3. Lógica de Negocio y Validación

### 3.1 Validación de Dependencias (Backend)
Aunque la UI permite selecciones libres, el backend (vía `RoleService`) implementa una validación de dependencias:
- Los permisos de **mutación** (CREAR, EDITAR, ELIMINAR) requieren implícitamente el permiso de **visualización** (VER).
- Si un rol tiene "CREAR_USUARIO" pero no "VER_USUARIO", el sistema arrojará una advertencia o validará la consistencia.

### 3.2 Protección de Roles del Sistema
- Los roles marcados como `is_system_role` (ej: `ROLE_ROOT`, `ROLE_ADMIN`) están protegidos.
- La UI detecta estos roles y bloquea la edición de sus nombres y la desactivación del estado, permitiendo solo la visualización o edición controlada de su descripción.

## 4. Gestión de Listados (Filtros Dinámicos)

Para mejorar la experiencia en el directorio de roles, se implementó:
- **Status Toggle**: Un interruptor (`p-toggleSwitch`) que permite alternar entre roles **Activos** e **Inactivos**.
- **Filtrado Reactivo**: Uso de `Signals` de Angular para una actualización instantánea de la tabla sin refrescos de página.

## 4. Componentes Técnicos

### 4.1 RoleFormComponent
- **Estado Reactivo**: Utiliza Angular Signals para manejar la carga de permisos agrupados (`permissionsGrouped`) y el estado de la UI.
- **FormArray**: Los permisos seleccionados se gestionan como un array de IDs en el formulario reactivo.
- **Visual Mapping**: Capacidad de transformar nombres técnicos de permisos (ej: `SECURITY_ROLE_CREATE`) en etiquetas legibles (ej: "Crear Roles") de forma dinámica.

## 5. Diseño e Identidad Visual (Premium)

- **Tarjetas de Recursos**: Uso de `resource-card` con bordes sutiles y encabezados diferenciados.
- **Feedback Visual**: El sistema utiliza alertas (`app-alert`) para notificar éxitos o errores de validación de dependencias de permisos.
- **Layout**: Diseño en cuadrícula adaptable (Responsive Grid) que organiza los recursos de forma óptima según el tamaño de la pantalla.

## 6. Endpoints de Seguridad (`RoleManagementController`)
- **Base URL**: `/api/core/management/roles`
- `GET /permissions/grouped`: Obtiene el árbol jerárquico (Módulo > Categoría > Permisos).
- `GET /{id}`: Detalle del rol y array de IDs de permisos asignados.
- `POST /`: Creación de un nuevo rol.
- `PUT /{id}`: Actualización de un rol existente.
- `PATCH /{id}/toggle`: Cambio de estado (Activo/Inactivo).

## 7. Futuro: Permisos Manuales

En el futuro, este sistema permitirá a los administradores de alta jerarquía definir nuevos "Permisos Manuales" o "Campos Sensibles" directamente desde la interfaz, extendiendo las capacidades del RBAC sin necesidad de cambios en el código.
