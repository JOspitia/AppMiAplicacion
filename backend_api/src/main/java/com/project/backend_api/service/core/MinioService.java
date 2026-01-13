package com.project.backend_api.service.core;

import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;
    private final AntiMalwareService antiMalwareService;

    @Value("${storage.s3.bucket-name}")
    private String bucketName;

    @Value("${storage.s3.public-bucket:public-assets}")
    private String publicBucket;

    @Value("${storage.s3.private-bucket:private-assets}")
    private String privateBucket;

    public InputStream getFile(String path) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(path)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching file from MinIO: " + path, e);
        }
    }

    public InputStream getPublicAsset(String fileName) {
        try {
            // Validar que el archivo tenga extensión permitida
            if (!isAllowedAsset(fileName)) {
                throw new IllegalArgumentException("File type not allowed");
            }
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(publicBucket)
                            .object(fileName)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching public asset: " + fileName, e);
        }
    }

    public InputStream getPrivateAsset(String fileName) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(privateBucket)
                            .object(fileName)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching private asset: " + fileName, e);
        }
    }

    public String getPrivatePresignedUrl(String fileName) {
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(privateBucket)
                            .object(fileName)
                            .expiry(1, TimeUnit.HOURS)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error generating presigned URL for: " + fileName, e);
        }
    }

    public void uploadPrivateFile(String path, InputStream inputStream, long size, String contentType) {
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(privateBucket)
                            .object(path)
                            .stream(inputStream, size, -1)
                            .contentType(contentType)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error uploading private asset: " + path, e);
        }
    }

    public void deletePrivateFile(String path) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(privateBucket)
                            .object(path)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error deleting private asset: " + path, e);
        }
    }

    public void uploadPublicFile(String path, InputStream inputStream, long size, String contentType) {
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(publicBucket)
                            .object(path)
                            .stream(inputStream, size, -1)
                            .contentType(contentType)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error uploading public asset: " + path, e);
        }
    }

    /**
     * Generic method to process and upload a private file following the
     * architecture standard.
     * Path: companies/{companyId}/{category}/{prefix}_{uuid}.extension
     */
    public Map<String, String> uploadPrivateMultipartFile(UUID companyId, String category, String prefix,
            MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            String originalName = file.getOriginalFilename();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            // CAPA EXTRA: Malware Scanning
            if (!antiMalwareService.isClean(file.getInputStream())) {
                throw new RuntimeException(
                        "Seguridad: Se ha detectado una amenaza potencial en el archivo. Carga cancelada.");
            }

            // Standard Naming: {prefix}_{uuid}{extension}

            String fileId = UUID.randomUUID().toString();
            String fileName = String.format("%s_%s%s", prefix, fileId, extension);

            // Standard Path: companies/{companyId}/{category}/{fileName}
            String path = String.format("companies/%s/%s/%s", companyId, category, fileName);

            // Perform low-level upload
            this.uploadPrivateFile(path, file.getInputStream(), file.getSize(), file.getContentType());

            // Resource URL for the frontend
            String apiUrl = String.format("/api/private/assets/%s/%s/%s", companyId, category, fileName);

            return Map.of(
                    "path", path,
                    "url", apiUrl,
                    "fileName", fileName);
        } catch (Exception e) {
            throw new RuntimeException("Error processing multipart upload: " + e.getMessage(), e);
        }
    }

    private boolean isAllowedAsset(String fileName) {

        return fileName.endsWith(".png") || fileName.endsWith(".jpg") ||
                fileName.endsWith(".jpeg") || fileName.endsWith(".gif") ||
                fileName.endsWith(".webp") || fileName.endsWith(".mp3");
    }
}
