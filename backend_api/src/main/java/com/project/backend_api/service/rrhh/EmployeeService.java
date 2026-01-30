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
    private final ContractTypeRepository contractTypeRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final EmployeeDocumentRepository employeeDocumentRepository;

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

    public EmployeeContractStepDto getContractData(UUID id) {
        Employee employee = findByIdAndCompany(id);
        return toContractStepDto(employee);
    }

    public List<EmployeeDocumentDto> getEmployeeDocuments(UUID employeeId) {
        return employeeDocumentRepository.findByEmployeeId(employeeId).stream()
                .map(this::toDocumentDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeePersonalStepDto createStep1(EmployeePersonalStepDto dto) {
        UUID companyId = getCurrentCompanyId();

        if (employeeRepository.existsByCompanyIdAndIdentificationNumber(companyId, dto.getIdentificationNumber())) {
            throw new IllegalArgumentException("Ya existe un empleado con este número de identificación.");
        }

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

        updatePersonalDataFromDto(saved, dto);
        updateEmergencyContacts(saved, dto.getEmergencyContacts());
        updateFamilyNucleus(saved, dto.getFamilyNucleus());
        updateWorkExperiences(saved, dto.getWorkExperiences());
        updateEducations(saved, dto.getEducations());
        updateReferences(saved, dto.getReferences());

        return toPersonalStepDto(employeeRepository.save(saved));
    }

    @Transactional
    public void updateStep2(UUID id, EmployeeContractStepDto dto, List<DocumentFileDto> files) {
        Employee employee = findByIdAndCompany(id);

        if (dto.getContractTypeId() != null) {
            employee.setContractType(contractTypeRepository.findById(dto.getContractTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Tipo de contrato no encontrado")));
        }

        employee.setContractNumber(dto.getContractNumber());
        employee.setContractStartDate(dto.getStartDate());
        employee.setContractEndDate(dto.getEndDate());
        employee.setProbationEndDate(dto.getProbationEndDate());

        if (dto.getWorkScheduleId() != null) {
            employee.setWorkSchedule(workScheduleRepository.findById(dto.getWorkScheduleId())
                    .orElseThrow(() -> new IllegalArgumentException("Horario laboral no encontrado")));
        }

        employee.setContractComments(dto.getComments());

        employeeRepository.save(employee);

        if (files != null && !files.isEmpty()) {
            for (DocumentFileDto fileDto : files) {
                if (fileDto.isUnified()) {
                    saveDocument(employee, null, fileDto, true);
                } else if (fileDto.getDocumentTypeId() != null) {
                    saveDocument(employee, fileDto.getDocumentTypeId(), fileDto, false);
                }
            }
        }
    }

    private void saveDocument(Employee employee, UUID documentTypeId, DocumentFileDto fileDto, boolean isUnified) {
        String fileName = fileDto.getFile().getOriginalFilename();
        String companyId = employee.getCompany().getId().toString();
        String employeeId = employee.getId().toString();
        String folder = isUnified ? "unified" : documentTypeId.toString();

        String path = String.format("companies/%s/employees/%s/documents/%s/%s",
                companyId, employeeId, folder, fileName);

        try {
            minioService.uploadPrivateFile(path, fileDto.getFile().getInputStream(), fileDto.getFile().getSize(),
                    fileDto.getFile().getContentType());
        } catch (java.io.IOException e) {
            throw new RuntimeException("Error reading file stream", e);
        }

        EmployeeDocument doc;
        if (isUnified) {
            doc = employeeDocumentRepository.findByEmployeeId(employee.getId()).stream()
                    .filter(EmployeeDocument::getIsUnified)
                    .findFirst()
                    .orElse(new EmployeeDocument());
            doc.setIsUnified(true);
            doc.setDocumentType(null);
        } else {
            doc = employeeDocumentRepository.findByEmployeeId(employee.getId()).stream()
                    .filter(d -> d.getDocumentType() != null && d.getDocumentType().getId().equals(documentTypeId))
                    .findFirst()
                    .orElse(new EmployeeDocument());
            doc.setIsUnified(false);
            doc.setDocumentType(documentTypeRepository.findById(documentTypeId).orElse(null));
        }

        doc.setEmployee(employee);
        doc.setFileName(fileName);
        doc.setFilePath(path);
        doc.setFileSize(fileDto.getFile().getSize());
        doc.setMimeType(fileDto.getFile().getContentType());
        doc.setExpirationDate(fileDto.getExpirationDate());

        employeeDocumentRepository.save(doc);
    }

    @Transactional
    public EmployeePersonalStepDto updateStep1(UUID id, EmployeePersonalStepDto dto) {
        Employee employee = findByIdAndCompany(id);
        updatePersonalDataFromDto(employee, dto);
        updateEmergencyContacts(employee, dto.getEmergencyContacts());
        updateFamilyNucleus(employee, dto.getFamilyNucleus());
        updateWorkExperiences(employee, dto.getWorkExperiences());
        updateEducations(employee, dto.getEducations());
        updateReferences(employee, dto.getReferences());

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

        if (dto.getPhotoUrl() != null && dto.getPhotoUrl().startsWith("data:image")) {
            if (employee.getId() != null) {
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
        } else {
            employee.setPhotoUrl(dto.getPhotoUrl());
        }

        employee.setEmailPersonal(dto.getEmailPersonal());
        employee.setEmailCorporate(dto.getEmailCorporate());
        employee.setPhoneMobile(dto.getPhoneMobile());
        employee.setPhoneHome(dto.getPhoneHome());
        employee.setPhoneAlternate(dto.getPhoneAlternate());
        employee.setAddress(dto.getAddress());
        employee.setResidenceNeighborhood(dto.getResidenceNeighborhood());

        if (dto.getResidenceCountryId() != null)
            employee.setResidenceCountry(countryRepository.findById(dto.getResidenceCountryId()).orElse(null));
        if (dto.getResidenceStateId() != null)
            employee.setResidenceState(stateRepository.findById(dto.getResidenceStateId()).orElse(null));
        if (dto.getResidenceCityId() != null)
            employee.setResidenceCity(cityRepository.findById(dto.getResidenceCityId()).orElse(null));

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
                        contact.setRelationship(rel.getName());
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
                exp.setIsCurrent(dto.getIsCurrent() != null ? dto.getIsCurrent() : false);

                String attachmentUrl = dto.getAttachmentUrl();
                if (attachmentUrl != null && attachmentUrl.startsWith("data:application/pdf")) {
                    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
                    String fileNamePrefix = "work_exp_" + timestamp + "_idx" + i;
                    String newUrl = minioService.uploadEmployeeFile(
                            employee.getCompany().getId(),
                            employee.getId(),
                            "work_experience",
                            fileNamePrefix,
                            attachmentUrl,
                            false);
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
                edu.setPhone(edu.getPhone());
                if (dto.getCityId() != null) {
                    edu.setCity(cityRepository.findById(dto.getCityId()).orElse(null));
                }
                edu.setStartYear(dto.getStartYear());
                edu.setEndYear(dto.getEndYear());
                edu.setHours(dto.getHours());
                edu.setIsFinished(dto.getIsFinished() != null ? dto.getIsFinished() : true);

                String attachmentUrl = dto.getAttachmentUrl();
                if (attachmentUrl != null && attachmentUrl.startsWith("data:")) {
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

    private void updateReferences(Employee employee, List<EmployeeReferenceDto> dtos) {
        employee.getReferences().clear();
        if (dtos != null) {
            for (int i = 0; i < dtos.size(); i++) {
                EmployeeReferenceDto dto = dtos.get(i);
                EmployeeReference ref = new EmployeeReference();
                ref.setReferenceType(dto.getReferenceType());
                ref.setName(dto.getName());
                ref.setOccupation(dto.getOccupation());
                ref.setCompany(dto.getCompany());
                ref.setPhone(dto.getPhone());
                ref.setMobile(dto.getMobile());

                String attachmentUrl = dto.getAttachmentUrl();
                if (attachmentUrl != null && attachmentUrl.startsWith("data:")) {
                    String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
                    String fileNamePrefix = "reference_" + timestamp + "_idx" + i;
                    String newUrl = minioService.uploadEmployeeFile(
                            employee.getCompany().getId(),
                            employee.getId(),
                            "reference",
                            fileNamePrefix,
                            attachmentUrl,
                            false);
                    ref.setAttachmentUrl(newUrl);
                } else {
                    ref.setAttachmentUrl(attachmentUrl);
                }
                employee.addReference(ref);
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
                        .isCurrent(w.getIsCurrent())
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
                        .countryId(edu.getCity() != null && edu.getCity().getState() != null
                                && edu.getCity().getState().getCountry() != null
                                        ? edu.getCity().getState().getCountry().getId()
                                        : null)
                        .stateId(edu.getCity() != null && edu.getCity().getState() != null
                                ? edu.getCity().getState().getId()
                                : null)
                        .cityId(edu.getCity() != null ? edu.getCity().getId() : null)
                        .cityName(edu.getCity() != null ? edu.getCity().getName() : null)
                        .startYear(edu.getStartYear())
                        .endYear(edu.getEndYear())
                        .hours(edu.getHours())
                        .isFinished(edu.getIsFinished())
                        .attachmentUrl(edu.getAttachmentUrl())
                        .build()).collect(Collectors.toList()))
                .references(e.getReferences().stream().map(ref -> EmployeeReferenceDto.builder()
                        .id(ref.getId())
                        .employeeId(e.getId())
                        .referenceType(ref.getReferenceType())
                        .name(ref.getName())
                        .occupation(ref.getOccupation())
                        .company(ref.getCompany())
                        .phone(ref.getPhone())
                        .mobile(ref.getMobile())
                        .attachmentUrl(ref.getAttachmentUrl())
                        .build()).collect(Collectors.toList()))
                .active(e.getActive())
                .build();
    }

    private EmployeeContractStepDto toContractStepDto(Employee employee) {
        return EmployeeContractStepDto.builder()
                .employeeId(employee.getId())
                .contractTypeId(employee.getContractType() != null ? employee.getContractType().getId() : null)
                .contractNumber(employee.getContractNumber())
                .startDate(employee.getContractStartDate())
                .endDate(employee.getContractEndDate())
                .probationEndDate(employee.getProbationEndDate())
                .workScheduleId(employee.getWorkSchedule() != null ? employee.getWorkSchedule().getId() : null)
                .comments(employee.getContractComments())
                .build();
    }

    private EmployeeDocumentDto toDocumentDto(EmployeeDocument doc) {
        if (doc == null)
            return null;
        return EmployeeDocumentDto.builder()
                .id(doc.getId())
                .documentTypeId(doc.getDocumentType() != null ? doc.getDocumentType().getId() : null)
                .documentTypeName(doc.getDocumentType() != null ? doc.getDocumentType().getName() : "Unificado")
                .fileName(doc.getFileName())
                .expirationDate(doc.getExpirationDate())
                .isUnified(doc.getIsUnified())
                .build();
    }
}
