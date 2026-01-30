package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.EmployeeJobHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeJobHistoryRepository extends JpaRepository<EmployeeJobHistory, UUID> {

    Optional<EmployeeJobHistory> findByEmployeeIdAndActiveTrue(UUID employeeId);
}
