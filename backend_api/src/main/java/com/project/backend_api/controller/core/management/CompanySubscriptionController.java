package com.project.backend_api.controller.core.management;

import com.project.backend_api.dto.core.administration.ModuleSubscriptionDto;
import com.project.backend_api.service.core.CompanySubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/management/companies/{companyId}/subscriptions")
@RequiredArgsConstructor
public class CompanySubscriptionController {

    private final CompanySubscriptionService subscriptionService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ROOT')")
    public ResponseEntity<List<ModuleSubscriptionDto>> listModules(@PathVariable UUID companyId) {
        return ResponseEntity.ok(subscriptionService.listModules(companyId));
    }

    @PatchMapping("/{moduleId}/toggle")
    @PreAuthorize("hasAuthority('ROLE_ROOT')")
    public ResponseEntity<Void> toggleModule(@PathVariable UUID companyId, @PathVariable UUID moduleId) {
        subscriptionService.toggleModule(companyId, moduleId);
        return ResponseEntity.ok().build();
    }
}
