---
description: Documentación completa de la implementación del módulo de Gestión de Tipos de Compensación (Bonos/Deducciones), incluyendo reglas de cumplimiento legal y RR.HH.
---

# Gestión de Tipos de Compensación (Nómina)

Este módulo administra el catálogo maestro de conceptos de nómina (ingresos y deducciones). Define no solo las reglas de cálculo financiero, sino también las reglas de **Cumplimiento Legal y RR.HH.** necesarias para la correcta liquidación de Seguridad Social, Parafiscales y Reportes a Entes de Control (UGPP/DIAN).

## 🏗️ Arquitectura del Backend

### 1. Modelo de Datos (`business_rrhh`)

El módulo permite una separación clara de responsabilidades: RR.HH. define las reglas de afectación y Financiera (posteriormente) definirá las cuentas contables.

#### 1.1 Entidad Principal: `CompensationType`
- **Tabla**: `business_rrhh.compensation_types` (Esquema aislado)
- **Atributos Clave**:
    - `category`: `EARNING` (Ingreso) o `DEDUCTION` (Deducción).
    - `isVariable`: Define si es monto fijo o porcentaje.
    - **Flags de Cumplimiento (RR.HH.)**:
        - `isSalary`: ¿Constituye salario base?
        - `isTaxable`: ¿Es base para Retención en la Fuente?
        - `affectsSocialSecurity`: ¿Suma para Salud y Pensión?
        - `affectsParafiscals`: ¿Suma para Caja, SENA, ICBF?
        - `affectsBenefits`: ¿Suma para Prima, Cesantías, Vacaciones?
        - `affectsArl`: ¿Suma para Riesgos Laborales?
    - **Reportes**:
        - `externalCode`: Código homologado para Nómina Electrónica / UGPP.

#### 1.2 Scripts de Migración
- **V108**: Creación inicial de tablas.
- **V109**: Adición de columnas de afectación (`affects_social_security`, etc.) y banderas legales.

### 2. Capa de Servicio
- **Tenant Isolation**: Filtrado automático por `company_id`.
- **Reglas de Negocio y Validación de Datos**:
    - **Saneamiento (Scrubbing)**: El sistema limpia automáticamente los campos contradictorios (`fixedAmount` vs `percentage/calculationBase`) dependiendo de si el concepto es variable o fijo.
    - **Validación Estricta (Efectuada en Backend)**: Mensajes de error en español que aseguran que un concepto variable tenga Base y Porcentaje, y un concepto fijo tenga Monto.
    - **Inicialización segura**: Flags booleanos en `onCreate` (default `false`).

## 🎨 Interfaz de Usuario (Frontend)

### 1. Formulario de Configuración (`CompensationTypeFormComponent`)

El formulario se ha estructurado para guiar al usuario de RR.HH. a través de secciones lógicas:

1.  **Información General**: Nombre, Código, Categoría.
2.  **Cálculo y Valores**: Definición de montos fijos vs. porcentajes y periodicidad.
3.  **Cumplimiento Legal y Reportes (Nuevo)**:
    - **Código de Reporte Externo**: Input con icono de escudo (`shield`) para entes gubernamentales.
    - **Herencia de Moneda**: Selección del Centro de Costos activa la herencia automática del `currencyId` y actualiza la simbología del formulario en tiempo real. El label de moneda por defecto es `---` hasta que se asigne un centro.
    - **Validación de Formularios Reactivos**: El estado de "Variable" altera los validadores del formulario (`Validators.required`) dinámicamente.
    - **Selectores de Búsqueda Avanzada**: Uso de `p-select` con `[filter]="true"` para búsqueda rápida y `[showClear]="false"` para evitar borrado accidental.
    - **Grid de Afectaciones**: Panel visual con switches para cada base (Salud, Pensión, ARL, Parafiscales).

### 2. Consideraciones de UX
- **Iconografía Semántica**:
    - `trending-up` (Verde) para Ingresos.
    - `trending-down` (Rojo) para Deducciones.
    - `shield` para cumplimiento legal.
- **Feedback Visual**: Badges de colores para estados Activo/Inactivo y Categoría.

## 🌍 Estrategia de Internacionalización (SaaS Ready)

Para permitir que el módulo sea exportable a otros países sin cambios en el código (Abstracción de Reglas de Negocio), se aplican los siguientes principios:

### 1. Abstracción de Terminología
En lugar de usar términos locales (como "Ley 1393"), el sistema utiliza etiquetas genéricas que se adaptan dinámicamente:
- **Código de Reporte Externo**: Identificador universal para entes reguladores (UGPP, PILA, Nómina Electrónica, Payroll Tax IDs).

### 2. Capa de Localización (Frontend)
El formulario utiliza **Signals** (`externalCodeLabel`) para renderizar los nombres de los campos. Esto permite que, en el futuro, una configuración por Jurisdicción/País cambie las etiquetas sin tocar la lógica de negocio ni la base de datos.

## 🛠️ Estándares Técnicos Aplicados

### 1. Esquema de Base de Datos
**Crítico**: Las tablas deben usar explícitamente `schema = "business_rrhh"`.
```java
@Table(name = "compensation_types", schema = "business_rrhh", ...)
```

### 2. Interpolación en Angular
Se corrigió conflicto de sintaxis JS/Angular para moneda: `Fijo $ {{ item.amount }}`.

### 3. Mapeo de Iconos (PrimeIcons)
- `dollar-sign` -> `currency-dollar`
- `file-text` -> `document`

## 🚀 Próximos Pasos
- **Motor de Cálculo**: Implementar la lógica que lea estos flags (`affects_...`) para calcular las bases de cotización reales en la liquidación de nómina.
- **Reportes**: Usar el `externalCode` para generar el XML de Nómina Electrónica.
