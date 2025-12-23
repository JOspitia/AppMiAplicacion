---
description: Guía de integración y personalización de PrimeNG para el sistema de diseño Premium.
---

# Integración de PrimeNG (Premium Design System)

Este documento describe cómo se integra, configura y personaliza PrimeNG en el proyecto Angular para cumplir con los estándares de diseño "Premium/Human-Centric".

> **Nota**: Para detalles sobre la estandarización global de inputs y consistencia visual, consulta `/ui-consistency-standards`.


## 1. Configuración Global (`app.config.ts`)

Utilizamos el preset **Aura** como base, personalizando la paleta semántica para usar nuestros colores corporativos (Indigo).

```typescript
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      // ... mapeo completo a la paleta Tailwind Indigo
      950: '{indigo.950}'
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeNG({
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities'
          }
        }
      },
      ripple: true
    })
  ]
};
```

## 2. Personalización de Componentes (CSS Overrides)

Para lograr el efecto "Premium" y "Glassmorphism", no confiamos solo en el tema base. Usamos clases de utilidad en `styles.css` o en el bloque `styles` de los componentes.

### 2.1 Inputs (`.premium-input`)
```css
.premium-input {
    @apply w-full bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl p-5 text-sm font-bold transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none shadow-sm;
}
```

#### 2.1.1 Inputs Bloqueados / Readonly (`.premium-input-locked`)
Para campos que el usuario no puede editar (como emails o nombres de sistema).
```css
.premium-input-locked {
    @apply w-full bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-white/10 rounded-2xl p-5 text-sm font-bold transition-all outline-none shadow-sm opacity-70 cursor-not-allowed border-dashed;
}
```

### 2.2 Selects / Dropdowns (`.premium-dropdown`)
Personalizamos tanto el trigger como el panel desplegable. Nota: En PrimeNG v21, `p-dropdown` se renombró a `p-select`.
```css
.premium-dropdown .p-select {
    @apply w-full bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold transition-all shadow-sm;
}
.premium-dropdown .p-select-panel {
    @apply rounded-3xl border-slate-100 dark:border-white/10 shadow-2xl;
}
```

### 2.3 Dialogs / Modales (`.premium-dialog`)
Aplicamos Glassmorphism agresivo al contenedor del diálogo.
```css
.premium-dialog .p-dialog {
    @apply bg-white/90 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[4rem] border-white/20 dark:border-slate-800 shadow-2xl;
}
.premium-dialog .p-dialog-header {
    @apply bg-transparent p-10 pb-0 font-black;
}
```

### 2.4 DatePickers / Calendars (`.premium-calendar`)
Nota: En PrimeNG v21, `p-calendar` se renombró a `p-datepicker` y su módulo a `DatePickerModule`.
```css
.premium-calendar .p-datepicker {
    @apply w-full;
}
.premium-calendar .p-datepicker input {
    @apply premium-input;
}
.premium-calendar .p-datepicker-panel {
    @apply rounded-[2.5rem] border-slate-100 dark:border-white/10 shadow-2xl backdrop-blur-3xl bg-white/90 dark:bg-slate-900/90;
}
```

## 3. Uso en Componentes

Siempre importa los módulos necesarios en los `imports` de tu componente standalone:

```typescript
imports: [
    ButtonModule,
    InputTextModule,
    SelectModule, // Antes DropdownModule (v21)
    DatePickerModule, // Antes CalendarModule (v21)
    DialogModule,
    // ...
]
]
```

Y aplica las clases personalizadas usando `styleClass` o `class` según corresponda:

```html
<!-- Input -->
<input pInputText class="premium-input" ...>

<!-- Select (Dropdown) -->
<p-select styleClass="premium-dropdown" ...></p-select>

<!-- DatePicker (Calendar) -->
<p-datepicker styleClass="premium-calendar" ...></p-datepicker>

<!-- Dialog -->
<p-dialog styleClass="premium-dialog" ...></p-dialog>
```

## 4. Iconografía

Aunque PrimeNG incluye PrimeIcons, preferimos usar nuestro `IconComponent` para iconos SVG (Lucide/Heroicons) más modernos.

### 4.1 Workflow para Nuevos Iconos
Los iconos son dinámicos y se sirven desde la base de datos. Si necesitas un icono que no existe:
1.  Verifica la tabla `configuration.icons`.
2.  Si no existe, crea una migración Flyway (`sql/Vn__add_icons.sql`) con el `INSERT` correspondiente.
3.  Usa el nombre del icono en el atributo `icon` del componente.

## 5. Implementación de Referencia

El **ProfileComponent** (`frontend-app/src/app/core/management/users/profile/profile.ts`) es la implementación de referencia que demuestra:

✅ **Uso de clases globales**: Todos los inputs usan los estilos de `styles.css`  
✅ **Variantes locales mínimas**: Solo `.premium-input-locked` para campos readonly  
✅ **Dropdown personalizado**: Template con `ng-template` para formato `+57 - Colombia`  
✅ **Integración completa**: InputText, Select, DatePicker, Password, Dialog  
✅ **Responsive**: Grid adaptativo con `md:grid-cols-2`

**Extracción de código recomendada**:
```typescript
// ✅ Correcto: Usar solo w-full
<input pInputText class="w-full" />
<p-select class="w-full" styleClass="w-full" />
<p-datepicker class="w-full" styleClass="w-full" />

// ❌ Incorrecto: Agregar clases redundantes
<input pInputText class="premium-input w-full h-11 rounded-2xl ..." />
```

Para más detalles sobre la refactorización, consulta `/profile-feature-implementation`.

