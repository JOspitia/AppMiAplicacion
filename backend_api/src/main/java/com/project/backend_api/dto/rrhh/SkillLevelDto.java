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
public class SkillLevelDto {
    private UUID id;
    private String name;
    private String code;
    private String description;
    private Integer weight;
    private Boolean active;
}
