# Arquitectura de Seguridad y Gestión de Sesiones

Este documento detalla el ecosistema de seguridad implementado en el proyecto, cubriendo desde la autenticación hasta la gestión de activos y protección contra ataques comunes.

---

## 1. Autenticación y Gestión de Sesiones

El sistema utiliza una arquitectura **Stateless** reforzada con **Cookies HttpOnly** para maximizar la seguridad contra ataques XSS (Cross-Site Scripting).

### 1.1 Flujo de Autenticación
1.  **Login**: El usuario envía credenciales al endpoint `/api/auth/login`.
2.  **Estrategia Híbrida**: El servidor responde con el token en dos vías:
    -   **Cookie (HttpOnly)**: `auth_token` para seguridad automática del navegador.
    -   **Body (JSON)**: `token` para almacenamiento en `localStorage` (fallback/SPA compatibility).
3.  **Persistencia**: Angular guarda el token en `localStorage`. Todas las peticiones posteriores incluyen el header `Authorization: Bearer <token>` **Y** las cookies.
4.  **Prioridad en Backend**: El `JwtTokenFilter` prioriza el header `Authorization` sobre la cookie para evitar problemas con bloqueos de cookies de terceros.

### 1.2 Sistema de Silent Refresh (Transmisión Automática)
Para evitar que la experiencia del usuario se interrumpa al expirar el Access Token, se implementó un **HttpInterceptor** avanzado:

-   **Detección de Errores**: Captura errores `401 Unauthorized` (Sesión expirada) y `403 Forbidden` (CSRF Desincronizado).
-   **Mutex/Semáforo**: Utiliza un `BehaviorSubject` para asegurar que solo se dispare una petición de refresco a la vez, incluso si hay múltiples peticiones paralelas fallando.
-   **Protección contra Bucles**: Implementa un header personalizado `X-Interceptor-Retry` para identificar peticiones ya reintentadas. Si una petición reintentada falla de nuevo, se cancela el flujo para evitar bucles infinitos.
-   **Reintento Transparente**: Una vez renovado el token, el interceptor clona la petición original añadiendo el header de marca y la reenvía sin que el usuario note el fallo inicial.

    -   **Unificación CSRF + Refresh**: Se implementó un **interceptor unificado** (frontend) que maneja ambos casos:
    - En caso de **403 Forbidden** (p. ej. CSRF desincronizado) ejecuta la **Estrategia Nuclear**: llama a `/api/auth/me` y lee el nuevo token CSRF directamente del cuerpo **JSON** de la respuesta, ignorando la cookie para evitar condiciones de carrera. Luego reintenta la petición original con el header `X-XSRF-TOKEN` actualizado.
    - En caso de **401 Unauthorized** ejecuta la rutina de refresh-token y reintenta la petición original.
    - Para evitar bucles, el interceptor marca reintentos con cabeceras (`X-Interceptor-Retry`, `X-CSRF-Retry`).

> **Nota de Desarrollo**: Para pruebas, el token JWT se ha configurado con una expiración corta (30s) para validar visualmente el flujo de refresco. En producción, esto debe ajustarse a 15 min (JWT) y 7 días (Refresh Token).

---

## 2. Protección CSRF / XSRF (Cross-Site Request Forgery)

Se implementó una estrategia híbrida robusta basada en el patrón de **Doble Envío de Cookie** pero reforzada con **Entrega Explícita por JSON (Solución Nuclear)** para recuperaciones.

### 2.1 Configuración del Backend
-   **Repositorio**: Se utiliza `CookieCsrfTokenRepository.withHttpOnlyFalse()`.
-   **Entrega JSON**: El endpoint `/api/auth/me` ha sido modificado para incluir explícitamente el `csrfToken` en su respuesta JSON. Esto permite al frontend obtener un token válido garantizado sin depender de la legibilidad o sincronización de las cookies en el navegador.

### 2.2 Configuración del Frontend
-   **Funcionamiento Normal**: Angular lee automáticamente la cookie `XSRF-TOKEN` y la adjunta al header `X-XSRF-TOKEN`.
-   **Recuperación de Fallos (Interceptor)**: Si una petición falla con `403`, el interceptor solicita `/api/auth/me`, extrae el token del JSON y reintenta la petición fallida manualmente. Esta redundancia elimina los errores por "race conditions" en la actualización de cookies.

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
Configurado en `SecurityConfig.java` para restringir el origen de los recursos que el navegador puede cargar. **La aplicación ya incluye una política base**, pero conviene conocer los matices y recomendaciones para producción:

- `default-src 'self'`: Política base que restringe recursos al propio dominio.
- `img-src 'self' data: blob: https://*`: Permite imágenes locales y fuentes seguras externas.
- `script-src`: Restringido a dominios autorizados y scripts locales, aunque en entornos con CDN o scripts embebidos puede haber excepciones (`'unsafe-inline'`/`'unsafe-eval'`) que **deben evitarse en producción**.

