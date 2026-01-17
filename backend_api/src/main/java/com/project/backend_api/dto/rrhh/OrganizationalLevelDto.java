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
public class OrganizationalLevelDto {
    private UUID id;
    private String name;
    private String description;
    private Integer hierarchyOrder;
    private Boolean active;
}
