package com.project.backend_api.dto.rrhh;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentDto {
    private UUID id;
    private String name;
    private String code;
    private String description;

    // Relations - IDs
    private UUID parentId;
    private UUID costCenterId;
    private UUID organizationalLevelId;
    private UUID managerPositionId;
    private List<UUID> locationIds;

    // Display helpers (Read-only usually)
    private String parentName;
    private String costCenterName;
    private String organizationalLevelName;

    private Boolean active;
}
