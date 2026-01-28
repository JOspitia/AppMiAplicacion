package com.project.backend_api.service.rrhh;

import com.project.backend_api.dto.rrhh.*;
import com.project.backend_api.model.rrhh.*;
import com.project.backend_api.repository.rrhh.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

    @Transactional(readOnly = true)
    public List<RelationshipDto> getActiveRelationships(Boolean isFamily) {
        List<Relationship> entities;
        if (isFamily != null) {
            entities = relationshipRepository.findByIsFamilyAndActiveTrueOrderByDisplayOrderAsc(isFamily);
        } else {
            entities = relationshipRepository.findByActiveTrueOrderByDisplayOrderAsc();
        }

        return entities.stream()
                .map(this::mapToRelationshipDto)
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
                .map(this::mapToOccupationDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, List<OccupationDto>> getOccupationsGroupedByCategory() {
        return occupationRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .collect(Collectors.groupingBy(Occupation::getCategory,
                        Collectors.mapping(this::mapToOccupationDto, Collectors.toList())));
    }

    @Transactional(readOnly = true)
    public List<EducationLevelDto> getActiveEducationLevels() {
        return educationLevelRepository.findByActiveTrue().stream()
                .map(this::mapToEducationLevelDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MaritalStatusDto> getActiveMaritalStatuses() {
        return maritalStatusRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToMaritalStatusDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BloodTypeDto> getActiveBloodTypes() {
        return bloodTypeRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToBloodTypeDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RhFactorDto> getActiveRhFactors() {
        return rhFactorRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToRhFactorDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExperienceRangeDto> getActiveExperienceRanges() {
        return experienceRangeRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::mapToExperienceRangeDto)
                .collect(Collectors.toList());
    }

    // Mappers
    private RelationshipDto mapToRelationshipDto(Relationship entity) {
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

    private OccupationDto mapToOccupationDto(Occupation entity) {
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

    private EducationLevelDto mapToEducationLevelDto(EducationLevel entity) {
        return EducationLevelDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }

    private MaritalStatusDto mapToMaritalStatusDto(MaritalStatus entity) {
        return MaritalStatusDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .build();
    }

    private BloodTypeDto mapToBloodTypeDto(BloodType entity) {
        return BloodTypeDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }

    private RhFactorDto mapToRhFactorDto(RhFactor entity) {
        return RhFactorDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }

    private ExperienceRangeDto mapToExperienceRangeDto(ExperienceRange entity) {
        return ExperienceRangeDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .build();
    }
}
