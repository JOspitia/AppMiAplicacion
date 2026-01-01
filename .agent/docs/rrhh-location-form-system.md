# Sistema de Formulario de Sedes (RRHH)

Este documento detalla el funcionamiento del sistema de gestión de sedes físicas (sucursales/oficinas) dentro del módulo de Recursos Humanos, accesible en `/rrhh/locations`.

## 1. Visión General

El propósito de este formulario es permitir a las empresas registrar sus ubicaciones físicas reales. A diferencia del catálogo geográfico global, las **Sedes** son entidades privadas de cada empresa (multi-tenant) y contienen información específica como la dirección normalizada y el estado de "Sede Principal".

## 2. Diferenciación Crítica

Es fundamental distinguir entre estos dos conceptos en la plataforma:
- **Ubicaciones (Geografía)**: Catálogo global de Países, Departamentos y Ciudades sincronizado desde una base de datos externa. Es de solo lectura para las empresas.
- **Sedes (RRHH)**: Las sucursales físicas creadas por la empresa que utilizan el catálogo geográfico para su clasificación.

## 3. Lógica de Dirección (Address Builder)

Para asegurar la consistencia en el reporte de nómina y seguridad social, el campo de dirección no es de texto libre. 
- Utiliza el componente compartido `app-address-builder`.
- El usuario construye la dirección seleccionando Tipo de Vía, Número, Placa y Complementos.
- El formulario recibe la cadena final normalizada.

## 4. Gestión de Sede Principal (Main Sede)

El sistema impone una regla de negocio estricta sobre la "Sede Principal":
- Solo puede existir **una** sede marcada como `isMain` por empresa.
- **Acción Backend**: Al marcar una nueva sede como principal, el `LocationService` desmarca automáticamente cualquier otra sede que tuviera ese estado anteriormente para asegurar la integridad de la matriz.

## 5. Implementación Técnica

### 5.1 Frontend (`LocationFormComponent`)
- **Ruta**: `/rrhh/locations/create` | `/rrhh/locations/edit/:id`
- **Componentes**: 
  - `p-select` con filtrado habilitado para la selección de geografía (País -> Depto -> Ciudad).
  - `p-toggleSwitch` para el estado activo y el flag de sede principal.
- **Reactividad**: El formulario reacciona al cambio de País para cargar los Departamentos correspondientes, y al cambio de Departamento para cargar las Ciudades.

### 5.2 Backend (`LocationService`)
- **Validación de Unicidad**: El nombre de la sede debe ser único dentro de la misma empresa.
- **Seguridad**: Todas las operaciones CRUD están protegidas por `companyId`, asegurando que una empresa no pueda ver ni editar las sedes de otra.
- **Auditoría**: Se rastrea el usuario creador (`createdBy`) y el último modificador (`updatedBy`).
