package com.project.backend_api.repository.core.management;



import com.project.backend_api.model.core.management.Company;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface CompanyRepository extends CrudRepository<Company, UUID> {

    // Busca una empresa por su nit.
    java.util.Optional<Company> findByNit(String nit);

    // Busca una empresa por su nombre.
    java.util.Optional<Company> findByName(String name);

    // Busca todas las empresas con status=true.
    java.util.List<Company> findByStatusTrue();

    // Busca todas las empresas activas (status=true)
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Company c WHERE c.status = true")
    java.util.List<Company> findAllActiveCompanies();

    // Busca todas las empresas con status=true y nombre distinto de 'PUBLIC'.
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Company c WHERE c.status = true AND UPPER(c.name) != 'PUBLIC'")
    java.util.List<Company> findActiveCompaniesExcludingPublic();

}