Notas y recomendaciones:

- Aplicación global vs rutas sensibles: establece una **política global** desde el servidor y **refuérzala** con una política más estricta en rutas sensibles (ej. `/login`, `/account`). Para `/login` se recomienda:
  - Evitar `unsafe-inline` y `unsafe-eval`.
  - Usar `nonce` o `hash` para permitir únicamente scripts inline legítimos generados por el servidor.
  - Incluir `frame-ancestors 'none'` para prevenir clickjacking.

- Fase segura de despliegue: primero usa `Content-Security-Policy-Report-Only` globalmente para recopilar violaciones y ajustar la política sin interrumpir a los usuarios; tras validar los reports, cambia a `Content-Security-Policy` bloqueante.

- Minimiza orígenes externos: revisa las entradas de `script-src`, `style-src` y `connect-src` y elimina orígenes innecesarios. Si usas terceros (analytics, pagos), añade sus orígenes explícitos.

Medidas complementarias implementadas en este repositorio:

- **Client-side hashing (migración)**: El frontend ahora calcula un `clientHash` (SHA-256 hex) y lo envía junto con la contraseña raw en el login. El backend acepta `clientHash` y soporta una estrategia de migración: si la autenticación con la contraseña raw tiene éxito y viene `clientHash`, el servidor re-hashea `bcrypt(clientHash)` y almacena la nueva representación. Esto facilita un paso seguro hacia el envío solo de hashes desde el cliente.

- **Protecciones en el input de contraseña**: el input incluye `autocomplete="new-password"` y el cliente evita el `paste` en ese campo (esto mejora la defensa contra algunos vectores automatizados, aunque puede limitar la usabilidad con gestores de contraseñas).

- **Cookies seguras**: los tokens se envían como cookies `HttpOnly`, `Secure` y `SameSite=Strict` (ya implementado en `AuthController`).

- **Monitorización**: habilita un endpoint para recibir reports CSP (o usa un servicio) para revisar violaciones y ajustar la política.

### Registros y diagnósticos añadidos
-   **Logs de Refresh**: El endpoint `/api/auth/refreshtoken` ahora registra la cabecera `X-XSRF-TOKEN` y el `Cookie` header cuando se recibe una petición de refresh, para facilitar el diagnóstico de fallos de cookie/CSRF.
-   **AccessDenied Logging**: Se añadió un `ControllerAdvice` (`SecurityExceptionHandler`) que registra detalles cuando se lanza `AccessDeniedException` (403), incluyendo la ruta, método, `X-XSRF-TOKEN` y las cookies presentes en la petición.

Resumen: la configuración actual proporciona una buena base, pero **recomiendo endurecer la CSP en producción** (eliminar `unsafe-inline`, usar nonces/hashes para inline legítimo y aplicar una política más estricta en `/login`). Implementa `Report-Only` primero para recoger datos y luego pasa a bloqueo total.

### 4.5 Cambios implementados (23-12-2025)
A continuación se resumen las medidas de seguridad implementadas recientemente en el proyecto, sus efectos y recomendaciones operativas:

- **Client-side hashing (migración segura)**: El frontend calcula un `clientHash` (SHA-256 hex) antes de enviar las credenciales y lo envía junto con la contraseña raw. El backend acepta `clientHash` y soporta una estrategia de migración donde, si la autenticación con la contraseña raw es exitosa y viene `clientHash`, el servidor actualiza la contraseña almacenada a `bcrypt(clientHash)`. Esto facilita un tránsito seguro hacia el envío únicamente de hashes desde el cliente.

- **Ajustes en AuthController**: Soporte para `clientHash` en el DTO `LoginRequest`, migración de contraseñas cuando procede y uso del método auxiliar `getClientIp(HttpServletRequest)` para registrar la IP real (lee `X-Forwarded-For` y cae a `remoteAddr` como fallback).

- **Rate limiting y auditoría**: `RateLimitFilter` ahora registra intentos bloqueados en `security.login_logs` con `status='BLOCKED'` y `failure_reason='Rate Limit Exceeded (429)'`. Se agregó la migración Flyway `V69__allow_null_user_in_login_logs_and_add_status.sql` que permite `user_id` NULL y crea las columnas `status` y `failure_reason` para soportar logs anónimos y detallados.

