---
description: Documentación específica del sistema de Formularios y Listados de Empresas (UX/UI y Lógica).
---

# Company Form System Documentation

Este documento se centra específicamente en la interacción y estructura del sistema de formularios y listados dentro del módulo de empresas. Sirve como guía de referencia para la lógica de interfaz de usuario de este dominio.

## 1. Visión General del Flujo

El sistema de gestión de empresas sigue un patrón **List-Detailed-Action**:
1.  **List View (Directorio)**: Vista de alto nivel con filtros rápidos y acciones inmediatas (Estado).
2.  **Form View (Gestión)**: Vista detallada para ingreso de datos complejos.
3.  **Action Feedback**: Ciclo de confirmación y feedback visual para cada operación crítica.

## 2. Componente de Listado (`CompanyListComponent`)

### Estructura de la Tabla
La tabla utiliza PrimeNG pero con una capa de personalización CSS intensiva para cumplir con el estándar "Human-Centric":

| Elemento | Especificación UX | Implementación Técnica |
| :--- | :--- | :--- |
| **Buscador** | Input con icono interno, padding amplio, sin bordes duros. | Clases CSS `pl-12`, `rounded-xl`, `border-slate-200`. Icono posicionado absolutamente. |
| **Fila de Datos** | Hover suave, fondo alterno sutil, bordes inferiores solamente. | `hover:bg-slate-50`, `border-b`, `last:border-none`. |
| **Columna Estado** | Badge visual que indica estado (Activo/Inactivo). | `bg-emerald-500/10` (Activo) vs `bg-red-500/10` (Inactivo). |
| **Acciones** | Botones circulares "Ghost" con tooltips. | `p-button-rounded`, `p-button-text`. Botón de estado cambia icono/color dinámicamente. |

### Lógica de Cambio de Estado (El "Toggle")
El botón de estado no dispara la acción inmediatamente.
1.  **Trigger**: Usuario hace clic en el botón (Icono Power/Ban).
2.  **Intercepción**: Se abre `ConfirmDialogComponent` con un mensaje contextual ("¿Deseas reactivar...?" o "¿Estás seguro de desactivar...?").
3.  **Confirmación**: Si el usuario acepta, se llama al servicio.
4.  **Feedback**: Se muestra `AlertComponent` en la parte superior de la lista confirmando el éxito.

## 3. Componente de Formulario (`CompanyFormComponent`)

### Layout "Glass Card"
El formulario no es plano; flota sobre el fondo de la aplicación.
- **Contenedor**: `bg-white/80` (Light) o `bg-[#0F172A]/90` (Dark).
- **Efecto**: `backdrop-blur-xl`, `shadow-2xl`.

### Campos y Validacion
Todos los campos son obligatorios y tienen feedback visual inmediato.
- **NIT**: Campo clave, se resalta visualmente.
- **Email Extension**: Input con prefijo visual ("@").
- **Fechas**: Selectores de fecha para suscripciones.

### Lógica de Navegación
- **Volver**: Botón "Atrás" siempre visible en la cabecera.
- **Cancelar**: Botón secundario al final del formulario que redirige a la lista.
- **Success**: Al guardar exitosamente, se muestra un mensaje breve y se redirige automáticamente (`Router.navigate`) a la lista.

## 4. Componentes Compartidos Utilizados

Este subsistema hace uso intensivo de la librería de componentes compartidos (`shared/components`):

- **`AppIcon`**: Abstracción de iconos (Feather/PrimeIcons) para consistencia.
- **`AlertComponent`**: Para feedback de estado (banners).
- **`ConfirmDialogComponent`**: Para decisiones críticas (modales).

## 5. Reglas de Estilo CSS (Tailwind)

Para mantener la consistencia en el futuro, referirse a estas clases utilitarias clave usadas en este módulo:

```css
/* Contenedores Principales */
.glass-panel {
    @apply bg-white/80 dark:bg-[#0F172A]/90 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-2xl;
}

/* Inputs de Texto */
.input-premium {
    @apply w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 transition-all;
}

/* Badges de Estado */
.badge-active {
    @apply bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400;
}
.badge-inactive {
    @apply bg-red-500/10 text-red-600 border border-red-500/20 dark:text-red-400;
}
```
