package com.project.backend_api.dto.core.management;



import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;
import java.util.UUID;

public record CreateUserRequest(
                @NotBlank String username,
                @NotBlank @Email String email,
                @NotBlank String firstName,
                @NotBlank String firstSurname,
                String secondSurname,
                @NotNull @NotEmpty List<UUID> roleIds,
                Boolean active) {
}





