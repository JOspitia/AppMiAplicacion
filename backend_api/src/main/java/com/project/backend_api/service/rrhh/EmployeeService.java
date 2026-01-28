package com.project.backend_api.service.rrhh;

import com.project.backend_api.dto.rrhh.*;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.rrhh.*;

import com.project.backend_api.repository.rrhh.*;

import com.project.backend_api.repository.core.administration.*;
import com.project.backend_api.service.core.AuthService;
import com.project.backend_api.service.core.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final ClothingSizeRepository clothingSizeRepository;

    private final EducationLevelRepository educationLevelRepository;
    private final GenderRepository genderRepository;
    private final IdentificationTypeRepository identificationTypeRepository;
    private final AuthService authService;

    // Repositories for referencing entities - assuming they exist in
    // core/administration
    // If not, we might need to use simple referencing or add them
    private final CountryRepository countryRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;
    private final MinioService minioService;
    private final RelationshipRepository relationshipRepository;
    private final OccupationRepository occupationRepository;
    private final MaritalStatusRepository maritalStatusRepository;
    private final BloodTypeRepository bloodTypeRepository;
    private final RhFactorRepository rhFactorRepository;
    private final ExperienceRangeRepository experienceRangeRepository;

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    public List<EmployeeListDto> getAll() {
        return employeeRepository.findByCompanyId(getCurrentCompanyId()).stream()
                .map(this::toListDto)
                .collect(Collectors.toList());
    }

    public EmployeePersonalStepDto getPersonalData(UUID id) {
        Employee employee = findByIdAndCompany(id);
        return toPersonalStepDto(employee);
    }

    @Transactional
    public EmployeePersonalStepDto createStep1(EmployeePersonalStepDto dto) {
        UUID companyId = getCurrentCompanyId();

        // Validate unique identification
        if (employeeRepository.existsByCompanyIdAndIdentificationNumber(companyId, dto.getIdentificationNumber())) {
            throw new IllegalArgumentException("Ya existe un empleado con este número de identificación.");
        }

        // Validate unique corporate email if present
        if (dto.getEmailCorporate() != null && !dto.getEmailCorporate().isEmpty()) {
            if (employeeRepository.existsByCompanyIdAndEmailCorporate(companyId, dto.getEmailCorporate())) {
                throw new IllegalArgumentException("Ya existe un empleado con este correo corporativo.");
            }
        }

        Employee employee = new Employee();
        employee.setCompany(Company.builder().id(companyId).build());
        employee.setActive(true);

        updatePersonalDataFromDto(employee, dto);

        Employee saved = employeeRepository.save(employee);

        // Second pass: now we have the ID, handle photo and collections
        updatePersonalDataFromDto(saved, dto);
        updateEmergencyContacts(saved, dto.getEmergencyContacts());
        updateFamilyNucleus(saved, dto.getFamilyNucleus());
        updateWorkExperiences(saved, dto.getWorkExperiences());
        updateEducations(saved, dto.getEducations());

        saved = employeeRepository.save(saved);

        return toPersonalStepDto(saved);
    }

    @Transactional
    public EmployeePersonalStepDto updateStep1(UUID id, EmployeePersonalStepDto dto) {
        Employee employee = findByIdAndCompany(id);

        // Update basic info
        updatePersonalDataFromDto(employee, dto);

        // Update collections
        updateEmergencyContacts(employee, dto.getEmergencyContacts());
        updateFamilyNucleus(employee, dto.getFamilyNucleus());
        updateWorkExperiences(employee, dto.getWorkExperiences());
        updateEducations(employee, dto.getEducations());

        Employee saved = employeeRepository.save(employee);
        return toPersonalStepDto(saved);
    }

    @Transactional
    public void toggleActive(UUID id) {
        Employee employee = findByIdAndCompany(id);
        employee.setActive(!employee.getActive());
        employeeRepository.save(employee);
    }

    private Employee findByIdAndCompany(UUID id) {
        return employeeRepository.findByIdAndCompanyId(id, getCurrentCompanyId())
                .orElseThrow(() -> new RuntimeException("Empleado no encontrado"));
    }

    private void updatePersonalDataFromDto(Employee employee, EmployeePersonalStepDto dto) {
        employee.setFirstName(dto.getFirstName());
        employee.setSecondName(dto.getSecondName());

        // Map legacy/frontend 'lastName' to firstLastName if explicit firstLastName is
        // missing
        String fLastName = dto.getFirstLastName();
        if (fLastName == null || fLastName.trim().isEmpty()) {
            fLastName = dto.getLastName();
        }
        employee.setFirstLastName(fLastName);
        employee.setSecondLastName(dto.getSecondLastName());

        if (dto.getIdentificationTypeId() != null) {
            IdentificationType it = identificationTypeRepository.findById(dto.getIdentificationTypeId()).orElse(null);
            employee.setIdentificationTypeEntity(it);
        }
        employee.setIdentificationNumber(dto.getIdentificationNumber());
        employee.setIdentificationIssueDate(dto.getIdentificationIssueDate());

        if (dto.getIdentificationIssueCountryId() != null) {
            employee.setIdentificationIssueCountry(
                    countryRepository.findById(dto.getIdentificationIssueCountryId()).orElse(null));
        }
        if (dto.getIdentificationIssueStateId() != null) {
            employee.setIdentificationIssueState(
                    stateRepository.findById(dto.getIdentificationIssueStateId()).orElse(null));
        }
        if (dto.getIdentificationIssuePlaceId() != null) {
            employee.setIdentificationIssuePlace(
                    cityRepository.findById(dto.getIdentificationIssuePlaceId()).orElse(null));
        }

        employee.setBirthDate(dto.getBirthDate());
        if (dto.getBirthCountryId() != null) {
            employee.setBirthCountry(countryRepository.findById(dto.getBirthCountryId()).orElse(null));
        }
        if (dto.getBirthStateId() != null) {
            employee.setBirthState(stateRepository.findById(dto.getBirthStateId()).orElse(null));
        }
        if (dto.getBirthPlaceId() != null) {
            employee.setBirthPlace(cityRepository.findById(dto.getBirthPlaceId()).orElse(null));
        }

        if (dto.getGenderId() != null) {
            employee.setGender(genderRepository.findById(dto.getGenderId()).orElse(null));
        }
        if (dto.getMaritalStatusId() != null) {
            MaritalStatus ms = maritalStatusRepository.findById(dto.getMaritalStatusId()).orElse(null);
            employee.setMaritalStatusEntity(ms);
        }

        if (dto.getBloodTypeId() != null) {
            BloodType bt = bloodTypeRepository.findById(dto.getBloodTypeId()).orElse(null);
            employee.setBloodTypeEntity(bt);
        }

        if (dto.getRhFactorId() != null) {
            RhFactor rf = rhFactorRepository.findById(dto.getRhFactorId()).orElse(null);
            employee.setRhFactorEntity(rf);
        }

        // Photo Handling: If base64, upload to MinIO in employee-specific folder
        if (dto.getPhotoUrl() != null && dto.getPhotoUrl().startsWith("data:image")) {
            // We only upload if employee already has an ID (update or second-pass in
            // create)
            if (employee.getId() != null) {
                // replaceExisting = true: elimina fotos anteriores (profile.jpg, profile.png,
                // etc.)
                // FileOptionsDto.profilePhoto(): redimensiona a 200x200 y limita a 10MB
                String newPhotoUrl = minioService.uploadEmployeeFile(
                        employee.getCompany().getId(),
                        employee.getId(),
                        "photo",
                        "profile",
                        dto.getPhotoUrl(),
                        true,
                        com.project.backend_api.dto.core.FileOptionsDto.profilePhoto());
                employee.setPhotoUrl(newPhotoUrl);
            }
            // else: photoUrl remains as base64 temporarily (will be handled in createStep1
            // second pass)
        } else {
            employee.setPhotoUrl(dto.getPhotoUrl());
        }

        // Contact
        employee.setEmailPersonal(dto.getEmailPersonal());
        employee.setEmailCorporate(dto.getEmailCorporate());
        employee.setPhoneMobile(dto.getPhoneMobile());
        employee.setPhoneHome(dto.getPhoneHome());
        employee.setPhoneAlternate(dto.getPhoneAlternate());
        employee.setAddress(dto.getAddress());
        employee.setResidenceNeighborhood(dto.getResidenceNeighborhood());

        // Residence
        if (dto.getResidenceCountryId() != null)
            employee.setResidenceCountry(countryRepository.findById(dto.getResidenceCountryId()).orElse(null));
        if (dto.getResidenceStateId() != null)
            employee.setResidenceState(stateRepository.findById(dto.getResidenceStateId()).orElse(null));
        if (dto.getResidenceCityId() != null)
            employee.setResidenceCity(cityRepository.findById(dto.getResidenceCityId()).orElse(null));

        // Additional
        if (dto.getShirtSizeId() != null)
            employee.setShirtSize(clothingSizeRepository.findById(dto.getShirtSizeId()).orElse(null));
        if (dto.getPantsSizeId() != null)
            employee.setPantsSize(clothingSizeRepository.findById(dto.getPantsSizeId()).orElse(null));
        if (dto.getShoeSizeId() != null)
            employee.setShoeSize(clothingSizeRepository.findById(dto.getShoeSizeId()).orElse(null));
        if (dto.getEducationLevelId() != null)
            employee.setEducationLevel(educationLevelRepository.findById(dto.getEducationLevelId()).orElse(null));

        employee.setSocioeconomicStratum(dto.getSocioeconomicStratum());
        employee.setMilitaryStatus(dto.getMilitaryStatus());
        employee.setIsPep(dto.getIsPep());
        if (dto.getExperienceRangeId() != null) {
            ExperienceRange er = experienceRangeRepository.findById(dto.getExperienceRangeId()).orElse(null);
            employee.setExperienceRangeEntity(er);
        }
        employee.setPositionApplied(dto.getPositionApplied());

        // Bank
        employee.setBankName(dto.getBankName());
        employee.setBankAccountType(dto.getBankAccountType());
        employee.setBankAccountNumber(dto.getBankAccountNumber());
    }

    private void updateEmergencyContacts(Employee employee, List<EmployeeEmergencyContactDto> dtos) {
        employee.getEmergencyContacts().clear();
        if (dtos != null) {
            for (EmployeeEmergencyContactDto dto : dtos) {
                EmployeeEmergencyContact contact = new EmployeeEmergencyContact();
                contact.setFirstName(dto.getFirstName());
                contact.setSecondName(dto.getSecondName());
                contact.setFirstLastName(dto.getFirstLastName());
                contact.setSecondLastName(dto.getSecondLastName());
                if (dto.getRelationshipId() != null) {
                    Relationship rel = relationshipRepository.findById(dto.getRelationshipId()).orElse(null);
                    contact.setRelationshipEntity(rel);
                    if (rel != null) {
                        contact.setRelationship(rel.getName()); // Sincronizar para evitar nulos y mantener datos
                                                                // coherentes
                    }
                }
                contact.setPhone(dto.getPhone());
                employee.addEmergencyContact(contact);
            }
        }
    }

    private void updateFamilyNucleus(Employee employee, List<EmployeeFamilyMemberDto> dtos) {
        employee.getFamilyNucleus().clear();
        if (dtos != null) {
            for (EmployeeFamilyMemberDto dto : dtos) {
                EmployeeFamilyMember member = new EmployeeFamilyMember();
                member.setFirstName(dto.getFirstName());
                member.setSecondName(dto.getSecondName());
                member.setFirstLastName(dto.getFirstLastName());
                member.setSecondLastName(dto.getSecondLastName());
                if (dto.getRelationshipId() != null) {
                    Relationship rel = relationshipRepository.findById(dto.getRelationshipId()).orElse(null);
                    member.setRelationshipEntity(rel);
                    if (rel != null) {
                        member.setRelationship(rel.getName());
                    }
                }
                member.setBirthDate(dto.getBirthDate());
                if (dto.getOccupationId() != null) {
                    Occupation occ = occupationRepository.findById(dto.getOccupationId()).orElse(null);
                    member.setOccupationEntity(occ);
                    if (occ != null) {
                        member.setOccupation(occ.getName());
                    }
                }
                member.setIsDependent(dto.getIsDependent());
                employee.addFamilyMember(member);
            }
        }
    }

    private void updateWorkExperiences(Employee employee, List<EmployeeWorkExperienceDto> dtos) {
        // We need to keep track of existing URLs if we want to avoid re-uploading the
        // same ones
        // but since we clear and re-add, we should check if the new attachmentUrl is
        // base64
        employee.getWorkExperiences().clear();
        if (dtos != null) {
            for (int i = 0; i < dtos.size(); i++) {
                EmployeeWorkExperienceDto dto = dtos.get(i);
                EmployeeWorkExperience exp = new EmployeeWorkExperience();
                exp.setCompanyName(dto.getCompanyName());
                exp.setPositionHeld(dto.getPositionHeld());
                exp.setImmediateSupervisor(dto.getImmediateSupervisor());
                exp.setCompanyPhone(dto.getCompanyPhone());
                exp.setStartDate(dto.getStartDate());
                exp.setEndDate(dto.getEndDate());
                exp.setFunctions(dto.getFunctions());

                String attachmentUrl = dto.getAttachmentUrl();
                if (attachmentUrl != null && attachmentUrl.startsWith("data:application/pdf")) {
                    // Carga de archivo con versionamiento por fecha y hora
                    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
                    // Use a more unique file name
                    String fileNamePrefix = "work_exp_" + timestamp + "_idx" + i;

                    String newUrl = minioService.uploadEmployeeFile(
                            employee.getCompany().getId(),
                            employee.getId(),
                            "work_experience",
                            fileNamePrefix,
                            attachmentUrl,
                            false // Mantiene histórico (no reemplaza)
                    );
                    exp.setAttachmentUrl(newUrl);
                } else {
                    exp.setAttachmentUrl(attachmentUrl);
                }

                employee.addWorkExperience(exp);
            }
        }
    }

    private void updateEducations(Employee employee, List<EmployeeEducationDto> dtos) {
        employee.getEducations().clear();
        if (dtos != null) {
            for (int i = 0; i < dtos.size(); i++) {
                EmployeeEducationDto dto = dtos.get(i);
                EmployeeEducation edu = new EmployeeEducation();

                if (dto.getEducationLevelId() != null) {
                    edu.setEducationLevel(educationLevelRepository.findById(dto.getEducationLevelId()).orElse(null));
                }

                edu.setInstitution(dto.getInstitution());
                edu.setTitleObtained(dto.getTitleObtained());
                edu.setCurrentSemester(dto.getCurrentSemester());
                edu.setPhone(dto.getPhone());

                if (dto.getCityId() != null) {
                    edu.setCity(cityRepository.findById(dto.getCityId()).orElse(null));
                }

                edu.setStartYear(dto.getStartYear());
                edu.setEndYear(dto.getEndYear());
                edu.setHours(dto.getHours());

                String attachmentUrl = dto.getAttachmentUrl();
                if (attachmentUrl != null && attachmentUrl.startsWith("data:application/pdf")) {
                    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
                    String fileNamePrefix = "education_" + timestamp + "_idx" + i;

                    String newUrl = minioService.uploadEmployeeFile(
                            employee.getCompany().getId(),
                            employee.getId(),
                            "education",
                            fileNamePrefix,
                            attachmentUrl,
                            false);
                    edu.setAttachmentUrl(newUrl);
                } else {
                    edu.setAttachmentUrl(attachmentUrl);
                }

                employee.addEducation(edu);
            }
        }
    }

    private EmployeeListDto toListDto(Employee e) {
        return EmployeeListDto.builder()
                .id(e.getId())
                .fullName(e.getFirstName() + " " + e.getFirstLastName()
                        + (e.getSecondLastName() != null ? " " + e.getSecondLastName() : ""))
                .identificationNumber(e.getIdentificationNumber())
                .emailCorporate(e.getEmailCorporate())
                .active(e.getActive())
                .photoUrl(e.getPhotoUrl())
                // Position/Dept are in Step 3 / JobHistory. Left blank for now or fetched if
                // needed.
                .build();
    }

    private EmployeePersonalStepDto toPersonalStepDto(Employee e) {
        return EmployeePersonalStepDto.builder()
                .id(e.getId())
                .firstName(e.getFirstName())
                .secondName(e.getSecondName())
                .lastName(e.getFirstLastName() + (e.getSecondLastName() != null ? " " + e.getSecondLastName() : ""))
                .firstLastName(e.getFirstLastName())
                .secondLastName(e.getSecondLastName())
                .identificationTypeId(
                        e.getIdentificationTypeEntity() != null ? e.getIdentificationTypeEntity().getId() : null)
                .identificationNumber(e.getIdentificationNumber())
                .identificationIssueDate(e.getIdentificationIssueDate())
                .identificationIssueCountryId(
                        e.getIdentificationIssueCountry() != null ? e.getIdentificationIssueCountry().getId() : null)
                .identificationIssueStateId(
                        e.getIdentificationIssueState() != null ? e.getIdentificationIssueState().getId() : null)
                .identificationIssuePlaceId(
                        e.getIdentificationIssuePlace() != null ? e.getIdentificationIssuePlace().getId() : null)
                .birthDate(e.getBirthDate())
                .birthCountryId(e.getBirthCountry() != null ? e.getBirthCountry().getId() : null)
                .birthStateId(e.getBirthState() != null ? e.getBirthState().getId() : null)
                .birthPlaceId(e.getBirthPlace() != null ? e.getBirthPlace().getId() : null)
                .genderId(e.getGender() != null ? e.getGender().getId() : null)
                .maritalStatusId(e.getMaritalStatusEntity() != null ? e.getMaritalStatusEntity().getId() : null)
                .nationalityId(e.getNationality() != null ? e.getNationality().getId() : null)
                .bloodTypeId(e.getBloodTypeEntity() != null ? e.getBloodTypeEntity().getId() : null)
                .rhFactorId(e.getRhFactorEntity() != null ? e.getRhFactorEntity().getId() : null)
                .photoUrl(e.getPhotoUrl())
                .emailPersonal(e.getEmailPersonal())
                .emailCorporate(e.getEmailCorporate())
                .phoneMobile(e.getPhoneMobile())
                .phoneHome(e.getPhoneHome())
                .phoneAlternate(e.getPhoneAlternate())
                .address(e.getAddress())
                .residenceNeighborhood(e.getResidenceNeighborhood())
                .residenceCountryId(e.getResidenceCountry() != null ? e.getResidenceCountry().getId() : null)
                .residenceStateId(e.getResidenceState() != null ? e.getResidenceState().getId() : null)
                .residenceCityId(e.getResidenceCity() != null ? e.getResidenceCity().getId() : null)

                .emergencyContacts(e.getEmergencyContacts().stream().map(c -> EmployeeEmergencyContactDto.builder()
                        .id(c.getId())
                        .firstName(c.getFirstName())
                        .secondName(c.getSecondName())
                        .firstLastName(c.getFirstLastName())
                        .secondLastName(c.getSecondLastName())
                        .relationship(c.getRelationship())
                        .relationshipId(c.getRelationshipEntity() != null ? c.getRelationshipEntity().getId() : null)
                        .phone(c.getPhone())
                        .build()).collect(Collectors.toList()))

                .familyNucleus(e.getFamilyNucleus().stream().map(f -> EmployeeFamilyMemberDto.builder()
                        .id(f.getId())
                        .firstName(f.getFirstName())
                        .secondName(f.getSecondName())
                        .firstLastName(f.getFirstLastName())
                        .secondLastName(f.getSecondLastName())
                        .relationship(f.getRelationship())
                        .relationshipId(f.getRelationshipEntity() != null ? f.getRelationshipEntity().getId() : null)
                        .birthDate(f.getBirthDate())
                        .occupation(f.getOccupation())
                        .occupationId(f.getOccupationEntity() != null ? f.getOccupationEntity().getId() : null)
                        .isDependent(f.getIsDependent())
                        .build()).collect(Collectors.toList()))

                .bankName(e.getBankName())
                .bankAccountType(e.getBankAccountType())
                .bankAccountNumber(e.getBankAccountNumber())

                .shirtSizeId(e.getShirtSize() != null ? e.getShirtSize().getId() : null)
                .pantsSizeId(e.getPantsSize() != null ? e.getPantsSize().getId() : null)
                .shoeSizeId(e.getShoeSize() != null ? e.getShoeSize().getId() : null)
                .educationLevelId(e.getEducationLevel() != null ? e.getEducationLevel().getId() : null)
                .socioeconomicStratum(e.getSocioeconomicStratum())
                .militaryStatus(e.getMilitaryStatus())
                .isPep(e.getIsPep())
                .experienceRangeId(e.getExperienceRangeEntity() != null ? e.getExperienceRangeEntity().getId() : null)
                .positionApplied(e.getPositionApplied())
                .workExperiences(e.getWorkExperiences().stream().map(w -> EmployeeWorkExperienceDto.builder()
                        .id(w.getId())
                        .companyName(w.getCompanyName())
                        .positionHeld(w.getPositionHeld())
                        .immediateSupervisor(w.getImmediateSupervisor())
                        .companyPhone(w.getCompanyPhone())
                        .startDate(w.getStartDate())
                        .endDate(w.getEndDate())
                        .functions(w.getFunctions())
                        .attachmentUrl(w.getAttachmentUrl())
                        .build()).collect(Collectors.toList()))
                .educations(e.getEducations().stream().map(edu -> EmployeeEducationDto.builder()
                        .id(edu.getId())
                        .employeeId(e.getId())
                        .educationLevelId(edu.getEducationLevel() != null ? edu.getEducationLevel().getId() : null)
                        .educationLevelName(edu.getEducationLevel() != null ? edu.getEducationLevel().getName() : null)
                        .institution(edu.getInstitution())
                        .titleObtained(edu.getTitleObtained())
                        .currentSemester(edu.getCurrentSemester())
                        .phone(edu.getPhone())
                        .cityId(edu.getCity() != null ? edu.getCity().getId() : null)
                        .cityName(edu.getCity() != null ? edu.getCity().getName() : null)
                        .startYear(edu.getStartYear())
                        .endYear(edu.getEndYear())
                        .hours(edu.getHours())
                        .attachmentUrl(edu.getAttachmentUrl())
                        .build()).collect(Collectors.toList()))
                .active(e.getActive())
                .build();
    }
}
