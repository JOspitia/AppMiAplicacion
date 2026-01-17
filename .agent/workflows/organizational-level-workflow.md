---
description: Documentación de la implementación del módulo de Niveles Organizacionales (Jerarquía RR.HH.)
---

# Workflow: Gestión de Niveles Organizacionales

Este módulo permite definir la estructura jerárquica de la organización (ej: CEO, Direcciones, Departamentos), utilizando un sistema de reordenamiento visual.

## 1. Arquitectura de Datos (Backend)

### 1.1 Modelo y Base de Datos
- **Tabla**: `business_rrhh.organizational_levels`.
- **Campos Críticos**:
    - `hierarchy_order`: Índice numérico que define la posición en el organigrama.
    - `unique_org_level_order_per_company`: Restricción única para evitar dos niveles con el mismo orden en una empresa.

### 1.2 Lógica de Reordenamiento (Estrategia Nuclear)
Para actualizar el orden sin violar restricciones de base de datos, se implementa una actualización en dos fases:
1.  **Fase de Limpieza**: Se asignan órdenes negativos temporales a los IDs recibidos.
2.  **Fase de Aplicación**: Se asignan los nuevos órdenes positivos (1, 2, 3...) según la posición en la lista.

## 2. Interfaz de Usuario (Frontend)

### 2.1 Lista Jerárquica (Drag & Drop)
- **Componente**: `OrganizationalLevelListComponent`.
- **Interacción**: Arrastre de filas mediante un **Floating Handle** centrado (`w-10 h-10 rounded-xl`).
- **Directiva**: Uso obligatorio de `pReorderableRowHandle` para asegurar una respuesta inmediata al arrastre.
- **Estado**: Se utiliza un arreglo mutable `displayItems` actualizado mediante un `effect` de Angular. Este arreglo es una copia del estado original (`[...filtered]`), permitiendo que PrimeNG manipule el orden en el DOM sin interferir con las señales inmutables de Angular hasta el guardado final.
- **Feedback**: Tooltips obligatorios (`[pTooltip]`) en el campo descripción para manejar textos truncados.

### 2.2 Formulario Simplificado
- **Componente**: `OrganizationalLevelFormComponent`.
- **Simplificación**: El campo `hierarchyOrder` **no es editable** por el usuario en el formulario. Se asigna automáticamente al final de la lista en la creación (`MAX(order) + 1`).
- **Campos**: Nombre, Descripción, Estado Activo.

## 3. Estándares Visuales
- **Icono Representativo**: `sitemap`.
- **Badges de Orden**: Círculos numerados con fondo `bg-slate-100` y borde definido.
- **Micro-interacciones**: Hover con cambio de color en el drag-handle para indicar que el elemento es movible.
