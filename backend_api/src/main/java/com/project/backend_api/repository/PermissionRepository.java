package com.project.backend_api.repository;

import com.project.backend_api.model.Permission;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PermissionRepository extends CrudRepository<Permission, UUID> {
    /**
     * Returns permissions that belong to modules for which the given company has an
     * ACTIVE subscription.
     * Results are ordered by module name and permission name for better UI
     * grouping.
     */
    @Query("""
                SELECT p FROM Permission p
                JOIN p.module m
                JOIN CompanySubscription cs ON cs.module.id = m.id
                WHERE cs.company.id = :companyId
                  AND cs.status = 'ACTIVE'
                ORDER BY m.name, p.name
            """)
    List<Permission> findByActiveSubscriptions(@Param("companyId") UUID companyId);

    java.util.Optional<Permission> findByName(String name);
}
