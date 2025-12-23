package com.project.backend_api.repository;

import com.project.backend_api.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CompanyRepository extends JpaRepository<Company, UUID> {

    Optional<Company> findByNit(String nit);

    List<Company> findByStatusTrue();

    @Query("SELECT c FROM Company c WHERE c.status = true ORDER BY c.name")
    List<Company> findAllActiveCompanies();
}
