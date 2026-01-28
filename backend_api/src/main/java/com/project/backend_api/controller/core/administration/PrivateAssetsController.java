package com.project.backend_api.controller.core.administration;

import com.project.backend_api.security.CustomUserDetails;
import com.project.backend_api.service.core.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/private/assets")
@RequiredArgsConstructor
// @PreAuthorize("isAuthenticated()") // Moved logic inside method to allow
// public images
public class PrivateAssetsController {

    private final MinioService minioService;

    @GetMapping("/{*path}")
    public ResponseEntity<?> getGlobalPrivateAsset(
            @PathVariable String path,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // 1. Limpieza y Normalización de la Ruta
        String cleanPath = path.startsWith("/") ? path.substring(1) : path;
        String decodedPath = URLDecoder.decode(cleanPath, StandardCharsets.UTF_8);

        // Convertir URL (company/...) a Estructura MinIO (companies/...)
        String minioPath = decodedPath;
        if (minioPath.startsWith("company/")) {
            minioPath = "companies/" + minioPath.substring("company/".length());
        }

        // 2. Extracción de Metadatos (Company ID para seguridad)
        UUID companyId = extractCompanyIdFromPath(minioPath);
        if (companyId == null) {
            return ResponseEntity.badRequest().build();
        }

        // 3. Verificaciones de Seguridad
        // Determinar si es una imagen pública (perfil, logos, etc.)
        boolean isPublicContent = minioPath.contains("/images/") || minioPath.contains("/photo/");

        if (!isPublicContent) {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            // CAPA 1: Validación de Tenancy (Aislamiento por Empresa)
            if (!userDetails.getUser().getIsSuperAdmin() && !companyId.equals(userDetails.getCompanyId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            // CAPA 2: Control de Acceso basado en Roles (RBAC) para áreas sensibles
            if (minioPath.contains("/payroll/") && !hasPrivilegedRole(userDetails)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        try {
            // 4. Obtención del Recurso desde MinIO
            java.io.InputStream inputStream = minioService.getPrivateAsset(minioPath);
            return buildResponse(minioPath, inputStream);

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private UUID extractCompanyIdFromPath(String path) {
        try {
            String[] segments = path.split("/");
            // Formato normalizado: companies/{uuid}/...
            if (segments.length >= 2 && "companies".equals(segments[0])) {
                return UUID.fromString(segments[1]);
            }
            return null;
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private boolean hasPrivilegedRole(CustomUserDetails user) {
        return user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_HR") || a.getAuthority().equals("ROLE_ADMIN"));
    }

    private ResponseEntity<?> buildResponse(String fileName, java.io.InputStream inputStream) {
        String contentType = "application/octet-stream";
        String lowerParams = fileName.toLowerCase();

        if (lowerParams.endsWith(".png"))
            contentType = "image/png";
        else if (lowerParams.endsWith(".jpg") || lowerParams.endsWith(".jpeg"))
            contentType = "image/jpeg";
        else if (lowerParams.endsWith(".svg"))
            contentType = "image/svg+xml";
        else if (lowerParams.endsWith(".pdf"))
            contentType = "application/pdf";
        else if (lowerParams.endsWith(".webp"))
            contentType = "image/webp";

        // Extraer solo el nombre del archivo para el header
        String simpleName = fileName;
        if (fileName.contains("/")) {
            simpleName = fileName.substring(fileName.lastIndexOf('/') + 1);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + simpleName + "\"")
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(org.springframework.http.CacheControl.maxAge(1, java.util.concurrent.TimeUnit.HOURS))
                .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                .body(new org.springframework.core.io.InputStreamResource(inputStream));
    }

}
