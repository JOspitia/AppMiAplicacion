package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.EmployeeBonus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EmployeeBonusRepository extends JpaRepository<EmployeeBonus, UUID> {
    List<EmployeeBonus> findByEmployeeIdAndActiveTrue(UUID employeeId);

    List<EmployeeBonus> findByEmployeeId(UUID employeeId);
}
