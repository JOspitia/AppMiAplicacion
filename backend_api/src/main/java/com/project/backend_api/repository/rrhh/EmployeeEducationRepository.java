package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.EmployeeEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeEducationRepository extends JpaRepository<EmployeeEducation, UUID> {
    List<EmployeeEducation> findByEmployeeId(UUID employeeId);

    void deleteByEmployeeId(UUID employeeId);
}
