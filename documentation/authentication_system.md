# Sistema de Autenticación y Seguridad

Este documento detalla la arquitectura, componentes y flujo de implementación del sistema de autenticación seguro desarrollado para la plataforma. El sistema utiliza **JWT (JSON Web Tokens)** transportados en **Cookies HttpOnly** para maximizar la seguridad contra ataques XSS, respaldado por una base de datos PostgreSQL.

---

## 1. Arquitectura de Seguridad

La autenticación es **Stateless** (sin estado en servidor), delegando la persistencia de la sesión al navegador mediante cookies seguras.

### Características Clave
*   **JWT en HttpOnly Cookies**: El token JWT no se almacena en `localStorage` ni `sessionStorage`. Se inyecta como una cookie `HttpOnly`, lo que impide que cualquier script de JavaScript (propio o malicioso) acceda a él.
*   **Protección XSS**: Al no ser accesible via JS, el token es inmune a robos por Cross-Site Scripting.
*   **Protección CSRF**: Se configura SameSite=Strict en la cookie y se valida el origen mediante CORS estricto.
*   **Hash de Contraseñas**: Se utiliza **BCrypt** con fuerza 10 para el hash de contraseñas.
*   **Rate Limiting**: Implementación de **Bucket4j** para prevenir ataques de fuerza bruta (Anti-Brute Force).
*   **Refresh Tokens**: Sistema de doble token (Access + Refresh) para balances de seguridad y usabilidad.
*   **Auditoría**: Cada inicio de sesión exitoso se registra en base de datos.

---

## 2. Componentes Backend (Spring Boot)

### A. Configuración de Seguridad (`SecurityConfig.java`)
*   **FilterChain**: Configura la cadena de filtros de seguridad.
*   **SessionManagement**: Establecida en `STATELESS`.
*   **CORS**: Configurado explícitamente para permitir credenciales (`allowCredentials(true)`) desde orígenes específicos (Frontend).
*   **DaoAuthenticationProvider**: Conecta Spring Security con nuestro servicio de base de datos y el encoder BCrypt.
*   **RateLimitFilter**: Filtro personalizado de alta prioridad que aplica políticas de Bucket4j por dirección IP antes de procesar autenticaciones.

### B. Gestión de Tokens (`JwtUtils.java`)
*   Generación de tokens firmados (HMAC-SHA).
*   Validación de firma y expiración.
*   Extracción de claims (usuario, roles).

### C. Filtro de Autenticación (`JwtTokenFilter.java`)
*   Intercepta cada petición HTTP.
*   Extrae el JWT específicamente de la cookie `accessToken`.
*   Valida el token y, si es correcto, establece el contexto de seguridad (`SecurityContextHolder`) para la petición actual.

### D. Controlador (`AuthController.java`)
*   **`/login`**:
    *   Autentica credenciales (**Usuario o Correo** / Password).
    *   Genera un **Access Token** de corta vida (15 minutos).
    *   Genera un **Refresh Token** persistente (7 días) almacenado en BD.
    *   **Multi-Tenancy**: Consulta las empresas disponibles para el usuario.
    *   Inyecta ambos tokens en Cookies HttpOnly.
    *   Retorna `LoginResponse` con mensaje, rol y **lista de empresas** para activar la lógica de Auto-Skip en el frontend.
    *   Registra el evento en la tabla `security.login_logs`.
*   **`/refreshtoken`**:
    *   Valida la existencia y expiración del Refresh Token.
    *   Genera un nuevo Access Token sin requerir credenciales del usuario.
    *   Mantiene la continuidad de la sesión (Rotación de Sesión).
*   **`/register`**:
    *   Gestiona el alta de nuevos usuarios corporativos.
    *   Valida unicidad de `username` y `email`.
    *   Encripta la contraseña usando BCrypt antes de persistir.
    *   Asocia los metadatos de auditoría inicial.
*   **`/logout`**:
    *   Invalida la sesión sobrescribiendo la cookie con `Max-Age=0`.
*   **`/me`**:
    *   Retorna la "fuente de la verdad" del usuario autenticado.
    *   Incluye: ID, username, email, nombre completo y el flag `isSuperAdmin`.
    *   Esencial para que el frontend (Guards y Layout) tome decisiones de UI en tiempo real.

