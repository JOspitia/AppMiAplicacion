package com.project.project.service.core;

import com.project.project.model.Company;
import com.project.project.repository.core.CompanyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;

    public Company createCompany(Company company) {
        if (companyRepository.findByNit(company.getNit()).isPresent()) {
            throw new IllegalArgumentException("Company with NIT " + company.getNit() + " already exists.");
        }
        return companyRepository.save(company);
    }

    public Optional<Company> getCompanyById(UUID id) {
        return companyRepository.findById(id);
    }

    public List<Company> listAllCompanies() {
        return (List<Company>) companyRepository.findAll();
    }

    public Company updateCompany(UUID id, Company updated) {
        return companyRepository.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setNit(updated.getNit());
                    existing.setEmailExtension(updated.getEmailExtension());
                    existing.setStatus(updated.getStatus());
                    return companyRepository.save(existing);
                })
                .orElseThrow(() -> new IllegalArgumentException("Company not found: " + id));
    }

    public void deleteCompany(UUID id) {
        companyRepository.deleteById(id);
    }

    // Impersonation logic (placeholder for now, to be integrated with Auth)
    public void impersonate(UUID companyId) {
        // In a real scenario, this might generate a special token or switch the current
        // session context
        // For now, we just verify the company exists
        companyRepository.findById(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found for impersonation: " + companyId));

        // The actual context switch happens in the AuthController/Filter via the
        // COMPANY_ID cookie/header
    }
}
