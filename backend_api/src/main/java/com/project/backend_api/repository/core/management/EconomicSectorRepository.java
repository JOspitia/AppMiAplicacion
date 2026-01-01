package com.project.backend_api.repository.core.management;



import com.project.backend_api.model.core.management.EconomicSector;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EconomicSectorRepository extends CrudRepository<EconomicSector, UUID> {
    List<EconomicSector> findByActiveTrue();
}






