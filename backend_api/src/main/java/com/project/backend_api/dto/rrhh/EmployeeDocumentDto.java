package com.project.backend_api.dto.rrhh;

import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDocumentDto {
    private UUID id;
    private UUID documentTypeId;
    private String documentTypeName;
    private String fileName;
    private LocalDate expirationDate;
    private boolean isUnified;
}
