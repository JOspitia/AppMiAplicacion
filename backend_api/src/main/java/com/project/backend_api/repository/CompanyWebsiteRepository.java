package com.project.backend_api.repository;

import com.project.backend_api.model.CompanyWebsite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyWebsiteRepository extends JpaRepository<CompanyWebsite, UUID> {
    List<CompanyWebsite> findByCompanyId(UUID companyId);
}
