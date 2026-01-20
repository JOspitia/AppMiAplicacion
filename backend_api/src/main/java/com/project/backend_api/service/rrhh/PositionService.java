package com.project.backend_api.service.rrhh;

import com.project.backend_api.dto.rrhh.*;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.rrhh.*;
import com.project.backend_api.repository.rrhh.*;
import com.project.backend_api.service.core.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PositionService {

    private final PositionRepository positionRepository;
    private final DepartmentRepository departmentRepository;
    private final OrganizationalLevelRepository organizationalLevelRepository;
    private final SkillLevelRepository skillLevelRepository;
    private final AuthService authService;

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    public List<PositionDto> getAll() {
        return positionRepository.findByCompanyId(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<PositionDto> getActive() {
        return positionRepository.findByCompanyIdAndActiveTrue(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public PositionDto getById(UUID id) {
        Position position = findByIdAndCompany(id);
        // Inicializar colecciones lazy
        position.getFunctions().size();
        position.getSkills().size();
        position.getRequirements().size();
        position.getExperiences().size();
        return toDto(position);
    }

    @Transactional
    public PositionDto create(PositionDto dto) {
        UUID companyId = getCurrentCompanyId();

        // Validar código único
        positionRepository.findByCodeAndCompanyId(dto.getCode(), companyId)
                .ifPresent(p -> {
                    throw new IllegalArgumentException("Ya existe un cargo con el código: " + dto.getCode());
                });

        // Validar salarios
        validateSalaries(dto.getMinSalary(), dto.getMaxSalary());

        Position position = new Position();
        position.setCompany(Company.builder().id(companyId).build());
        position.setActive(true);

        mapDtoToEntity(dto, position, companyId);

        Position saved = positionRepository.save(position);
        return toDto(saved);
    }

    @Transactional
    public PositionDto update(UUID id, PositionDto dto) {
        UUID companyId = getCurrentCompanyId();
        Position position = findByIdAndCompany(id);

        // Validar código único (excluyendo el registro actual)
        positionRepository.findByCodeAndCompanyId(dto.getCode(), companyId)
                .ifPresent(p -> {
                    if (!p.getId().equals(id)) {
                        throw new IllegalArgumentException("Ya existe un cargo con el código: " + dto.getCode());
                    }
                });

        // Validar salarios
        validateSalaries(dto.getMinSalary(), dto.getMaxSalary());

        // Inicializar colecciones
        position.getFunctions().size();
        position.getSkills().size();
        position.getRequirements().size();
        position.getExperiences().size();

        mapDtoToEntity(dto, position, companyId);

        Position saved = positionRepository.save(position);
        return toDto(saved);
    }

    @Transactional
    public void toggleActive(UUID id) {
        Position position = findByIdAndCompany(id);
        position.setActive(!position.getActive());
        positionRepository.save(position);
    }

    private Position findByIdAndCompany(UUID id) {
        Position position = positionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cargo no encontrado"));

        if (!position.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("No autorizado");
        }
        return position;
    }

    private void validateSalaries(BigDecimal minSalary, BigDecimal maxSalary) {
        if (minSalary != null && maxSalary != null) {
            if (minSalary.compareTo(BigDecimal.ZERO) > 0 && maxSalary.compareTo(BigDecimal.ZERO) > 0) {
                if (minSalary.compareTo(maxSalary) > 0) {
                    throw new IllegalArgumentException("El salario mínimo no puede ser mayor que el salario máximo.");
                }
            }
        }
    }

    private void mapDtoToEntity(PositionDto dto, Position position, UUID companyId) {
        position.setName(dto.getName());
        position.setCode(dto.getCode());
        position.setDescription(dto.getDescription());
        position.setMinSalary(dto.getMinSalary());
        position.setMaxSalary(dto.getMaxSalary());
        position.setRiskLevel(dto.getRiskLevel());

        if (dto.getActive() != null) {
            position.setActive(dto.getActive());
        }

        // Validar y asignar departamento
        if (dto.getDepartmentId() != null) {
            Department department = departmentRepository.findById(dto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Departamento no encontrado"));
            if (!department.getCompany().getId().equals(companyId)) {
                throw new RuntimeException("Departamento inválido");
            }
            position.setDepartment(department);

            // Heredar moneda del centro de costos del departamento
            if (department.getCostCenter() != null && department.getCostCenter().getCurrency() != null) {
                position.setCurrency(department.getCostCenter().getCurrency());
            }
        } else {
            throw new IllegalArgumentException("El departamento es requerido");
        }

        // Validar y asignar nivel organizacional
        if (dto.getOrganizationalLevelId() != null) {
            OrganizationalLevel level = organizationalLevelRepository.findById(dto.getOrganizationalLevelId())
                    .orElseThrow(() -> new RuntimeException("Nivel organizacional no encontrado"));
            if (!level.getCompany().getId().equals(companyId)) {
                throw new RuntimeException("Nivel organizacional inválido");
            }
            position.setOrganizationalLevel(level);
        } else {
            throw new IllegalArgumentException("El nivel organizacional es requerido");
        }

        // Actualizar colecciones
        updateFunctions(position, dto.getFunctions());
        updateSkills(position, dto.getSkills(), companyId);
        updateRequirements(position, dto.getRequirements());
        updateExperiences(position, dto.getExperiences());
    }

    private void updateFunctions(Position position, List<PositionFunctionDto> dtos) {
        position.getFunctions().clear();
        if (dtos != null && !dtos.isEmpty()) {
            for (int i = 0; i < dtos.size(); i++) {
                PositionFunctionDto dto = dtos.get(i);
                PositionFunction function = new PositionFunction();
                function.setDescription(dto.getDescription());
                function.setDisplayOrder(i + 1);
                position.addFunction(function);
            }
        }
    }

    private void updateSkills(Position position, List<PositionSkillDto> dtos, UUID companyId) {
        position.getSkills().clear();
        if (dtos != null && !dtos.isEmpty()) {
            for (int i = 0; i < dtos.size(); i++) {
                PositionSkillDto dto = dtos.get(i);
                PositionSkill skill = new PositionSkill();
                skill.setSkillName(dto.getSkillName());
                skill.setIsMandatory(dto.getIsMandatory() != null ? dto.getIsMandatory() : true);
                skill.setDescription(dto.getDescription());
                skill.setDisplayOrder(i + 1);

                // Asignar nivel de habilidad si existe
                if (dto.getSkillLevelId() != null) {
                    SkillLevel level = skillLevelRepository.findByIdAndCompanyId(dto.getSkillLevelId(), companyId)
                            .orElse(null);
                    skill.setSkillLevel(level);
                }

                position.addSkill(skill);
            }
        }
    }

    private void updateRequirements(Position position, List<PositionRequirementDto> dtos) {
        position.getRequirements().clear();
        if (dtos != null && !dtos.isEmpty()) {
            for (int i = 0; i < dtos.size(); i++) {
                PositionRequirementDto dto = dtos.get(i);
                PositionRequirement requirement = new PositionRequirement();
                requirement.setRequirementType(dto.getRequirementType());
                requirement.setDescription(dto.getDescription());
                requirement.setIsMandatory(dto.getIsMandatory() != null ? dto.getIsMandatory() : true);
                requirement.setDisplayOrder(i + 1);
                position.addRequirement(requirement);
            }
        }
    }

    private void updateExperiences(Position position, List<PositionExperienceDto> dtos) {
        position.getExperiences().clear();
        if (dtos != null && !dtos.isEmpty()) {
            for (int i = 0; i < dtos.size(); i++) {
                PositionExperienceDto dto = dtos.get(i);
                PositionExperience experience = new PositionExperience();
                experience.setArea(dto.getArea());
                experience.setMinYears(dto.getMinYears() != null ? dto.getMinYears() : 0);
                experience.setMaxYears(dto.getMaxYears());

                // Validar años de experiencia
                if (experience.getMaxYears() != null && experience.getMaxYears() < experience.getMinYears()) {
                    throw new IllegalArgumentException(
                            "Los años máximos no pueden ser menores a los años mínimos en el área: "
                                    + experience.getArea());
                }

                experience.setIsMandatory(dto.getIsMandatory() != null ? dto.getIsMandatory() : true);
                experience.setDescription(dto.getDescription());
                experience.setDisplayOrder(i + 1);
                position.addExperience(experience);
            }
        }
    }

    private PositionDto toDto(Position position) {
        PositionDto dto = PositionDto.builder()
                .id(position.getId())
                .name(position.getName())
                .code(position.getCode())
                .description(position.getDescription())
                .minSalary(position.getMinSalary())
                .maxSalary(position.getMaxSalary())
                .riskLevel(position.getRiskLevel())
                .active(position.getActive())
                .build();

        // Department info
        if (position.getDepartment() != null) {
            dto.setDepartmentId(position.getDepartment().getId());
            dto.setDepartmentName(position.getDepartment().getName());
            dto.setDepartmentCode(position.getDepartment().getCode());
        }

        // Organizational level info
        if (position.getOrganizationalLevel() != null) {
            dto.setOrganizationalLevelId(position.getOrganizationalLevel().getId());
            dto.setOrganizationalLevelName(position.getOrganizationalLevel().getName());
        }

        // Currency info
        if (position.getCurrency() != null) {
            dto.setCurrencyId(position.getCurrency().getId());
            dto.setCurrencyCode(position.getCurrency().getCode());
            dto.setCurrencySymbol(position.getCurrency().getSymbol());
        }

        // Collections
        dto.setFunctions(position.getFunctions().stream()
                .map(f -> PositionFunctionDto.builder()
                        .id(f.getId())
                        .description(f.getDescription())
                        .displayOrder(f.getDisplayOrder())
                        .build())
                .collect(Collectors.toList()));

        dto.setSkills(position.getSkills().stream()
                .map(s -> PositionSkillDto.builder()
                        .id(s.getId())
                        .skillName(s.getSkillName())
                        .skillLevelId(s.getSkillLevel() != null ? s.getSkillLevel().getId() : null)
                        .skillLevelName(s.getSkillLevel() != null ? s.getSkillLevel().getName() : null)
                        .isMandatory(s.getIsMandatory())
                        .description(s.getDescription())
                        .displayOrder(s.getDisplayOrder())
                        .build())
                .collect(Collectors.toList()));

        dto.setRequirements(position.getRequirements().stream()
                .map(r -> PositionRequirementDto.builder()
                        .id(r.getId())
                        .requirementType(r.getRequirementType())
                        .description(r.getDescription())
                        .isMandatory(r.getIsMandatory())
                        .displayOrder(r.getDisplayOrder())
                        .build())
                .collect(Collectors.toList()));

        dto.setExperiences(position.getExperiences().stream()
                .map(e -> PositionExperienceDto.builder()
                        .id(e.getId())
                        .area(e.getArea())
                        .minYears(e.getMinYears())
                        .maxYears(e.getMaxYears())
                        .isMandatory(e.getIsMandatory())
                        .description(e.getDescription())
                        .displayOrder(e.getDisplayOrder())
                        .build())
                .collect(Collectors.toList()));

        return dto;
    }
}
