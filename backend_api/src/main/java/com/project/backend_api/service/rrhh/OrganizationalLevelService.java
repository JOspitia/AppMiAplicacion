package com.project.backend_api.service.rrhh;

import com.project.backend_api.dto.rrhh.OrganizationalLevelDto;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.rrhh.OrganizationalLevel;
import com.project.backend_api.repository.rrhh.OrganizationalLevelRepository;
import com.project.backend_api.service.core.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationalLevelService {

    private final OrganizationalLevelRepository repository;
    private final AuthService authService;

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    public List<OrganizationalLevelDto> getAll() {
        return repository.findByCompanyIdOrderByHierarchyOrderAsc(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<OrganizationalLevelDto> getActive() {
        return repository.findByCompanyIdAndActiveTrueOrderByHierarchyOrderAsc(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public OrganizationalLevelDto getById(UUID id) {
        OrganizationalLevel level = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nivel organizacional no encontrado"));

        if (!level.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("Nivel organizacional no encontrado para la compañía actual");
        }
        return toDto(level);
    }

    @Transactional
    public OrganizationalLevelDto create(OrganizationalLevelDto dto) {
        UUID companyId = getCurrentCompanyId();

        if (dto.getHierarchyOrder() == null) {
            Integer maxOrder = repository.findMaxHierarchyOrder(companyId);
            dto.setHierarchyOrder(maxOrder != null ? maxOrder + 1 : 1);
        }

        validateHierarchyOrderUnique(dto.getHierarchyOrder(), null, companyId);
        validateNameUnique(dto.getName(), null, companyId);

        OrganizationalLevel entity = new OrganizationalLevel();
        entity.setCompany(Company.builder().id(companyId).build());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setHierarchyOrder(dto.getHierarchyOrder());
        entity.setActive(dto.getActive() != null ? dto.getActive() : true);

        return toDto(repository.save(entity));
    }

    @Transactional
    public void updateOrder(List<UUID> orderedIds) {
        UUID companyId = getCurrentCompanyId();

        // Fetch all items ensuring they belong to the company
        List<OrganizationalLevel> allLevels = repository.findByCompanyIdOrderByHierarchyOrderAsc(companyId);

        // Filter only the levels that are in the input list (validation) but allow
        // reordering subset if needed,
        // though usually we reorder the whole list.
        // For safety, let's only update those present in orderedIds, but we must ensure
        // we don't collide with others.
        // Assuming orderedIds contains ALL levels or at least the segment being
        // reordered.

        // Strategy: Two-pass update to avoid Unique Constraint violation.
        // 1. Update to temporary negative values.
        // 2. Update to final positive values.

        // Create a map for faster lookup
        var levelMap = allLevels.stream()
                .collect(Collectors.toMap(OrganizationalLevel::getId, l -> l));

        // Pass 1: Set to temporary negative values
        for (int i = 0; i < orderedIds.size(); i++) {
            UUID id = orderedIds.get(i);
            if (levelMap.containsKey(id)) {
                OrganizationalLevel level = levelMap.get(id);
                level.setHierarchyOrder(-(i + 1)); // Temporary negative order
            }
        }
        repository.saveAll(allLevels);
        repository.flush(); // Force write to DB to ensure "old" positive values are gone

        // Pass 2: Set to final positive values
        for (int i = 0; i < orderedIds.size(); i++) {
            UUID id = orderedIds.get(i);
            if (levelMap.containsKey(id)) {
                OrganizationalLevel level = levelMap.get(id);
                level.setHierarchyOrder(i + 1);
            }
        }
        repository.saveAll(allLevels);
    }

    @Transactional
    public OrganizationalLevelDto update(UUID id, OrganizationalLevelDto dto) {
        UUID companyId = getCurrentCompanyId();

        OrganizationalLevel entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nivel organizacional no encontrado"));

        if (!entity.getCompany().getId().equals(companyId)) {
            throw new RuntimeException("No autorizado");
        }

        validateHierarchyOrderUnique(dto.getHierarchyOrder(), id, companyId);
        validateNameUnique(dto.getName(), id, companyId);

        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setHierarchyOrder(dto.getHierarchyOrder());
        if (dto.getActive() != null)
            entity.setActive(dto.getActive());

        return toDto(repository.save(entity));
    }

    @Transactional
    public void toggleActive(UUID id) {
        OrganizationalLevel entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nivel organizacional no encontrado"));

        if (!entity.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("No autorizado");
        }

        entity.setActive(!entity.getActive());
        repository.save(entity);
    }

    private void validateHierarchyOrderUnique(Integer hierarchyOrder, UUID excludeId, UUID companyId) {
        if (hierarchyOrder == null)
            return;
        repository.findByHierarchyOrderAndCompanyId(hierarchyOrder, companyId)
                .ifPresent(existing -> {
                    if (excludeId == null || !existing.getId().equals(excludeId)) {
                        throw new RuntimeException("Ya existe un nivel con el orden " + hierarchyOrder);
                    }
                });
    }

    private void validateNameUnique(String name, UUID excludeId, UUID companyId) {
        if (name == null || name.isBlank())
            return;
        repository.findByNameAndCompanyId(name, companyId)
                .ifPresent(existing -> {
                    if (excludeId == null || !existing.getId().equals(excludeId)) {
                        throw new RuntimeException("Ya existe un nivel con el nombre '" + name + "'");
                    }
                });
    }

    private OrganizationalLevelDto toDto(OrganizationalLevel entity) {
        return OrganizationalLevelDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .hierarchyOrder(entity.getHierarchyOrder())
                .active(entity.getActive())
                .build();
    }
}
