package com.project.backend_api.service.rrhh;

import com.project.backend_api.repository.core.management.CompanyRepository;
import com.project.backend_api.repository.rrhh.ContractTypeRepository;
import com.project.backend_api.model.rrhh.ContractType;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.service.core.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractTypeService {

    private final ContractTypeRepository repository;
    private final CompanyRepository companyRepository;
    private final AuthService authService;

    private UUID getCurrentCompanyId() {
        return authService.getSelectedCompanyId();
    }

    public List<ContractType> findAll() {
        return repository.findByCompanyId(getCurrentCompanyId());
    }

    public List<ContractType> findAllActive() {
        return repository.findByCompanyIdAndActiveTrue(getCurrentCompanyId());
    }

    public ContractType findById(UUID id) {
        return repository.findById(id)
                .filter(e -> e.getCompany().getId().equals(getCurrentCompanyId()))
                .orElseThrow(() -> new RuntimeException("Tipo de contrato no encontrado"));
    }

    @Transactional
    public ContractType save(ContractType contractType) {
        if (isNameDuplicated(contractType)) {
            throw new IllegalArgumentException("Ya existe un tipo de contrato con este nombre.");
        }

        if (contractType.getId() == null) {
            Company company = companyRepository.findById(getCurrentCompanyId())
                    .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
            contractType.setCompany(company);
            if (contractType.getActive() == null)
                contractType.setActive(true);
        } else {
            ContractType existing = findById(contractType.getId());
            existing.setName(contractType.getName());
            existing.setDescription(contractType.getDescription());
            existing.setHasEndDate(contractType.getHasEndDate());
            existing.setDefaultDuration(contractType.getDefaultDuration());
            existing.setDurationUnit(contractType.getDurationUnit());
            if (contractType.getActive() != null) {
                existing.setActive(contractType.getActive());
            }
            contractType = existing;
        }
        return repository.save(contractType);
    }

    private boolean isNameDuplicated(ContractType contractType) {
        if (contractType.getId() == null) {
            return repository.existsByCompanyIdAndName(getCurrentCompanyId(), contractType.getName());
        } else {
            return repository.existsByCompanyIdAndNameAndIdNot(getCurrentCompanyId(), contractType.getName(),
                    contractType.getId());
        }
    }

    @Transactional
    public void delete(UUID id) {
        ContractType existing = findById(id);
        repository.delete(existing);
    }

    @Transactional
    public ContractType toggleActive(UUID id) {
        ContractType existing = findById(id);
        existing.setActive(!existing.getActive());
        return repository.save(existing);
    }
}
