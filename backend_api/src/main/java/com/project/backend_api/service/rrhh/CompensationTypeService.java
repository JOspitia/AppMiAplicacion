package com.project.backend_api.service.rrhh;

import com.project.backend_api.dto.rrhh.CompensationTypeDto;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.rrhh.CompensationCategory;
import com.project.backend_api.model.rrhh.CompensationType;
import com.project.backend_api.repository.core.administration.CurrencyRepository;
import com.project.backend_api.repository.rrhh.CalculationBaseRepository;
import com.project.backend_api.repository.rrhh.CompensationTypeRepository;
import com.project.backend_api.repository.rrhh.CostCenterRepository;
import com.project.backend_api.repository.rrhh.PeriodicityRepository;
import com.project.backend_api.service.core.AuthService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompensationTypeService {

    private final CompensationTypeRepository repository;
    private final CostCenterRepository costCenterRepository;
    private final PeriodicityRepository periodicityRepository;
    private final CalculationBaseRepository calculationBaseRepository;
    private final CurrencyRepository currencyRepository;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<CompensationTypeDto> getAll() {
        return repository.findAllByCompanyId(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CompensationTypeDto> getActive() {
        return repository.findActiveByCompanyId(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompensationTypeDto getById(UUID id) {
        return repository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Compensation Type not found"));
    }

    @Transactional
    public CompensationTypeDto create(CompensationTypeDto dto) {
        UUID companyId = getCurrentCompanyId();

        if (dto.getCode() != null && repository.existsByCodeAndCompanyId(dto.getCode(), companyId)) {
            throw new RuntimeException("El código ya existe en esta empresa");
        }

        CompensationType entity = new CompensationType();
        entity.setCompany(Company.builder().id(companyId).build());
        updateEntityFromDto(entity, dto);

        return toDto(repository.save(entity));
    }

    @Transactional
    public CompensationTypeDto update(UUID id, CompensationTypeDto dto) {
        CompensationType entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compensation Type not found"));

        if (!entity.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("No tiene permisos para editar este registro");
        }

        updateEntityFromDto(entity, dto);
        return toDto(repository.save(entity));
    }

    @Transactional
    public void toggleActive(UUID id) {
        CompensationType entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compensation Type not found"));

        if (!entity.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("No tiene permisos");
        }

        entity.setActive(!entity.getActive());
        repository.save(entity);
    }

    @Transactional
    public void delete(UUID id) {
        CompensationType entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Compensation Type not found"));

        if (!entity.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("No tiene permisos");
        }

        repository.delete(entity);
    }

    // --- Dropdown Options ---

    @Transactional(readOnly = true)
    public List<OptionDto> getPeriodicityOptions() {
        return periodicityRepository.findAllActive().stream()
                .map(p -> new OptionDto(p.getId(), p.getName()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OptionDto> getCalculationBaseOptions() {
        return calculationBaseRepository.findAllActive().stream()
                .map(c -> new OptionDto(c.getId(), c.getName()))
                .collect(Collectors.toList());
    }

    // --- Helpers ---

    private void updateEntityFromDto(CompensationType entity, CompensationTypeDto dto) {
        entity.setName(dto.getName());
        entity.setCode(dto.getCode());
        entity.setDescription(dto.getDescription());
        entity.setCategory(dto.getCategory() != null ? dto.getCategory() : CompensationCategory.EARNING);

        entity.setIsSalary(dto.getIsSalary());
        entity.setIsTaxable(dto.getIsTaxable());
        entity.setIsVariable(dto.getIsVariable());
        entity.setIsReadOnly(dto.getIsReadOnly());
        entity.setActive(dto.getActive());

        entity.setFixedAmount(dto.getFixedAmount());
        entity.setPercentage(dto.getPercentage());
        entity.setTargetValue(dto.getTargetValue());

        if (dto.getCostCenterId() != null) {
            entity.setCostCenter(costCenterRepository.findById(dto.getCostCenterId()).orElse(null));
        } else {
            entity.setCostCenter(null);
        }

        if (dto.getCurrencyId() != null) {
            entity.setCurrency(currencyRepository.findById(dto.getCurrencyId()).orElse(null));
        } else {
            entity.setCurrency(null);
        }

        if (dto.getPeriodicityId() != null) {
            entity.setPeriodicity(periodicityRepository.findById(dto.getPeriodicityId()).orElse(null));
        } else {
            entity.setPeriodicity(null);
        }

        if (dto.getCalculationBaseId() != null) {
            entity.setCalculationBase(calculationBaseRepository.findById(dto.getCalculationBaseId()).orElse(null));
        } else {
            entity.setCalculationBase(null);
        }
    }

    private CompensationTypeDto toDto(CompensationType entity) {
        return CompensationTypeDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .description(entity.getDescription())
                .category(entity.getCategory())
                .categoryLabel(entity.getCategory().getLabel())
                .isSalary(entity.getIsSalary())
                .isTaxable(entity.getIsTaxable())
                .isVariable(entity.getIsVariable())
                .isReadOnly(entity.getIsReadOnly())
                .active(entity.getActive())
                .costCenterId(entity.getCostCenter() != null ? entity.getCostCenter().getId() : null)
                .costCenterName(entity.getCostCenter() != null ? entity.getCostCenter().getName() : null)
                .currencyId(entity.getCurrency() != null ? entity.getCurrency().getId() : null)
                .currencyCode(entity.getCurrency() != null ? entity.getCurrency().getCode() : null)
                .periodicityId(entity.getPeriodicity() != null ? entity.getPeriodicity().getId() : null)
                .periodicityName(entity.getPeriodicity() != null ? entity.getPeriodicity().getName() : null)
                .calculationBaseId(entity.getCalculationBase() != null ? entity.getCalculationBase().getId() : null)
                .calculationBaseName(entity.getCalculationBase() != null ? entity.getCalculationBase().getName() : null)
                .fixedAmount(entity.getFixedAmount())
                .percentage(entity.getPercentage())
                .targetValue(entity.getTargetValue())
                .build();
    }

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    @Data
    @AllArgsConstructor
    public static class OptionDto {
        private UUID id;
        private String name;
    }
}
