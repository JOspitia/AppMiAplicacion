package com.project.backend_api.dto.core.management;




import lombok.Builder;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import java.util.UUID;

@Builder
public record UserProfileDto(
                UUID id,
                String username,
                @Email @Size(max = 100) String email,
                @NotBlank @Size(max = 50) String firstName,
                @NotBlank @Size(max = 50) String firstSurname,
                @Size(max = 50) String secondSurname,
                @Size(max = 20) String phoneNumber,
                @Size(max = 10) String phoneExtension,
                String address,
                String country,
                String department,
                String city,
                UUID genderId,
                String genderName,
                java.time.LocalDate dateOfBirth,
                Integer age,
                String pendingEmail,
                Boolean isSuperAdmin,
                Boolean verified) {
}






