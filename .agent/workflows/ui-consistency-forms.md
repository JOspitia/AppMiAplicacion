---
description: Estándares técnicos de formularios y componentes PrimeNG para el sistema core.
---

# Estándares de Formularios (UI Consistency)

Este documento define la estructura y el estilo obligatorio para todos los formularios del sistema, asegurando una experiencia **Human-Centric** y premium.

## 1. Campos de Entrada (Inputs)

### 1.1 Inputs con Iconos
Todos los campos de identidad (Código, Nombre, Usuario, Email) deben integrar sus iconos dentro del campo:
- **Estructura**: `relative group` con `app-icon` posicionado con `absolute left-4 top-1/2 -translate-y-1/2`.
- **Spacing**: El input debe tener `style="padding-left: 3.5rem !important;"`.
- **Interactividad**: Uso de `group-focus-within:text-primary` para animar el color del icono.

### 1.2 Selectores (Dropdowns)
Se utiliza el componente `p-select` (PrimeNG v21+):
- **Autocomplete**: Atributo `[filter]="true"` y `filterBy="name"` siempre habilitado.
- **Overlay**: `appendTo="body"` para evitar problemas de posicionamiento y scroll.
- **Limpieza**: `[showClear]="true"` para campos opcionales.

### 1.3 Textareas
Utilizados para descripciones:
- **Clases**: `w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl resize-none`.
- **Filas**: Mínimo 3 o 4 filas según el contexto.

## 2. Patrones de Selección Avanzada

### 2.1 Asignación Múltiple (Sedes, Roles, Permisos)
Cuando se requiere asignar múltiples elementos, se sigue el patrón de **Chips Externos**:
1.  **Área de Visualización**: Un contenedor superior que muestra `chips` personalizados de los elementos ya seleccionados.
2.  **Selector**: Un `p-multiSelect` que muestra solo un resumen (ej: "3 elementos asignados") cuando está cerrado.
3.  **Gestión**: El usuario puede eliminar elementos directamente desde los chips superiores o deseleccionarlos en el dropdown.

## 3. Botones y Confirmación
- **Ubicación**: Alineados a la derecha al final del formulario.
- **Estilo**: Botón primario con `shadow-lg shadow-primary/30` y efecto de escala al pulsar.
- **Estado**: Deben mostrar un spinner de carga y deshabilitarse durante el procesamiento (`[loading]="loading()"`).

## 4. Estándares de Listados (Visual Hierarchy)
Para optimizar el espacio y mejorar la lectura, todos los listados principales deben seguir el patrón de **Columna Combinada**:

### 4.1 Columna "Nombre y Descripción"
- **Estructura**: Un `flexbox` con alineación superior (`items-start`).
- **Icono**: El icono representativo del módulo dentro de un contenedor `h-10 w-10rounded-xl bg-primary/10 transition-transform group-hover:scale-110`.
- **Información**: 
    - **Nombre**: Texto principal en `text-sm font-bold`.
    - **Metadatos**: Seguido (opcionalmente) por badges o textos pequeños (ej: Nivel Organizacional).
    - **Descripción**: Una línea truncada (`line-clamp-1`) en `text-xs text-slate-500` con `[pTooltip]` accesible (Estándar: 14px, font-medium, `tooltip-wide`).

### 4.2 Columna "Código"
- **Estilo**: El código debe visualizarse como un badge sutil: `text-xs font-black px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600`. No debe ser el foco de atención, sino una referencia rápida.

## 5. Estructura de Secciones
Utilizar indicadores visuales de sección para agrupar campos relacionados:
- Una barra vertical de color primario (`w-1.5 h-6 bg-primary rounded-full`).
- Título en `text-xl font-black`.
