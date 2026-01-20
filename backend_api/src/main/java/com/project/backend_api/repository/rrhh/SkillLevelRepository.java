package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.SkillLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SkillLevelRepository extends JpaRepository<SkillLevel, UUID> {

    @Query("SELECT sl FROM SkillLevel sl WHERE sl.company.id = :companyId ORDER BY sl.weight ASC, sl.name ASC")
    List<SkillLevel> findByCompanyIdOrderByWeight(@Param("companyId") UUID companyId);

    @Query("SELECT sl FROM SkillLevel sl WHERE sl.company.id = :companyId AND sl.active = true ORDER BY sl.weight ASC, sl.name ASC")
    List<SkillLevel> findByCompanyIdAndActiveTrueOrderByWeight(@Param("companyId") UUID companyId);

    @Query("SELECT sl FROM SkillLevel sl WHERE sl.id = :id AND sl.company.id = :companyId")
    Optional<SkillLevel> findByIdAndCompanyId(@Param("id") UUID id, @Param("companyId") UUID companyId);
}
