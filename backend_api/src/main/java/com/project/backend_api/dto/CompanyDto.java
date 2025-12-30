package com.project.backend_api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String name; // Nombre Comercial
    private String nit;

    // Business Information
    private String legalName; // Razón Social
    private UUID entityTypeId;
    private String entityTypeName; // For display purposes
    private UUID sectorId; // Sector Económico
    private String sectorName; // For display
    private String otherSector; // Otro sector (cuando sector = "Otro")
    private String description;

    // Contact Information
    private String notificationEmail; // Email institucional
    private String mainPhone; // Teléfono fijo / Conmutador
    private String mobilePhone; // Teléfono celular
    private String phoneExtension; // Código de país

    // Address Information
    private UUID countryId;
    private String countryName;
    private UUID stateId;
    private String stateName;
    private UUID cityId;
    private String cityName;
    private String streetAddress;
    private String postalCode;

    // Websites
    private List<CompanyWebsiteDTO> websites;

    // Branding
    private String logoUrl;
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
