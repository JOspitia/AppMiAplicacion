---
description: Documentación completa de la implementación del módulo de Gestión de Tipos de Identificación (Document Types System).
---

# Gestión de Tipos de Identificación

Este workflow describe la implementación del módulo de Tipos de Identificación, que permite parametrizar los documentos de identidad aceptados para empleados (CC, TI, Pasaporte, etc.).

## 1. Arquitectura de Datos (Backend)

### 1.1 Modelo `IdentificationType`
Entidad que representa los tipos de documentos de identificación.
- **Tabla**: `public.identification_types`
- **Campos Principales**:
    - `id` (UUID): Identificador único.
    - `company_id` (UUID): Relación con la compañía (multi-tenant).
    - `name` (String): Nombre descriptivo (ej: "Cédula de Ciudadanía").
    - `code` (String): Código corto opcional (ej: "CC", "TI", "PASS"). Se normaliza a mayúsculas automáticamente.
    - `is_required` (Boolean): Indica si el documento es obligatorio para empleados.
    - `requires_expiration` (Boolean): Indica si el documento tiene fecha de vencimiento.
    - `active` (Boolean): Estado activo/inactivo.
    - `country_code` (String): Código ISO del país (ej: "CO", "US"). NULL = Global.
    - `validation_regex` (String): Expresión regular para validar el formato del número de documento.
- **Auditoría Automática**: Esta entidad extiende `AuditableEntity`, gestionando automáticamente `createdAt`, `updatedAt`, `createdBy` y `updatedBy` mediante JPA Auditing.

### 1.2 Reglas de Negocio (Service)
- **Validación de Código Único**: El código (si se proporciona) debe ser único por compañía.
- **Normalización Automática**: Los códigos se convierten automáticamente a mayúsculas en `@PrePersist` y `@PreUpdate`.
- **Multi-tenencia**: Todas las operaciones validan el acceso por `company_id`.
- **Soft Toggle**: Permite activar/desactivar tipos sin eliminarlos de la base de datos.

## 2. Interfaz de Usuario (Frontend)

### 2.1 Identification Type List (`identification-type-list.component`)
Implementa el estándar de diseño **Premium Glassmorphism** con listado optimizado.
- **Visualización (Patrón Columna Combinada)**:
    - **Código**: Badge con el código corto (si existe).
    - **Nombre**: Columna combinada con icono `id-card`, nombre y badge de validación regex (si existe).
    - **País**: Badge con código ISO o "Global".
    - **Obligatorio**: Icono check/x indicando si es requerido.
    - **Expiración**: Icono calendario/x indicando si requiere fecha de vencimiento.
    - **Estado**: Badge activo/inactivo con indicador visual.
    - **Gestión**: Botones de acción para Editar y Activar/Desactivar con tooltips.

### 2.2 Identification Type Form (`identification-type-form.component`)
Formulario reactivo con validación en tiempo real.

#### Características Principales:
1. **Hero Header**: Siguiendo el estándar de formularios con título gradiente y botón de retorno premium.
2. **Sección de Información del Documento**:
    - **Nombre**: Input con icono `id-card` (requerido, max 100 caracteres).
    - **Código**: Input con icono `hash`, se convierte automáticamente a mayúsculas (opcional, max 50 caracteres).
    - **País (ISO)**: Input con icono `globe`, max 2 caracteres, se convierte a mayúsculas (opcional).
    - **Expresión Regular**: Input con icono `shield-check`, fuente monospace para mejor legibilidad (opcional, max 255 caracteres).

3. **Sección de Toggles (Grid 3 Columnas)**:
    - **Obligatorio**: Toggle para marcar si el documento es requerido para empleados.
    - **Expiración**: Toggle para indicar si el documento tiene fecha de vencimiento.
    - **Estado Activo**: Toggle para activar/desactivar el tipo.

4. **Validación en Tiempo Real**:
    - Campos requeridos se validan al perder el foco.
    - Mensajes de error claros y específicos.
    - Botón de guardar se deshabilita si el formulario es inválido.

