package com.project.backend_api.repository;

import com.project.backend_api.model.CompanySubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanySubscriptionRepository extends JpaRepository<CompanySubscription, UUID> {
    List<CompanySubscription> findByCompanyId(UUID companyId);

    Optional<CompanySubscription> findByCompanyIdAndModuleId(UUID companyId, UUID moduleId);

    // Obtiene las suscripciones activas de una empresa
    @Query("SELECT cs FROM CompanySubscription cs WHERE cs.company.id = :companyId AND cs.status = 'ACTIVE'")
    List<CompanySubscription> findActiveByCompanyId(@Param("companyId") UUID companyId);
}
