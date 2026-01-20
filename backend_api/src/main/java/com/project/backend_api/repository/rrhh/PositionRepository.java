package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.Position;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PositionRepository extends JpaRepository<Position, UUID> {

    @Query("SELECT p FROM Position p WHERE p.company.id = :companyId ORDER BY p.code ASC")
    List<Position> findByCompanyId(@Param("companyId") UUID companyId);

    @Query("SELECT p FROM Position p WHERE p.company.id = :companyId AND p.active = true ORDER BY p.code ASC")
    List<Position> findByCompanyIdAndActiveTrue(@Param("companyId") UUID companyId);

    @Query("SELECT p FROM Position p WHERE p.id = :id AND p.company.id = :companyId")
    Optional<Position> findByIdAndCompanyId(@Param("id") UUID id, @Param("companyId") UUID companyId);

    @Query("SELECT p FROM Position p WHERE p.code = :code AND p.company.id = :companyId")
    Optional<Position> findByCodeAndCompanyId(@Param("code") String code, @Param("companyId") UUID companyId);

    @Query("SELECT p FROM Position p WHERE p.department.id = :departmentId AND p.company.id = :companyId ORDER BY p.code ASC")
    List<Position> findByDepartmentIdAndCompanyId(@Param("departmentId") UUID departmentId,
            @Param("companyId") UUID companyId);
}
