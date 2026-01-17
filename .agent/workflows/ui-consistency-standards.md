---
description: Estándares de Consistencia Visual (Human-Centric Design)
---

# Estándares de Consistencia Visual (Human-Centric Design)

Este documento sirve como índice maestro para la estandarización de interfaz de usuario. Debido a la profundidad de los estándares, se han dividido en documentos especializados.

## 📁 Documentación Detallada

### 1. [Estándares de Formularios](./ui-consistency-forms.md)
Detalla la estandarización física de inputs, alturas, bordes y clases globales de CSS para garantizar que todos los formularios se vean uniformes.

### 2. [Patrones UX/UI Avanzados](./ui-consistency-ux-patterns.md)
Cubre patrones complejos de interacción como:
- **Wizards / Steppers** (Formularios por pasos)
- **Feedback System** (Toasts, Alertas, Modales)
- **Filtros Reactivos** (Switch de Estado)
- **Truncado de Texto**
- **Selector de Empresa**

---

## 3. Estandarización de Tablas (Modo Oscuro)

Para garantizar que los listados se integren con el tema "Midnight":

- **Transparencia**: Las tablas deben tener fondo transparente.
- **Paginador**: Estilo `rounded-xl` con highlight sutil.
- **Encabezados**: `text-xs font-bold uppercase tracking-wider`.

```css
.dark .p-datatable {
  --p-datatable-header-background: transparent;
  --p-datatable-row-background: transparent;
  --p-paginator-background: transparent;
}
```

## 4. Responsividad Móvil (Mobile-First)

- **Grids Fluidos**: `grid-cols-1` por defecto.
- **Pestañas**: Menús horizontales se apilan verticalmente.
- **Acciones**: Botones escalables y de fácil acceso táctil.

## 5. Avatares e Iniciales

Para garantizar una representación consistente de usuarios y empresas:

- **Fondo**: Gradiente `bg-gradient-to-br from-primary to-primary-dark`.
- **Dimensiones**:
    - Listados: `h-12 w-12 rounded-2xl`
    - Navbar: `h-10 w-10 rounded-xl`

```html
<div class="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary-dark text-white flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
    AB
</div>
```

---

**Última Actualización**: 2026-01-16
**Estado**: ✅ Estandarizado y Dividido
