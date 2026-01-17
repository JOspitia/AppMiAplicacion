---
description: Documentación completa de la implementación del módulo de Gestión de Tipos de Contrato.
---

# Gestión de Tipos de Contrato
Este flujo de trabajo describe la implementación del módulo de configuración de Tipos de Contrato, utilizado para estandarizar los acuerdos laborales.

## 1. Arquitectura de Datos (Backend)

### 1.1 Modelo `ContractType`
Entidad que define las plantillas de contratos disponibles.
- **Tabla**: `business_rrhh.contract_types`
- **Campos Principales**:
    - `id` (UUID): Identificador único.
    - `name` (String): Nombre descriptivo (ej: Indefinido).
    - `description` (String): Detalle del contrato.
    - `hasEndDate` (Boolean): Flag que indica si requiere fecha fin.
    - `defaultDuration` (Integer): Duración numérica por defecto.
    - `durationUnit` (Enum): Unidad de tiempo (`DAYS`, `MONTHS`, `YEARS`).
    - `active` (Boolean): Estado del registro.
- **Reglas de Negocio**:
    - El nombre debe ser único por empresa.
    - Si `hasEndDate` es `false`, la duración por defecto debe ignorarse.

## 2. Interfaz de Usuario (Frontend)

### 2.1 Lista de Tipos de Contrato (`contract-type-list.component`)
Implementa el estándar de diseño **Premium Glassmorphism** con listado optimizado.
- **Visualización (Patrón Columna Combinada)**:
    - **Tipo**: Columna combinada con icono `document` (en contenedor premium), nombre del tipo y descripción con tooltip (`tooltip-wide`).
    - **Duración**: Badge o texto que combina valor y unidad (ej: "12 Meses").
    - **Modo**: Badge informativo (Término Fijo vs Indefinido).
    - **Estado**: Badge de estado Activo/Inactivo.
- **Acciones**: Editar y Toggle Active.

### 2.2 Formulario (`contract-type-form.component`)
Diseño **Human-Centric** con secciones claras y feedback visual.
- **Inputs con Iconos**: Campo Nombre con icono `document` integrado.
- **Lógica Condicional**:
    - El toggle `hasEndDate` controla la visibilidad de los campos de duración.
    - Si se desactiva, muestra un mensaje de confirmación de "Contrato Indefinido".
- **Selectores**: `p-select` para la unidad de tiempo, `p-inputNumber` para la duración.

## 3. Integración
- **ContractTypeService**: Servicio Angular para comunicación con la API.
- **Endpoints**: `/api/rrhh/contract-types` (CRUD completo).

## 4. Workflows Relacionados
- Este módulo es dependencia directa para la creación de Contratos de Empleados (futura implementación), donde estos tipos alimentarán un dropdown de selección.
