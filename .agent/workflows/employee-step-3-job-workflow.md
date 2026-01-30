---
description: Documentación completa de la implementación del módulo de Gestión de Datos Corporativos (Step 3).
---

# Workflow: Employee Creation Wizard - Step 3 (Job & Corporate Data)

Este documento detalla la implementación del **Paso 3** del asistente de creación de empleados, enfocado en la **Estructura Organizacional** y **Datos Corporativos**.

## 1. Descripción General
El Paso 3 permite definir la ubicación funcional del empleado dentro de la organización, así como los detalles de compensación y cuentas corporativas. Este paso es crítico para la nómina y la seguridad.

### Características Principales:
- **Estructura Organizacional en Cascada**: Selección jerárquica de `Centro de Costos` -> `Departamento` -> `Posición` / `Ubicación`.
- **Moneda Inteligente**: Selección automática basada en el catálogo del Centro de Costos, con formato `(COP) - Peso Colombiano`.
- **Botón Mágico de Email**: Generación inteligente de correo corporativo (ej: `jospitia@empresa.com`) con detección de colisiones en el backend.
- **Detección de Auxilio de Transporte**: Activación automática si el salario es inferior al tope del Centro de Costos, con alerta de excepción (Amber).
- **Historial Laboral**: Los datos se almacenan en `employee_job_history` para mantener un registro histórico de cambios.

## 2. Estructura de Datos (Backend)

### DTO: `EmployeeJobStepDto`
Objeto de transferencia de datos para el frontend.
```java
public class EmployeeJobStepDto {
    private UUID employeeId;
    private String firstName;
    private String lastName;
    private String companyDomain;
    // Organizational Structure
    private UUID costCenterId;
    private UUID departmentId;
    private UUID locationId;
    private UUID operationalCenterId;
    private UUID positionId;
    private UUID managerId;
    // Compensation
    private BigDecimal salary;
    private String currencyCode;
    private Boolean transportAid;
    // Corporate Account
    private String email;
}
```

### Entidad: `EmployeeJobHistory`
Tabla principal donde se persiste la información (`business_rrhh.employee_job_history`).
- **Relaciones**: `Employee`, `Position`, `Department`, `CostCenter`, `Location`, `OperationalCenter`, `Supervisor`.
- **Campos Clave**: `salary`, `currency`, `startDate`, `endDate`, `active`.

## 3. Implementación Frontend (Angular)

### Componente: `EmployeeJobFormComponent`
- **Selector**: `app-employee-job-form`
- **Ruta**: `src/app/rrhh/employees/wizard/steps/step3-job.component.ts`

### Lógica de Negocio (Cascadas)
1. **Centro de Costos** (`costCenterId`):
   - Al cambiar, filtra la lista de **Departamentos**.
   - **Moneda**: Cambia automáticamente la moneda de pago y el tope de auxilio legal basado en la configuración del C.C.
   - Reinicia: Departamento, Cargo, Ubicación, Centro Operacional.

2. **Departamento** (`departmentId`):
   - Al cambiar, filtra la lista de **Cargos** (Positions) y **Sedes** (Locations).
   - Reinicia: Cargo, Ubicación.

3. **Sede** (`locationId`):
   - Al cambiar, filtra la lista de **Centros Operacionales**.

### Lógica Especial
- **Generación de Email**: Utiliza un botón con icono `sparkles` que invoca al backend para sugerir un correo único, priorizando formatos cortos (`flastname`) y manejando duplicados (`flastname1`).
- **Validación de Transporte**: 
    - **Auto-check**: Se activa si `salary <= costCenter.transportAidThreshold`.
    - **Amber Alert**: Si se activa manualmente con un salario superior al tope, se muestra un aviso de excepción: *"El salario ingresado supera el tope de auxilio para este C.C."*.

### Validaciones
- **Campos Requeridos**: Centro de Costos, Departamento, Cargo, Salario, Moneda, Email. Se marcan con borde rojo sin mensajes individuales.
- **Mensaje Global**: *"Por favor completa todos los campos obligatorios resaltados en rojo."*
- **Salario**: Debe ser mayor a 0.

## 4. Endpoints API

### `GET /api/rrhh/employees/{id}/job`
Recupera los datos corporativos y metadatos del empleado (nombres, dominio permitido).

### `GET /api/rrhh/employees/{id}/suggest-email`
Genera una sugerencia de correo corporativo único basada en algoritmos de limpieza y disponibilidad.

### `POST /api/rrhh/employees/{id}/step3`
Guarda o actualiza los datos del paso 3.
- Si existe un registro activo en `employee_job_history`, lo actualiza.
- Si no existe, crea uno nuevo.
- Actualiza el `email_corporate` en la tabla `employees`.

## 5. Referencias de Estilo (UI)
- **Navegación**: Botones `REGRESAR` (Ghost) y `GUARDAR Y CONTINUAR` (Primary) con diseño `rounded-3xl` y tipografía premium.
- **Input Spacing**: Iconos alineados a la izquierda (`pi-calculator`, `pi-building`, `pi-at`, etc.).
- **Currency Tooltip**: Formato estandarizado `(CODE) - Name`.
