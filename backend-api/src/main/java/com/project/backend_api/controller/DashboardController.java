package com.project.backend_api.controller;

import com.project.backend_api.dto.ModuleDto;
import com.project.backend_api.model.User;
import com.project.backend_api.repository.UserRepository;
import com.project.backend_api.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepository userRepository;

    @GetMapping("/modules")
    public ResponseEntity<List<ModuleDto>> getModules(
            Authentication authentication,
            @CookieValue(value = "companyContext", required = false) String companyIdStr) {
        if (companyIdStr == null || companyIdStr.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UUID companyId = UUID.fromString(companyIdStr);
        List<ModuleDto> modules = dashboardService.getUserModules(user, companyId);

        return ResponseEntity.ok(modules);
    }
}
