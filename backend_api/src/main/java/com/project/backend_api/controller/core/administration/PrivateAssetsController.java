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

    @GetMapping("/{companyId}/{category}/{fileName}")
    public ResponseEntity<?> getPrivateAsset(
            @PathVariable UUID companyId,
            @PathVariable String category,
            @PathVariable String fileName,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        boolean isPublicCategory = "images".equalsIgnoreCase(category);

        // Security Check: Enforce authentication for non-public categories
        if (!isPublicCategory) {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            // CAPA 1: Validación de Tenancy (Aislamiento por Empresa)
            if (!userDetails.getUser().getIsSuperAdmin() && !companyId.equals(userDetails.getCompanyId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            // CAPA 2: Control de Acceso basado en Roles (RBAC)
            if ("payroll".equalsIgnoreCase(category) && !userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_HR") || a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        try {
            // Decodificar nombre del archivo si es necesario
            String decodedFileName = URLDecoder.decode(fileName, StandardCharsets.UTF_8);

            // Estándar de ruta: companies/{companyId}/{category}/{fileName}
            String fullPath = String.format("companies/%s/%s/%s", companyId, category, decodedFileName);

            java.io.InputStream inputStream = minioService.getPrivateAsset(fullPath);

            // Determine Content-Type
            String contentType = "application/octet-stream";
            String lowerParams = decodedFileName.toLowerCase();
            if (lowerParams.endsWith(".png"))
                contentType = "image/png";
            else if (lowerParams.endsWith(".jpg") || lowerParams.endsWith(".jpeg"))
                contentType = "image/jpeg";
            else if (lowerParams.endsWith(".svg"))
                contentType = "image/svg+xml";
            else if (lowerParams.endsWith(".pdf"))
                contentType = "application/pdf";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + decodedFileName + "\"")
                    .header("X-Content-Type-Options", "nosniff")
                    .cacheControl(org.springframework.http.CacheControl.maxAge(1, java.util.concurrent.TimeUnit.HOURS)) // Cache
                                                                                                                        // for
                                                                                                                        // 1
                                                                                                                        // hour
                    .contentType(org.springframework.http.MediaType.parseMediaType(contentType))
                    .body(new org.springframework.core.io.InputStreamResource(inputStream));

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }

    }

}




