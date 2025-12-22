package com.project.project.service.core;

import com.project.project.annotation.TransactionalWithRollback;

import com.project.project.model.Company;
import com.project.project.model.CompanySubscription;
import com.project.project.model.SaaSModule;
import com.project.project.repository.core.CompanyRepository;
import com.project.project.repository.core.CompanySubscriptionRepository;
import com.project.project.repository.SaaSModuleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanySubscriptionService {

    private final CompanySubscriptionRepository subscriptionRepository;
    private final CompanyRepository companyRepository;
    private final SaaSModuleRepository moduleRepository;

    public boolean isModuleActive(UUID companyId, String moduleCode) {
        Optional<SaaSModule> moduleOpt = moduleRepository.findByCode(moduleCode);
        if (moduleOpt.isEmpty()) {
            log.warn("DEBUG: Módulo no encontrado: {}", moduleCode);
            return false;
        }
        SaaSModule module = moduleOpt.get();
        if (!module.getIsActive()) {
            log.debug("DEBUG: Módulo inactivo globalmente: {}", moduleCode);
            return false;
        }

        Optional<CompanySubscription> subscriptionOpt = subscriptionRepository.findByCompanyIdAndModuleId(companyId,
                module.getId());
        if (subscriptionOpt.isEmpty()) {
            log.debug("DEBUG: Suscripción no encontrada para compañía {} y módulo {}", companyId, moduleCode);
            return false;
        }

        CompanySubscription subscription = subscriptionOpt.get();
        boolean isActive = subscription.getStatus() == CompanySubscription.SubscriptionStatus.ACTIVE &&
                (subscription.getEndDate() == null || subscription.getEndDate().isAfter(LocalDateTime.now()));

        if (!isActive) {
            log.debug("DEBUG: Suscripción inactiva. Status: {}, EndDate: {}, Now: {}",
                    subscription.getStatus(), subscription.getEndDate(), LocalDateTime.now());
        }

        return isActive;
    }

    @TransactionalWithRollback
    public void activateModule(UUID companyId, UUID moduleId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));
        SaaSModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Module not found"));

        Optional<CompanySubscription> existing = subscriptionRepository.findByCompanyIdAndModuleId(companyId, moduleId);
        if (existing.isPresent()) {
            CompanySubscription sub = existing.get();
            sub.setStatus(CompanySubscription.SubscriptionStatus.ACTIVE);
            sub.setEndDate(null); // Reset end date or set to future
            subscriptionRepository.save(sub);
        } else {
            CompanySubscription sub = CompanySubscription.builder()
                    .company(company)
                    .module(module)
                    .startDate(LocalDateTime.now())
                    .status(CompanySubscription.SubscriptionStatus.ACTIVE)
                    .build();
            subscriptionRepository.save(sub);
        }
    }

    @TransactionalWithRollback
    public void suspendModule(UUID companyId, UUID moduleId) {
        CompanySubscription sub = subscriptionRepository.findByCompanyIdAndModuleId(companyId, moduleId)
                .orElseThrow(() -> new IllegalArgumentException("Subscription not found"));
        sub.setStatus(CompanySubscription.SubscriptionStatus.SUSPENDED);
        sub.setEndDate(LocalDateTime.now());
        subscriptionRepository.save(sub);
    }

    public List<CompanySubscription> getSubscriptions(UUID companyId) {
        return subscriptionRepository.findByCompanyId(companyId);
    }
}
