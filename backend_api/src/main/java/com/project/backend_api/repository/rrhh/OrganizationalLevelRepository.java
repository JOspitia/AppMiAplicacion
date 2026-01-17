package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.OrganizationalLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrganizationalLevelRepository extends JpaRepository<OrganizationalLevel, UUID> {
    List<OrganizationalLevel> findByCompanyIdOrderByHierarchyOrderAsc(UUID companyId);

    List<OrganizationalLevel> findByCompanyIdAndActiveTrueOrderByHierarchyOrderAsc(UUID companyId);

    Optional<OrganizationalLevel> findByNameAndCompanyId(String name, UUID companyId);

    Optional<OrganizationalLevel> findByHierarchyOrderAndCompanyId(Integer hierarchyOrder, UUID companyId);

    Optional<OrganizationalLevel> findByIdAndCompanyId(UUID id, UUID companyId);

    long countByCompanyId(UUID companyId);

    @org.springframework.data.jpa.repository.Query("SELECT MAX(o.hierarchyOrder) FROM OrganizationalLevel o WHERE o.company.id = :companyId")
    Integer findMaxHierarchyOrder(UUID companyId);
}
