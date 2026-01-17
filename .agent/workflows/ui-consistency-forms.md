---
description: Estándares técnicos de formularios y componentes PrimeNG para el sistema core.
---

# Estándares de Formularios (UI Consistency)

Este documento define la estructura, el estilo y la jerarquía visual obligatoria para todos los formularios del sistema, asegurando una experiencia **Human-Centric** y premium.

## 1. Cabecera del Formulario (Hero Header)

Todos los formularios de creación o edición deben seguir esta estructura visual para mantener la orientación del usuario:

- **Breadcrumb Contextual**: Un `span` superior con `text-primary font-bold tracking-widest text-[10px] uppercase`.
- **Título Dinámico**: `h1` en `text-4xl font-black text-slate-900 dark:text-white`. La palabra clave (ej: Sede, Departamento) debe ir en un `span` con gradiente: `bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark`.
- **Botón de Retorno**: Ubicado a la derecha, diseño circular/cuadrado redondeado (`rounded-2xl`), fondo blanco/transparente con borde sutil, e icono `arrow-left`.
- **Descripción de Contexto**: Un párrafo corto (`text-sm text-slate-500`) que explique el propósito del formulario.

## 2. Contenedor de Formulario (Glass Container)

Para lograr el efecto de profundidad y modernidad:
- **Clases**: `bg-white/80 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl p-8 md:p-12`.
- **Transiciones**: Debe usar `transition-all duration-500` y animaciones de entrada `animate-fade-in`.

## 3. Estructura de Secciones

Agrupar campos relacionados para reducir la carga cognitiva:
- **Indicador**: Barra vertical de color primario (`w-1.5 h-6 bg-primary rounded-full`).
- **Título + Icono**: `h2` en `text-xl font-black` acompañado de un `app-icon` descriptivo en `text-slate-400`.
- **Espaciado**: Margen inferior generoso (`mb-8` a `mb-10`) entre secciones.

## 4. Campos de Entrada (Inputs)

### 4.1 Inputs con Iconos
Campos de identidad (Código, Nombre, Usuario, Email) deben integrar sus iconos:
- **Estructura**: `relative group` con `app-icon` posicionado `absolute left-4 top-1/2 -translate-y-1/2`.
- **Padding**: El input debe tener `style="padding-left: 3.5rem !important;"`.
- **Diseño**: `bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl`.

### 4.2 Selectores (p-select)
- **Configuración**: `[filter]="true"`, `filterBy="name"`, `appendTo="body"`.
- **Estilo**: Debe coincidir con el radio de borde y fondo de los inputs de texto.

### 4.3 Campo de Descripción (Premium Textarea)
- **Diseño**: `w-full p-4 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl text-sm resize-none`.
- **Label**: Usar siempre **"Descripción (Opcional)"** para mayor claridad.

### 4.4 Selectores de Tiempo (p-datepicker)
- **Modo**: `[timeOnly]="true" hourFormat="12"`.
- **Anclaje**: Siempre `appendTo="body"` para evitar saltos en el layout de grids o modales.
- **Estilo**: Fondo transparente con bordes nulos cuando se usa dentro de tablas.

### 4.5 Campos Numéricos (p-inputNumber)
- **Estilo**: Deben usar bordes redondeados `rounded-xl` y heredar el tema oscuro/claro de forma fluida.
- **Botones**: Los botones de incremento deben tener transiciones suaves para evitar parpadeos.

### 4.6 Grillas Complejas (Sub-filas)
Para formularios que requieren múltiples entradas por fila (ej: Jornada Partida):
- **Alineación de Cabecera**: El grid de la sub-fila debe coincidir exactamente con el `grid-cols` de los títulos superiores.
- **Consistencia Vertical**: Usar `items-stretch` en el contenedor grid y `h-full` en los divs de las celdas para asegurar que el fondo y los bordes cubran toda la altura de la fila, independientemente del contenido.
- **Micro-interacciones**: Los botones de acción (eliminar/editar) deben usar iconos estándar (`times` para borrar) con colores de alta visibilidad (`rose-500`) y feedback al hover.
- **Jerarquía**: Usar badges o números de índice (`#1`, `#2`) con posicionamiento absoluto para identificar elementos sin desplazar los inputs principales.

## 5. Patrones de Selección Avanzada

### 5.1 Asignación Múltiple (Chips Externos)
1.  **Área de Chips**: Contenedor superior con `flex-wrap gap-2` que muestra `chips` personalizados.
2.  **Selector**: `p-multiSelect` que actúa como disparador, mostrando solo un resumen (ej: "3 sedes asignadas").

## 6. Botones y Confirmación

- **Ubicación**: Alineados a la derecha en un bloque con `border-t border-slate-200 pt-8`.
- **Estilo Primario**: `px-10 py-3 bg-primary text-white rounded-2xl hover:scale-105 active:scale-95 transition-all font-bold shadow-lg shadow-primary/30`.
- **Estado de Carga**: Integrar `app-icon` con `pi-spin pi-spinner` cuando `loading()` sea verdadero.

## 7. Estabilidad Visual (Anti-Flash)

Para evitar el parpadeo blanco al cambiar entre temas claro/oscuro o al cargar datos:
- **Transiciones Globales**: Aplicar `transition-colors duration-300` en contenedores, celdas y labels.
- **Color de Texto**: Forzar `text-slate-800 dark:text-slate-100` en componentes de terceros (PrimeNG) para garantizar contraste inmediato.
- **Bordes Dinámicos**: Usar opacidades bajas en modo oscuro (`dark:border-white/10`) para un look más integrado (glassmorphism).
