---
description: Estándares para la Estabilidad de Infraestructura y Multi-tenencia en el Backend.
---

# Estabilidad de Infraestructura (Backend)

Este workflow define los estándares para mantener una base de datos robusta y un sistema multi-tenant seguro.

## 1. Migraciones Flyway Idempotentes
- **Robustez**: Todas las migraciones SQL deben verificar la existencia de tablas/columnas antes de actuar (Ej: `IF NOT EXISTS`, `DO $$ BEGIN IF NOT EXISTS...`).
- **Idempotencia**: Garantiza que el comando `docker-compose up --build` pueda ejecutarse n veces sin fallos de migración.
- **Constraints**: Define restricciones únicas (`UNIQUE`) necesarias para las cláusulas `ON CONFLICT` en inserciones de datos maestros.

## 1.1 Catálogos Globales (Estrategia de Esquema)
- **Public Schema**: Los catálogos que no son específicos por empresa (Ej: Niveles Educativos, Tallas, Factores RH) deben residir en el esquema `public`.
- **Simplificación**: Estos catálogos no requieren `company_id`. Esto permite estandarizar la data base del sistema y simplifica las llaves foráneas globales.
- **Migración**: Al mover catálogos de esquemas privados a `public`, asegurar que los IDs huérfanos en tablas transaccionales (como `employees`) sean limpiados o mapeados correctamente antes de recrear los `Constraints`.

## 2. Core Multi-Tenant
- **Relaciones**: Mantener la integridad referencial en la tabla `security.user_company_roles`.
- **Contexto**: Las peticiones de negocio deben estar filtradas por la cookie `companyContext`. El `JwtTokenFilter` extrae este valor en cada request.
- **Seguridad de Datos**: Validar siempre que el usuario autenticado tiene permisos reales sobre la empresa solicitada en el contexto. El método `loadUserByUsernameAndCompany` en `CustomUserDetailsService` es el encargado de cargar el contexto correcto.

## 3. Servicios de Identidad y Verificación
- **Endpoint /me**: Debe proveer la "fuente de la verdad" sobre el usuario actual, incluyendo:
    - Datos personales (firstName, email).
    - Flags de autorización (`isSuperAdmin`).
- **Verificación Obligatoria**: Todo usuario nuevo (vía registro o admin) debe ser creado con `verified = false` y recibir un `VerificationToken`.
- **CustomUserDetails**: Extender el principal de Spring Security para incluir el objeto `User` completo y el `companyId` activo de la sesión.

## 4. Auditoría y Logs
- **LoginLog**: Registrar cada intento de acceso exitoso o fallido en `security.login_logs`.
- **Traceability**: Asegurar que cada registro de auditoría incluya IP, User-Agent y Timestamp.

## 5. Mejores Prácticas de API
- **DTOs**: Utilizar Records o Clases de transferencia de datos para todas las entradas y salidas de la API.
- **Validación**: Aplicar `@Valid` y anotaciones de Jakarta Validation para prevenir datos corruptos.
- **Manejo de Errores**: Retornar códigos HTTP precisos (401 para no autenticado, 403 para prohibido, 429 para rate limit).

## 6. Sincronización Entidad-DB y Seguridad de Roles
- **Mapeo de Auditoría**: Las columnas de auditoría en la BD (`assigned_at` o `created_at`) deben coincidir exactamente con las anotaciones `@CreationTimestamp` de las entidades JPA para evitar errores de consulta SQL.
- **Flags Administrativos**: No confiar en strings como "ADMIN" para otorgar privilegios totales. Utilizar siempre flags booleanos explícitos (como `is_admin_role` in la tabla de roles) para habilitar bypass de permisos por suscripción.
- **Autoridades Dinámicas**: El `UserDetailsService` debe cargar tanto roles como permisos específicos para asegurar que la autorización granular funcione en toda la sesión, incluyendo el refresco de tokens.

## 7. Estructura de Paquetes y Mapeos Estándar (Refactorización)
Para mantener el orden en el crecimiento de la plataforma, el backend se organiza en módulos (`core`, `rrhh`) y sub-capas (`administration`, `management`).

### Estructura de Directorios
Todo el código debe seguir el patrón: `com.project.backend_api.<type>.<module>.<sublayer>`

*   **Tipos (`<type>`)**: `controller`, `service`, `repository`, `dto`, `model`.
*   **Módulos (`<module>`)**:
    *   `core`: Funcionalidades transversales y base del sistema.
    *   `rrhh`: Módulo específico de Recursos Humanos.
*   **Sub-capas (`<sublayer>`)**:
    *   `administration`: Configuración global, Auth, Seguridad, Datos Maestros (Geo, Sectores).
    *   `management`: Gestión operativa de entidades (Empresas, Usuarios, Sedes, Empleados).

### Estándar de Mapeos (API Endpoints)
Los endpoints deben reflejar la jerarquía de paquetes:

*   **Core Administration**: `/api/core/administration/...` (Ej: `/api/auth`, `/api/core/administration/geo`)
*   **Core Management**: `/api/core/management/...` (Ej: `/api/core/management/companies`, `/api/core/management/users`)
*   **RRHH**: `/api/rrhh/...` (Ej: `/api/rrhh/operational-centers`)

### Regla de Oro
Si una entidad es compartida o base para otros módulos (como `Location` / Sede), debe vivir en `core.management` aunque se use intensivamente en módulos específicos.
