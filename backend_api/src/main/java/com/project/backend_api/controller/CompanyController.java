package com.project.backend_api.controller;

import com.project.backend_api.dto.CompanyDto;
import com.project.backend_api.model.Company;
import com.project.backend_api.repository.CompanyRepository;
import com.project.backend_api.repository.UserCompanyRoleRepository;
import com.project.backend_api.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyRepository companyRepository;
    private final UserCompanyRoleRepository userCompanyRoleRepository;

    @PostMapping("/select")
    public ResponseEntity<?> selectCompany(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            HttpServletResponse response) {

        try {
            UUID companyId = UUID.fromString(request.get("companyId"));
            UUID userId = userDetails.getUser().getId();

            // Validate access
            boolean hasAccess;
            if (userDetails.getUser().getIsSuperAdmin()) {
                // Super admins have access to all companies
                hasAccess = companyRepository.existsById(companyId);
            } else {
                // Regular users must have explicit access
                hasAccess = userCompanyRoleRepository.existsByUserIdAndCompanyIdAndIsActiveTrue(userId, companyId);
            }

            if (!hasAccess) {
                return ResponseEntity.status(403).body(Map.of("error", "No tienes acceso a esta empresa"));
            }

            // Create company context cookie
            ResponseCookie companyCookie = ResponseCookie.from("companyContext", companyId.toString())
                    .httpOnly(true)
                    .secure(true)
                    .path("/api")
                    .maxAge(24 * 60 * 60) // 1 day
                    .sameSite("Strict")
                    .build();

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, companyCookie.toString())
                    .body(Map.of(
                            "message", "Empresa seleccionada exitosamente",
                            "companyId", companyId.toString()));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Company ID inválido"));
        }
    }

    @GetMapping("/available")
    public ResponseEntity<List<CompanyDto>> getAvailableCompanies(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        UUID userId = userDetails.getUser().getId();
        List<Company> companies;

        if (userDetails.getUser().getIsSuperAdmin()) {
            // Super admins see all active companies
            companies = companyRepository.findAllActiveCompanies();
        } else {
            // Regular users see only their assigned companies
            companies = userCompanyRoleRepository.findCompaniesByUserId(userId);
        }

        List<CompanyDto> companyDtos = companies.stream()
                .map(c -> CompanyDto.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .nit(c.getNit())
                        .build())
                .toList();

        return ResponseEntity.ok(companyDtos);
    }

    @GetMapping("/current")
    public ResponseEntity<?> getCurrentCompany(HttpServletRequest request) {
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (jakarta.servlet.http.Cookie cookie : cookies) {
                if ("companyContext".equals(cookie.getName())) {
                    try {
                        UUID companyId = UUID.fromString(cookie.getValue());
                        return companyRepository.findById(companyId)
                                .map(company -> ResponseEntity.ok((Object) CompanyDto.builder()
                                        .id(company.getId())
                                        .name(company.getName())
                                        .nit(company.getNit())
                                        .build()))
                                .orElse(ResponseEntity.ok(Map.of("hasCompany", false)));
                    } catch (IllegalArgumentException e) {
                        return ResponseEntity.ok(Map.of("hasCompany", false));
                    }
                }
            }
        }

        return ResponseEntity.ok(Map.of("hasCompany", false));
    }
}
