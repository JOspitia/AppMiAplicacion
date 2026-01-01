package com.project.backend_api.repository.rrhh;



import com.project.backend_api.model.rrhh.OperationalCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface OperationalCenterRepository extends JpaRepository<OperationalCenter, UUID> {
    List<OperationalCenter> findByCompanyId(UUID companyId);

    List<OperationalCenter> findByCompanyIdAndActiveTrue(UUID companyId);

    Optional<OperationalCenter> findByCodeAndCompanyId(String code, UUID companyId);

    List<OperationalCenter> findByLocationIdAndCompanyIdAndActiveTrue(UUID locationId, UUID companyId);
}


