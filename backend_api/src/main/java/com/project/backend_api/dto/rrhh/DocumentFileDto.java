package com.project.backend_api.dto.rrhh;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentFileDto {
    private UUID documentTypeId;
    private MultipartFile file;
    private LocalDate expirationDate;
    private boolean isUnified;
}
