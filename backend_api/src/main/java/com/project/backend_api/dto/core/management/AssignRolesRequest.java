package com.project.backend_api.dto.core.management;



import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public record AssignRolesRequest(
        @NotNull UUID userId,
        @NotNull UUID companyId,
        @NotNull @NotEmpty List<UUID> roleIds) {
}





