---
description: Documentación completa de la implementación del módulo de Gestión de Empresas (Company System).
---

# Implementación del Módulo de Gestión de Empresas (SPA)

Este documento detalla la implementación técnica, arquitectura y decisiones de diseño del módulo de Gestión de Empresas, que incluye el listado inteligente (`CompanyListComponent`) y el formulario de gestión (`CompanyFormComponent`).

## 1. Arquitectura Frontend: Componentes & Servicios

### 1.1 `CompanyService` (`frontend-app/src/app/core/services/company.service.ts`)
Servicio centralizado que orquesta la comunicación con el backend:
- **Operaciones CRUD**: `getAll()`, `getById()`, `create()`, `update()`, `delete()`.
- **Gestión de Estados**: `setStatus()` para activar/inactivar empresas sin eliminarlas físicamente.
- **Mapeo de Tipos**: Interfaz `Company` que sincroniza con el DTO del backend, incluyendo campos como `emailExtension` y `status`.

### 1.2 `CompanyListComponent` (`frontend-app/src/app/core/companies/company-list.component.ts`)
Pantalla principal de directorio empresarial con diseño Premium.
- **Tabla Inteligente (PrimeNG)**:
    - **Identidad Premium**: Uso de cuadros de iniciales con gradiente dinámico (`bg-gradient-to-br from-primary to-primary-dark`) o logotipos corporativos si están disponibles, escalables al pasar el ratón (`group-hover:scale-110`).
    - **Filtrado global reactivo**: Búsqueda por múltiples campos (`name`, `nit`, `emailExtension`).
    - **[NUEVO] Filtro de Estado**: Switch de alternancia (`p-toggleSwitch`) para conmutar entre empresas "Activas" e "Inactivas" instantáneamente.
    - **Paginación integrada** y manejo de estados vacíos estilizado.
- **Sistema de Acciones "Safe"**:
    - **Toggle Status**: Implementación de un flujo seguro para activar/desactivar empresas.
        - **Paso 1: Confirmación Modal**: Uso de `ConfirmDialogComponent` para validar la intención del usuario.
        - **Paso 2: Feedback Visual**: Uso de `AlertComponent` (Banner) para confirmar el éxito de la operación.
        - Evita el uso de `alert()` o `confirm()` nativos del navegador por razones de UX.

### 1.3 `CompanyFormComponent` (`frontend-app/src/app/core/companies/company-form.component.ts`)
Formulario unificado para Creación y Edición.
- **Diseño Glassmorphism**: Contenedor con `backdrop-blur` y bordes sutiles.
- **Validación Reactiva**: Uso de `ReactiveFormsModule` con validadores síncronos.
- **Navegación Inteligente**: Redirección automática a la lista tras guardar, con feedback visual previo (`AlertComponent`).
- **Modo Edición**: Detección automática basada en parámetros de ruta (`/edit/:id`).

## 2. Sistema de Notificaciones y Feedback (UX)

Se ha estandarizado el feedback al usuario en este módulo, reemplazando alertas nativas por componentes estéticos de Tailwind:

### 2.1 `ConfirmDialogComponent` (Nuevo Estándar)
Modal de confirmación genérico y reutilizable.
- **Ubicación**: `frontend-app/src/app/shared/components/confirm-dialog`
- **Características**:
    - Animaciones de entrada/salida (`@overlayAnimation`, `@modalAnimation`).
    - Backdrop con desenfoque.
    - Soporte para títulos y mensajes dinámicos.
    - Estilos adaptativos (Dark Mode).

### 2.2 `AlertComponent` (Banner)
Banner de notificación en línea para resultados de operaciones.
- **Ubicación**: `frontend-app/src/app/shared/components/alert`
- **Uso**: Se muestra encima de la tabla o formulario para indicar éxito (verde/emerald) o error (rojo).

### 2.3 `ToastComponent` (Notificaciones Flotantes)
Sistema global de notificaciones tipo "Toast".
- **Ubicación**: `frontend-app/src/app/shared/components/toast`
- **Uso**: Ideal para notificaciones pasivas o cuando el contexto cambia rápidamente. (Nota: En este módulo se priorizó `AlertComponent` para persistencia visual en la lista, pero `Toast` está disponible globalmente).

## 3. Routing y Navegación

Se ajustaron las rutas para mantener la consistencia jerárquica bajo `/core`:
 
- **Lista**: `/core/management/companies`
- **Crear**: `/core/management/companies/create`
- **Editar**: `/core/management/companies/edit/:id`
 
Esto asegura que el `authGuard` y el `MainLayout` protejan y envuelvan correctamente estas vistas.

## 4. Backend Integration

### 4.1 Endpoints (`com.project.backend_api.controller.core.management.CompanyManagementController`)
- `GET /api/core/management/companies`: Listado completo.
- `PATCH /api/core/management/companies/{id}/toggle`: Endpoint específico para cambio de estado seguro.
- `POST /api/core/management/companies`: Creación de empresa.
- `PUT /api/core/management/companies/{id}`: Actualización de empresa.
- `POST /api/core/management/companies/{id}/logo`: Carga de logotipo.

- **Tabla "Clean"**: Se eliminaron bordes de celdas verticales, usando solo separadores horizontales sutiles y mucho espaciado (padding) para mejorar la legibilidad.
- **Botones de Estado**: Uso de "badges" interactivos (cápsulas redondeadas) que sirven tanto de indicador visual como de botón de acción.

## 6. Branding & Identidad Visual por Empresa

El sistema implementa una mecánica de **Marca Blanca Dinámica** que personaliza la interfaz según la empresa seleccionada:

### 6.1 `BrandingService` (Maza)
- **Persistencia de Marca**: Al seleccionar una empresa, el servicio captura su `logoUrl` y `primaryColor`.
- **Inyección de CSS Tokens**: El servicio inyecta dinámicamente variables en `:root`:
    - `--primary`: Color base en Hex.
    - `--primary-rgb`: Componentes R, G, B para permitir opacidad en tiempo de ejecución.
    - `--primary-ring`: Sombra suave calculada para estados de foco.
- **Reset Automático**: Al salir de la sesión o volver a áreas públicas, el branding vuelve a los valores por defecto (Indigo).

### 6.2 Aplicación en UI
- **Glows Suaves**: Se evita la saturación usando opacidades ultra-bajas (`5-10%`) sobre el color primario dinámico en componentes como el Login y el Selector de Empresas.
- **Sincronización de Componentes**: Todos los componentes estandarizados (inputs, botones, tablas) heredan automáticamente estos tokens para asegurar que la "app" se sienta como propiedad de la empresa seleccionada.

## 7. Próximos Pasos

- Agregar validación de unicidad de NIT en tiempo real.
- Extender el branding dinámico a componentes complejos como gráficos y dashboards.
