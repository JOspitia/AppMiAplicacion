package com.project.backend_api.controller;

import com.project.backend_api.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/private/assets")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class PrivateAssetsController {

    private final MinioService minioService;

    @GetMapping("/{fileName}")
    public ResponseEntity<byte[]> getPrivateAsset(@PathVariable String fileName) {
        try {
            // Decodificar URL encoding (%20 -> espacio)
            String decodedFileName = URLDecoder.decode(fileName, StandardCharsets.UTF_8);

            InputStream inputStream = minioService.getPrivateAsset(decodedFileName);
            byte[] content = inputStream.readAllBytes();
            inputStream.close();

            String mediaType = getMediaType(decodedFileName);
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(mediaType))
                    .cacheControl(CacheControl.noStore())
                    .header("Access-Control-Allow-Credentials", "true")
                    .body(content);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private String getMediaType(String fileName) {
        if (fileName.endsWith(".png")) return "image/png";
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) return "image/jpeg";
        if (fileName.endsWith(".gif")) return "image/gif";
        return "application/octet-stream";
    }
}
