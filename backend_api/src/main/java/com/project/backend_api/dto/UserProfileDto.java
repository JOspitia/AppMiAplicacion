package com.project.backend_api.dto;

import lombok.Builder;
import java.util.UUID;

@Builder
public record UserProfileDto(
        UUID id,
        String username,
        String email,
        String firstName,
        String firstSurname,
        String secondSurname,
        String phoneNumber,
        String phoneExtension,
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
