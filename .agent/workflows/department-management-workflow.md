---
description: Documentación completa de la implementación del módulo de Gestión de Departamentos (Department System).
---

# Gestión de Departamentos
Este flujo de trabajo describe la implementación del módulo de Gestión de Departamentos, encargado de mantener la estructura funcional y jerárquica de la organización.

## 1. Arquitectura de Datos (Backend)

### 1.1 Modelo `Department`
Entidad central que representa un área funcional.
- **Tabla**: `business_rrhh.departments`
- **Campos Principales**:
    - `id` (UUID): Identificador único.
    - `code` (String): Código único por compañía (Ej: `TIC-001`).
    - `name` (String): Nombre del departamento.
    - `active` (Boolean): Estado del departamento.
- **Relaciones**:
    - `parent` (ManyToOne): Departamento padre (Jerarquía).
    - `costCenter` (ManyToOne): Centro de Costos asociado.
    - `organizationalLevel` (ManyToOne): Nivel jerárquico (Estratégico, Táctico, etc.).
    - `locations` (ManyToMany): Sedes donde opera el departamento.
    - `managerPositionId` (UUID): Referencia a la posición del jefe de área.

### 1.2 Reglas de Negocio (Service)
- **Unicidad de Código**: El campo `code` debe ser único dentro de la misma compañía (`findByCodeAndCompanyId`).
- **Jerarquía Cíclica**: Se valida que un departamento no pueda ser su propio padre.
- **Validación de Relaciones**: Todas las entidades relacionadas (Padre, Centro de Costos, Nivel, Sedes) deben pertenecer a la misma compañía del usuario (`getCurrentCompanyId()`).

## 2. Interfaz de Usuario (Frontend)

### 2.1 Department List (`department-list.component`)
Implementa el estándar de diseño **Premium Glassmorphism** unificado con el módulo de Finanzas.
- **Visualización (Patrón Columna Combinada)**: `p-table` con estructura optimizada:
    - **Código**: Badge sutil `text-xs font-black` (estándar unificado).
    - **Nombre y Descripción**: Columna combinada que muestra el icono `building` (en contenedor premium), nombre del departamento, nivel organizacional (badge pequeño) y una línea de descripción con tooltip accesible.
    - **Metadatos**: Columnas de ancho reducido (15%) para Padre y Centro de Costos.
    - **Estado**: Badge de estado Activo/Inactivo con punto de color.
- **Filtros**:
    - Buscador global por múltiples campos.
    - Toggle para mostrar/ocultar inactivos.
- **Acciones**: Editar y Toggle Active (con confirmación).

### 2.2 Department Form (`department-form.component`)
Formulario reactivo con validaciones en tiempo real y diseño **Human-Centric**.
- **Inputs con Iconos**: Campos de Código y Nombre con iconos de PrimeIcons integrados dentro del campo (`absolute`, `padding-left: 3.5rem`).
- **Selectores de Autocompletado**: Todos los dropdowns (`p-select`) tienen habilitado el filtro de búsqueda (`[filter]="true"`) y `appendTo="body"`.
- **Asignación de Sedes (Pattern: Roles Assignment)**:
    - Uso de `p-multiSelect` con un área superior de **Chips externos** para gestión rápida de sedes vinculadas.
    - El selector muestra un resumen (ej: "3 sedes asignadas") en lugar de una lista saturada.
- **Descripción**: Estilo unificado con el sistema de Roles (textarea resize-none, bordes redondeados premium).
- **Validación**: Código y Nombre obligatorios.

## 3. Integración y Servicios
- **DepartmentService**: Maneja el CRUD completo.
- **Dependencias**: Se integra con `CostCenterService`, `OrganizationalLevelService` y `LocationService` para poblar los selectores del formulario.

## 4. Estándares Técnicos
- **DTOs**: Uso de `DepartmentDto` para transferir datos, incluyendo nombres de relaciones para visualización eficiente sin N+1 consultas en el frontend.
- **Backend**: Validaciones de seguridad (`@PreAuthorize`) y multi-tenencia (`TenantContext`).
