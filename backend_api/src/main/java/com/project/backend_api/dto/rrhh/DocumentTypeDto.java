package com.project.backend_api.dto.rrhh;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentTypeDto {
    private UUID id;
    private String name;
    private String code;

    // Categoría
    private UUID categoryId;
    private String categoryName;

    private Boolean isRequired;
    private Boolean requiresExpiration;
    private Boolean active;
}
