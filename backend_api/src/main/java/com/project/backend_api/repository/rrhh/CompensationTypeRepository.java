package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.CompensationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompensationTypeRepository extends JpaRepository<CompensationType, UUID> {

    @Query("SELECT c FROM CompensationType c WHERE c.company.id = :companyId ORDER BY c.category, c.name ASC")
    List<CompensationType> findAllByCompanyId(@Param("companyId") UUID companyId);

    @Query("SELECT c FROM CompensationType c WHERE c.company.id = :companyId AND c.active = true ORDER BY c.name ASC")
    List<CompensationType> findActiveByCompanyId(@Param("companyId") UUID companyId);

    boolean existsByCodeAndCompanyId(String code, UUID companyId);
}
