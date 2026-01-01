---
description: Documentación completa de la implementación del Sistema de Suscripciones SaaS y Toggle de Módulos.
---

# Gestión de Suscripciones SaaS

Este documento detalla la implementación del sistema de control de características (Feature Toggling) basado en suscripciones por empresa. Este módulo permite al Super Admin ("Root") habilitar o deshabilitar módulos completos (ej: RRHH, Nómina, Seguridad) para una empresa específica.

## 1. Arquitectura de Datos

### Entidades Core
1. **SaaSModule** (`configuration.saas_modules`):
   - Catálogo maestro de módulos disponibles en la plataforma.
   - Campos: `code`, `name`, `description`.
   - Ejemplo: 'CORE_HR', 'PAYROLL', 'RECRUITMENT'.

2. **CompanySubscription** (`security.company_subscriptions`):
   - Tabla pivote que vincula `Company` <-> `SaaSModule`.
   - Estado: `ACTIVE`, `SUSPENDED`, `EXPIRED`.
   - Controla si una empresa tiene acceso "pagado/habilitado" al módulo.

3. **SidebarMenu** (`configuration.sidebar_menu`):
   - Cada ítem del menú puede estar vinculado opcionalmente a un `module_id`.
   - Si está vinculado, el menú solo se renderiza si existe una suscripción activa.

## 2. Lógica de Negocio (Backend)

### DashboardService (Filtering)
El servicio de dashboard actúa como guardián de la interfaz de usuario:

```java
// Lógica de Filtrado en DashboardService.java
public List<ModuleDto> getUserModules(User user, UUID companyId) {
    // 1. Obtener IDs de módulos suscritos y activos
    Set<UUID> subscribedIds = companySubscriptionRepository.findActiveByCompanyId(companyId)...
    
    // 2. Filtrar menú recursivamente
    return allMenus.stream()
        .filter(menu -> {
            // Si el menú pertenece a un módulo, verificar suscripción
            if (menu.getModule() != null && !subscribedIds.contains(menu.getModule().getId())) {
                return false; 
            }
            return true;
        })...
}
```

### CompanySubscriptionService (Management)
Servicio exclusivo para `ROLE_ROOT` que permite:
- Listar todos los módulos del sistema y su estado para una empresa.
- **Toggle**: Activar/Suspender una suscripción con un solo clic.

## 3. Implementación Frontend

### CompanySubscriptionComponent
Ubicado en `/core/companies/:id/subscriptions`.
- **Acceso**: Protegido por `SuperAdminGuard`.
- **UI**: Tabla limpia con `p-toggleSwitch` para activación inmediata.
- **Feedback**: Notificaciones toast al cambiar estados.

### Integración en CompanyList
Se añadió un botón de acceso directo "Gestionar Suscripciones" (icono servidor) en el listado de empresas, visible solo para Super Admins.

## 4. Flujo de Trabajo

### Habilitar un Nuevo Módulo para un Cliente
1. El Super Admin navega a "Directorio de Empresas".
2. Localiza la empresa cliente.
3. Clic en el icono de "Gestionar Suscripciones".
4. En la lista de módulos, activa el switch del módulo deseado (ej: "Nómina").
5. **Resultado Inmediato**:
   - Los usuarios de esa empresa con permisos de Nómina ahora verán el menú correspondiente.
   - Si no tuviera suscripción, el menú permanecería oculto aunque tuvieran roles de administrador.

## 5. Consideraciones de Seguridad
- La validación es doble:
  1. **Nivel Suscripción**: ¿La empresa pagó esto?
  2. **Nivel Rol**: ¿El usuario tiene permiso para verlo?
- Si falla cualquiera de las dos, el acceso es denegado.

---
**Estado**: ✅ Producción
**Última Actualización**: 2025-12-31
