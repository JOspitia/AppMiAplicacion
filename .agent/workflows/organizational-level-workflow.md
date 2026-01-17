---
description: Documentación de la implementación del módulo de Niveles Organizacionales (Jerarquía RR.HH.)
---

# Workflow: Gestión de Niveles Organizacionales

Este módulo permite definir la estructura jerárquica de la organización (ej: CEO, Direcciones, Departamentos), utilizando un sistema de reordenamiento visual.

## 1. Arquitectura de Datos (Backend)

### 1.1 Modelo y Base de Datos
- **Tabla**: `business_rrhh.organizational_levels`.
- **Campos Críticos**:
    - `hierarchy_order`: Índice numérico opcional (permite `NULL`).
- **Blindaje de Integridad**: 
    - Se utiliza un **Índice Único Parcial** `unique_active_hierarchy_order_per_company` que solo actúa sobre filas donde `active = TRUE`.
    - Esto permite que registros inactivos tengan `hierarchy_order = NULL` sin causar colisiones.

### 1.2 Lógica de Reordenamiento y Estado (Integridad Condicional)
Para garantizar que el orden siempre sea coherente:
1.  **Desactivación**: Al pasar un nivel a `active = false`, el servicio limpia el campo `hierarchy_order` (lo pone en `NULL`).
2.  **Reactivación**: Al reactivar un nivel, el sistema calcula automáticamente su nueva posición usando `MAX(hierarchy_order) + 1` de la compañía actual.
3.  **Reordenamiento (Update Order)**: Solo se permite reordenar el subconjunto de elementos activos. El backend utiliza la estrategia de dos fases (valores negativos -> valores positivos) dentro de una transacción.

## 2. Interfaz de Usuario (Frontend)

### 2.1 Lista Jerárquica (Drag & Drop)
- **Componente**: `OrganizationalLevelListComponent`.
- **Interacción**: Arrastre de filas mediante un **Floating Handle** centrado (`w-10 h-10 rounded-xl`).
- **Standard de Visualización (Patrón Columna Combinada)**:
    - **Nombre y Descripción**: Columna unificada que agrupa el icono `sitemap` (en contenedor premium con micro-animación) y los datos textuales.
    - **Descripción**: Reducida a una línea con `line-clamp-1` y tooltip de accesibilidad unificado (`tooltip-wide`).
- **Directiva**: Uso obligatorio de `pReorderableRowHandle` para asegurar una respuesta inmediata al arrastre.
- **Estado**: Se utiliza un arreglo mutable `displayItems` actualizado mediante un `effect` de Angular. Este arreglo es una copia del estado original (`[...filtered]`).

### 2.2 Formulario Simplificado
- **Componente**: `OrganizationalLevelFormComponent`.
- **Simplificación**: El campo `hierarchyOrder` **no es editable** por el usuario en el formulario. Se asigna automáticamente al final de la lista en la creación (`MAX(order) + 1`).
- **Autocompletado**: Todos los selectores deben tener habilitado el filtro de búsqueda (`[filter]="true"`) y `appendTo="body"` para consistencia sistémica.
- **Campos**: Nombre, Descripción, Estado Activo.

## 3. Estándares Visuales
- **Icono Representativo**: `sitemap`.
- **Badges de Orden**: Círculos numerados con fondo `bg-slate-100` y borde definido.
- **Micro-interacciones**: Hover con cambio de color en el drag-handle para indicar que el elemento es movible.
