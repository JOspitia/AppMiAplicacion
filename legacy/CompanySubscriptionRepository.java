package com.project.project.repository.core;

import com.project.project.model.CompanySubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanySubscriptionRepository extends JpaRepository<CompanySubscription, UUID> {
    List<CompanySubscription> findByCompanyId(UUID companyId);

    Optional<CompanySubscription> findByCompanyIdAndModuleId(UUID companyId, UUID moduleId);
}
