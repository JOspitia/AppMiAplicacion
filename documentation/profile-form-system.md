# Sistema de Formulario de Perfil de Usuario

Este documento detalla la arquitectura técnica, lógica de negocio y componentes de UI que conforman el módulo de perfil de usuario (`/core/management/users/profile`).

## 1. Visión General

El módulo de perfil permite al usuario gestionar su identidad digital, seguridad y ubicación. Se diseñó bajo principios de **"Human-Centric Design"**, priorizando la usabilidad, validación en tiempo real y estética "Premium".

### Componentes Principales
1.  **`ProfileComponent`**: Orquestador principal (Standalone).
2.  **`AddressBuilderComponent`**: Componente compartido para construcción de direcciones estandarizadas.
3.  **`ProfileService`**: Capa de abstracción de API.

---

## 2. Arquitectura de Componentes

### 2.1 ProfileComponent (`profile.ts`)
Este componente actúa como contenedor inteligente dividido en dos pestañas lógicas:

#### A. Pestaña "Información Personal"
-   **Navegación Responsiva**: Las pestañas se adaptan a móviles (apilado vertical) con etiquetas de texto simplificadas.
-   **Formulario Reactivo (`infoForm`)**:
    -   Campos bloqueados: Nombres, Email (requieren flujos especiales).
    -   Campos editables: Teléfono (con máscara), Género, Fecha de Nacimiento.
    -   **Ubicación en Cascada (Sequential Loading)**:
        -   Carga automática al inicio: `Países -> Departamentos -> Ciudades` basado en los datos guardados.
        -   Evita errores de visualización inicial donde los selectores aparecían vacíos.
    -   **Dirección**: Campo de solo lectura que activa el `AddressBuilderComponent`.

#### B. Pestaña "Seguridad y Acceso"
-   **Cambio de Contraseña (`passwordForm`)**:
    -   Diseño en Grid: Campos de nueva contraseña y confirmación alineados en 2 columnas (desktop).
    -   Botón Unificado: Estilo `bg-primary` con sombra, idéntico al de perfil para consistencia visual.
    -   Uso de `p-password` con feedback de fortaleza nativo en español.
-   **Verificación de Identidad**: MODAL previo para acciones sensibles (como cambiar email).

### 2.2 AddressBuilderComponent (Shared)
Componente reutilizable (`shared/components/address-builder`) diseñado para solucionar el problema de direcciones no estandarizadas en Colombia/Latam.

-   **Responsividad**: Grid adaptativo (1 col en móvil, 2 en tablet, 4 en desktop).
-   **UX Móvil**: Botones apilados y padding ajustado para pantallas táctiles.
-   **Lógica**:
    -   Permite seleccionar Vía Principal, Números, Letras, Bis, Cuadrantes y Complementos.
    -   Genera una vista previa en tiempo real.
    -   Al confirmar, emite el valor formateado al componente padre.

---

## 3. Integración con Backend (API)

### 3.1 Endpoints (`ProfileController`)
| Método | Endpoint | Descripción | Payload |
|---|---|---|---|
| GET | `/api/profile/me` | Obtiene perfil completo | - |
| POST | `/api/profile/update` | Actualiza datos básicos | `UserProfileDto` |
| POST | `/api/profile/change-password` | Cambia contraseña | `ChangePasswordDto` |
| POST | `/api/profile/verify-password` | Verifica identidad | `PasswordDto` |
| POST | `/api/profile/change-email` | Inicia cambio email | `EmailDto` |

### 3.2 Seguridad y Resiliencia
1.  **Protección XSRF**: Configuración en `app.config.ts` para sincronizar `XSRF-TOKEN`.
2.  **AuthInterceptor (Silent Refresh y CSRF recovery)**:
    -   Detecta tokens expirados y renovados automáticamente (401 → refresh) y reintenta la petición original.
    -   Detecta 403 (CSRF desincronizado) y realiza un prefeteo a `/api/profile/me` para forzar la creación de la cookie `XSRF-TOKEN` antes de reintentar.
    -   **Loop Protection**: Cabeceras `X-Interceptor-Retry` y `X-CSRF-Retry` para evitar reentradas infinitas.
    -   **Nota para desarrolladores**: Se eliminó la lógica de reintento específica en componentes (p. ej. `change-password`), la cual ahora depende del interceptor centralizado para mantener el código UI limpio y evitar duplicidad de lógica.
    -   Mantiene la integridad de los datos en formularios largos durante el refresco.

---

## 4. Guía de Uso y UX

### 4.1 Construcción de Direcciones
1.  El usuario hace clic en el input de dirección (o el botón de lápiz).
2.  Se abre el modal `<app-address-builder>`.
3.  El usuario selecciona los componentes (ej: "Calle", "10", "#", "20", "-30").
4.  La vista previa muestra: "Calle 10 # 20 - 30".
5.  Al dar clic en "Confirmar", el modal se cierra y el dato viaja al formulario principal.

### 4.2 Cambio de Contraseña Segura
1.  El usuario ingresa su contraseña actual.
2.  Al escribir la nueva, el medidor de `p-password` indica si es Débil/Media/Fuerte.
3.  Labels traducidos: "Fuerte", "Media", "Débil".

---

## 5. Decisiones Técnicas Clave

-   **Standalone Components**: `ProfileComponent` no depende de un módulo gigante, importa lo que necesita.
-   **Shared Component**: Se extrajo el Address Builder para evitar duplicidad, ya que se usará en otros formularios (ej: creación de empleados).
-   **Tailwind + Glassmorphism**: Estilos consistentes con el resto de la app, usando utilidades `backdrop-blur`, gradientes y sombras suaves.
-   **Signals**: (Futuro) Se planea migrar la gestión de estado local a Angular Signals completamente.

## 6. Depuración Común

-   **Error 403 en POST**: Verificar si la cookie `XSRF-TOKEN` existe y si `withXsrfConfiguration` está activo.
-   **Listas de Ciudades Vacías**: Verificar que el ID del departamento seleccionado corresponda al país del catálogo.
