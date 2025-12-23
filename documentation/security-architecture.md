# Arquitectura de Seguridad y Gestión de Sesiones

Este documento detalla el ecosistema de seguridad implementado en el proyecto, cubriendo desde la autenticación hasta la gestión de activos y protección contra ataques comunes.

---

## 1. Autenticación y Gestión de Sesiones

El sistema utiliza una arquitectura **Stateless** reforzada con **Cookies HttpOnly** para maximizar la seguridad contra ataques XSS (Cross-Site Scripting).

### 1.1 Flujo de Autenticación
1.  **Login**: El usuario envía credenciales al endpoint `/api/auth/login`.
2.  **Tokens**: El servidor responde con dos tokens:
    -   **Access Token (JWT)**: Almacenado de forma segura (Cookie HttpOnly).
    -   **Refresh Token**: Almacenado en la base de datos (`security.refresh_tokens`) y vinculado a una cookie de larga duración.
3.  **Persistencia**: Todas las peticiones posteriores incluyen automáticamente las cookies gracias a la configuración `withCredentials: true`.

### 1.2 Sistema de Silent Refresh (Transmisión Automática)
Para evitar que la experiencia del usuario se interrumpa al expirar el Access Token, se implementó un **HttpInterceptor** avanzado:

-   **Detección de Errores**: Captura errores `401 Unauthorized` (Sesión expirada) y `403 Forbidden` (CSRF Desincronizado).
-   **Mutex/Semáforo**: Utiliza un `BehaviorSubject` para asegurar que solo se dispare una petición de refresco a la vez, incluso si hay múltiples peticiones paralelas fallando.
-   **Protección contra Bucles**: Implementa un header personalizado `X-Interceptor-Retry` para identificar peticiones ya reintentadas. Si una petición reintentada falla de nuevo, se cancela el flujo para evitar bucles infinitos.
-   **Reintento Transparente**: Una vez renovado el token, el interceptor clona la petición original añadiendo el header de marca y la reenvía sin que el usuario note el fallo inicial.

> **Nota de Desarrollo**: Para pruebas, el token JWT se ha configurado con una expiración corta (30s) para validar visualmente el flujo de refresco. En producción, esto debe ajustarse a 15 min (JWT) y 7 días (Refresh Token).

---

## 2. Protección CSRF / XSRF (Cross-Site Request Forgery)

Se implementó el patrón de **Doble Envío de Cookie** recomendado para SPAs modernas (Angular + Spring Security 6).

### 2.1 Configuración del Backend
-   **Repositorio**: Se utiliza `CookieCsrfTokenRepository.withHttpOnlyFalse()`, permitiendo que Angular lea el valor del token.
-   **Filtro Despertador (`CsrfCookieFilter`)**: Un filtro personalizado que fuerza la generación del token en cada respuesta (solucionando el problema del *Lazy Loading* de Spring Security 6). Sin este filtro, la primera petición mutable suele fallar.

### 2.2 Configuración del Frontend
En `app.config.ts`, el `HttpClient` está configurado para sincronizar automáticamente:
```typescript
withXsrfConfiguration({
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-XSRF-TOKEN',
})
```

---

## 3. Almacenamiento y Gestión de Activos (MinIO)

La gestión de imágenes y archivos sensibles se realiza a través de un servicio de almacenamiento de objetos (S3 Compatible).

-   **Servicio**: MinIO ejecutándose en contenedor Docker.
-   **Buckets**: 
    -   `logos`: Para logotipos de empresas y perfiles.
    -   `assets`: Para recursos estáticos de la aplicación.
-   **Acceso**: El backend actúa como proxy para servir estos archivos, protegiendo las credenciales de MinIO y permitiendo aplicar reglas de negocio/seguridad antes de la descarga.

---

## 4. Capas de Seguridad Adicionales

### 4.1 Rate Limiting (`RateLimitFilter`)
Implementado en el backend para prevenir ataques de fuerza bruta y denegación de servicio (DoS). Limita el número de peticiones por IP en un margen de tiempo definido.

### 4.2 Content Security Policy (CSP)
Configurado en `SecurityConfig.java` para restringir el origen de los recursos que el navegador puede cargar:
-   `default-src 'self'`: Solo permite recursos del propio dominio por defecto.
-   `img-src 'self' data: blob: https://*`: Permite imágenes locales y externas seguras.
-   `script-src`: Restringido a dominios autorizados y scripts locales.

### 4.3 Referrer Policy y HSTS
-   **HSTS (HTTP Strict Transport Security)**: Obliga el uso de HTTPS durante un año tras la primera conexión.
-   **Referrer Policy**: Configurado como `strict-origin-when-cross-origin` para proteger la privacidad del usuario en saltos entre dominios.

---

## 5. Jerarquía Administrativa y Multitenancy

El sistema implementa una jerarquía de tres niveles para equilibrar el control global del SaaS con el control local de cada empresa.

### 5.1 Niveles de Acceso
1.  **Super Administrador (Root / ROLE_ROOT):**
    *   **Alcance:** Global (todas las empresas del sistema).
    *   **Flag:** `is_super_admin = true` en la tabla `security.users`.
    *   **Poder:** Omnipotencia. Salta validaciones de suscripciones y permisos.
2.  **Administrador de Empresa (Company Admin / ROLE_ADMIN):**
    *   **Alcance:** Limitado a su empresa asignada.
    *   **Identificación:** Flag `is_admin_role = true` en la tabla `security.roles`.
    *   **Poder:** Acceso total a todos los módulos **suscritos** por su empresa. Bypassa los permisos granulares internos de cada módulo.
3.  **Usuario Regular:**
    *   **Alcance:** Limitado a su empresa asignada.
    *   **Poder:** Condicionado estrictamente por los permisos granulares de su rol dentro del módulo suscrito.

### 5.2 Mapeo de Autoridades (Spring Security)
El sistema carga dinámicamente las autoridades en el momento del login y del refresco de token:
- **Roles:** Se mapean como `ROLE_{NOMBRE_ROL}`. Si el rol tiene el flag `is_admin_role`, se añade automáticamente la autoridad global `ROLE_ADMIN`.
- **Permisos:** Se cargan individualmente como autoridades (ej: `CORE_USER_VIEW`), permitiendo el uso de `@PreAuthorize("hasAuthority('...')")`.

---

## 6. Resumen de Tecnologías

| Capa | Tecnología |
|---|---|
| Autenticación | JWT + Cookies HttpOnly |
| Refresco de Sesión | RxJS (Interceptor + Mutex) |
| Protección CSRF | Cookie-Header Pattern |
| Almacenamiento | MinIO (Object Storage) |
| Seguridad Backend | Spring Security 6.x |
| Control de Tráfico | RateLimitFilter (Custom Java) |
