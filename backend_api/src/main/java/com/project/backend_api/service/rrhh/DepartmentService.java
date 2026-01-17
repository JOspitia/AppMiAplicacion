package com.project.backend_api.service.rrhh;

import com.project.backend_api.dto.rrhh.DepartmentDto;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.core.management.Location;
import com.project.backend_api.model.rrhh.CostCenter;
import com.project.backend_api.model.rrhh.Department;
import com.project.backend_api.model.rrhh.OrganizationalLevel;
import com.project.backend_api.repository.core.management.LocationRepository;
import com.project.backend_api.repository.rrhh.CostCenterRepository;
import com.project.backend_api.repository.rrhh.DepartmentRepository;
import com.project.backend_api.repository.rrhh.OrganizationalLevelRepository;
import com.project.backend_api.service.core.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DepartmentService {

    private final DepartmentRepository repository;
    private final CostCenterRepository costCenterRepository;
    private final OrganizationalLevelRepository organizationalLevelRepository;
    private final LocationRepository locationRepository;
    private final AuthService authService;

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    public List<DepartmentDto> getAll() {
        return repository.findByCompanyIdOrderByCodeAsc(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<DepartmentDto> getActive() {
        return repository.findByCompanyIdAndActiveTrueOrderByCodeAsc(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public DepartmentDto getById(UUID id) {
        Department entity = findByIdAndValidateAccess(id);
        return toDto(entity);
    }

    @Transactional
    public DepartmentDto create(DepartmentDto dto) {
        UUID companyId = getCurrentCompanyId();
        validateCodeUnique(dto.getCode(), null, companyId);

        Department entity = new Department();
        entity.setCompany(Company.builder().id(companyId).build());

        updateEntityFromDto(entity, dto, companyId);

        return toDto(repository.save(entity));
    }

    @Transactional
    public DepartmentDto update(UUID id, DepartmentDto dto) {
        UUID companyId = getCurrentCompanyId();
        Department entity = findByIdAndValidateAccess(id);

        validateCodeUnique(dto.getCode(), id, companyId);

        // Prevent circular parent dependency (simple check: parent cannot be self)
        if (dto.getParentId() != null && dto.getParentId().equals(id)) {
            throw new RuntimeException("Un departamento no puede ser su propio padre");
        }

        updateEntityFromDto(entity, dto, companyId);

        return toDto(repository.save(entity));
    }

    @Transactional
    public void toggleActive(UUID id) {
        Department entity = findByIdAndValidateAccess(id);
        entity.setActive(!entity.getActive());
        repository.save(entity);
    }

    private Department findByIdAndValidateAccess(UUID id) {
        Department entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Departamento no encontrado"));

        if (!entity.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("No autorizado");
        }
        return entity;
    }

    private void updateEntityFromDto(Department entity, DepartmentDto dto, UUID companyId) {
        entity.setName(dto.getName());
        entity.setCode(dto.getCode());
        entity.setDescription(dto.getDescription());
        entity.setManagerPositionId(dto.getManagerPositionId());
        if (dto.getActive() != null)
            entity.setActive(dto.getActive());

        // Resolving relations
        if (dto.getParentId() != null) {
            Department parent = repository.findById(dto.getParentId())
                    .orElseThrow(() -> new RuntimeException("Departamento padre no encontrado"));
            if (!parent.getCompany().getId().equals(companyId))
                throw new RuntimeException("Departamento padre inválido");
            entity.setParent(parent);
        } else {
            entity.setParent(null);
        }

        if (dto.getCostCenterId() != null) {
            CostCenter cc = costCenterRepository.findById(dto.getCostCenterId())
                    .orElseThrow(() -> new RuntimeException("Centro de costos no encontrado"));
            if (!cc.getCompany().getId().equals(companyId))
                throw new RuntimeException("Centro de costos inválido");
            entity.setCostCenter(cc);
        } else {
            entity.setCostCenter(null);
        }

        if (dto.getOrganizationalLevelId() != null) {
            OrganizationalLevel ol = organizationalLevelRepository.findById(dto.getOrganizationalLevelId())
                    .orElseThrow(() -> new RuntimeException("Nivel organizacional no encontrado"));
            if (!ol.getCompany().getId().equals(companyId))
                throw new RuntimeException("Nivel organizacional inválido");
            entity.setOrganizationalLevel(ol);
        } else {
            entity.setOrganizationalLevel(null);
        }

        if (dto.getLocationIds() != null && !dto.getLocationIds().isEmpty()) {
            List<Location> locs = locationRepository.findAllById(dto.getLocationIds());
            // Basic check
            locs.forEach(l -> {
                if (!l.getCompany().getId().equals(companyId))
                    throw new RuntimeException("Sede inválida: " + l.getName());
            });
            entity.setLocations(new HashSet<>(locs));
        } else {
            entity.getLocations().clear();
        }
    }

    private void validateCodeUnique(String code, UUID excludeId, UUID companyId) {
        if (code == null || code.isBlank())
            return;
        repository.findByCodeAndCompanyId(code, companyId).ifPresent(existing -> {
            if (excludeId == null || !existing.getId().equals(excludeId)) {
                throw new RuntimeException("Ya existe un departamento con el código '" + code + "'");
            }
        });
    }

    private DepartmentDto toDto(Department entity) {
        return DepartmentDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .description(entity.getDescription())
                .active(entity.getActive())
                .parentId(entity.getParent() != null ? entity.getParent().getId() : null)
                .parentName(entity.getParent() != null ? entity.getParent().getName() : null)
                .costCenterId(entity.getCostCenter() != null ? entity.getCostCenter().getId() : null)
                .costCenterName(entity.getCostCenter() != null ? entity.getCostCenter().getName() : null)
                .organizationalLevelId(
                        entity.getOrganizationalLevel() != null ? entity.getOrganizationalLevel().getId() : null)
                .organizationalLevelName(
                        entity.getOrganizationalLevel() != null ? entity.getOrganizationalLevel().getName() : null)
                .managerPositionId(entity.getManagerPositionId())
                .locationIds(entity.getLocations().stream().map(Location::getId).collect(Collectors.toList()))
                .build();
    }
}
