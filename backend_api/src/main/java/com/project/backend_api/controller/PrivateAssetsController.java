package com.project.backend_api.controller;

import com.project.backend_api.security.CustomUserDetails;
import com.project.backend_api.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@RestController
@RequestMapping("/api/private/assets")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class PrivateAssetsController {

    private final MinioService minioService;

    @GetMapping("/{companyId}/{category}/{fileName}")
    public ResponseEntity<?> getPrivateAsset(
            @PathVariable UUID companyId,
            @PathVariable String category,
            @PathVariable String fileName,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        // CAPA 1: Validación de Tenancy (Aislamiento por Empresa)
        if (!userDetails.getUser().getIsSuperAdmin() && !companyId.equals(userDetails.getCompanyId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // CAPA 2: Control de Acceso basado en Roles (RBAC) para categorías sensibles
        if ("payroll".equalsIgnoreCase(category) && !userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_HR") || a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            // Decodificar nombre del archivo si es necesario
            String decodedFileName = URLDecoder.decode(fileName, StandardCharsets.UTF_8);

            // Estándar de ruta: companies/{companyId}/{category}/{fileName}
            String fullPath = String.format("companies/%s/%s/%s", companyId, category, decodedFileName);

            // CAPA 3: URLs Firmadas (Presigned URLs) para descarga segura y eficiente
            String presignedUrl = minioService.getPrivatePresignedUrl(fullPath);

            // CAPA 4: Seguridad en el Transporte y Visualización
            return ResponseEntity.status(HttpStatus.FOUND) // 302 Redirect
                    .location(URI.create(presignedUrl))
                    .header("X-Content-Type-Options", "nosniff")
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + decodedFileName + "\"")
                    .build();

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

}
