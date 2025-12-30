package com.project.backend_api.repository;

import com.project.backend_api.model.Company;
import com.project.backend_api.model.UserCompanyRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserCompanyRoleRepository extends JpaRepository<UserCompanyRole, UUID> {

    // Retorna una lista de empresas a las que pertenece el usuario.
    @Query("SELECT DISTINCT ucr.company FROM UserCompanyRole ucr WHERE ucr.user.id = :userId AND ucr.company.status = true")
    List<Company> findCompaniesByUserId(@Param("userId") UUID userId);

    // Verifica si el usuario tiene el rol ROOT en alguna empresa.
    @Query("SELECT CASE WHEN COUNT(ucr) > 0 THEN true ELSE false END FROM UserCompanyRole ucr WHERE ucr.user.id = :userId AND ucr.role.name = 'ROOT'")
    boolean hasRootRole(@Param("userId") UUID userId);

    // Retorna una lista de usuarios asociados con la empresa dada.
    @Query("SELECT DISTINCT ucr.user FROM UserCompanyRole ucr WHERE ucr.company.id = :companyId")
    List<com.project.backend_api.model.User> findUsersByCompanyId(@Param("companyId") UUID companyId);

    // Busca el rol de un usuario en una empresa específica que esté activo
    @Query("SELECT ucr FROM UserCompanyRole ucr WHERE ucr.user.id = :userId AND ucr.company.id = :companyId AND ucr.isActive = true")
    java.util.Optional<UserCompanyRole> findByUserIdAndCompanyIdAndIsActiveTrue(@Param("userId") UUID userId, @Param("companyId") UUID companyId);

    // Verifica si un usuario tiene acceso activo a una empresa
    @Query("SELECT CASE WHEN COUNT(ucr) > 0 THEN true ELSE false END FROM UserCompanyRole ucr WHERE ucr.user.id = :userId AND ucr.company.id = :companyId AND ucr.isActive = true")
    boolean existsByUserIdAndCompanyIdAndIsActiveTrue(@Param("userId") UUID userId, @Param("companyId") UUID companyId);

    // Retorna los roles activos de un usuario
    @Query("SELECT ucr FROM UserCompanyRole ucr WHERE ucr.user.id = :userId AND ucr.isActive = true")
    List<UserCompanyRole> findByUserIdAndIsActiveTrue(@Param("userId") UUID userId);
}