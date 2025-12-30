package com.project.backend_api.repository;

import com.project.backend_api.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoleRepository extends JpaRepository<Role, UUID> {

    // Busca un rol por nombre dentro de una empresa específica.
    Optional<Role> findByNameAndCompanyId(String name, UUID companyId);

    /**
     * QUERY PRINCIPAL:
     * Devuelve:
     * 1. Roles creados por la empresa específica (r.company.id = :companyId)
     * 2. Roles del Sistema (Globales) que no tienen empresa (r.company IS NULL) y
     * están marcados como systemRole
     * * Filtra siempre por active = true.
     */
    @Query("SELECT r FROM Role r WHERE " +
            "(r.company.id = :companyId OR (r.company IS NULL AND r.isSystemRole = true)) " +
            "AND r.active = true")
    List<Role> findByCompanyIdOrSystem(@Param("companyId") UUID companyId);

    // Devuelve solo los roles creados por la empresa (excluye los del sistema).
    @Query("SELECT r FROM Role r WHERE r.company.id = :companyId AND r.active = true")
    List<Role> findByCompanyId(@Param("companyId") UUID companyId);

    // Verifica si existe un rol con ese nombre en la empresa.
    boolean existsByNameAndCompanyId(String name, UUID companyId);
}