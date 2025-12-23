# Sistema de Layout Principal (SPA)

Este documento describe la arquitectura y el funcionamiento del shell principal de la aplicación, que transforma el proyecto en una verdadera **Single Page Application (SPA)** con navegación fluida y gestión de estados persistente.

## 1. Arquitectura del Layout

El layout principal se divide en tres componentes clave que trabajan en conjunto bajo el `MainLayoutComponent`.

### A. Shell Principal (`MainLayoutComponent`)
Ubicado en `src/app/core/layout/main-layout.component.ts`, este componente actúa como el contenedor global para todas las páginas autenticadas.

**Características:**
*   **Sidebar Colapsable**: Menú lateral dinámico que soporta submenús y modo compacto (icon-only).
*   **Topbar de Cristal (Glassmorphism)**: Barra superior fija con efectos de desenfoque, selectores de empresa, información de usuario y controles de tema.
*   **Router Outlet**: Punto de inyección dinámica donde Angular carga las vistas internas (`Home`, `Dashboard`, etc.) sin recargar la página completa.
*   **Gestión de Temas**: Sincronización automática entre el modo claro y oscuro.

### B. Componente Home (`HomeComponent`)
Inspirado en el diseño original del ecosistema, ofrece una bienvenida personalizada.
*   **Saludo Dinámico**: Carga el nombre del usuario desde `/api/auth/me`.
*   **Módulos de Acceso**: Grid visual de tarjetas para acceder a Empleados, Nómina, etc.
*   **Banner de Seguridad**: Indicador visual de cumplimiento y protección de datos.

### C. Componente Dashboard (`DashboardComponent`)
Panel especializado para administradores con métricas clave.
*   **Estadísticas en Tiempo Real**: Tarjetas con indicadores de empleados, asistencia y nómina.
*   **Gráficos**: Visualización de tendencias empresariales.

---

## 2. Flujo de Navegación y Acceso

### Seguridad con Guards
Se implementó un sistema de protección de rutas basado en roles:

1.  **`authGuard`**: Asegura que el usuario tenga una empresa seleccionada y sesión activa antes de entrar al layout.
2.  **`superAdminGuard`**: Filtra el acceso al `/dashboard`. Si un usuario normal intenta entrar, es redirigido automáticamente a `/home`.

### Configuración de Rutas (`app.routes.ts`)
```typescript
{
    path: '',
    component: MainLayoutComponent,
    children: [
        { path: 'home', component: HomeComponent },
        { path: 'dashboard', component: DashboardComponent, canActivate: [superAdminGuard] },
        { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
}
```

---

## 3. Integración con el Backend

Para soportar este layout, se añadieron/actualizaron los siguientes servicios:

*   **`GET /api/auth/me`**: Retorna el perfil completo del usuario autenticado (ID, nombre, email, rol, y si es superadmin).
*   **`GET /api/companies/current`**: Inyecta el nombre de la empresa actual en los componentes de bienvenida.
*   **`GET /api/companies/available`**: Llena el selector de empresas en la barra superior.
*   **`POST /api/companies/select`**: Cambia el contexto de la empresa sin cerrar sesión, actualizando la cookie `companyContext`.

---

## 4. Estándares Estéticos (Human-Centric)

*   **Diseño Unificado (Brand Consistency)**: Todas las tarjetas de módulos utilizan el esquema de color `--primary-color` (Indigo) para transmitir profesionalismo y autoridad.
*   **Contraste Inteligente (Hover Fix)**: En modo día, el hover de las tarjetas aplica un degradado oscuro (`indigo-600` a `indigo-900`) para garantizar que el texto blanco sea 100% legible.
*   **Iconografía de Alta Fidelidad**: Implementación de un renderizador híbrido que soporta SVGs "pixel-perfect" inyectados desde la DB. Ver [Sistema de Gestión de Iconos](./icon-management-system.md).

*   **Micro-animaciones**: Transiciones suaves al colapsar el sidebar y hover effects en las tarjetas de módulos.
*   **Ambient Glow**: Orbes de luz sutiles en las esquinas para dar profundidad a la interfaz.
*   **Shadows Dinámicas**: Sombras que reaccionan al hover para dar sensación de elevación física.

---

## 5. Cómo funciona el Cambio de Contexto
Cuando un usuario cambia de empresa en el selector superior:
1. El frontend llama a `/api/companies/select`.
2. El backend actualiza la cookie `companyContext`.
3. La página realiza un refresco controlado para que todos los componentes (Home, Sidebar) carguen los datos específicos de la nueva empresa.
