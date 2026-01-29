package com.project.backend_api.model.rrhh;

import com.project.backend_api.model.core.AuditableEntity;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.core.management.User;
import com.project.backend_api.model.core.administration.City;
import com.project.backend_api.model.core.administration.Country;
import com.project.backend_api.model.core.administration.State;
import com.project.backend_api.model.core.administration.Gender;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "employees", schema = "business_rrhh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    // --- Personal Information ---

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName; // Nombres

    @Column(name = "second_name", length = 100)
    private String secondName;

    @Column(name = "first_last_name", nullable = false, length = 100)
    private String firstLastName;

    @Column(name = "second_last_name", length = 100)
    private String secondLastName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "identification_type_id")
    private IdentificationType identificationTypeEntity;

    @Column(name = "identification_number", nullable = false, length = 50)
    private String identificationNumber;

    @Column(name = "identification_issue_date")
    private LocalDate identificationIssueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "identification_issue_country_id")
    private Country identificationIssueCountry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "identification_issue_state_id")
    private State identificationIssueState;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "identification_issue_place_id")
    private City identificationIssuePlace;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "birth_country_id")
    private Country birthCountry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "birth_state_id")
    private State birthState;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "birth_place_id")
    private City birthPlace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gender_id")
    private Gender gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "marital_status_id")
    private MaritalStatus maritalStatusEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "nationality_id")
    private Country nationality;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blood_type_id")
    private BloodType bloodTypeEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rh_factor_id")
    private RhFactor rhFactorEntity;

    @Column(name = "photo_url")
    private String photoUrl;

    // --- Contact Information ---

    @Column(name = "email_personal", length = 150)
    private String emailPersonal;

    @Column(name = "email_corporate", length = 150)
    private String emailCorporate;

    @Column(name = "phone_mobile", length = 20)
    private String phoneMobile;

    @Column(name = "phone_home", length = 20)
    private String phoneHome;

    @Column(name = "phone_alternate", length = 30)
    private String phoneAlternate;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "residence_neighborhood", length = 150)
    private String residenceNeighborhood;

    // Residence Location
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residence_country_id")
    private Country residenceCountry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residence_state_id")
    private State residenceState;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "residence_city_id")
    private City residenceCity;

    // --- Emergency Contact ---
    // Legacy columns removed as they don't exist in DB.
    // Uses OneToMany relationship below.

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EmployeeEmergencyContact> emergencyContacts = new ArrayList<>();

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EmployeeFamilyMember> familyNucleus = new ArrayList<>();

    // --- Work Experience ---
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EmployeeWorkExperience> workExperiences = new ArrayList<>();

    // --- Education History ---
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EmployeeEducation> educations = new ArrayList<>();

    // --- References ---
    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<EmployeeReference> references = new ArrayList<>();

    // --- Additional / Dotation ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shirt_size_id")
    private ClothingSize shirtSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pants_size_id")
    private ClothingSize pantsSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shoe_size_id")
    private ClothingSize shoeSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "education_level_id")
    private EducationLevel educationLevel;

    @Column(name = "socioeconomic_stratum")
    private String socioeconomicStratum;

    @Column(name = "military_status")
    private String militaryStatus;

    @Column(name = "is_pep")
    @Builder.Default
    private Boolean isPep = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "experience_range_id")
    private ExperienceRange experienceRangeEntity;

    @Column(name = "position_applied", length = 150)
    private String positionApplied;

    // --- Financial ---
    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "bank_account_type", length = 50)
    private String bankAccountType;

    @Column(name = "bank_account_number", length = 50)
    private String bankAccountNumber;

    @Builder.Default
    private Boolean active = true;

    // Helpers
    public void addEmergencyContact(EmployeeEmergencyContact contact) {
        emergencyContacts.add(contact);
        contact.setEmployee(this);
    }

    public void removeEmergencyContact(EmployeeEmergencyContact contact) {
        emergencyContacts.remove(contact);
        contact.setEmployee(null);
    }

    public void addFamilyMember(EmployeeFamilyMember member) {
        familyNucleus.add(member);
        member.setEmployee(this);
    }

    public void removeFamilyMember(EmployeeFamilyMember member) {
        familyNucleus.remove(member);
        member.setEmployee(null);
    }

    public void addWorkExperience(EmployeeWorkExperience experience) {
        workExperiences.add(experience);
        experience.setEmployee(this);
    }

    public void removeWorkExperience(EmployeeWorkExperience experience) {
        workExperiences.remove(experience);
        experience.setEmployee(null);
    }

    public void addEducation(EmployeeEducation education) {
        educations.add(education);
        education.setEmployee(this);
    }

    public void removeEducation(EmployeeEducation education) {
        educations.remove(education);
        education.setEmployee(null);
    }

    public void addReference(EmployeeReference reference) {
        references.add(reference);
        reference.setEmployee(this);
    }

    public void removeReference(EmployeeReference reference) {
        references.remove(reference);
        reference.setEmployee(null);
    }

    @PrePersist
    protected void onCreate() {
        if (active == null) {
            active = true;
        }
        if (isPep == null) {
            isPep = false;
        }
    }
}
