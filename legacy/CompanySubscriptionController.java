package com.project.project.controller.core;

import com.project.project.model.Company;
import com.project.project.model.SaaSModule;
import com.project.project.repository.core.CompanyRepository;
import com.project.project.security.RequiresModule;
import com.project.project.service.core.CompanySubscriptionService;
import com.project.project.service.SaaSConfigurationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/core/companies/{companyId}/subscriptions")
@RequiresModule("CORE_PLATFORM")
@RequiredArgsConstructor
public class CompanySubscriptionController {

    private final CompanySubscriptionService subscriptionService;
    private final SaaSConfigurationService configurationService;
    private final CompanyRepository companyRepository;

    @GetMapping
    public String listSubscriptions(@PathVariable UUID companyId, Model model) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found"));

        List<SaaSModule> allModules = configurationService.getAllModules();

        // Create a view model list
        List<ModuleSubscriptionViewModel> viewModels = allModules.stream()
                .map(module -> {
                    boolean isActive = subscriptionService.isModuleActive(companyId, module.getCode());
                    return new ModuleSubscriptionViewModel(module, isActive);
                })
                .collect(Collectors.toList());

        model.addAttribute("company", company);
        model.addAttribute("modules", viewModels);

        return "core/administration/companies/subscriptions";
    }

    @PostMapping("/{moduleId}/toggle")
    public String toggleSubscription(@PathVariable UUID companyId, @PathVariable UUID moduleId) {
        // Check current status
        SaaSModule module = configurationService.getAllModules().stream()
                .filter(m -> m.getId().equals(moduleId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Module not found"));

        boolean isActive = subscriptionService.isModuleActive(companyId, module.getCode());

        if (isActive) {
            subscriptionService.suspendModule(companyId, moduleId);
        } else {
            subscriptionService.activateModule(companyId, moduleId);
        }

        return "redirect:/core/companies/" + companyId + "/subscriptions";
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ModuleSubscriptionViewModel {
        private SaaSModule module;
        private boolean active;
    }
}
