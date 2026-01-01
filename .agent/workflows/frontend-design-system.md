---
description: Estándar de diseño Human-Centric para la interfaz de RR.HH.
---

# Human-Centric Design System (HR Tech)

Este documento define la identidad visual para software de RR.HH., equilibrando la autoridad empresarial con la accesibilidad humana. **La unificación de colores es crítica para transmitir profesionalismo.**

## 1. Definición de la Paleta de Colores Dinámica

Para cualquier implementación, utiliza EXCLUSIVAMENTE estos tokens de color. El sistema es dinámico y se basa en la empresa seleccionada.

```css
:root {
    /* 1. EL COLOR DE MARCA (Dinámico via BrandingService) */
    --primary: #4f46e5;            /* Color base (Hex) */
    --primary-rgb: 79, 70, 229;    /* Color base (RGB para opacidad) */
    --primary-dark: #4338ca;       /* Sombra (15% más oscuro) */
    --primary-light: #6366f1;      /* Resalte (20% más claro) */
    
    /* 2. EL COLOR DE ACCIÓN/CRECIMIENTO (Éxito) */
    --success-color: #10b981;      /* Emerald 500 */
    
    /* 3. SEMÁNTICA DE ESTADOS */
    --warning-color: #f59e0b;      /* Amber 500 */
    --danger-color: #ef4444;       /* Red 500 */
    --info-color: #0ea5e9;         /* Sky 500 */

    /* 4. SUPERFICIES Y FONDOS (Human-Centric) */
    --bg-light: #f8fafc;           /* Fondo de la app (Slate 50) */
    --bg-card: #ffffff;            /* Tarjetas */
    --text-main: #1e293b;          /* Texto principal (Slate 800) */
    --text-muted: #64748b;         /* Texto secundario (Slate 500) */
    --border-main: #f1f5f9;        /* Bordes sutiles */
}

/* Modo Oscuro - Midnight Blue */
.dark {
    --bg-light: #0b1120;           /* Midnight Blue (Slate 950) */
    --bg-card: #1e293b;            /* Dark Card (Slate 800) */
    --text-main: #f8fafc;          /* Off White (Slate 50) */
    --text-muted: #94a3b8;         /* Slate 400 */
    --border-main: rgba(255, 255, 255, 0.05);
}
```

## 2. Branding Dinámico (Empresa)

El sistema soporta el cambio de identidad visual en tiempo real basado en la empresa del usuario:

- **Mecánica**: El `BrandingService` intercepta la selección de empresa e inyecta las variables CSS directamente en `:root`.
- **Primary RGB**: Es VITAL usar `--primary-rgb` para efectos de resplandor (glow) y estados de selección.
- **Uso en Glows**: Para evitar la saturación visual, los resplandores deben usar opacidades bajas:
    - Fondos ornamentales: `rgba(var(--primary-rgb), 0.05)`.
    - Sombras de tarjetas: `0 25px 50px -12px rgba(var(--primary-rgb), 0.25)`.
    - Highlights de selección: `rgba(var(--primary-rgb), 0.1)`.


## 2. Reglas de Unificación Visual

1.  **Consistencia de Marca**: Todos los botones de acción principal (`CTA`) y las **tarjetas de módulos funcionales** deben usar `--primary-color`. Solo usa `--success-color` para confirmaciones o indicadores de "Buen Estado". Esto asegura una interfaz coherente y profesional.
2.  **Gradients Controlados**: Si usas gradientes, deben ser sutiles. Recomendado: `from-primary to-indigo-400` o `from-primary to-info`. **Evita mezclar colores cálidos con fríos en el mismo componente.**
3.  **Menos es Más (Whitespace)**: En RR.HH. hay muchas tablas. No uses bordes negros. Usa `--border-main` y mucho padding.
4.  **Iconografía**: Usa iconografía consistente (mismo grosor y estilo). Preferiblemente **Lucide Icons** o **PrimeIcons** si se usan correctamente.
5.  **Prioridad Tailwind/PrimeNG (Regla de CTA Críticos)**: Debido a que el "reset" de Tailwind puede tener prioridad sobre el tema base de PrimeNG en ciertas condiciones de capas CSS (especialmente en modo luz), **para botones CTA críticos (como Atención Personalizada)** es obligatorio usar clases de Tailwind directas (`bg-primary text-white`) junto con los atributos de PrimeNG. Esto garantiza la visibilidad total en cualquier tema.

## 4. Patrones de Componentes Críticos
 
- **Modo Oscuro**: Sincronización obligatoria entre sistema (OS) y preferencia guardada en `localStorage`. Aplicación inmediata vía clase `.dark`.
- **Formularios Multi-Sección (Registro)**:
    - Uso de identificadores numéricos visuales para pasos.
    - Agrupación lógica de campos para reducir carga cognitiva.
    - Validaciones en tiempo real con componentes específicos (ej. Medidor de fuerza de Password).
- **Layout de Cristal (Glassmorphism)**:
    - Uso de `backdrop-blur-xl` en Header y Sidebar.
    - Bordes translúcidos (`border-white/10` o `border-slate-800/10`) para separar áreas sin lineas duras.
    - Fondos con transparencia controlada (`bg-white/80` o `bg-slate-900/80`).
- **Componentes Globales (Cookie Consent)**:
    - Uso de `backdrop-blur` (Glassmorphism) para integrarse sin interrumpir.
    - Persistencia en `localStorage` para evitar recurrencia intrusiva.
    - Ubicación estratégica (esquina inferior) con animaciones de entrada controladas.

## 5. ¿Por qué la Unificación es Vital?

- **Reduce la Carga Cognitiva**: El usuario asocia un color y una posición (ej. Botón Volver siempre a la izquierda) a una acción específica sin pensarlo.
- **Transmite Control**: Una paleta dispar se percibe como software "en construcción". Una paleta unificada se percibe como un producto terminado y profesional.
- **Seguridad visual**: El balance de tonos Slate y el uso de capas CSS (`tailwind-base, primeng, tailwind-utilities`) evitan conflictos visuales y aseguran una interfaz fluida.
