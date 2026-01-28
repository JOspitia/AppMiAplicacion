package com.project.backend_api.dto.rrhh;

import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeePersonalStepDto {
    private UUID id;

    // Basic Info
    private String firstName;
    private String secondName;
    private String lastName;
    private String firstLastName;
    private String secondLastName;

    private UUID identificationTypeId;
    private String identificationNumber;
    private LocalDate identificationIssueDate;
    private UUID identificationIssueCountryId;
    private UUID identificationIssueStateId;
    private UUID identificationIssuePlaceId;

    // Birth
    private LocalDate birthDate;
    private UUID birthCountryId;
    private UUID birthStateId;
    private UUID birthPlaceId;
    private UUID genderId; // FK

    // Demographics
    private UUID maritalStatusId;
    private UUID nationalityId;
    private UUID bloodTypeId;
    private UUID rhFactorId;
    private String photoUrl;

    // Contact
    private String emailPersonal;
    private String emailCorporate;
    private String phoneMobile;
    private String phoneHome;
    private String phoneAlternate;
    private String address;
    private String residenceNeighborhood;

    // Residence
    private UUID residenceCountryId;
    private UUID residenceStateId;
    private UUID residenceCityId;

    // Emergency
    private List<EmployeeEmergencyContactDto> emergencyContacts; // Nested List

    // Bank
    private String bankName;
    private String bankAccountType;
    private String bankAccountNumber;

    // Additional
    private UUID shirtSizeId;
    private UUID pantsSizeId;
    private UUID shoeSizeId;
    private UUID educationLevelId;
    private String socioeconomicStratum;
    private String militaryStatus;
    private Boolean isPep;
    private UUID experienceRangeId;
    private String positionApplied;

    // Family
    private List<EmployeeFamilyMemberDto> familyNucleus;

    // Work Experience
    private List<EmployeeWorkExperienceDto> workExperiences;

    // Education
    private List<EmployeeEducationDto> educations;

    private Boolean active;
}
