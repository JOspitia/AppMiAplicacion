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
public class PositionSkillDto {
    private UUID id;
    private String skillName;
    private UUID skillLevelId;
    private String skillLevelName; // Display helper
    private Boolean isMandatory;
    private String description;
    private Integer displayOrder;
}