### E. Modelo de Datos y Persistencia
*   **Esquemas Flyway**:
    *   `security`: Contiene tablas `users`, `roles`, `login_logs`.
    *   `configuration`: Configuración global.
    *   `business_core`: Datos del negocio, empresas, módulos.
*   **JPA Entities**:
    *   `User`: Mapeo de la tabla de usuarios.
    *   `LoginLog`: Registro histórico de accesos.
*   **CustomUserDetailsService**: Puente entre la tabla `User` y la interfaz `UserDetails` de Spring Security.

---

## 3. Componentes Frontend (Angular)

### A. Interceptor (`auth.interceptor.ts`)
*   **Gestión de Credenciales**: Añade `withCredentials: true` a todas las peticiones para el envío automático de cookies.
*   **Refresco Silencioso (Mutex)**:
    *   Detecta errores **401 Unauthorized**.
    *   Usa un "semáforo" (`isRefreshing`) para manejar la concurrencia: si múltiples peticiones fallan simultáneamente, solo una dispara el refresco.
    *   Crea una **cola de peticiones** (`BehaviorSubject`) que espera a que el nuevo token sea emitido para reintentar las peticiones originales de forma transparente.
    *   **Auto-Logout**: Si el refresco falla (token de refresco expirado), redirige automáticamente al `/login`.

### B. Servicio (`auth.service.ts`)
*   Maneja las llamadas a la API `/api/auth/login` y `/logout`.
*   **Nota**: No gestiona el token manualmente (no hay `localStorage.setItem`), ya que todo es manejado por el navegador via cookies.

### C. Interfaz de Usuario (`LoginComponent`)
*   **Identificación Flexible**: Soporte para "Usuario o Correo" en un único campo.
*   **Diseño Premium**: Glassmorphism avanzado con ornamentos ambientales (`ambient-glow`).
*   **Usabilidad Estructural**:
    *   Botón "Volver" unificado a la izquierda (consistente con páginas legales).
    *   Selector de tema a la derecha.
    *   Espaciado optimizado entre opciones y botón de acción principal.
*   **Validaciones**: Feedback inmediato para campos requeridos y formato.
*   **Control de Fuerza Bruta**:
    *   Detección de error **429 (Too Many Requests)**.
    *   Bloqueo dinámico del formulario por 1 minuto.
    *   Cuenta regresiva visual para mejorar la experiencia del usuario mientras espera la reactivación.

### D. Registro de Usuarios (`RegisterComponent`)
*   **Flujo en 2 Pasos**: Separación lógica entre "Información Personal" y "Seguridad".
*   **Validación de Fortaleza**: Medidor visual de seguridad de contraseña (`p-password` con feedback).
*   **Confirmación**: Validación de coincidencia de contraseñas con feedback animado.
*   **Persistencia de Datos**: Integración con el servicio de usuario para creación de perfiles SaaS.

---

## 4. Flujo de Autenticación

1.  **Usuario** ingresa credenciales en `LoginComponent`.
2.  **Angular** envía POST a `/api/auth/login`.
3.  **Spring Boot**:
    *   `AuthenticationManager` valida credenciales contra PostgreSQL hash.
    *   Si es válido, genera JWT.
    *   Guarda registro en `login_logs`.
    *   Responde con Header: `Set-Cookie: accessToken=...; HttpOnly; SameSite=Strict; Path=/`.
4.  **Navegador**: Recibe la respuesta y almacena la cookie de forma segura.
5.  **Carga de Perfil**: El frontend llama a `/api/auth/me` para obtener el contexto del usuario y configurar el layout.
6.  **Flujo Multi-Tenant (Auto-Skip)**:
    *   **0 empresas**: Muestra error de acceso.
    *   **1 empresa**: El frontend llama automáticamente a `/api/companies/select` y redirige al Dashboard.
    *   **2+ empresas**: Redirige al `SelectCompanyComponent` para que el usuario elija.
6.  **Contexto de Empresa**: Al seleccionar una empresa, se crea la cookie `companyContext` (HttpOnly) que el backend usa para filtrar datos en peticiones subsecuentes.
7.  **Peticiones Subsecuentes**:
    *   El usuario navega o realiza acciones.
    *   **Interceptor** asegura el envío de credenciales (`withCredentials`).
    *   **Navegador** adjunta las cookies (`accessToken` y `companyContext`) automáticamente.
    *   **JwtTokenFilter** en Backend lee la cookie y autoriza la petición.

