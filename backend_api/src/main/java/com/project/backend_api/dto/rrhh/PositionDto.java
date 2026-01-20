package com.project.backend_api.dto.rrhh;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionDto {
    private UUID id;
    private String name;
    private String code;
    private String description;

    // Salary range
    private BigDecimal minSalary;
    private BigDecimal maxSalary;
    private String riskLevel;

    // Relations - IDs
    private UUID departmentId;
    private UUID organizationalLevelId;
    private UUID currencyId;

    // Display helpers (Read-only)
    private String departmentName;
    private String departmentCode;
    private String organizationalLevelName;
    private String currencyCode;
    private String currencySymbol;

    // Nested collections
    @Builder.Default
    private List<PositionFunctionDto> functions = new ArrayList<>();

    @Builder.Default
    private List<PositionSkillDto> skills = new ArrayList<>();

    @Builder.Default
    private List<PositionRequirementDto> requirements = new ArrayList<>();

    @Builder.Default
    private List<PositionExperienceDto> experiences = new ArrayList<>();

    private Boolean active;
}
