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
public class PositionRequirementDto {
    private UUID id;
    private String requirementType; // EDUCATION, CERTIFICATION, LICENSE, OTHER
    private String description;
    private Boolean isMandatory;
    private Integer displayOrder;
}
