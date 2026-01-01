package com.project.backend_api.service.core;

import com.project.backend_api.repository.core.administration.SaasModuleRepository;
import com.project.backend_api.model.core.administration.SaasModule;
import com.project.backend_api.dto.core.administration.ModuleSubscriptionDto;
import com.project.backend_api.model.core.management.Company;
import com.project.backend_api.model.core.management.CompanySubscription;
import com.project.backend_api.repository.core.management.CompanyRepository;
import com.project.backend_api.repository.core.management.CompanySubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompanySubscriptionService {

    private final CompanySubscriptionRepository subscriptionRepository;
    private final CompanyRepository companyRepository;
    private final SaasModuleRepository moduleRepository;

    @Transactional(readOnly = true)
    public List<ModuleSubscriptionDto> listModules(UUID companyId) {
        List<SaasModule> allModules = moduleRepository.findAll();

        return allModules.stream()
                .map(module -> {
                    boolean isSubscribed = isModuleActive(companyId, module.getId());
                    return ModuleSubscriptionDto.builder()
                            .id(module.getId())
                            .code(module.getCode())
                            .name(module.getName())
                            .description(module.getDescription())
                            .isSubscribed(isSubscribed)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private boolean isModuleActive(UUID companyId, UUID moduleId) {
        return subscriptionRepository.findByCompanyIdAndModuleId(companyId, moduleId)
                .map(sub -> "ACTIVE".equals(sub.getStatus()))
                .orElse(false);
    }

    @Transactional
    public void toggleModule(UUID companyId, UUID moduleId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Empresa no encontrada"));
        SaasModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));

        Optional<CompanySubscription> existing = subscriptionRepository.findByCompanyIdAndModuleId(companyId, moduleId);

        if (existing.isPresent()) {
            CompanySubscription sub = existing.get();
            if ("ACTIVE".equals(sub.getStatus())) {
                sub.setStatus("SUSPENDED");
                sub.setEndDate(LocalDateTime.now());
            } else {
                sub.setStatus("ACTIVE");
                sub.setEndDate(null);
            }
            subscriptionRepository.save(sub);
        } else {
            CompanySubscription sub = CompanySubscription.builder()
                    .company(company)
                    .module(module)
                    .startDate(LocalDateTime.now())
                    .status("ACTIVE")
                    .build();
            subscriptionRepository.save(sub);
        }
    }
}
