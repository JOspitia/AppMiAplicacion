---
description: Estándares técnicos de formularios y componentes PrimeNG
---

# Estandarización de Componentes y Formularios

## 1. Arquitectura de Clases Globales

Se creó una capa de estandarización en `src/styles.css` usando Tailwind CSS `@layer components` para aplicar el principio **DRY (Don't Repeat Yourself)**.

**Ubicación**: `frontend-app/src/styles.css`

```css
@layer components {
  /* ========================================
     HUMAN-CENTRIC FORM STANDARDIZATION
     Ensures visual consistency across all inputs
     ======================================== */
  
  /* Master Input Class - Applies to all text inputs */
  .p-inputtext {
    @apply h-11 text-sm rounded-2xl border-slate-200 dark:border-white/10 !important;
    @apply bg-white dark:bg-white/5 !important;
    @apply font-bold transition-all !important;
    @apply focus:border-primary focus:ring-4 focus:ring-[var(--primary-ring)] !important;
  }

  /* Force Dropdowns to full width and standard height */
  .p-select, .p-dropdown {
    @apply w-full !important;
  }

  .p-select .p-select-label,
  .p-dropdown .p-dropdown-label {
    @apply h-11 flex items-center text-sm font-bold !important;
  }

  /* Calendar/DatePicker Standardization */
  .p-datepicker, .p-calendar {
    @apply w-full !important;
  }

  .p-datepicker input,
  .p-calendar input {
    @apply h-11 text-sm font-bold rounded-2xl !important;
  }
}
```

## 2. Estándares Físicos Definidos

| Propiedad        | Valor Estandarizado | Justificación                                              |
|------------------|---------------------|------------------------------------------------------------|
| **Altura**       | `h-11` (44px)       | Cumple con estándares de accesibilidad táctil (min. 44px)  |
| **Ancho**        | `w-full` (100%)     | Ocupa el 100% del contenedor padre (Grid/Flex)             |
| **Border Radius**| `rounded-2xl`       | Consistencia visual premium con el Design System           |
| **Font Size**    | `text-sm` (14px)    | Tamaño legible sin sacrificar densidad de información      |
| **Font Weight**  | `font-bold`         | Mayor jerarquía visual y legibilidad                       |
| **Border Color** | `border-slate-200`  | Sutil en modo claro, resalta en dark mode                  |

## 3. Componentes Estandarizados

✅ **Input Text** (`pInputText`)  
✅ **Dropdown/Select** (`p-select`, `p-dropdown`)  
✅ **DatePicker/Calendar** (`p-datepicker`, `p-calendar`)  
✅ **Password** (`p-password`)  
✅ **InputNumber** (`p-inputnumber`)  
✅ **Textarea** (`p-inputtextarea`)  
✅ **Buttons** (`p-button`)  
✅ **Dialogs** (`p-dialog`)
✅ **Tables/Paginators** (`p-datatable`, `p-paginator`)

## 4. Inputs Especiales (Iconos y Padding)

Para inputs numéricos (`p-inputNumber`) que requieren un icono interno (ej: Moneda), se debe usar una clase CSS específica para garantizar el padding correcto, ya que los estilos en línea a veces son sobrescritos.

**Implementación Correcta:**

1.  Definir la clase en el componente:
    ```typescript
    styles: [`
        :host ::ng-deep .icon-padding-left {
            padding-left: 3.5rem !important;
        }
    `]
    ```
2.  Aplicar la clase a `inputStyleClass`:
    ```html
    <p-inputNumber 
        styleClass="w-full"
        inputStyleClass="w-full ... icon-padding-left">
    </p-inputNumber>
    ```
