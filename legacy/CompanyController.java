package com.project.project.controller.core;

import com.project.project.model.Company;
import com.project.project.security.RequiresModule;
import com.project.project.service.core.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Controller
@RequestMapping("/core/companies")
@RequiresModule("CORE_PLATFORM")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final com.project.project.service.core.UserCompanyRoleService userCompanyRoleService;
    private final com.project.project.service.BreadcrumbService breadcrumbService;

    @GetMapping
    public String listCompanies(Model model,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {

        // Check if user is ROOT (Super Admin)
        boolean isRoot = userDetails.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ROOT"));

        java.util.List<Company> companies;
        if (isRoot) {
            // ROOT sees all companies
            companies = companyService.listAllCompanies();
        } else {
            // Other users only see companies they belong to
            if (userDetails instanceof com.project.project.security.CustomUserDetails) {
                com.project.project.security.CustomUserDetails customUser = (com.project.project.security.CustomUserDetails) userDetails;
                companies = userCompanyRoleService.findCompaniesForUser(customUser.getUser().getId());
            } else {
                companies = java.util.Collections.emptyList();
            }
        }

        // Convert to DTOs
        java.util.List<com.project.project.dto.core.CompanyDto> companyDtos = companies.stream()
                .map(c -> com.project.project.dto.core.CompanyDto.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .nit(c.getNit())
                        .emailExtension(c.getEmailExtension())
                        .status(c.getStatus())
                        .build())
                .toList();

        model.addAttribute("companies", companyDtos);
        model.addAttribute("isRoot", isRoot);
        model.addAttribute("breadcrumbs", breadcrumbService.createSimple("Empresas"));
        return "core/administration/companies/list";
    }

    @GetMapping("/create")
    @PreAuthorize("hasRole('ROLE_ROOT')")
    public String createCompanyForm(Model model) {
        model.addAttribute("company", new Company());
        model.addAttribute("breadcrumbs", breadcrumbService.builder()
                .addItem("Inicio", "/home")
                .addItem("Empresas", "/core/companies")
                .addCurrent("Nueva Empresa")
                .build());
        return "core/administration/companies/form";
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ROLE_ROOT')")
    public String createCompany(@ModelAttribute Company company,
            org.springframework.web.servlet.mvc.support.RedirectAttributes redirectAttributes,
            Model model) {
        try {
            companyService.createCompany(company);
            redirectAttributes.addFlashAttribute("success", "Empresa creada exitosamente");
            return "redirect:/core/companies";
        } catch (IllegalArgumentException e) {
            model.addAttribute("error", e.getMessage());
            model.addAttribute("company", company);
            model.addAttribute("breadcrumbs", breadcrumbService.builder()
                    .addItem("Inicio", "/home")
                    .addItem("Empresas", "/core/companies")
                    .addCurrent("Nueva Empresa")
                    .build());
            return "core/administration/companies/form";
        }
    }

    @GetMapping("/edit/{id}")
    @PreAuthorize("hasRole('ROLE_ROOT')")
    public String editCompanyForm(@PathVariable UUID id, Model model) {
        Company company = companyService.getCompanyById(id)
                .orElseThrow(() -> new IllegalArgumentException("Invalid company Id:" + id));

        // Convert to DTO
        com.project.project.dto.core.CompanyDto companyDto = com.project.project.dto.core.CompanyDto.builder()
                .id(company.getId())
                .name(company.getName())
                .nit(company.getNit())
                .emailExtension(company.getEmailExtension())
                .status(company.getStatus())
                .build();

        model.addAttribute("company", companyDto);
        model.addAttribute("breadcrumbs", breadcrumbService.builder()
                .addItem("Inicio", "/home")
                .addItem("Empresas", "/core/companies")
                .addCurrent("Editar Empresa")
                .build());
        return "core/administration/companies/form";
    }

    @PostMapping("/edit/{id}")
    @PreAuthorize("hasRole('ROLE_ROOT')")
    public String updateCompany(@PathVariable UUID id, @ModelAttribute Company company) {
        companyService.updateCompany(id, company);
        return "redirect:/core/companies";
    }

    @PostMapping("/impersonate/{id}")
    @PreAuthorize("hasRole('ROLE_ROOT')")
    public String impersonateCompany(@PathVariable UUID id) {
        companyService.impersonate(id);
        // In a real implementation, this would set a cookie/session and redirect
        // For now, we'll just redirect to home, assuming the service or filter handles
        // the context switch if implemented
        // But since we are just validating the UI flow:
        return "redirect:/home?impersonated=true";
    }
}