## 3. Integración y Servicios

### 3.1 Backend
- **IdentificationTypeService**: Maneja el CRUD completo con validaciones multi-tenant.
- **Endpoints**: `/api/rrhh/identification-types`
    - `GET /` - Listar todos
    - `GET /active` - Listar solo activos
    - `GET /{id}` - Obtener por ID
    - `POST /` - Crear nuevo
    - `PUT /{id}` - Actualizar existente
    - `PUT /{id}/toggle-active` - Cambiar estado
    - `DELETE /{id}` - Eliminar (validar uso previo)

### 3.2 Frontend
- **IdentificationTypeService**: Servicio Angular para comunicación con API.
- **Rutas**:
    - `/rrhh/identification-types` - Lista
    - `/rrhh/identification-types/create` - Crear
    - `/rrhh/identification-types/edit/:id` - Editar

## 4. Estándares Técnicos Aplicados

### 4.1 Backend
- **Auditoría Automática**: Uso de `AuditableEntity` para tracking de cambios.
- **Normalización de Datos**: `@PrePersist` y `@PreUpdate` para códigos en mayúsculas.
- **Validaciones de Multi-tenencia**: Todos los métodos validan acceso por compañía.
- **Permisos**: `RRHH_CONFIG_VIEW` y `RRHH_CONFIG_EDIT`.

### 4.2 Frontend
- **Reactive Forms**: Validación reactiva con mensajes de error específicos.
- **Diseño Premium**: Siguiendo workflows `/ui-consistency-forms.md` y `/ui-consistency-standards.md`:
    - Hero Header con gradiente.
    - Contenedor Glassmorphism con `backdrop-blur-3xl`.
    - Grid con diseño moderno (bordes sutiles, backgrounds diferenciados).
    - Inputs con padding consistente, focus rings en color primario.
- **Signals**: Para manejo de estado reactivo.
- **Lazy Loading**: Componentes cargados bajo demanda.

## 5. Casos de Uso Típicos

### Ejemplo 1: Cédula de Ciudadanía (Colombia)
- `name`: "Cédula de Ciudadanía"
- `code`: "CC"
- `countryCode`: "CO"
- `validationRegex`: "^[0-9]{6,10}$"
- `isRequired`: true
- `requiresExpiration`: false

### Ejemplo 2: Pasaporte (Global)
- `name`: "Pasaporte"
- `code`: "PASS"
- `countryCode`: null (Global)
- `validationRegex`: "^[A-Z0-9]{6,9}$"
- `isRequired`: false
- `requiresExpiration`: true

### Ejemplo 3: Tarjeta de Identidad (Colombia)
- `name`: "Tarjeta de Identidad"
- `code`: "TI"
- `countryCode`: "CO"
- `validationRegex`: "^[0-9]{10,11}$"
- `isRequired`: false
- `requiresExpiration`: false

## 6. Integración con Otros Módulos

Este módulo es fundamental para:
- **Gestión de Empleados**: Los empleados seleccionan su tipo de documento de identidad.
- **Validación de Documentos**: La regex permite validar automáticamente el formato del número de documento.
- **Gestión Documental**: Los documentos de empleados se categorizan por tipo.
- **Reportes de Cumplimiento**: Identificar documentos próximos a vencer (si `requiresExpiration` es true).

## 7. Mejoras Futuras Sugeridas

- **Plantillas de Regex**: Crear un catálogo de expresiones regulares comunes para facilitar la configuración.
- **Validación en Tiempo Real**: Probar la regex en el formulario con un input de ejemplo.
- **Alertas de Vencimiento**: Sistema de notificaciones para documentos próximos a expirar.
- **Historial de Cambios**: Mostrar quién y cuándo modificó cada tipo de identificación.
- **Importación Masiva**: Permitir cargar tipos de identificación desde un archivo CSV/Excel.

---
// turbo-all