---

## 5. Estrategia de Anti-Fuerza Bruta (Rate Limiting)

Para proteger el sistema de ataques automatizados, se ha implementado un sistema de "Cubetas de Tokens" (Token Buckets) usando **Bucket4j**:

### Arquitectura del Sistema

*   **Servicio**: `RateLimitingService.java` gestiona un cache thread-safe (`ConcurrentHashMap`) de cubetas por IP.
*   **Filtro**: `RateLimitFilter.java` extiende `OncePerRequestFilter` y se ejecuta **antes** de la autenticación.
*   **Integración**: El filtro se inyecta en `SecurityConfig` con `.addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)`.

### Configuración de Límites

*   **Capacidad**: 5 intentos permitidos por IP.
*   **Recarga**: 5 intentos cada minuto (Refill Greedy).
*   **API**: Utiliza `Bandwidth.builder().capacity(5).refillGreedy(5, Duration.ofMinutes(1))`.

### Manejo de IPs en Entornos Proxy (Cloudflare/Nginx)

El filtro está optimizado para entornos de producción con proxies inversos:

```java
String ip = request.getHeader("X-Forwarded-For");
if (ip == null || ip.isEmpty()) {
    ip = request.getRemoteAddr();
} else {
    // X-Forwarded-For puede contener múltiples IPs: "cliente, proxy1, proxy2"
    // Tomamos la primera (el cliente real)
    ip = ip.split(",")[0].trim();
}
```

### Flujo de Protección

1.  **Intercepción**: `RateLimitFilter` intercepta peticiones POST a `/api/auth/login`.
2.  **Resolución de IP**: Extrae la IP real del cliente usando `X-Forwarded-For` con fallback a `RemoteAddress`.
3.  **Consulta de Cubeta**: Resuelve la cubeta asociada a esa IP (`resolveBucket(ip)`).
4.  **Consumo de Token**: Intenta consumir 1 token (`tryConsumeAndReturnRemaining(1)`).
5.  **Respuesta**:
    *   **Permitido**: Si hay tokens, continúa al siguiente filtro y agrega header `X-Rate-Limit-Remaining`.
    *   **Bloqueado**: Si no hay tokens, retorna **HTTP 429** con JSON: `{"message": "Demasiados intentos. Por favor espere 1 minuto."}`.

### Experiencia de Usuario (Frontend)

El `LoginComponent` captura el error 429 y:

1.  **Muestra mensaje visual**: "⚠️ Límite de intentos seguridad excedido. Por favor espera X segundos."
2.  **Deshabilita el formulario**: Bloqueo completo de campos y botón de ingreso.
3.  **Cuenta regresiva en tiempo real**: Actualiza el mensaje cada segundo (60→59→58...).
4.  **Auto-reactivación**: Al llegar a 0, habilita automáticamente el formulario sin necesidad de refrescar.


---

## 6. Base de Datos (Esquema Resumido)

### `security.users`
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `username` | VARCHAR | Único |
| `password` | VARCHAR | Hash BCrypt |
| `email` | VARCHAR | Único |
| `is_super_admin`| BOOLEAN | Flag de permisos |

### `security.refresh_tokens`
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `user_id` | UUID | FK -> Users |
| `token` | VARCHAR | Token aleatorio único |
| `expiry_date` | TIMESTAMP | Fecha de expiración (7 días) |

### `security.user_company_roles`
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `user_id` | UUID | FK -> Users |
| `company_id` | UUID | FK -> Companies |
| `role_name` | VARCHAR | ADMIN, EMPLOYEE, etc. |
| `is_active` | BOOLEAN | Estado de la relación |

### `security.login_logs`
| Columna | Tipo | Descripción |
| :--- | :--- | :--- |
| `id` | UUID | PK |
| `user_id` | UUID | FK -> Users |
| `login_time` | TIMESTAMP | Fecha acceso |
| `ip_address` | VARCHAR | IP Cliente |
| `user_agent` | TEXT | Navegador/OS |