- **Cabeceras y CSP**: Se añadió `Content-Security-Policy-Report-Only` global para monitorizar violaciones sin bloquear; además se integraron cabeceras de refuerzo (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Permissions-Policy`, HSTS). Se implementó saneamiento del valor CSP para eliminar CR/LF y evitar errores al enviar la cabecera.

- **Protecciones en inputs sensibles**: En el formulario de login se aplicó `autocomplete="new-password"` y se previene el `paste` en el campo de contraseña (medida de seguridad que puede afectar a gestores de contraseñas). Recomendamos evaluar usabilidad versus seguridad antes de imponerla en todos los entornos.

- **Privacidad y comunicación al usuario**: Se añadió la sección "Registro de seguridad" a la página de Política de Privacidad para informar a los usuarios sobre la recolección de la IP y datos básicos del cliente (User-Agent) con fines de auditoría y protección del sistema.

- **Robustez y errores**: Los fallos al persistir logs de auditoría no deben bloquear la respuesta al cliente; por ello, estos errores se capturan y registran en el logger sin impedir devolver el `429`. Adicionalmente se aplicaron defensas para prevenir inyección en cabeceras (CR/LF sanitization).

- **Logout y auditoría mejorada (23-12-2025)**: Se reforzó el flujo de cierre de sesión para garantizar que la acción quede correctamente auditada incluso si el `SecurityContext` fue limpiado:
  - El backend registra siempre el evento de `LOGOUT` **antes** de borrar las cookies de sesión, incluyendo `status='LOGOUT'` y `failure_reason='Cierre de sesión voluntario'`.
  - Ahora se persiste también el `user_agent` del cliente en los eventos `LOGOUT` para facilitar investigación forense y correlación con otras señales.
  - Si el objeto `UserDetails` no está disponible (por ejemplo, porque Spring limpió el contexto), el servidor realiza un intento **best-effort** de recuperar el `username` desde la cookie `accessToken` y busca el `User` en la base de datos para asociar el `user_id` al registro de logout sin bloquear la respuesta.
  - El endpoint `/api/auth/logout` devuelve un JSON estructurado (`{"message":"Logout exitoso"}`) para evitar errores de parseo en el frontend; se recomienda limpiar el estado local (LocalStorage / Store) **solo** tras recibir el 200 OK del servidor.
  - Se validó manualmente con un flujo de registro → login → logout que `user_id` y `user_agent` se persisten en `security.login_logs`.

Recomendaciones operativas:
- Mantener la CSP en `Report-Only` y monitorizar los reports durante 1–2 semanas antes de pasar a una política bloqueante.
- Añadir índices (`status`, `ip_address`) en `security.login_logs` si se prevé uso frecuente para investigación de incidentes.
- Definir una política de retención de logs (por ejemplo, 6–12 meses) y procedimientos para cumplimiento de solicitudes de derechos (acceso, rectificación, supresión).
- Evaluar la eliminación de `unsafe-inline` y la adopción de nonces/hashes para scripts inline en producción, priorizando el endurecimiento en rutas sensibles (`/login`).

---


### 4.3 Referrer Policy y HSTS
-   **HSTS (HTTP Strict Transport Security)**: Obliga el uso de HTTPS durante un año tras la primera conexión.
-   **Referrer Policy**: Configurado como `strict-origin-when-cross-origin` para proteger la privacidad del usuario en saltos entre dominios.

### 4.4 Manejo Global de Errores y Validación Professional
Para evitar la fuga de información y mejorar la experiencia de auditoría:
-   **GlobalExceptionHandler**: Captura excepciones de validación (`MethodArgumentNotValidException`) y errores de tiempo de ejecución, devolviendo respuestas JSON estructuradas (Status 400) en lugar de páginas de error genéricas (Status 403/500).
-   **Seguridad en el Despacho de Errores**: Se configuró `dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()` en el backend para asegurar que los mensajes de error de validación lleguen al cliente incluso en rutas protegidas.

Operativa y manejo de errores

- Se implementa un manejador específico para `AuthenticationException` en `GlobalExceptionHandler` que retorna **HTTP 401** con un JSON consistente: `{"message": "Credenciales incorrectas"}`. Esto evita problemas de parseo en el frontend cuando ocurren fallos de autenticación.
- El formato de error para `RuntimeException` devuelve JSON con la clave `message` y se registra mediante `SLF4J` en niveles apropiados (WARN para validación, INFO para fallos de autenticación, ERROR para errores en tiempo de ejecución), lo que facilita la auditoría y el debugging.
- El sistema documenta procedimientos y guías para depurar `502 Bad Gateway` causados por fallos de conectividad entre Nginx y el backend; estas guías incluyen comandos para verificar contenedores, revisar logs, comprobar conectividad interna y ejecutar acciones correctivas rápidas.

#### Guía rápida: Depuración de 502 Bad Gateway (Nginx) 🔧
Si el frontend devuelve `502` con `connect() failed (Host is unreachable)`, sigue estos pasos para diagnosticar y resolver el problema:

1. Verificar contenedores y estado:
   - `docker-compose ps`
   - `docker ps --filter "name=app_backend" --no-trunc`
   *Esperado:* `app_backend` aparece como `Up`.

2. Revisar logs del backend:
   - `docker-compose logs --tail 200 backend`
   - o `docker logs --tail 200 app_backend`
   *Buscar:* errores de arranque (Flyway), excepciones o mensajes como `Started Application`.

3. Probar acceso directo al backend desde el host (evitar Nginx):
   - `curl -v http://localhost:8081/actuator/health`
   - o (PowerShell) `Invoke-RestMethod -Uri 'http://localhost:8081/api/auth/login' -Method Post -ContentType 'application/json' -Body '{"usernameOrEmail":"admin","password":"admin"}'`
   *Resultado esperado:* respuesta HTTP (200 / 401 / JSON) — si no responde, el backend no está escuchando correctamente.

4. Comprobar conectividad desde el contenedor frontend (resolución interna):
   - `docker exec -it app_frontend sh -c "apk add --no-cache curl >/dev/null 2>&1 || true; curl -v http://backend:8080/api/auth/login -H 'Content-Type: application/json' -d '{\"usernameOrEmail\":\"admin\",\"password\":\"admin\"}' || true"`
   *Si falla:* problema de DNS/Red Docker o backend no escucha en 8080.

5. Inspeccionar red Docker e IP del backend:
   - `docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" app_backend`
   - `docker network inspect app-network`

6. Acciones correctivas rápidas:
   - `docker-compose up -d --build backend` (reconstruir/levantar)
   - `docker restart app_backend`
   - Revisar `nginx.conf` y confirmar `proxy_pass http://backend:8080/`; si lo modificas, reinicia `app_frontend`.

> Nota: en entornos productivos, también verificar reglas de firewall/SELinux y que el servicio esté expuesto en la red interna correcta. Añadir estas comprobaciones a los runbooks de operación puede ahorrar tiempo en incidentes futuros.


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
- **[CRITICAL UPDATE] Multi-Role Assignment**: 
    - Se modificó la arquitectura de asignación para permitir que un usuario tenga **múltiples roles** por empresa.
    - Las autoridades resultantes son la **unión** de todos los permisos de todos los roles asignados, permitiendo una granularidad superior y composición de perfiles (ej: "Admin de Nómina" + "Visualizador de Auditoría").

---

## 6. Auditoría y Pruebas de Penetración (Pentesting Local)

Se ha implementado una suite de scripts de auditoría en la carpeta `audit/` para validar las defensas activas del sistema.

### 6.1 Scripts de Auditoría Disponibles
| Script | Objetivo de la Prueba | Éxito esperado |
|---|---|---|
| `attack.ps1` | **Fuerza Bruta / Rate Limit**: Intenta realizar 15 logins seguidos. | Status **429** tras el 5to intento. |
| `injection_test.ps1` | **Validación e Inyección**: Prueba XSS, correos inválidos y contraseñas cortas. | Status **400** con JSON de error detallado. |
| `attack_login.ps1` | Script de auditoría general: intenta pares de credenciales, registra respuestas y encabezados básicos. | Registro claro de éxitos/fallos en log y consola. |
| `rate_limit_test.ps1` | Prueba específica de rate-limiting: repite un par de credenciales inválidas N veces y detecta `429`. | Detecta y marca el intento donde aparece 429. |
| `login_with_headers.ps1` | Captura y registra encabezados (Set-Cookie, Content-Type) y muestra flags `HttpOnly`, `Secure`, `SameSite`. | Muestra `Set-Cookie` y ayuda a auditar flags de seguridad. |
| `encoding_check.ps1` | Verifica presencia de patrones de "mojibake" (ej. `Ã`) y revisa charset en Content-Type para detectar problemas de encoding. | Identifica secuencias sospechosas y extrae excerpts para revisión. |

### 6.2 Ejecución de Pruebas
Para ejecutar una auditoría de seguridad, use PowerShell desde la raíz:
```powershell
# Validar protección contra ataques DoS/Brute Force
powershell -ExecutionPolicy Bypass -File .\audit\attack.ps1

# Validar integridad de datos y rechazo de scripts maliciosos
powershell -ExecutionPolicy Bypass -File .\audit\injection_test.ps1
```

---

## 7. Resumen de Tecnologías

| Capa | Tecnología |
|---|---|
| Autenticación | Estrategia Híbrida (JWT Header + Cookie) |
| Refresco de Sesión | RxJS (Interceptor + Mutex) |
| Protección CSRF | Double Submit + JSON Delivery |
| Almacenamiento | MinIO (Object Storage) |
| Seguridad Backend | Spring Security 6.x |
| Control de Tráfico | `com.project.backend_api.security.RateLimitFilter` |
| Auditoría de Datos | GlobalExceptionHandler (Validación 400) |
| Herramientas de Test | PowerShell Pentesting Scripts (`audit/`) |
