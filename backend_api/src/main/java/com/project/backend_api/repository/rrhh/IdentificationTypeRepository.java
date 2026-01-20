package com.project.backend_api.repository.rrhh;

import com.project.backend_api.model.rrhh.IdentificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdentificationTypeRepository extends JpaRepository<IdentificationType, UUID> {

    @Query("SELECT it FROM IdentificationType it WHERE (it.company.id = :companyId OR it.company IS NULL) ORDER BY it.code ASC")
    List<IdentificationType> findAllByCompanyIdOrGlobal(@Param("companyId") UUID companyId);

    @Query("SELECT it FROM IdentificationType it WHERE (it.company.id = :companyId OR it.company IS NULL) AND it.active = true ORDER BY it.code ASC")
    List<IdentificationType> findActiveByCompanyIdOrGlobal(@Param("companyId") UUID companyId);

    @Query("SELECT it FROM IdentificationType it WHERE (it.company.id = :companyId OR it.company IS NULL) AND (it.country.id = :countryId OR it.country IS NULL) AND it.active = true ORDER BY it.code ASC")
    List<IdentificationType> findActiveByCompanyAndCountry(@Param("companyId") UUID companyId,
            @Param("countryId") UUID countryId);

    @Query("SELECT it FROM IdentificationType it WHERE it.code = :code AND (it.company.id = :companyId OR it.company IS NULL)")
    Optional<IdentificationType> findByCodeAndCompanyScope(@Param("code") String code,
            @Param("companyId") UUID companyId);
}
