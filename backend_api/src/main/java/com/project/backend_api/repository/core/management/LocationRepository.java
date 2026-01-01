package com.project.backend_api.repository.core.management;



import com.project.backend_api.model.core.management.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LocationRepository extends JpaRepository<Location, UUID> {
    List<Location> findByCompanyId(UUID companyId);

    List<Location> findByCompanyIdAndActiveTrue(UUID companyId);
}






