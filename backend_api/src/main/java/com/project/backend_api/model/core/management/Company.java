package com.project.backend_api.model.core.management;

import com.project.backend_api.model.core.AuditableEntity;
import com.project.backend_api.model.core.administration.City;
import com.project.backend_api.model.core.administration.State;
import com.project.backend_api.model.core.administration.Country;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "companies", schema = "security")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
public class Company extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Basic Information
    @Column(nullable = false, unique = true)
    private String name; // Nombre Comercial

    @Column(unique = true)
    private String nit;

    // Business Information
    @Column(name = "legal_name")
    private String legalName; // Razón Social

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entity_type_id")
    private EntityType entityType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sector_id")
    private EconomicSector sector; // Sector Económico

    @Column(name = "other_sector")
    private String otherSector; // Otro sector (cuando sector = "Otro")

    @Column(columnDefinition = "TEXT")
    private String description; // Descripción de la empresa

    // Contact Information
    @Column(name = "notification_email")
    private String notificationEmail; // Email institucional

    @Column(name = "main_phone")
    private String mainPhone; // Teléfono fijo / Conmutador

    @Column(name = "mobile_phone")
    private String mobilePhone; // Teléfono celular

    @Column(name = "phone_extension")
    private String phoneExtension; // Extensión telefónica (código de país)

    // Address Information (detailed with geography)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id")
    private Country country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id")
    private State state;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id")
    private City city;

    @Column(name = "street_address")
    private String streetAddress; // Dirección completa de la calle

    @Column(name = "postal_code")
    private String postalCode;

    // Websites (one-to-many relationship)
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<CompanyWebsite> websites = new ArrayList<>();

    // Branding
    @Column(name = "logo_url", length = 500)
    private String logoUrl; // URL en MinIO

    @Column(name = "primary_color", length = 7)
    private String primaryColor; // Color primario en formato #RRGGBB

    // Operational Parameters
    @Column(name = "allowed_domain")
    private String allowedDomain; // Dominio permitido (ej: miempresa.com)

    // Subscription & Trial
    @Column(name = "trial_ends_at")
    private LocalDateTime trialEndsAt;

    @Column(name = "subscription_ends_at")
    private LocalDateTime subscriptionEndsAt;

    @Column(name = "subscription_notification_pending")
    @Builder.Default
    private Boolean subscriptionNotificationPending = false;

    @Builder.Default
    private Boolean status = true;

    // Soft Delete (separate from standard audit)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private User deletedBy;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Helper methods for managing websites
    public void addWebsite(CompanyWebsite website) {
        websites.add(website);
        website.setCompany(this);
    }

    public void removeWebsite(CompanyWebsite website) {
        websites.remove(website);
        website.setCompany(null);
    }
}
