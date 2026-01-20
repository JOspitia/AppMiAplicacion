package com.project.backend_api.service.rrhh;

import com.project.backend_api.dto.rrhh.IdentificationTypeDto;
import com.project.backend_api.model.core.administration.Country;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.rrhh.IdentificationType;
import com.project.backend_api.repository.core.administration.CountryRepository;
import com.project.backend_api.repository.rrhh.IdentificationTypeRepository;
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
public class IdentificationTypeService {

    private final IdentificationTypeRepository repository;
    private final CountryRepository countryRepository;
    private final AuthService authService;

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    public List<IdentificationTypeDto> getAll() {
        return repository.findAllByCompanyIdOrGlobal(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<IdentificationTypeDto> getActive() {
        return repository.findActiveByCompanyIdOrGlobal(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public IdentificationTypeDto getById(UUID id) {
        IdentificationType entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de identificación no encontrado"));

        // Validar acceso (puede ver si es global o de su compañía)
        UUID currentCompanyId = getCurrentCompanyId();
        if (entity.getCompany() != null && !entity.getCompany().getId().equals(currentCompanyId)) {
            throw new RuntimeException("No autorizado");
        }

        return toDto(entity);
    }

    @Transactional
    public IdentificationTypeDto create(IdentificationTypeDto dto) {
        UUID companyId = getCurrentCompanyId();
        validateCodeUnique(dto.getCode(), null, companyId);

        IdentificationType entity = new IdentificationType();
        entity.setCompany(Company.builder().id(companyId).build());

        updateEntityFromDto(entity, dto);

        return toDto(repository.save(entity));
    }

    @Transactional
    public IdentificationTypeDto update(UUID id, IdentificationTypeDto dto) {
        IdentificationType entity = findByIdAndValidateModification(id);
        UUID companyId = getCurrentCompanyId();

        validateCodeUnique(dto.getCode(), id, companyId);
        updateEntityFromDto(entity, dto);

        return toDto(repository.save(entity));
    }

    @Transactional
    public void toggleActive(UUID id) {
        IdentificationType entity = findByIdAndValidateModification(id);
        entity.setActive(!entity.getActive());
        repository.save(entity);
    }

    @Transactional
    public void delete(UUID id) {
        IdentificationType entity = findByIdAndValidateModification(id);
        repository.delete(entity);
    }

    private IdentificationType findByIdAndValidateModification(UUID id) {
        IdentificationType entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tipo de identificación no encontrado"));

        if (entity.getCompany() == null) {
            throw new RuntimeException("No se pueden modificar tipos de identificación globales.");
        }

        if (!entity.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("No autorizado para modificar este registro.");
        }
        return entity;
    }

    private void updateEntityFromDto(IdentificationType entity, IdentificationTypeDto dto) {
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setValidationRegex(dto.getValidationRegex());

        // Manejo de País (Relacional)
        if (dto.getCountryId() != null) {
            Country country = countryRepository.findById(dto.getCountryId())
                    .orElseThrow(() -> new RuntimeException("País no encontrado"));
            entity.setCountry(country);
        } else {
            entity.setCountry(null);
        }

        if (dto.getActive() != null) {
            entity.setActive(dto.getActive());
        }
    }

    private void validateCodeUnique(String code, UUID excludeId, UUID companyId) {
        if (code != null && !code.isBlank()) {
            repository.findByCodeAndCompanyScope(code.toUpperCase().trim(), companyId).ifPresent(existing -> {
                if (excludeId == null || !existing.getId().equals(excludeId)) {
                    throw new RuntimeException("Ya existe un tipo de identificación con el código '" + code + "'");
                }
            });
        }
    }

    private IdentificationTypeDto toDto(IdentificationType entity) {
        return IdentificationTypeDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .countryId(entity.getCountry() != null ? entity.getCountry().getId() : null)
                .countryName(entity.getCountry() != null ? entity.getCountry().getName() : null)
                .validationRegex(entity.getValidationRegex())
                .active(entity.getActive())
                .isGlobal(entity.getCompany() == null)
                .build();
    }
}
