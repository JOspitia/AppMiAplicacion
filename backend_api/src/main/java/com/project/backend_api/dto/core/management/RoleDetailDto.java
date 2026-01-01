package com.project.backend_api.dto.core.management;

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
public class RoleDetailDto {
    private RoleDto role;
    private List<UUID> assignedPermissionIds;
}
