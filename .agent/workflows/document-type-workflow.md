---
description: Documentación completa de la implementación del módulo de Gestión de Tipos de Soportes (Document Types System).
---

# Gestión de Tipos de Soportes (Document Types)

Este módulo permite parametrizar los diferentes tipos de documentos o soportes físicos/digitales que se le solicitan a los empleados, como certificaciones, diplomas, escaneos de documentos, etc.

## 🏗️ Estructura del Backend (Spring Boot)

### 1. Entidades Relacionadas
- **DocumentType**: Entidad principal que define el soporte.
- **DocumentCategory**: Agrupador lógico (ej: "Académico", "Experiencia Laboral").

### 2. Atributos Clave
- `isRequired`: Fuerza al empleado a cargar este soporte para completar su ingreso.
- `requiresExpiration`: Habilita campos de fecha de vencimiento y genera alertas.
- `code`: Identificador corto (ej: "ACT_GRADO") para integraciones.

### 3. API Endpoints (`/api/rrhh/document-types`)
- `GET /active`: Lista de soportes disponibles para el portal del empleado.
- `PUT /{id}/toggle-active`: Toggling de estado.

## 🎨 Estructura del Frontend (Angular)

### 1. Componentes
- **DocumentTypeListComponent**: Gestión administrativa con badges de categorización y estados de obligatoriedad.
- **DocumentTypeFormComponent**: Configuración de reglas de negocio por soporte.

## 🛠️ Estándares Técnicos
- **Aislamiento**: Multi-tenant mediante `company_id`.
- **Auditoría**: Tracking completo vía `AuditableEntity`.
- **Normalización**: Códigos siempre en mayúsculas automáticas.

## 📋 Integración con el Sistema de Archivos
Este módulo define los "metadatos" que luego se utilizan en el módulo de carga de archivos (MinIO) para validar qué archivos se están subiendo y qué reglas deben cumplir.
