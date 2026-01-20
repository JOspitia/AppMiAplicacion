---
description: Documentación completa de la implementación del módulo de Gestión de Cargos (Positions System).
---

# Gestión de Cargos (Positions)
Este flujo de trabajo describe la implementación del módulo de Gestión de Cargos, encargado de definir los puestos de trabajo con sus funciones, habilidades, requisitos y experiencia requerida.

## 1. Arquitectura de Datos (Backend)

### 1.1 Modelo `Position`
Entidad central que representa un cargo o puesto de trabajo.
- **Tabla**: `business_rrhh.positions`
- **Campos Principales**:
    - `id` (UUID): Identificador único.
    - `code` (String): Código único por compañía (Ej: `POS-001`).
    - `name` (String): Nombre del cargo.
    - `description` (TEXT): Descripción del cargo y sus objetivos.
    - `min_salary` (BigDecimal): Salario mínimo del rango.
    - `max_salary` (BigDecimal): Salario máximo del rango.
    - `risk_level` (String): Nivel de riesgo laboral (I, II, III, IV, V).
    - `active` (Boolean): Estado del cargo.
- **Relaciones**:
    - `department` (ManyToOne): Departamento al que pertenece el cargo.
    - `organizationalLevel` (ManyToOne): Nivel jerárquico del cargo.
    - `currency` (ManyToOne): Moneda heredada del centro de costos del departamento.
    - `functions` (OneToMany): Lista de funciones y responsabilidades.
    - `skills` (OneToMany): Lista de habilidades y conocimientos requeridos.
    - `requirements` (OneToMany): Lista de requisitos educativos, certificaciones, etc.
    - `experiences` (OneToMany): Lista de experiencias laborales requeridas.

### 1.2 Entidades Relacionadas

#### `PositionFunction`
- **Tabla**: `business_rrhh.position_functions`
- **Campos**: `description` (TEXT), `display_order` (Integer)
- **Propósito**: Define las funciones y responsabilidades del cargo.

#### `PositionSkill`
- **Tabla**: `business_rrhh.position_skills`
- **Campos**: `skill_name` (String), `skill_level_id` (FK), `is_mandatory` (Boolean), `description` (TEXT), `display_order` (Integer)
- **Propósito**: Define habilidades técnicas o blandas requeridas con nivel de dominio.

#### `PositionRequirement`
- **Tabla**: `business_rrhh.position_requirements`
- **Campos**: `requirement_type` (String: EDUCATION, CERTIFICATION, LICENSE, OTHER), `description` (TEXT), `is_mandatory` (Boolean), `display_order` (Integer)
- **Propósito**: Define requisitos formales (títulos, certificaciones, licencias).

#### `PositionExperience`
- **Tabla**: `business_rrhh.position_experience`
- **Campos**: `area` (String), `min_years` (Integer), `max_years` (Integer), `is_mandatory` (Boolean), `description` (TEXT), `display_order` (Integer)
- **Propósito**: Define experiencia laboral requerida en áreas específicas.

#### `SkillLevel`
- **Tabla**: `business_rrhh.skill_levels`
- **Campos**: `name` (String), `code` (String), `weight` (Integer), `active` (Boolean)
- **Propósito**: Catálogo de niveles de dominio (Básico, Intermedio, Avanzado, Experto).

### 1.3 Reglas de Negocio (Service)
- **Unicidad de Código**: El campo `code` debe ser único dentro de la misma compañía.
- **Validación de Salarios**: Si se especifican ambos salarios, el mínimo no puede ser mayor que el máximo.
- **Herencia de Moneda**: La moneda se hereda automáticamente del centro de costos del departamento seleccionado.
- **Validación de Relaciones**: Departamento y Nivel Organizacional deben pertenecer a la misma compañía.
- **Gestión de Colecciones**: Las colecciones (functions, skills, requirements, experiences) se gestionan mediante cascade ALL y orphan removal.

## 2. Interfaz de Usuario (Frontend)

### 2.1 Position List (`position-list.component`)
Implementa el estándar de diseño **Premium Glassmorphism** unificado.
- **Visualización (Patrón Columna Combinada)**: `p-table` con estructura optimizada:
    - **Código**: Badge sutil `text-xs font-black`.
    - **Nombre y Nivel**: Columna combinada con icono `briefcase`, nombre del cargo, nivel organizacional (badge pequeño) y descripción con tooltip.
    - **Departamento**: Nombre y código del departamento.
    - **Salarios**: Columnas de salario mínimo y máximo con formato de moneda.
    - **Nivel de Riesgo**: Badge con código de colores (verde para I-II, amarillo para III, rojo para IV-V).
    - **Estado**: Badge de estado Activo/Inactivo con punto de color.
