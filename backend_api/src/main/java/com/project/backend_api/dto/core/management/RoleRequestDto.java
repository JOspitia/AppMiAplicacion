package com.project.backend_api.dto.core.management;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleRequestDto {
    private UUID id;
    private String name;
    private String description;
    private Boolean isAdminRole;
    private Boolean isRootRole;
    private Set<UUID> permissionIds;
}
