---
description: Workflow para la gestión de Sedes (Locations) en el módulo de Recursos Humanos.
---

# Gestión de Sedes (RRHH)

Este workflow describe la implementación y el mantenimiento del sistema de gestión de sedes físicas de la organización. No debe confundirse con el catálogo de **Ubicaciones** (Países/Ciudades) que se sincroniza desde la administración central.

## Estándares del Módulo

1. **Ubicación en el Sistema**: Las sedes se gestionan dentro del ecosistema de **Recursos Humanos** -> **Configuración** -> **Sedes**.
2. **Multi-tenancy**: Cada sede está vinculada estrictamente a una `Company` a través de `company_id`. No se permiten cruces de sedes entre tenants.
3. **Jerarquía Geográfica**: Toda sede debe contar con una estructura geográfica completa utilizando el catálogo maestro de Ubicaciones: `País` -> `Departamento` -> `Ciudad`.
4. **Sede Principal (Main)**: Cada empresa debe tener exactamente una sede marcada como `isMain`. Si se marca una nueva sede como principal, la anterior pierde automáticamente ese estado.

## Componentes Técnicos

### Backend

1. **Entidad**: `Location.java` en `com.project.backend_api.model.core.management`.
2. **Controlador**: `LocationController.java` en `com.project.backend_api.controller.core.management` expone los endpoints en `/api/core/management/locations`.
3. **Seguridad**:
   - `RRHH_VIEW` / `RRHH_CONFIG_VIEW`: Permisos para visualización y configuración de sedes.

### Frontend

1. **Servicio**: `location.service.ts` para operaciones CRUD y cambio de estado.
2. **Listado**: `LocationListComponent` en `src/app/rrhh/locations/location-list.component.ts` (Ruta: `/rrhh/sedes`).
3. **Formulario**: `LocationFormComponent` en `src/app/rrhh/locations/location-form.component.ts` (Rutas: `/rrhh/sedes/create`, `/rrhh/sedes/edit/:id`).
4. **Address Builder**: Uso obligatorio del componente compartido `app-address-builder` para estandarizar el formato de direcciones.

## Catálogo de Ubicaciones (Sincronización Geográfica)

El sistema cuenta con un sincronizador de datos geográficos para poblar el catálogo de países, estados y ciudades, además de metadatos críticos. Para más detalles técnicos, ver [Documentación de Geo-Sync](../docs/geo-sync-system.md).

1. **Mantenimiento**: `GeoSyncComponent` en `src/app/core/management/geo/geo-sync.component.ts`.
2. **Ruta**: `/core/management/locations`.
3. **Estrategia de Sincronización**: **Nuclear Sync** (Precarga en memoria) para optimizar el rendimiento y evitar timeouts.
4. **Datos Sincronizados**:
   - **Geografía**: Países -> Estados/Departamentos -> Ciudades.
   - **Monedas**: Código ISO, nombre y símbolos nativos.
   - **Extensiones Telefónicas**: Indicativos internacionales (ej: +57, +34) normalizados con prefijo.

## Flujos de Trabajo Comunes

### Crear una Nueva Sede
1. Navegar a `Recursos Humanos` -> `Configuración` -> `Sedes` (URL: `/rrhh/sedes`).
2. Hacer clic en `Nueva Sede`.
3. Completar el nombre (único por empresa).
4. Usar el "Address Builder" para generar la dirección.
5. Seleccionar la jerarquía geográfica.
6. Guardar.

### Cambiar la Sede Principal
1. Editar la sede deseada.
2. Activar el interruptor `Sede Principal`.
3. El sistema gestionará automáticamente el cambio, asegurando que solo haya una matriz activa.

### Desactivar una Sede (Soft Delete)
1. En el listado, usar el icono de prohibición (`pi-ban`).
2. Confirmar en el diálogo de seguridad.
3. La sede pasará a estado "Inactiva" y solo será visible activando el filtro de inactivos.
