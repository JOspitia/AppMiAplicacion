package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.Periodicity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PeriodicityRepository extends JpaRepository<Periodicity, UUID> {

    @Query("SELECT p FROM Periodicity p WHERE p.active = true ORDER BY p.daysInterval ASC")
    List<Periodicity> findAllActive();

    boolean existsByCode(String code);

    java.util.Optional<Periodicity> findByCode(String code);
}
