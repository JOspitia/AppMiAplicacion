package com.project.project.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "companies", schema = "security")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String nit;

    @Column(name = "email_extension")
    private String emailExtension;

    @Column(name = "business_name")
    private String businessName;

    @Column(name = "sector")
    private String sector;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sector_id")
    private EconomicSector economicSector;

    @Column(name = "other_sector")
    private String otherSector;

    @Column(name = "employee_count")
    private String employeeCount;

    private String address;
    private String phone;

    @Column(name = "trial_ends_at")
    private LocalDateTime trialEndsAt;

    @Column(name = "subscription_ends_at")
    private LocalDateTime subscriptionEndsAt;

    @Column(name = "subscription_notification_pending")
    @Builder.Default
    private Boolean subscriptionNotificationPending = false;

    @Builder.Default
    private Boolean status = true;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
