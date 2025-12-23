---
description: Documentación completa de la implementación del módulo de Perfil de Usuario Público.
---

# Implementación del Perfil de Usuario Público (SPA)

Este documento detalla los cambios realizados para implementar el formulario de perfil público en la aplicación Angular, incluyendo la integración con el backend Spring Boot.

## 1. Frontend: Angular Component & Service

### 1.1 `ProfileService` (`frontend-app/src/app/core/services/profile.service.ts`)
Se creó un servicio centralizado para manejar todas las operaciones relacionadas con el perfil:
- **Obtención de datos**: `getProfile()` para datos del usuario, `getGenders()`, `getCountries()`, `getStates()`, `getCities()` para catálogos.
- **Actualización**: `updateProfile(data)` para información personal.
- **Seguridad**: `verifyPassword()`, `changePassword()`, `changeEmail()`.

### 1.2 `ProfileComponent` (`frontend-app/src/app/core/management/users/profile/profile.ts`)
Se desarrolló un componente standalone con diseño "Premium" (Glassmorphism + Tailwind + PrimeNG).
- **Refactorización Mayor**:
    - **AddressBuilderComponent Compartido**: Se extrajo la lógica de construcción de direcciones a un componente reutilizable (`frontend-app/src/app/shared/components/address-builder`), eliminando ~80 líneas de código duplicado y centralizando la lógica de direcciones complejas.
    - **Formulario Limpio**: Se eliminaron métodos redundantes de validación de contraseña manual, aprovechando las capacidades nativas de PrimeNG.
- **Estructura**:
    - Header con navegación de regreso.
    - Pestañas: "Información Personal" y "Seguridad y Acceso". 
- **Características Clave**:
    - **Constructor de Direcciones**: Integración vía `<app-address-builder>` que maneja su propio estado y lógica.
    - **Gestión de Contraseñas**: Uso de `p-password` con etiquetas en español (`promptLabel`, `weakLabel`, etc.) y sin validadores visuales redundantes.
    - **Protección XSRF**: Integración nativa con cookies de seguridad (ver sección 4.2).

### 1.3 Routing (`frontend-app/src/app/app.routes.ts`)
(Sin cambios mayores) Se mantiene la carga lazy del componente.

## 2. Backend: Spring Boot API
(Se mantienen los endpoints descritos anteriormente)

## 3. Arquitectura de UI "Human-Centric"
(Se mantiene la estandarización global descrita)

## 4. Seguridad y Autenticación

### 4.1 Auth Guard Implementado
Se mantiene `authGuard` protegiendo las rutas internas.

### 4.2 Protección XSRF/CSRF (Nuevo)
Para evitar errores `403 Forbidden` en peticiones POST (como cambio de contraseña), se configuró explícitamente el manejo de tokens XSRF en `app.config.ts`:

```typescript
provideHttpClient(
  withFetch(),
  withInterceptors([authInterceptor]),
  withXsrfConfiguration({
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-XSRF-TOKEN',
  })
),
```

Esto asegura que Angular extraiga automáticamente el token de la cookie y lo envíe en el header `X-XSRF-TOKEN`, alineándose con la configuración del backend Spring Security.


## 7. Próximos Pasos (Pendientes)
- Implementar el envío real de correos electrónicos para la verificación de cambio de email.
- Migrar datos reales completos de geografía a la base de datos.
- Extender la estandarización UI a otros módulos (Dashboard, Usuarios, Reportes).

---

**Última Actualización**: 2025-12-23  
**Estado**: ✅ Implementado y Optimizado  
**Referencias Relacionadas**: 
- `/ui-consistency-standards` - Documentación completa de estandarización
- `/primeng-integration-guide` - Guía de integración de PrimeNG
- `/frontend-design-system` - Design System Human-Centric

