---
description: Estándares de la Arquitectura de Interfaz SPA (HR-Tech) con Angular.
---

# Arquitectura de Interfaz (Frontend)

Este workflow define los pilares de la interfaz de usuario moderna y la navegación SPA.

## 1. Estructura de Navegación SPA
- **MainLayoutComponent**: Utiliza este componente como el "Shell" permanente.
- **Router Outlet**: Todo el contenido dinámico debe inyectarse en el `router-outlet` del layout principal.
- **Navegación Fluida**: Evita recargas de página utilizando `routerLink` y navegación programática.

## 2. Lógica de Acceso y Selección de Empresa
- **Auto-Skip**: Implementa lógica en el login para saltar `/select-company` si el usuario solo pertenece a una empresa.
- **SelectCompanyComponent**: Muestra este componente con diseño de tarjetas premium cuando hay 2 o más empresas.

## 3. Segmentación de Vistas por Rol
- **HomeComponent**: Vista por defecto para todos los usuarios. Debe contener:
    - Saludo personalizado (`/api/auth/me`).
    - Grid de módulos funcionales (tarjetas con gradientes).
- **DashboardComponent**: Vista administrativa rica en datos exclusiva para roles de gestión (Super Admin).

## 4. Protección y Seguridad (Guards)
- **Estrategia de Rutas**: La Landing Page debe ser la ruta raíz (`/`). Las rutas de la aplicación operativa (`/home`, etc.) deben estar protegidas y declaradas antes en el router para prioridad de coincidencia específica.
- **authGuard**: Verifica que el usuario tenga un token válido consultando `/api/auth/me`. Si el usuario no está autenticado, redirige al `/login`.
- **superAdminGuard**: Restringe el acceso a rutas administrativas críticas basándose en el campo `isSuperAdmin` del perfil.

## 5. Gestión de Estado y Datos
- **Servicios Centralizados**: Usa servicios Angular inyectables para llamadas a la API.
- **Signals**: Utiliza Angular Signals para una reactividad eficiente en el estado de la UI (sidebar, tema, usuario).
- **Cookies HttpOnly**: No intentes leer tokens JWT desde el frontend; confía en el manejo automático del navegador y el interceptor `withCredentials`.

## 6. Rutas Futuras y Estructura de Navegación

Se ha definido un mapa de rutas para la expansión de la aplicación, siguiendo una jerarquía lógica por módulos de negocio (Core, RRHH, Settings):

```text
/home
/settings/general

# Core Management
/core/management
/core/management/users
/core/management/users/profile
/core/management/users/profile/change-password
/core/management/roles
/core/management/locations
/core/companies
/core/permissions/catalog
/core/administration

# Recursos Humanos (RRHH)
/rrhh
/rrhh/settings
/rrhh/settings/work-schedules
/rrhh/departments
/rrhh/operational-centers
/rrhh/identification-types
/rrhh/compensation-types
/rrhh/locations
/rrhh/organizational-levels
/rrhh/contract-types
/rrhh/cost-centers
/rrhh/positions
/rrhh/document-types
/rrhh/employees
```

## 7. Patrones de Listas y Formularios (CRUD Standard)

Para garantizar la consistencia "Premium" en todos los módulos (Empresas, Usuarios, Roles, Sedes, etc.), se deben seguir estos estándares de feedback visual:

### 7.1 Feedback en Listados
- **Empty States Estilizados**: Nunca mostrar una tabla vacía sin más. Usar un contenedor con icono de búsqueda y mensaje claro.
- **Filtros de Estado Reactivos**: Usar `p-toggleSwitch` para alternar entre Activos/Inactivos inmediatamente.
- **Tooltips Compactos**: Usar el estilo `.tooltip-wide` para descripciones largas, evitando barras de desplazamiento internas.

### 7.2 Feedback en Guardado (Stability Pattern)
- **Spinners de Acción**: Todos los botones de envío (`Guardar`, `Crear`, `Actualizar`) deben mostrar un spinner animado (`pi-spinner`) mientras `loading()` sea true.
- **Deshabilitación Preventiva**: El botón debe deshabilitarse visualmente (`disabled:opacity-70`) para evitar clics dobles.
- **Persistencia de Carga**: NO desactivar el estado `loading` inmediatamente tras el éxito. Mantenerlo activo mientras se muestra el mensaje de confirmación hasta que ocurra la navegación final. Esto proporciona un feedback fluido y profesional.
- **Standard Delay**: Usar un `setTimeout` de 1500ms a 2000ms antes de la redirección para que el usuario pueda leer el mensaje de éxito.
