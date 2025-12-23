# Sistema de Menú Dinámico y Control de Acceso SaaS

Este documento detalla la arquitectura, el funcionamiento y la lógica del sistema de menú dinámico implementado en la aplicación. Este sistema permite que tanto la barra lateral (Sidebar) como el tablero principal (Dashboard) se adapten automáticamente al perfil del usuario, los permisos asignados y las suscripciones activas de la empresa.

---

## 1. Arquitectura de Base de Datos

El sistema se basa en 5 tablas principales que definen la jerarquía y el acceso:

| Tabla | Esquema | Propósito |
| :--- | :--- | :--- |
| `saas_modules` | `configuration` | Define los grandes módulos funcionales del sistema (Nómina, Empleados, etc.). |
| `sidebar_menu` | `configuration` | Almacena los ítems del menú, su icono, ruta (URL) y jerarquía (Padre/Hijo). |
| `company_subscriptions` | `security` | Cruza empresas con módulos. Si no hay registro activo aquí, nadie de esa empresa ve el módulo. |
| `roles` y `permissions` | `security` | Define qué acciones puede realizar un rol. El menú se cruza con estos permisos. |
| `user_company_roles` | `security` | Asigna un rol específico a un usuario dentro de una empresa determinada. |

---

## 2. Lógica de Filtrado (Backend - `DashboardService`)

Cuando el frontend solicita los módulos, el servidor ejecuta una lógica de "Triple Validación" para garantizar la seguridad:

### Paso A: Identificación del Contexto
Se obtiene el `userId` del token JWT y el `companyId` de la cookie `companyContext`.

### Paso B: Reglas de Visibilidad (Jerarquía de Acceso)
1.  **Super Administradores (SaaS Owners):**
    *   **Identificación:** `is_super_admin = true` en el perfil del usuario.
    *   **Lógica:** Saltan todas las validaciones. Ven el 100% de los menús activos del sistema independientemente de suscripciones o permisos.
2.  **Administradores de Empresa (Tenant Admins):**
    *   **Identificación:** Usuario con un rol asignado que tiene el flag `is_admin_role = true`.
    *   **Validación 1 (Suscripción):** Solo ven módulos a los que su empresa está suscrita actualmente.
    *   **Validación 2 (Excepción de Permiso):** Si el módulo está suscrito, se les otorga acceso total al menú del módulo, ignorando los permisos granulares (`permission_required`).
3.  **Usuarios de Empresa (Regulares):**
    *   **Validación 1 (Suscripción):** Se verifica que la empresa tenga contratado el módulo.
    *   **Validación 2 (Permisos Específicos):** Deben tener el permiso exacto definido en `permission_required` dentro de su rol asignado.

### Paso C: Construcción Jerárquica
El servicio procesa los menús de forma recursiva:
*   Si un menú padre es invisible por falta de permisos, todos sus hijos desaparecen automáticamente.
*   Se respeta el campo `order_index` para mantener la consistencia visual.

---

## 3. Integración en el Frontend (Angular)

### A. Servicio Centralizado (`DashboardService`)
Utiliza **Angular Signals** para manejar el estado global de los módulos:
*   `modules = signal<ModuleDto[]>([])`: Almacena la lista de menús permitidos.
*   `loadUserModules()`: Realiza la petición HTTP y actualiza la signal. Al ser una signal, cualquier componente que la use se refrescará automáticamente cuando los datos cambien.

### B. Sidebar (`MainLayoutComponent`)
*   Consume la signal de módulos.
*   Implementa una interfaz `MenuItem` que extiende el DTO del backend agregando `isOpen: boolean` para manejar el estado local de apertura/cierre de carpetas sin afectar la lógica global.
*   **Renderizado de Iconos**: Utiliza el [Sistema de Iconos Dinámicos](./icon-management-system.md) para renderizar automáticamente SVGs desde la base de datos o PrimeIcons.


### C. Dashboard (`HomeComponent`)
*   Utiliza la misma signal de módulos para renderizar las tarjetas táctiles.
*   **Lógica de Fallback:** Si el backend no envía una descripción específica para la tarjeta, el frontend genera una automáticamente basada en el título.

---

## 4. Flujo de Datos

1.  **Login:** El usuario se autentica.
2.  **Selección de Empresa:** El usuario elige su entorno de trabajo (esto guarda el `companyId` en una cookie segura).
3.  **Carga de UI:**
    *   `MainLayout` se inicializa y llama a `dashboardService.loadUserModules()`.
    *   El API procesa `SidebarMenu` + `Subscriptions` + `Permissions`.
    *   El JSON resultante llega al frontend.
    *   Las **Signals** notifican al Sidebar y al Home de forma simultánea.
4.  **Renderizado:** La interfaz se dibuja con los colores y accesos específicos de ese usuario.

---

## 5. Ventajas del Sistema

*   **Escalabilidad:** Para añadir un nuevo módulo a la aplicación, no hace falta tocar el código de Angular. Solo se inserta el nuevo ítem en `configuration.sidebar_menu`.
*   **Seguridad Multi-Tenant:** Un usuario puede ser Admin en la "Empresa A" y ver todo, pero ser un simple empleado en la "Empresa B" y ver solo su perfil.
*   **Performance:** Los datos se cargan una sola vez al inicio y se comparten mediante Signals, minimizando el tráfico de red.

---
*Documentación generada automáticamente por Antigravity AI Core.*
