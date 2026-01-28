package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.Employee;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends org.springframework.data.jpa.repository.JpaRepository<Employee, UUID> {

    List<Employee> findByCompanyId(UUID companyId);

    Optional<Employee> findByIdAndCompanyId(UUID id, UUID companyId);

    boolean existsByCompanyIdAndIdentificationNumber(UUID companyId, String identificationNumber);

    boolean existsByCompanyIdAndEmailCorporate(UUID companyId, String emailCorporate);

    @Query(value = "SELECT COUNT(*) FROM business_rrhh.employees WHERE company_id = :companyId AND active = true", nativeQuery = true)
    Long countActiveEmployeesByCompanyId(@Param("companyId") UUID companyId);
}
