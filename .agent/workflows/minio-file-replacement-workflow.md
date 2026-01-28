---
description: [Workflow for managing file replacement in MinIO storage system]
---

# MinIO File Replacement Strategy Workflow

Este workflow documenta la estrategia de reemplazo de archivos en el sistema de almacenamiento MinIO, permitiendo controlar si se mantiene histórico o se reemplazan versiones anteriores.

## Problema Resuelto

Al subir archivos múltiples veces (ej: actualizar foto de perfil de un empleado), se generaban duplicados con diferentes extensiones:
- `profile.jpg`
- `profile.png`
- `profile_v2.jpg`

Esto causaba:
- **Desperdicio de almacenamiento**
- **Confusión sobre cuál es la versión actual**
- **Necesidad de limpieza manual**

## Solución Implementada

### 1. Nuevo Parámetro `replaceExisting`

Se agregó un parámetro booleano a los métodos de upload en `MinioService`:

```java
public String uploadEmployeeFile(UUID companyId, UUID employeeId, String category, 
                                  String prefix, String base64Data, boolean replaceExisting, 
                                  FileOptionsDto options)
```

**Comportamiento:**
- `replaceExisting = true`: Elimina todos los archivos con el mismo prefijo antes de subir el nuevo
- `replaceExisting = false`: Mantiene histórico, permite múltiples versiones

### 2. Método de Eliminación por Prefijo

Nuevo método en `MinioService.java`:

```java
public void deletePrivateFilesByPrefix(String folderPath, String filePrefix)
```

**Funcionamiento:**
1. Lista todos los archivos en la carpeta especificada
2. Filtra por prefijo (ej: "profile")
3. Elimina todos los archivos que coincidan (profile.jpg, profile.png, etc.)
4. Si hay error, registra warning pero no interrumpe la subida del nuevo archivo

### 3. Casos de Uso

| Tipo de Archivo | `replaceExisting` | Razón |
|:---|:---:|:---|
| **Foto de Perfil** | `true` | Solo debe existir una versión actual |
| **Logo de Empresa** | `true` | Solo una versión activa |
| **Contratos** | `false` | Se requiere histórico legal |
| **Documentos Legales** | `false` | Auditoría y compliance |
| **Nóminas** | `false` | Histórico financiero obligatorio |
| **Certificados** | `false` | Trazabilidad requerida |

## 🖼️ Procesamiento de Imágenes y Validación

Se ha integrado un motor de procesamiento de imágenes y validación de tamaño mediante el DTO `FileOptionsDto`.

### 1. DTO `FileOptionsDto`
Permite definir restricciones técnicas para el archivo antes de ser guardado:

- `maxWidth` / `maxHeight`: Dimensiones máximas permitidas (se aplica redimensionamiento manteniendo aspect ratio).
- `maxFileSize`: Límite de tamaño en bytes.
- `quality`: Calidad de compresión (para formatos compatibles).

### 2. Validaciones Automáticas
- **Tamaño**: Si el archivo excede `maxFileSize`, se lanza una `IllegalArgumentException`.
- **Redimensionamiento**: Si es una imagen y supera las dimensiones, se procesa automáticamente usando `Graphics2D` con filtros de alta calidad (Bilinear + Anti-aliasing).

### 3. Presets Disponibles
- `FileOptionsDto.profilePhoto()`: 
    - Dimensiones: 200x200 px.
    - Tamaño Máximo: 10 MB.
    - Calidad: 0.85.

## Implementación en Módulos

### Empleados (RRHH)

**Archivo:** `EmployeeService.java`

```java
// Foto de perfil: replaceExisting = true + Procesamiento de Imagen (200x200)
String newPhotoUrl = minioService.uploadEmployeeFile(
    employee.getCompany().getId(),
    employee.getId(),
    "photo",
    "profile",
    dto.getPhotoUrl(),
    true, // Reemplazar archivo existente
    FileOptionsDto.profilePhoto()); // Redimensionar 200x200 + Límite 10MB
```

**Resultado:**
- Al subir una nueva foto, elimina `profile.jpg` (si existe)
- Sube `profile.png` (nueva versión)
- Solo existe un archivo en la carpeta `photo/`

### Ejemplo para Documentos con Histórico

```java
// Contrato laboral: replaceExisting = false
String contractUrl = minioService.uploadEmployeeFile(
    employee.getCompany().getId(),
    employee.getId(),
    "contracts",
    "contract",
    dto.getContractPdf(),
    false); // Mantener histórico
```

**Resultado:**
- Mantiene: `contract_2024-01-15.pdf`
- Agrega: `contract_2024-06-20.pdf`
- Ambos archivos coexisten para auditoría

## Estructura de Carpetas en MinIO

```
private-assets/
└── companies/
    └── {companyId}/
        └── employees/
            └── {employeeId}/
                ├── photo/
                │   └── profile.jpg          ← Solo una versión (replaceExisting=true)
                ├── contracts/
                │   ├── contract_v1.pdf      ← Histórico mantenido
                │   ├── contract_v2.pdf      ← (replaceExisting=false)
                │   └── contract_v3.pdf
                └── payroll/
                    ├── 2024-01.pdf          ← Histórico obligatorio
                    ├── 2024-02.pdf
                    └── 2024-03.pdf
```

## Seguridad y Logging

- **Logging**: Cada eliminación se registra con `log.info("Eliminando archivo anterior: {}", objectName)`
- **Error Handling**: Si falla la eliminación, se registra warning pero continúa la subida
- **Malware Scanning**: Se mantiene antes de subir cualquier archivo

## Mantenimiento

### Agregar Nuevo Tipo de Archivo

1. **Determinar si requiere histórico**:
   - ¿Es un documento legal/financiero? → `replaceExisting = false`
   - ¿Es una imagen/logo/perfil? → `replaceExisting = true`

2. **Implementar en el Service correspondiente**:
   ```java
   minioService.uploadEmployeeFile(companyId, employeeId, category, prefix, data, replaceExisting, options);
   ```

3. **Documentar la decisión** en este workflow

### Limpieza Manual (si es necesario)

Si necesitas limpiar archivos huérfanos manualmente:

```java
minioService.deletePrivateFilesByPrefix(
    "companies/{companyId}/employees/{employeeId}/photo/", 
    "old_prefix"
);
```

## Compatibilidad

- **Versión Legacy**: Se mantiene método sin parámetro `replaceExisting` (por defecto `false`)
- **Migración**: Código existente sigue funcionando sin cambios
- **Nuevas Implementaciones**: Usar siempre la versión con parámetro explícito
