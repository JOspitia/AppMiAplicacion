package com.project.backend_api.dto.core.management;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDto {
    // Basic Information
    private UUID id;
    @NotBlank
    @Size(max = 255)
    private String name; // Nombre Comercial
    @Size(max = 50)
    private String nit;

    // Business Information
    @Size(max = 255)
    private String legalName; // Razón Social
    private UUID entityTypeId;
    private String entityTypeName; // For display purposes
    private UUID sectorId; // Sector Económico
    private String sectorName; // For display
    private String otherSector; // Otro sector (cuando sector = "Otro")
    private String description;

    // Contact Information
    @Email
    @Size(max = 255)
    private String notificationEmail; // Email institucional
    @Size(max = 20)
    private String mainPhone; // Teléfono fijo / Conmutador
    @Size(max = 20)
    private String mobilePhone; // Teléfono celular
    @Size(max = 10)
    private String phoneExtension; // Código de país

    // Address Information
    private UUID countryId;
    private String countryName;
    private UUID stateId;
    private String stateName;
    private UUID cityId;
    private String cityName;
    @Size(max = 255)
    private String streetAddress;
    private String postalCode;

    // Websites
    private List<CompanyWebsiteDTO> websites;

    // Branding
    private String logoUrl;
    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Color debe ser un formato Hexadecimal válido (#RRGGBB)")
    private String primaryColor; // #RRGGBB

    // Operational Parameters
    private String allowedDomain;

    // Calculated/Display Fields
    private Long activeEmployeeCount; // Calculated: count of active employees

    // Subscription & Status
    private LocalDateTime trialEndsAt;
    private LocalDateTime subscriptionEndsAt;
    private Boolean subscriptionNotificationPending;
    private Boolean status;

    // Audit Information
    private UUID createdById;
    private String createdByName;
    private UUID updatedById;
    private String updatedByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}





