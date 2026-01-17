package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.CostCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CostCenterRepository extends JpaRepository<CostCenter, UUID> {
    List<CostCenter> findByCompanyId(UUID companyId);

    List<CostCenter> findByCompanyIdAndActiveTrue(UUID companyId);

    Optional<CostCenter> findByCodeAndCompanyId(String code, UUID companyId);
}
