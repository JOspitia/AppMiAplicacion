package com.project.backend_api.repository.core.administration;



import com.project.backend_api.model.core.management.CompanyWebsite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyWebsiteRepository extends JpaRepository<CompanyWebsite, UUID> {
    List<CompanyWebsite> findByCompanyId(UUID companyId);
}






