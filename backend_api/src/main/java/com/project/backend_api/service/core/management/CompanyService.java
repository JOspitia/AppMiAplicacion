package com.project.backend_api.service.core.management;

import com.project.backend_api.repository.core.administration.CityRepository;
import com.project.backend_api.repository.core.management.CompanyRepository;
import com.project.backend_api.repository.core.management.EntityTypeRepository;
import com.project.backend_api.model.core.management.EntityType;
import com.project.backend_api.model.core.management.EconomicSector;
import com.project.backend_api.repository.core.administration.CountryRepository;
import com.project.backend_api.repository.core.management.EconomicSectorRepository;
import com.project.backend_api.service.core.MinioService;
import com.project.backend_api.repository.core.administration.StateRepository;
import com.project.backend_api.model.core.administration.State;

import com.project.backend_api.dto.core.management.CompanyDto;
import com.project.backend_api.dto.core.management.CompanyWebsiteDTO;
import com.project.backend_api.model.core.management.*;
import com.project.backend_api.model.core.administration.*;
import com.project.backend_api.repository.core.management.*;

import com.project.backend_api.repository.rrhh.EmployeeRepository;
import com.project.backend_api.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final EntityTypeRepository entityTypeRepository;
    private final EconomicSectorRepository economicSectorRepository;
    private final CountryRepository countryRepository;
    private final StateRepository stateRepository;
    private final CityRepository cityRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final MinioService minioService;

    private final UserCompanyRoleRepository userCompanyRoleRepository;

    @Transactional(readOnly = true)
    public List<CompanyDto> listAll() {
        User currentUser = getCurrentUser();
        if (currentUser == null)
            return List.of();

        List<Company> companies;
        // ONLY users with isSuperAdmin = true (global) see all companies
        if (Boolean.TRUE.equals(currentUser.getIsSuperAdmin())) {
            // Convert Iterable to List explicitly to avoid ClassCastException
            companies = new java.util.ArrayList<>();
            companyRepository.findAll().forEach(companies::add);
        } else {
            // Others see only where they are assigned
            companies = userCompanyRoleRepository.findCompaniesByUserId(currentUser.getId());
        }

        return companies.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CompanyDto getById(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));
        return toDto(company);
    }

    public CompanyDto create(CompanyDto dto) {
        Company company = new Company();
        updateCompanyFromDto(company, dto, true);

        // Set created_by from authenticated user
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            company.setCreatedBy(currentUser);
        }

        Company saved = companyRepository.save(company);
        return toDto(saved);
    }

    public CompanyDto update(UUID id, CompanyDto dto) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));

        updateCompanyFromDto(company, dto, false);

        // Set updated_by from authenticated user
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            company.setUpdatedBy(currentUser);
        }

        Company updated = companyRepository.save(company);
        return toDto(updated);
    }

    public CompanyDto setStatus(UUID id, boolean status) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));

        company.setStatus(status);

        // Set updated_by
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            company.setUpdatedBy(currentUser);
        }

        Company updated = companyRepository.save(company);
        return toDto(updated);
    }

    public void toggleStatus(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));
        company.setStatus(!company.getStatus());
        companyRepository.save(company);
    }

    public void softDelete(UUID id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Empresa no encontrada"));

        company.setStatus(false);
        company.setDeletedAt(LocalDateTime.now());

        User currentUser = getCurrentUser();
        if (currentUser != null) {
            company.setDeletedBy(currentUser);
        }

        companyRepository.save(company);
    }

    public Map<String, String> uploadLogo(UUID companyId, MultipartFile file) {
        // Validación de seguridad: Solo imágenes
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen válida (PNG, JPG, SVG)");
        }

        // Use generic global service for standard processing
        Map<String, String> result = minioService.uploadPrivateMultipartFile(companyId, "images", "logo", file);

        String logoUrl = result.get("url");

        // Domain Logic: Auto-update company record
        companyRepository.findById(companyId).ifPresent(company -> {
            company.setLogoUrl(logoUrl);
            companyRepository.save(company);
        });

        return result;
    }

    // DTO Conversion Methods
    private CompanyDto toDto(Company company) {
        if (company == null)
            return null;

        // Calculate active employee count
        Long activeEmployeeCount = employeeRepository.countActiveEmployeesByCompanyId(company.getId());

        CompanyDto.CompanyDtoBuilder builder = CompanyDto.builder()
                .id(company.getId())
                .name(company.getName())
                .nit(company.getNit())
                .legalName(company.getLegalName())
                .notificationEmail(company.getNotificationEmail())
                .description(company.getDescription())
                .mainPhone(company.getMainPhone())
                .mobilePhone(company.getMobilePhone())
                .phoneExtension(company.getPhoneExtension())
                .streetAddress(company.getStreetAddress())
                .postalCode(company.getPostalCode())
                .logoUrl(company.getLogoUrl())
                .primaryColor(company.getPrimaryColor())
                .allowedDomain(company.getAllowedDomain())
                .trialEndsAt(company.getTrialEndsAt())
                .subscriptionEndsAt(company.getSubscriptionEndsAt())
                .subscriptionNotificationPending(company.getSubscriptionNotificationPending())
                .status(company.getStatus())
                .activeEmployeeCount(activeEmployeeCount) // Calculated field
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt());

        // Entity Type
        if (company.getEntityType() != null) {
            builder.entityTypeId(company.getEntityType().getId())
                    .entityTypeName(company.getEntityType().getName());
        }

        // Economic Sector
        if (company.getSector() != null) {
            builder.sectorId(company.getSector().getId())
                    .sectorName(company.getSector().getName());
        }
        builder.otherSector(company.getOtherSector());

        // Geography
        if (company.getCountry() != null) {
            builder.countryId(company.getCountry().getId())
                    .countryName(company.getCountry().getName());
        }
        if (company.getState() != null) {
            builder.stateId(company.getState().getId())
                    .stateName(company.getState().getName());
        }
        if (company.getCity() != null) {
            builder.cityId(company.getCity().getId())
                    .cityName(company.getCity().getName());
        }

        // Websites
        if (company.getWebsites() != null && !company.getWebsites().isEmpty()) {
            List<CompanyWebsiteDTO> websiteDTOs = company.getWebsites().stream()
                    .map(w -> new CompanyWebsiteDTO(w.getId(), w.getUrl(), w.getIsPrimary(), w.getDescription()))
                    .collect(Collectors.toList());
            builder.websites(websiteDTOs);
        }

        // Audit
        if (company.getCreatedBy() != null) {
            builder.createdById(company.getCreatedBy().getId())
                    .createdByName(
                            company.getCreatedBy().getFirstName() + " " + company.getCreatedBy().getFirstSurname());
        }
        if (company.getUpdatedBy() != null) {
            builder.updatedById(company.getUpdatedBy().getId())
                    .updatedByName(
                            company.getUpdatedBy().getFirstName() + " " + company.getUpdatedBy().getFirstSurname());
        }

        return builder.build();
    }

    // Update Company entity from DTO
    private void updateCompanyFromDto(Company company, CompanyDto dto, boolean isNew) {
        company.setName(dto.getName());
        company.setNit(dto.getNit());
        company.setLegalName(dto.getLegalName());
        company.setNotificationEmail(dto.getNotificationEmail());
        company.setDescription(dto.getDescription());
        company.setMainPhone(dto.getMainPhone());
        company.setMobilePhone(dto.getMobilePhone());
        company.setPhoneExtension(dto.getPhoneExtension());
        company.setStreetAddress(dto.getStreetAddress());
        company.setPostalCode(dto.getPostalCode());
        company.setLogoUrl(dto.getLogoUrl());
        company.setPrimaryColor(dto.getPrimaryColor());
        company.setAllowedDomain(dto.getAllowedDomain());
        company.setStatus(dto.getStatus() != null ? dto.getStatus() : true);

        // Entity Type
        if (dto.getEntityTypeId() != null) {
            EntityType entityType = entityTypeRepository.findById(dto.getEntityTypeId()).orElse(null);
            company.setEntityType(entityType);
        }

        // Economic Sector
        if (dto.getSectorId() != null) {
            EconomicSector sector = economicSectorRepository.findById(dto.getSectorId()).orElse(null);
            company.setSector(sector);
        }
        company.setOtherSector(dto.getOtherSector());

        // Geography
        if (dto.getCountryId() != null) {
            Country country = countryRepository.findById(dto.getCountryId()).orElse(null);
            company.setCountry(country);
        }
        if (dto.getStateId() != null) {
            State state = stateRepository.findById(dto.getStateId()).orElse(null);
            company.setState(state);
        }
        if (dto.getCityId() != null) {
            City city = cityRepository.findById(dto.getCityId()).orElse(null);
            company.setCity(city);
        }

        // Websites - handle separately if needed
        // For now, we'll skip complex website management in this method
        // It should be handled through a dedicated endpoint or service method
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof CustomUserDetails) {
                return ((CustomUserDetails) principal).getUser();
            } else if (principal instanceof String) {
                String username = (String) principal;
                return userRepository.findByUsername(username).orElse(null);
            }
        }
        return null;
    }
}
