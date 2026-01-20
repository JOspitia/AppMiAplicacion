package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.AuditableEntity;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.core.management.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Table(name = "employees", schema = "business_rrhh")
public class Employee extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "identification_type")
    private String identificationType;

    @Column(name = "identification_number", nullable = false)
    private String identificationNumber;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    private String gender;

    @Column(name = "marital_status")
    private String maritalStatus;

    @Column(name = "email_personal")
    private String emailPersonal;

    @Column(name = "email_corporate")
    private String emailCorporate;

    @Column(name = "phone_mobile")
    private String phoneMobile;

    @Column(name = "phone_home")
    private String phoneHome;

    private String address;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bank_account_type")
    private String bankAccountType;

    @Column(name = "bank_account_number")
    private String bankAccountNumber;

    @Column(name = "photo_url")
    private String photoUrl;

    @Builder.Default
    private Boolean active = true;
}
