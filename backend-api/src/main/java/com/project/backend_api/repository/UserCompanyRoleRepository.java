package com.project.backend_api.repository;

import com.project.backend_api.model.Company;
import com.project.backend_api.model.UserCompanyRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserCompanyRoleRepository extends JpaRepository<UserCompanyRole, UUID> {

    @Query("SELECT ucr.company FROM UserCompanyRole ucr WHERE ucr.user.id = :userId AND ucr.isActive = true AND ucr.company.status = true ORDER BY ucr.company.name")
    List<Company> findCompaniesByUserId(@Param("userId") UUID userId);

    @Query("SELECT CASE WHEN COUNT(ucr) > 0 THEN true ELSE false END FROM UserCompanyRole ucr WHERE ucr.user.id = :userId AND ucr.company.id = :companyId AND ucr.isActive = true")
    boolean existsByUserIdAndCompanyIdAndIsActiveTrue(@Param("userId") UUID userId, @Param("companyId") UUID companyId);

    List<UserCompanyRole> findByUserIdAndIsActiveTrue(UUID userId);

    Optional<UserCompanyRole> findByUserIdAndCompanyIdAndIsActiveTrue(UUID userId, UUID companyId);
}
