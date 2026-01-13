package com.project.backend_api.controller.core.administration;

import com.project.backend_api.service.core.MinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/public/assets")
@RequiredArgsConstructor
@Slf4j
public class PublicAssetsController {

    private final MinioService minioService;

    @GetMapping("/{*fileName}")
    public ResponseEntity<byte[]> getPublicAsset(@PathVariable String fileName) {
        try {
            // Eliminar slash inicial si existe (causado por {*fileName})
            String cleanFileName = fileName.startsWith("/") ? fileName.substring(1) : fileName;

            // Decodificar URL encoding (%20 -> espacio)
            String decodedFileName = URLDecoder.decode(cleanFileName, StandardCharsets.UTF_8);

            // Intentar con múltiples claves candidatas (original, images/, images/landing/,
            // music/)
            String[] candidates = new String[] {
                    decodedFileName,
                    "images/" + decodedFileName,
                    "images/landing/" + decodedFileName,
                    "music/" + decodedFileName
            };

            for (String candidate : candidates) {
                try {
                    log.debug("Intentando cargar desde MinIO: {}", candidate);
                    InputStream inputStream = minioService.getPublicAsset(candidate);
                    byte[] content = inputStream.readAllBytes();
                    inputStream.close();

                    String mediaType = getMediaType(candidate);
                    log.info("✓ Sirviendo recurso público '{}' exitosamente (candidata: {})", decodedFileName,
                            candidate);
                    return ResponseEntity.ok()
                            .contentType(MediaType.parseMediaType(mediaType))
                            .cacheControl(CacheControl.maxAge(30, TimeUnit.DAYS))
                            .body(content);
                } catch (Exception e) {
                    log.warn("✗ Candidata '{}' falló: {}", candidate, e.getMessage());
                    // intentar con la siguiente candidata
                }
            }

            log.warn("Recurso no encontrado para ninguna candidata: {}", decodedFileName);
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error al obtener el recurso: {}", fileName, e);
            return ResponseEntity.notFound().build();
        }
    }

    private String getMediaType(String fileName) {
        if (fileName.endsWith(".png"))
            return "image/png";
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg"))
            return "image/jpeg";
        if (fileName.endsWith(".gif"))
            return "image/gif";
        if (fileName.endsWith(".mp3"))
            return "audio/mpeg";
        if (fileName.endsWith(".webp"))
            return "image/webp";
        return "application/octet-stream";
    }
}
