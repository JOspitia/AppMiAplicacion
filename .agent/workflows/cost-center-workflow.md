---
description: Documentación de la implementación del módulo de Centros de Costos (Finanzas RR.HH.)
---

# Workflow: Gestión de Centros de Costos

El módulo de Centros de Costos permite la segmentación financiera de los gastos de nómina y operativos por unidad de negocio.

## 1. Integración Financiera (Backend)

### 1.1 Modelo
- **Entidad**: `CostCenter`.
- **Relaciones Clave**:
    - `Currency`: Moneda asociada para presupuestos.
    - `Company`: Aislamiento multi-tenant.
- **Validaciones**: El código del centro de costo (`code`) debe ser único por empresa.

### 1.2 Funcionalidades
- Gestión de presupuestos (`budget`).
- Umbral de auxilio de transporte (`transportAidThreshold`).
- Toggling de estado activo/inactivo controlado por permisos `RRHH_COST_CENTER_EDIT`.

## 2. Experiencia de Usuario (Frontend)

### 2.1 Visualización de Datos (Tabla Premium)
- **Standard de Visualización**: Uso del patrón de **Columna Combinada** (Nombre y Descripción) para optimizar el espacio.
- **Formateo**: Los valores monetarios deben mostrarse con el símbolo de la moneda asociada y formato decimal estándar.
- **Indicadores de Estado**: Uso de badges circulares de estado (Emerald/Rose) con punto indicador.
- **Iconografía**: Uso obligatorio del icono `calculator` o `building` en contenedor premium (`h-10 w-10rounded-xl`).

### 2.2 Formulario de Gestión
- **Validación en Tiempo Real**: El sistema debe validar que el código no esté duplicado antes de permitir el guardado.
- **Inputs Especializados**: Uso de `p-inputNumber` para presupuestos y parámetros financieros, asegurando el cumplimiento del estándar de padding para iconos.

## 3. Estándares de Diseño
- **Icono Representativo**: `calculator` o `chart-pie`.
- **Consistency**: Sigue el patrón de "Glassmorphism" para contenedores y tarjetas de listado, manteniendo la coherencia con el resto de módulos de RR.HH.
