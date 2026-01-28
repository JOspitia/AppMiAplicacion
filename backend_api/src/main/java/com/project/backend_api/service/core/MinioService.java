package com.project.backend_api.service.core;

import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.ListObjectsArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.Result;
import io.minio.messages.Item;
import io.minio.http.Method;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import org.springframework.web.multipart.MultipartFile;
import com.project.backend_api.dto.core.FileOptionsDto;

@Service
@RequiredArgsConstructor
@Slf4j
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

    /**
     * Elimina todos los archivos que coincidan con un prefijo específico.
     * Útil para reemplazar archivos como fotos de perfil donde solo debe existir
     * una versión.
     */
    public void deletePrivateFilesByPrefix(String folderPath, String filePrefix) {
        try {
            Iterable<Result<Item>> results = minioClient.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(privateBucket)
                            .prefix(folderPath)
                            .build());

            for (Result<Item> result : results) {
                Item item = result.get();
                String objectName = item.objectName();
                // Extraer solo el nombre del archivo
                String fileName = objectName.substring(objectName.lastIndexOf('/') + 1);

                // Si el archivo comienza con el prefijo (ej: "profile"), eliminarlo
                if (fileName.startsWith(filePrefix)) {
                    log.info("Eliminando archivo anterior: {}", objectName);
                    deletePrivateFile(objectName);
                }
            }
        } catch (Exception e) {
            log.warn("Error al eliminar archivos con prefijo {}: {}", filePrefix, e.getMessage());
            // No lanzar excepción, permitir que continúe la subida del nuevo archivo
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
     * 
     * @param replaceExisting Si es true, elimina archivos anteriores con el mismo
     *                        prefijo en esa categoría.
     * @param options         Opciones de optimización y validación.
     */
    public Map<String, String> uploadPrivateMultipartFile(UUID companyId, String category, String prefix,
            MultipartFile file, boolean replaceExisting, FileOptionsDto options) {
        try {
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File is empty");
            }

            String originalName = file.getOriginalFilename();
            String contentType = file.getContentType();
            String extension = "";
            if (originalName != null && originalName.contains(".")) {
                extension = originalName.substring(originalName.lastIndexOf("."));
            }

            byte[] bytes = file.getBytes();

            // Validar límites de tamaño
            if (options != null && options.getMaxFileSize() != null) {
                if (bytes.length > options.getMaxFileSize()) {
                    throw new IllegalArgumentException(String.format(
                            "El archivo excede el tamaño máximo permitido de %d bytes", options.getMaxFileSize()));
                }
            }

            // Procesar imagen si se especifican dimensiones y es una imagen
            if (options != null && (options.getMaxWidth() != null || options.getMaxHeight() != null)
                    && contentType != null && contentType.startsWith("image/")) {
                bytes = processImage(bytes, contentType, options);
            }

            // CAPA EXTRA: Malware Scanning
            if (!antiMalwareService.isClean(new ByteArrayInputStream(bytes))) {
                throw new RuntimeException(
                        "Seguridad: Se ha detectado una amenaza potencial en el archivo. Carga cancelada.");
            }

            // Standard Naming: {prefix}_{uuid}{extension}
            String fileId = UUID.randomUUID().toString();
            String fileName = String.format("%s_%s%s", prefix, fileId, extension);

            // Standard Path: companies/{companyId}/{category}/{fileName}
            String folderPath = String.format("companies/%s/%s/", companyId, category);
            String path = folderPath + fileName;

            // Si replaceExisting es true, eliminar archivos anteriores con el mismo prefijo
            if (replaceExisting) {
                deletePrivateFilesByPrefix(folderPath, prefix);
            }

            // Perform low-level upload
            this.uploadPrivateFile(path, new ByteArrayInputStream(bytes), bytes.length, contentType);

            // Resource URL for the frontend - MUST start with /company/ to be handled by
            // PrivateAssetsController
            String apiUrl = String.format("/api/private/assets/company/%s/%s/%s", companyId, category, fileName);

            return Map.of(
                    "path", path,
                    "url", apiUrl,
                    "fileName", fileName);
        } catch (Exception e) {
            throw new RuntimeException("Error processing multipart upload: " + e.getMessage(), e);
        }
    }

    /**
     * Versión con replaceExisting pero sin opciones.
     */
    public Map<String, String> uploadPrivateMultipartFile(UUID companyId, String category, String prefix,
            MultipartFile file, boolean replaceExisting) {
        return uploadPrivateMultipartFile(companyId, category, prefix, file, replaceExisting, null);
    }

    /**
     * Versión legacy para compatibilidad.
     */
    public Map<String, String> uploadPrivateMultipartFile(UUID companyId, String category, String prefix,
            MultipartFile file) {
        return uploadPrivateMultipartFile(companyId, category, prefix, file, false, null);
    }

    /**
     * Generic method to process and upload a private file from base64 string.
     * Useful for wizard-style uploads where the file is part of a JSON DTO.
     */
    public Map<String, String> uploadPrivateBase64(UUID companyId, String category, String prefix, String base64Data) {
        try {
            if (base64Data == null || !base64Data.contains("base64,")) {
                throw new IllegalArgumentException("Invalid base64 data format");
            }

            String[] parts = base64Data.split(",");
            String header = parts[0];
            String content = parts[1];

            String contentType = header.substring(header.indexOf(":") + 1, header.indexOf(";"));
            String extension = "." + contentType.substring(contentType.lastIndexOf("/") + 1);

            byte[] bytes = java.util.Base64.getDecoder().decode(content);
            InputStream inputStream = new java.io.ByteArrayInputStream(bytes);

            // CAPA EXTRA: Malware Scanning
            if (!antiMalwareService.isClean(new java.io.ByteArrayInputStream(bytes))) {
                throw new RuntimeException("Seguridad: Se ha detectado una amenaza potencial en el archivo.");
            }

            String fileId = UUID.randomUUID().toString();
            String fileName = String.format("%s_%s%s", prefix, fileId, extension);

            // Standard Path: companies/{companyId}/{category}/{fileName}
            String path = String.format("companies/%s/%s/%s", companyId, category, fileName);

            this.uploadPrivateFile(path, inputStream, bytes.length, contentType);

            // Resource URL for the frontend - MUST start with /company/ to be handled by
            // PrivateAssetsController
            String apiUrl = String.format("/api/private/assets/company/%s/%s/%s", companyId, category, fileName);

            return Map.of(
                    "path", path,
                    "url", apiUrl,
                    "fileName", fileName);
        } catch (Exception e) {
            throw new RuntimeException("Error processing base64 upload: " + e.getMessage(), e);
        }
    }

    /**
     * Advanced method for employee-specific storage following the
     * folder-per-employee standard.
     * Path: companies/{companyId}/employees/{employeeId}/{category}/{fileName}
     * 
     * @param replaceExisting Si es true, elimina archivos anteriores con el mismo
     *                        prefijo antes de subir.
     *                        Útil para fotos de perfil donde solo debe existir una
     *                        versión.
     *                        Si es false, mantiene histórico (útil para documentos,
     *                        contratos, etc.)
     * @param options         Opciones de procesamiento (redimensionamiento, límite
     *                        de tamaño).
     */
    public String uploadEmployeeFile(UUID companyId, UUID employeeId, String category, String prefix,
            String base64Data, boolean replaceExisting, FileOptionsDto options) {
        try {
            if (base64Data == null || !base64Data.contains("base64,"))
                return base64Data; // Return as is if not base64

            String[] parts = base64Data.split(",");
            String header = parts[0];
            String content = parts[1];

            String contentType = header.substring(header.indexOf(":") + 1, header.indexOf(";"));
            String extension = "." + contentType.substring(contentType.lastIndexOf("/") + 1);
            if (extension.equals(".jpeg"))
                extension = ".jpg"; // Normalization

            byte[] bytes = java.util.Base64.getDecoder().decode(content);

            // Validar límites de tamaño si se especifican
            if (options != null && options.getMaxFileSize() != null) {
                if (bytes.length > options.getMaxFileSize()) {
                    throw new IllegalArgumentException(String.format(
                            "El archivo excede el tamaño máximo permitido de %d bytes", options.getMaxFileSize()));
                }
            }

            // Procesar imagen si se especifican dimensiones y es una imagen
            if (options != null && (options.getMaxWidth() != null || options.getMaxHeight() != null)
                    && contentType.startsWith("image/")) {
                bytes = processImage(bytes, contentType, options);
            }

            // Malware Scanning
            if (!antiMalwareService.isClean(new java.io.ByteArrayInputStream(bytes))) {
                throw new RuntimeException("Seguridad: Amenaza detectada en el archivo.");
            }

            String fileName = String.format("%s%s", prefix, extension);
            String folderPath = String.format("companies/%s/employees/%s/%s/", companyId, employeeId, category);
            String path = folderPath + fileName;

            // Si replaceExisting es true, eliminar archivos anteriores con el mismo prefijo
            if (replaceExisting) {
                deletePrivateFilesByPrefix(folderPath, prefix);
            }

            this.uploadPrivateFile(path, new java.io.ByteArrayInputStream(bytes), bytes.length, contentType);

            return String.format("/api/private/assets/%s", path.replace("companies/", "company/")); // Adjust URL format
        } catch (Exception e) {
            throw new RuntimeException("Error uploading employee asset: " + e.getMessage(), e);
        }
    }

    /**
     * Versión con replaceExisting pero sin opciones específicas
     */
    public String uploadEmployeeFile(UUID companyId, UUID employeeId, String category, String prefix,
            String base64Data, boolean replaceExisting) {
        return uploadEmployeeFile(companyId, employeeId, category, prefix, base64Data, replaceExisting, null);
    }

    /**
     * Versión legacy sin parámetro replaceExisting (por defecto false para mantener
     * compatibilidad)
     */
    public String uploadEmployeeFile(UUID companyId, UUID employeeId, String category, String prefix,
            String base64Data) {
        return uploadEmployeeFile(companyId, employeeId, category, prefix, base64Data, false, null);
    }

    /**
     * Procesa una imagen para redimensionarla manteniendo la relación de aspecto.
     */
    private byte[] processImage(byte[] imageBytes, String contentType, FileOptionsDto options) throws Exception {
        BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageBytes));
        if (originalImage == null)
            return imageBytes;

        int type = originalImage.getType() == 0 ? BufferedImage.TYPE_INT_ARGB : originalImage.getType();

        int targetWidth = originalImage.getWidth();
        int targetHeight = originalImage.getHeight();

        // Calcular nuevas dimensiones manteniendo aspect ratio
        if (options.getMaxWidth() != null && targetWidth > options.getMaxWidth()) {
            targetHeight = (int) (targetHeight * ((double) options.getMaxWidth() / targetWidth));
            targetWidth = options.getMaxWidth();
        }
        if (options.getMaxHeight() != null && targetHeight > options.getMaxHeight()) {
            targetWidth = (int) (targetWidth * ((double) options.getMaxHeight() / targetHeight));
            targetHeight = options.getMaxHeight();
        }

        BufferedImage resizedImage = new BufferedImage(targetWidth, targetHeight, type);
        Graphics2D g = resizedImage.createGraphics();

        // Calidad de renderizado
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        g.drawImage(originalImage, 0, 0, targetWidth, targetHeight, null);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        String formatName = contentType.substring(contentType.lastIndexOf("/") + 1);
        ImageIO.write(resizedImage, formatName, baos);

        return baos.toByteArray();
    }

    private boolean isAllowedAsset(String fileName) {

        return fileName.endsWith(".png") || fileName.endsWith(".jpg") ||
                fileName.endsWith(".jpeg") || fileName.endsWith(".gif") ||
                fileName.endsWith(".webp") || fileName.endsWith(".mp3");
    }
}
