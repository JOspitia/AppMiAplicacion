---
description: Documentación de la implementación del módulo de Centros Operacionales (RRHH).
---

# Gestión de Centros Operacionales

Los Centros Operacionales representan los puntos físicos o lógicos donde se ejecutan las actividades de la empresa. A diferencia de las Sedes (Locations), los Centros Operacionales están vinculados a la estructura administrativa de RRHH.

## 🏗️ Estructura del Backend (Spring Boot)

### 1. Entidad `OperationalCenter`
- **Tabla**: `public.operational_centers`
- **Campos**:
    - `id` (UUID)
    - `location_id` (UUID): Relación opcional con una Sede física.
    - `name` (String): Max 100 caracteres.
    - `code` (String): Código único por empresa.
    - `active` (Boolean)

### 2. Lógica de Servicio
- **Multi-tenencia**: Filtrado automático por `company_id` mediante `AuthService`.
- **Validación**: Impide códigos duplicados dentro de la misma empresa.

## 🎨 Estructura del Frontend (Angular)

### 1. Componentes
- **OperationalCenterListComponent**: Tabla con integración de búsqueda y toggle de estados.
- **OperationalCenterFormComponent**: Formulario con selector de Sedes (Locations) filtrado por activos.

## 🛠️ Estándares Técnicos
- **Auditoría**: Extiende `AuditableEntity`.
- **Diseño**: Sigue el patrón Glassmorphism y el sistema de diseño Human-Centric.
- **Iconografía**: Icono representativo `map-pin` o `target`.
