---
description: Componentes de Patrones UX/UI Avanzados (Wizards, Feedback, Filtros)
---

# Patrones UX/UI Avanzados y de Interacción

## 1. Sistema de Feedback y Alertas (UX)

Para garantizar una comunicación clara del estado del sistema al usuario, se definen tres niveles de feedback:

### 1.1 Toast Notifications (Flotantes)
- **Uso**: Notificaciones transitorias que no requieren acción del usuario. (Ej. "Guardado automático").
- **Componente**: `ToastComponent`.
- **Comportamiento**: Flotante y autodesvanecible.

### 1.2 Banners de Alerta (En Línea)
- **Uso**: Feedback directo tras una acción (Ej. "Éxito al guardar").
- **Componente**: `AlertComponent`.
- **Ubicación**: Zona superior del contenido principal.

### 1.3 Modales de Confirmación (Críticos)
- **Uso**: Acciones destructivas o cambios de estado (Toggle Status).
- **Componente**: `ConfirmDialogComponent`.
- **Regla**: Prohibido usar `window.alert()`.

## 2. Filtros de Lista (Status Toggle Switch)

Para mejorar la gestión de grandes volúmenes de datos y permitir la limpieza visual de las tablas, se ha estandarizado un patrón de filtrado por estado:

### 2.1 Diseño del Toggle de Estado
- **Componente**: `p-toggleSwitch` (PrimeNG v18+).
- **Ubicación**: Cabecera de la tabla (`pTemplate="caption"`), alineado a la derecha de la barra de búsqueda.
- **Micro-interacción**:
    - **Labels**: Etiquetas de texto en negrita y mayúsculas (`text-[10px] font-bold uppercase tracking-wider`).
    - **Color Dinámico**: La etiqueta seleccionada debe usar el color temático (Primario para Activos, Rojo/Rosa para Inactivos) mientras que la no seleccionada se atenúa (`text-slate-400`).
    - **Backdrop**: El grupo de control debe estar contenido en una cápsula con fondo sutil (`bg-slate-50 dark:bg-slate-800/50`) y borde definido.

### 2.2 Implementación Técnica (Signals)
- Se utiliza una señal `showInactive` para controlar el estado del switch.
- El filtrado se realiza mediante un `computed` de Angular en el frontend para una respuesta instantánea (Zero-Latency Filtering), evitando peticiones innecesarias al servidor si la data ya está en memoria.

```typescript
// Patrón de filtrado reactivo
showInactive = signal<boolean>(false);
filteredItems = computed(() => {
    return this.items().filter(item => item.active === !this.showInactive());
});
```

## 3. Manejo de Textos Largos en Listados (Truncado Inteligente)

Para evitar que las filas de las tablas crezcan de forma desproporcionada y rompan la armonía visual cuando existen descripciones o campos de texto extensos, se define el siguiente estándar:

### 3.1 Reglas de Truncado
- **Descripciones**: Máximo de **2 líneas** usando la clase `line-clamp-2` de Tailwind CSS.
- **Campos Técnicos (Emails, Direcciones, NIT)**: Máximo de **1 línea** usando `truncate` y limitando el ancho máximo del contenedor (ej: `max-w-[200px]`).
- **Comportamiento**: Ambos deben ir acompañados de la directiva `overflow-hidden`.

### 3.2 Tooltips de Continuidad
- **Obligatoriedad**: Siempre que se trunque un texto, se debe añadir la directiva `[pTooltip]` de PrimeNG para permitir la lectura completa.
- **Configuración Premium**:
    - `tooltipPosition="bottom"` o `"top"` según el contexto.
    - `[showDelay]="500"` (Previene el ruido visual al mover el cursor rápidamente).
    - El tooltip debe contener el texto original completo.

```html
<!-- Ejemplo de Implementación Estándar -->
<span class="text-[11px] font-medium text-slate-500 line-clamp-2 overflow-hidden" 
      [pTooltip]="item.description" 
      tooltipPosition="bottom"
      [showDelay]="500">
    {{ item.description }}
</span>
```

## 4. Componentes de Mago (Steppers/Wizards)

Para flujos complejos de creación (ej: Nuevo Usuario, Nueva Empresa), se ha estandarizado el uso de un **Wizard Visual** en lugar de formularios monolíticos largos.

