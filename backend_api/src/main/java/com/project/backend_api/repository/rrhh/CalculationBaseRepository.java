package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.CalculationBase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CalculationBaseRepository extends JpaRepository<CalculationBase, UUID> {

    @Query("SELECT c FROM CalculationBase c WHERE c.active = true ORDER BY c.name ASC")
    List<CalculationBase> findAllActive();

    boolean existsByCode(String code);
}
