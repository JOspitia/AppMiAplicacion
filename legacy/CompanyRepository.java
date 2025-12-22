package com.project.project.repository.core;

import com.project.project.model.Company;
import org.springframework.data.repository.CrudRepository;
import java.util.UUID;

public interface CompanyRepository extends CrudRepository<Company, UUID> {
    java.util.Optional<Company> findByNit(String nit);

    java.util.Optional<Company> findByName(String name);

    java.util.List<Company> findByStatusTrue();

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Company c WHERE c.status = true AND UPPER(c.name) != 'PUBLIC'")
    java.util.List<Company> findActiveCompaniesExcludingPublic();
}
