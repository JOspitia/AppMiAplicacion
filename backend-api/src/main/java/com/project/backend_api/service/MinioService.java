package com.project.backend_api.service;

import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;

@Service
@RequiredArgsConstructor
public class MinioService {

    private final MinioClient minioClient;

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
            if (!isAllowedAsset(fileName)) {
                throw new IllegalArgumentException("File type not allowed");
            }
            return minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(privateBucket)
                            .object(fileName)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error fetching private asset: " + fileName, e);
        }
    }

    private boolean isAllowedAsset(String fileName) {
        return fileName.endsWith(".png") || fileName.endsWith(".jpg") ||
               fileName.endsWith(".jpeg") || fileName.endsWith(".gif");
    }
}
