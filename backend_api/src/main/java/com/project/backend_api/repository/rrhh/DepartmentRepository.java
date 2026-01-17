package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {

    List<Department> findByCompanyIdOrderByCodeAsc(UUID companyId);

    List<Department> findByCompanyIdAndActiveTrueOrderByCodeAsc(UUID companyId);

    Optional<Department> findByCodeAndCompanyId(String code, UUID companyId);

    // To check if a department is used as parent?
    boolean existsByParentId(UUID parentId);
}
