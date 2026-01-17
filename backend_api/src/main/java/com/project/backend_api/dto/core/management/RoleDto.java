package com.project.backend_api.dto.core.management;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDto {
    private UUID id;
    private String name;
    private String description;
    private Boolean isSystemRole;
    private Boolean isAdminRole;
    private Boolean isRootRole;
    private Boolean active;
    private LocalDateTime createdAt;
    private Integer permissionCount;
}