### 4.1 Estructura Visual
- **Barra de Progreso**: Indicador lineal superior que muestra el avance porcentual.
- **Indicadores de Paso**: Nodos visuales que muestran el número de paso o un check (`pi-check`) si ya fue completado.
- **Transiciones**: Animaciones suaves entre pasos (`animate-fade-in`).
- **Navegación**: Botones "Atrás" (Secundario) y "Siguiente/Finalizar" (Primario) en la parte inferior.

### 4.2 Comportamiento
- **Validación por Paso**: No permite avanzar si el `FormGroup` parcial del paso actual es inválido.
- **Persistencia de Datos**: Los datos se mantienen en memoria hasta el guardado final.
- **Feedback de Carga**: El botón final muestra un spinner y se deshabilita durante el envío.

```html
<!-- Ejemplo de Indicador de Progreso -->
<div class="h-full transition-all duration-700 ease-out shadow-lg bg-primary" 
     [style.width]="(currentStep() / totalSteps * 100) + '%'"></div>
```

## 5. Selector de Empresa (Multi-Tenant Context)

Para aplicaciones SaaS multi-tenant, el contexto de la empresa seleccionada es crítico. Se ha implementado un selector estandarizado en la barra de navegación superior (Topbar).

### 5.1 Características
- **Ubicación Global**: Siempre visible en el Topbar, asegurando que el usuario sepa en qué contexto opera.
- **Estilo**: `p-select` con fondo transparente y borde sutil para integrarse en la barra de navegación sin competir visualmente.
- **Comportamiento**:
    - Al cambiar de empresa, se dispara una recarga completa (`window.location.reload()`) o una resincronización reactiva profunda para asegurar que todos los datos (Permisos, Logos, Colores) se actualicen y no queden residuos del tenant anterior.
    - Se actualiza el `brandingService` inmediatamente para reflejar el logo y color primario de la nueva empresa.

### 5.2 Estilo Personalizado
```css
.header-company-select .p-select {
    background: transparent !important;
    border: 1px solid rgba(226, 232, 240, 0.8) !important;
    /* ... ver styles.css para implementación completa ... */
}
```

## 6. Reordenamiento Jerárquico (Drag & Drop)

Para módulos que requieren una estructura de precedencia o jerarquía (ej: Niveles Organizacionales, Categorías), se utiliza el patrón de arrastre para eliminar la carga cognitiva de asignar números secuenciales manualmente.

### 6.1 Interfaz de Usuario (Frontend)
- **Componente**: `p-table` con `pReorderableRow`.
- **Área de Agarre (Floating Drag Handle)**:
    - Se debe usar una columna específica a la izquierda (`w-20`).
    - **Diseño de Botón**: En lugar de ocupar toda la celda, el activador debe ser un contenedor redondeado (`w-10 h-10 rounded-xl`) centrado en la celda (`mx-auto`).
    - **Directiva**: Es obligatorio usar `pReorderableRowHandle` (CamelCase) en el elemento interno.
    - **Alineación**: La celda debe tener un padding izquierdo (`pl-6`) para separar el control del borde de la tabla y mantener consistencia vertical con `py-6`.
    - **Feedback**:
        - Cambio de fondo sutil (`hover:bg-slate-100`) y borde definido al hacer hover.
        - Animación de escala (`active:scale-95`) para feedback táctil durante el "agarre".
- **Actualización Optimista**: Al soltar la fila, el componente debe recalcular los números de orden visualmente de inmediato mientras se procesa la petición en el backend.

### 6.2 Estrategia de Consistencia (Backend)
Para evitar errores de "Duplicate Key" en bases de datos con restricciones únicas (`unique_order_per_company`), el servicio debe procesar el reordenamiento en dos fases dentro de una misma transacción:

1.  **Fase Temporal (Cleanup)**: Asignar valores negativos temporales (`-1, -2, ...`) a todos los registros involucrados. Realizar un `flush` a la base de datos.
2.  **Fase Final (Reorder)**: Asignar los valores positivos definitivos (`1, 2, ...`) basados en el nuevo orden recibido.

### 6.3 Ejemplo Técnico (Angular)
```typescript
onRowReorder(event: any) {
    const orderedIds = this.displayItems.map(item => item.id);
    
    // UI Optimista
    this.displayItems.forEach((item, index) => item.hierarchyOrder = index + 1);

    this.service.reorder(orderedIds).subscribe({
        error: () => this.loadItems() // Revertir en caso de error
    });
}
```