- **Filtros**:
    - Buscador global por código, nombre, departamento y nivel organizacional.
    - Toggle para mostrar/ocultar inactivos.
- **Acciones**: Editar y Toggle Active (con confirmación).

### 2.2 Position Form (`position-form.component`)
Formulario reactivo complejo con **4 secciones de colecciones dinámicas** mediante modales.

#### Sección 1: Información Básica
- **Inputs con Iconos**: Código y Nombre con iconos integrados.
- **Selectores**: Departamento (con código), Nivel Organizacional, Nivel de Riesgo.
- **Descripción**: Textarea para objetivos del cargo.

#### Sección 2: Compensación
- **Salarios**: InputNumber con formato de moneda (COP).
- **Validación**: El salario mínimo no puede ser mayor que el máximo.

#### Sección 3: Funciones y Responsabilidades
- **Patrón**: Lista dinámica con modal para agregar.
- **Visualización**: Cards numeradas con descripción y botón de eliminar.
- **Modal**: Textarea para descripción de la función.

#### Sección 4: Habilidades y Conocimientos
- **Patrón**: Lista dinámica con modal para agregar.
- **Visualización**: Cards con nombre, nivel de dominio (badge azul) y obligatoriedad (badge rojo).
- **Modal**: Input de nombre, selector de nivel, toggle de obligatoriedad.

#### Sección 5: Requisitos
- **Patrón**: Lista dinámica con modal para agregar.
- **Visualización**: Cards con tipo (badge morado), descripción y obligatoriedad.
- **Modal**: Selector de tipo (Educación, Certificación, Licencia, Otro), textarea de descripción, toggle de obligatoriedad.

#### Sección 6: Experiencia Requerida
- **Patrón**: Lista dinámica con modal para agregar.
- **Visualización**: Cards con área, rango de años (badge verde) y obligatoriedad.
- **Modal**: Input de área, InputNumber de años mínimos y máximos, toggle de obligatoriedad.

## 3. Integración y Servicios
- **PositionService**: Maneja el CRUD completo con gestión de colecciones anidadas.
- **SkillLevelService**: Proporciona el catálogo de niveles de habilidad ordenado por peso.
- **Dependencias**: Se integra con `DepartmentService`, `OrganizationalLevelService` para poblar selectores.

## 4. Estándares Técnicos
- **DTOs**: Uso de `PositionDto` con DTOs anidados para cada colección (`PositionFunctionDto`, `PositionSkillDto`, `PositionRequirementDto`, `PositionExperienceDto`).
- **Backend**: 
    - Validaciones de seguridad (`@PreAuthorize`) con permisos `RRHH_POSITION_VIEW` y `RRHH_POSITION_EDIT`.
    - Multi-tenencia (`TenantContext`).
    - Auditoría automática mediante `AuditableEntity`.
- **Frontend**:
    - FormArrays para gestión de colecciones dinámicas.
    - Modales PrimeNG Dialog para agregar elementos.
    - Validaciones reactivas en tiempo real.

## 5. Flujo de Trabajo Típico

### Crear un Cargo:
1. Navegar a `/rrhh/positions` y hacer clic en "Nuevo Cargo".
2. Completar información básica (código, nombre, departamento, nivel organizacional).
3. Definir rango salarial (opcional).
4. Agregar funciones mediante el modal (mínimo recomendado: 3-5 funciones).
5. Agregar habilidades con niveles de dominio.
6. Agregar requisitos educativos y certificaciones.
7. Agregar experiencia laboral requerida.
8. Guardar el cargo.

### Editar un Cargo:
1. Desde el listado, hacer clic en el icono de editar.
2. Modificar campos básicos o colecciones.
3. Agregar/eliminar funciones, habilidades, requisitos o experiencias.
4. Actualizar el cargo.

## 6. Consideraciones Especiales
- **Herencia de Moneda**: Al seleccionar un departamento, la moneda se hereda automáticamente del centro de costos asociado.
- **Orden de Visualización**: Todas las colecciones se ordenan por `display_order` ASC.
- **Eliminación en Cascada**: Al eliminar un cargo, todas sus colecciones relacionadas se eliminan automáticamente (orphan removal).
- **Validación de Experiencia**: Si se especifica `max_years`, debe ser mayor o igual a `min_years`.
