---
description: Estándares y workflow para la gestión de archivos públicos y privados en MinIO con aislamiento multi-tenant.
---

# Gestión de Archivos (Private & Public Assets)

Este workflow define el estándar para cargar, proteger y servir archivos en el ecosistema, asegurando aislamiento por empresa (Tenancy) y optimización de recursos mediante URLs firmadas.

## 🏗️ Estructura de Almacenamiento

### 1. Bucket Privado (`private-assets`)
Se utiliza para documentos sensibles (nómina, contratos) y assets de marca que requieren control de acceso.
- **Patrón de Ruta**: `companies/{companyId}/{category}/{prefix}_{uuid}.extension`
- **Ejemplo**: `companies/550e8400-e29b/images/logo_a1b2c3d4.png`

### 2. Bucket Público (`public-assets`)
Para recursos que no requieren autenticación (ej: imágenes de landing page, iconos globales).
- **Patrón de Ruta**: `{category}/{fileName}.extension`

---

## 🚀 Workflow de Carga (Upload)

Para mantener la consistencia, **siempre** utiliza el motor global de `MinioService`.

### Paso 1: Implementación en el Service
No construyas rutas manualmente. Usa el método universal:

```java
// En tu Service de Dominio
public Map<String, String> uploadSomeFile(UUID companyId, MultipartFile file) {
    // 1. Llamar al servicio global (Maneja UUIDs, extensiones y rutas)
    Map<String, String> result = minioService.uploadPrivateMultipartFile(
        companyId, 
        "contracts", // Categoría (Carpeta)
        "sign",      // Prefijo del archivo
        file
    );
    
    // 2. Persistir la URL devuelta en tu Entidad
    String secureUrl = result.get("url"); // Ej: /api/private/assets/...
    entity.setDocumentUrl(secureUrl);
    repository.save(entity);
    
    return result;
}
```

### Paso 2: Exposición en el Controller
El controlador debe validar los permisos antes de permitir la subida.

```java
@PostMapping("/{id}/documents")
@PreAuthorize("hasPermission(#id, 'COMPANY_WRITE')")
public ResponseEntity<?> upload(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(domainService.uploadSomeFile(id, file));
}
```

---

## 🛡️ Workflow de Acceso (Download/View)

### Acceso a Archivos Privados
El acceso se centraliza en `PrivateAssetsController`. **NUNCA** sirvas bytes directamente; usa redirección a URLs firmadas.

1. **Aislamiento de Tenancy**: El controlador verifica que `userDetails.getCompanyId() == path.companyId`.
2. **Seguridad RBAC**: Las categorías sensibles (ej: `payroll`) deben validar roles extra (`ROLE_HR`).
3. **Presigned URLs**: El backend genera una URL temporal (1h) de MinIO y devuelve un `302 Redirect`.

**Standard Headers**:
- `X-Content-Type-Options: nosniff`: Evita inyecciones MIME.
- `Content-Disposition: inline`: Permite visualización en navegador con nombre seguro.

---

## 🎨 Integración Frontend (Angular)

### Carga con Preview
1. Capturar archivo mediante `<input type="file">`.
2. Generar preview local usando `FileReader` y `base64`.
3. Al guardar, enviar a través de `FormData`.

```typescript
uploadLogo(companyId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${environment.apiUrl}/management/companies/${companyId}/logo`, formData);
}
```

---

## 🛡️ Consideraciones de Producción para ClamAV

Para garantizar que la protección anti-malware sea efectiva y no degrade el sistema:

1. **Actualización de Firmas (FreshClam)**: El contenedor de ClamAV debe tener acceso a internet para descargar definiciones de virus diariamente. Sin actualizaciones, la protección contra amenazas nuevas (Zero-day) es nula.
2. **Recursos de Memoria**: ClamAV es intensivo en RAM (requiere ~1-2GB para cargar la base de datos de virus). En `docker-compose.yml`, hemos limitado el contenedor a **2GB** para evitar que consuma todos los recursos del host.
3. **Política de Fallo Cerrado**: Si el servicio de ClamAV no está disponible o falla el escaneo, el sistema debe **bloquear** la carga del archivo. Es preferible un error temporal a una brecha de seguridad.
4. **Timeouts**: Para archivos muy pesados, el tiempo de escaneo aumenta. Si planeas manejar archivos de >50MB, ajusta los timeouts en la configuración del cliente ClamAV.

