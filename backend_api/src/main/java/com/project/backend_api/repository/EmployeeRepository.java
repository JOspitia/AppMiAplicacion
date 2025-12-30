package com.project.backend_api.repository;

import com.project.backend_api.model.Employee;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EmployeeRepository extends CrudRepository<Employee, UUID> {

    @Query(value = "SELECT COUNT(*) FROM business_rrhh.employees WHERE company_id = :companyId AND active = true", nativeQuery = true)
    Long countActiveEmployeesByCompanyId(@Param("companyId") UUID companyId);
}
