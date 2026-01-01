package com.project.backend_api.dto.core.administration;



import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
                @NotBlank @Size(min = 4, max = 50) String username,
                @NotBlank @Email @Size(max = 100) String email,
                @NotBlank @Size(max = 50) String firstName,
                @NotBlank @Size(max = 50) String firstSurname,
                String secondSurname,
                @NotBlank @Size(min = 8, max = 100) String password) {
}



