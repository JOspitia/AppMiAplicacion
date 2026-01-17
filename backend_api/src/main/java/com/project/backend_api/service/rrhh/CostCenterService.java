package com.project.backend_api.service.rrhh;

import com.project.backend_api.dto.rrhh.CostCenterDto;
import com.project.backend_api.model.core.administration.Currency;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.rrhh.CostCenter;
import com.project.backend_api.repository.rrhh.CostCenterRepository;
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
public class CostCenterService {

    private final CostCenterRepository costCenterRepository;
    private final AuthService authService;

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    public List<CostCenterDto> getAllCostCenters() {
        return costCenterRepository.findByCompanyId(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<CostCenterDto> getActiveCostCenters() {
        return costCenterRepository.findByCompanyIdAndActiveTrue(getCurrentCompanyId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CostCenterDto getCostCenterById(UUID id) {
        CostCenter costCenter = costCenterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Centro de Costos no encontrado"));

        if (!costCenter.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("Centro de Costos no encontrado en la empresa actual");
        }
        return toDto(costCenter);
    }

    @Transactional
    public CostCenterDto saveCostCenter(CostCenterDto dto) {
        UUID currentCompanyId = getCurrentCompanyId();
        CostCenter costCenter;

        if (dto.getId() == null) {
            costCenter = toEntity(dto);
            costCenter.setCompany(Company.builder().id(currentCompanyId).build());
            if (costCenter.getActive() == null) {
                costCenter.setActive(true);
            }
        } else {
            costCenter = costCenterRepository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Centro de Costos no encontrado"));

            if (!costCenter.getCompany().getId().equals(currentCompanyId)) {
                throw new RuntimeException("No tiene permisos para editar este centro de costos");
            }

            updateEntity(costCenter, dto);
        }

        validateCodeDuplication(costCenter, currentCompanyId);
        CostCenter saved = costCenterRepository.save(costCenter);
        return toDto(saved);
    }

    private void validateCodeDuplication(CostCenter costCenter, UUID companyId) {
        if (costCenter.getCode() != null && !costCenter.getCode().isEmpty()) {
            costCenterRepository.findByCodeAndCompanyId(costCenter.getCode(), companyId)
                    .ifPresent(existing -> {
                        if (existing.getId() != null && !existing.getId().equals(costCenter.getId())) {
                            throw new RuntimeException(
                                    "Ya existe un Centro de Costos con el código '" + costCenter.getCode() + "'.");
                        }
                    });
        }
    }

    @Transactional
    public void toggleActiveStatus(UUID id) {
        CostCenter existing = costCenterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Centro de Costos no encontrado"));

        if (!existing.getCompany().getId().equals(getCurrentCompanyId())) {
            throw new RuntimeException("No tiene permisos");
        }

        existing.setActive(!existing.getActive());
        costCenterRepository.save(existing);
    }

    private CostCenterDto toDto(CostCenter entity) {
        return CostCenterDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .budget(entity.getBudget())
                .currencyId(entity.getCurrency() != null ? entity.getCurrency().getId() : null)
                .currencyCode(entity.getCurrency() != null ? entity.getCurrency().getCode() : null)
                .currencySymbol(entity.getCurrency() != null ? entity.getCurrency().getSymbol() : null)
                .transportAidThreshold(entity.getTransportAidThreshold())
                .description(entity.getDescription())
                .active(entity.getActive())
                .build();
    }

    private void updateEntity(CostCenter entity, CostCenterDto dto) {
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setBudget(dto.getBudget());
        entity.setTransportAidThreshold(dto.getTransportAidThreshold());
        entity.setDescription(dto.getDescription());

        if (dto.getCurrencyId() != null) {
            entity.setCurrency(Currency.builder().id(dto.getCurrencyId()).build());
        } else {
            entity.setCurrency(null);
        }

        if (dto.getActive() != null) {
            entity.setActive(dto.getActive());
        }
    }

    private CostCenter toEntity(CostCenterDto dto) {
        CostCenter.CostCenterBuilder builder = CostCenter.builder()
                .id(dto.getId())
                .code(dto.getCode())
                .name(dto.getName())
                .budget(dto.getBudget())
                .transportAidThreshold(dto.getTransportAidThreshold())
                .description(dto.getDescription())
                .active(dto.getActive());

        if (dto.getCurrencyId() != null) {
            builder.currency(Currency.builder().id(dto.getCurrencyId()).build());
        }

        return builder.build();
    }
}
