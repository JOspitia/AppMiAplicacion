package com.project.backend_api.dto.core.administration;



import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record LoginRequest(
                @NotBlank String username,
                @NotBlank String password,
                UUID companyId,
                String clientHash) {
}



