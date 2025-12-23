package com.project.backend_api.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users", schema = "security")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "first_surname", nullable = false)
    private String firstSurname;

    @Column(name = "second_surname")
    private String secondSurname;

    @Column(name = "is_super_admin", nullable = false)
    @Builder.Default
    private Boolean isSuperAdmin = false;

    @Builder.Default
    private Boolean verified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gender_id")
    private Gender gender;

    @Column(name = "date_of_birth")
    private java.time.LocalDate dateOfBirth;

    private Integer age;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "phone_extension")
    private String phoneExtension;

    private String address;
    private String city;
    private String country;
    private String department;

    @Column(name = "pending_email")
    private String pendingEmail;

    @Column(name = "pending_email_token")
    private String pendingEmailToken;

    @Column(name = "password_expiry_date")
    private LocalDateTime passwordExpiryDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
