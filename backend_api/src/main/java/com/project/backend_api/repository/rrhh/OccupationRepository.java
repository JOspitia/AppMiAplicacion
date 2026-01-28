package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.Occupation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OccupationRepository extends JpaRepository<Occupation, UUID> {

    List<Occupation> findByActiveTrueOrderByDisplayOrderAsc();

    List<Occupation> findByCategoryAndActiveTrueOrderByDisplayOrderAsc(String category);

    Optional<Occupation> findByCode(String code);
}
