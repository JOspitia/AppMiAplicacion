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
public class PositionExperienceDto {
    private UUID id;
    private String area;
    private Integer minYears;
    private Integer maxYears;
    private Boolean isMandatory;
    private String description;
    private Integer displayOrder;
}
