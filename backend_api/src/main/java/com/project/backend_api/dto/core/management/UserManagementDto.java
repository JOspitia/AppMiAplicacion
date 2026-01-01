package com.project.backend_api.dto.core.management;




import lombok.Builder;
import java.util.List;
import java.util.UUID;
import java.time.LocalDateTime;

@Builder
public record UserManagementDto(
                UUID id, // UserCompanyRole ID (primary assignment)
                UUID userId,
                String username,
                String email,
                String firstName,
                String firstSurname,
                String secondSurname,
                List<String> roleNames,
                List<UUID> roleIds,
                Boolean verified,
                Boolean active,
                LocalDateTime createdAt) {
}






