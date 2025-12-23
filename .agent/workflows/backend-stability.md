---
description: Estándares para la Estabilidad de Infraestructura y Multi-tenencia en el Backend.
---

# Estabilidad de Infraestructura (Backend)

Este workflow define los estándares para mantener una base de datos robusta y un sistema multi-tenant seguro.

## 1. Migraciones Flyway Idempotentes
- **Robustez**: Todas las migraciones SQL deben verificar la existencia de tablas/columnas antes de actuar (Ej: `IF NOT EXISTS`, `DO $$ BEGIN IF NOT EXISTS...`).
- **Idempotencia**: Garantiza que el comando `docker-compose up --build` pueda ejecutarse n veces sin fallos de migración.
- **Constraints**: Define restricciones únicas (`UNIQUE`) necesarias para las cláusulas `ON CONFLICT` en inserciones de datos maestros.

## 2. Core Multi-Tenant
- **Relaciones**: Mantener la integridad referencial en la tabla `security.user_company_roles`.
- **Contexto**: Las peticiones de negocio deben estar filtradas por la cookie `companyContext`.
- **Seguridad de Datos**: Validar siempre que el usuario autenticado tiene permisos reales sobre la empresa solicitada en el contexto.

## 3. Servicios de Identidad y Perfil
- **Endpoint /me**: Debe proveer la "fuente de la verdad" sobre el usuario actual, incluyendo:
    - Datos personales (firstName, email).
    - Flags de autorización (`isSuperAdmin`).
- **CustomUserDetails**: Extender el principal de Spring Security para incluir el objeto `User` completo, facilitando el acceso a datos en controladores.

## 4. Auditoría y Logs
- **LoginLog**: Registrar cada intento de acceso exitoso o fallido en `security.login_logs`.
- **Traceability**: Asegurar que cada registro de auditoría incluya IP, User-Agent y Timestamp.

## 5. Mejores Prácticas de API
- **DTOs**: Utilizar Records o Clases de transferencia de datos para todas las entradas y salidas de la API.
- **Validación**: Aplicar `@Valid` y anotaciones de Jakarta Validation para prevenir datos corruptos.
- **Manejo de Errores**: Retornar códigos HTTP precisos (401 para no autenticado, 403 para prohibido, 429 para rate limit).
