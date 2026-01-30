package com.project.backend_api.service.rrhh;

import com.project.backend_api.dto.rrhh.*;
import com.project.backend_api.model.rrhh.*;
import com.project.backend_api.repository.rrhh.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import com.project.backend_api.service.core.AuthService;

@Service
@RequiredArgsConstructor
public class CatalogService {

    private final RelationshipRepository relationshipRepository;
    private final OccupationRepository occupationRepository;
    private final EducationLevelRepository educationLevelRepository;
    private final MaritalStatusRepository maritalStatusRepository;
    private final BloodTypeRepository bloodTypeRepository;
    private final RhFactorRepository rhFactorRepository;
    private final ExperienceRangeRepository experienceRangeRepository;
    private final ContractTypeRepository contractTypeRepository;
    private final WorkScheduleRepository workScheduleRepository;
    private final DocumentTypeRepository documentTypeRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<RelationshipDto> getActiveRelationships(Boolean isFamily) {
        List<Relationship> entities;
        if (isFamily != null) {
            entities = relationshipRepository.findByIsFamilyAndActiveTrueOrderByDisplayOrderAsc(isFamily);
        } else {
            entities = relationshipRepository.findByActiveTrueOrderByDisplayOrderAsc();
        }

        return entities.stream()
                .map(this::toRelationshipDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OccupationDto> getActiveOccupations(String category) {
        List<Occupation> entities;
        if (category != null && !category.isEmpty()) {
            entities = occupationRepository.findByCategoryAndActiveTrueOrderByDisplayOrderAsc(category);
        } else {
            entities = occupationRepository.findByActiveTrueOrderByDisplayOrderAsc();
        }

        return entities.stream()
                .map(this::toOccupationDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, List<OccupationDto>> getOccupationsGroupedByCategory() {
        return occupationRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .collect(Collectors.groupingBy(Occupation::getCategory,
                        Collectors.mapping(this::toOccupationDto, Collectors.toList())));
    }

    @Transactional(readOnly = true)
    public List<EducationLevelDto> getActiveEducationLevels() {
        return educationLevelRepository.findByActiveTrue().stream()
                .map(this::toEducationLevelDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MaritalStatusDto> getActiveMaritalStatuses() {
        return maritalStatusRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::toMaritalStatusDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BloodTypeDto> getActiveBloodTypes() {
        return bloodTypeRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::toBloodTypeDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RhFactorDto> getActiveRhFactors() {
        return rhFactorRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::toRhFactorDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExperienceRangeDto> getActiveExperienceRanges() {
        return experienceRangeRepository.findAll().stream()
                .map(this::toExperienceRangeDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContractTypeDto> getActiveContractTypes() {
        return contractTypeRepository.findAll().stream()
                .map(this::toContractTypeDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<WorkScheduleDto> getActiveWorkSchedules() {
        return workScheduleRepository.findAll().stream()
                .map(this::toWorkScheduleDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentTypeDto> getHRDocumentTypes() {
        UUID companyId = authService.getSelectedCompanyId();
        // First try to find by specific RRHH category
        List<DocumentType> docs = documentTypeRepository.findByCompanyIdAndCategoryCodeOrderByNameAsc(companyId,
                "RRHH_DOCUMENT");

        // If empty, fallback to all active documents for the company (to avoid empty
        // screens due to migration issues)
        if (docs.isEmpty()) {
            docs = documentTypeRepository.findByCompanyIdAndActiveTrueOrderByNameAsc(companyId);
        }

        return docs.stream()
                .filter(DocumentType::getActive)
                .map(this::toDocumentTypeDto)
                .collect(Collectors.toList());
    }

    // Mappers
    private RelationshipDto toRelationshipDto(Relationship entity) {
        return RelationshipDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .isFamily(entity.getIsFamily())
                .active(entity.getActive())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }

    private OccupationDto toOccupationDto(Occupation entity) {
        return OccupationDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .active(entity.getActive())
                .displayOrder(entity.getDisplayOrder())
                .build();
    }

    private EducationLevelDto toEducationLevelDto(EducationLevel entity) {
        return EducationLevelDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }

    private MaritalStatusDto toMaritalStatusDto(MaritalStatus entity) {
        return MaritalStatusDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .build();
    }

    private BloodTypeDto toBloodTypeDto(BloodType entity) {
        return BloodTypeDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }

    private RhFactorDto toRhFactorDto(RhFactor entity) {
        return RhFactorDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }

    private ExperienceRangeDto toExperienceRangeDto(ExperienceRange er) {
        return ExperienceRangeDto.builder()
                .id(er.getId())
                .code(er.getCode())
                .name(er.getName())
                .build();
    }

    private ContractTypeDto toContractTypeDto(ContractType ct) {
        return ContractTypeDto.builder()
                .id(ct.getId())
                .name(ct.getName())
                .hasEndDate(ct.getHasEndDate())
                .defaultDuration(ct.getDefaultDuration())
                .durationUnit(ct.getDurationUnit())
                .build();
    }

    private WorkScheduleDto toWorkScheduleDto(WorkSchedule ws) {
        return WorkScheduleDto.builder()
                .id(ws.getId())
                .name(ws.getName())
                .build();
    }

    private DocumentTypeDto toDocumentTypeDto(DocumentType dt) {
        return DocumentTypeDto.builder()
                .id(dt.getId())
                .name(dt.getName())
                .code(dt.getCode())
                .isRequired(dt.getIsRequired())
                .requiresExpiration(dt.getRequiresExpiration())
                .build();
    }
}
