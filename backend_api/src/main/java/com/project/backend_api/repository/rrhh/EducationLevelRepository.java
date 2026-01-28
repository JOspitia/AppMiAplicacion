package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.EducationLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EducationLevelRepository extends JpaRepository<EducationLevel, UUID> {
    List<EducationLevel> findByActiveTrue();
}
