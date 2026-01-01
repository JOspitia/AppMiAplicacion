package com.project.backend_api.service.rrhh;



import com.project.backend_api.model.core.management.Location;
import com.project.backend_api.model.rrhh.OperationalCenter;
import com.project.backend_api.dto.rrhh.OperationalCenterDto;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.repository.rrhh.OperationalCenterRepository;
import com.project.backend_api.service.core.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OperationalCenterService {

    private final OperationalCenterRepository operationalCenterRepository;
    private final AuthService authService;

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    public List<OperationalCenterDto> getAllOperationalCenters() {
        return operationalCenterRepository.findByCompanyId(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<OperationalCenterDto> getActiveOperationalCenters() {
        return operationalCenterRepository.findByCompanyIdAndActiveTrue(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    public OperationalCenterDto getOperationalCenterById(UUID id) {
        OperationalCenter center = operationalCenterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Centro operacional no encontrado"));

        if (!center.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("Centro operacional no encontrado en la empresa actual");
        }
        return toDto(center);
    }

    @Transactional
    public OperationalCenterDto saveOperationalCenter(OperationalCenterDto dto) {
        UUID currentCompanyId = getCurrentCompanyId();
        OperationalCenter center;

        if (dto.getId() == null) {
            center = toEntity(dto);
            center.setCompany(Company.builder().id(currentCompanyId).build());
            if (center.getActive() == null) {
                center.setActive(true);
            }
        } else {
            center = operationalCenterRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Centro operacional no encontrado"));

            if (!center.getCompany().getId().equals(currentCompanyId)) {
                throw new RuntimeException("No tiene permisos para editar este centro operacional");
            }

            updateEntity(center, dto);
        }

        validateCodeDuplication(center, currentCompanyId);
        OperationalCenter saved = operationalCenterRepository.save(center);
        return toDto(saved);
    }

    private void validateCodeDuplication(OperationalCenter center, UUID companyId) {
        if (center.getCode() != null && !center.getCode().isEmpty()) {
            operationalCenterRepository.findByCodeAndCompanyId(center.getCode(), companyId)
                    .stream()
                    .filter(existing -> existing.getId() != null && !existing.getId().equals(center.getId()))
                    .findFirst()
                    .ifPresent(existing -> {
                        throw new RuntimeException(
                                "Centro operacional con el código '" + center.getCode() + "' ya existe.");
                    });
        }
    }

    @Transactional
    public void toggleActiveStatus(UUID id) {
        OperationalCenter existing = operationalCenterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Centro operacional no encontrado"));

        if (!existing.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("No tiene permisos");
        }

        existing.setActive(!existing.getActive());
        operationalCenterRepository.save(existing);
    }

    public List<OperationalCenterDto> getOperationalCentersByLocation(UUID locationId) {
        return operationalCenterRepository.findByLocationIdAndCompanyIdAndActiveTrue(locationId, getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(java.util.stream.Collectors.toList());
    }

    private OperationalCenterDto toDto(OperationalCenter entity) {
        return OperationalCenterDto.builder()
                .id(entity.getId())
                .companyId(entity.getCompany() != null ? entity.getCompany().getId() : null)
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .locationId(entity.getLocation() != null ? entity.getLocation().getId() : null)
                .locationName(entity.getLocation() != null ? entity.getLocation().getName() : null)
                .active(entity.getActive())
                .build();
    }

    private OperationalCenter toEntity(OperationalCenterDto dto) {
        OperationalCenter.OperationalCenterBuilder builder = OperationalCenter.builder()
                .id(dto.getId())
                .code(dto.getCode())
                .name(dto.getName())
                .description(dto.getDescription())
                .active(dto.getActive());

        if (dto.getLocationId() != null) {
            builder.location(Location.builder().id(dto.getLocationId()).build());
        }

        return builder.build();
    }

    private void updateEntity(OperationalCenter entity, OperationalCenterDto dto) {
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        if (dto.getActive() != null) {
            entity.setActive(dto.getActive());
        }

        if (dto.getLocationId() != null) {
            entity.setLocation(Location.builder().id(dto.getLocationId()).build());
        } else {
            entity.setLocation(null);
        }
    }
}






