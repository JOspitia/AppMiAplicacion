package com.project.backend_api.repository.core.administration;



import com.project.backend_api.model.core.administration.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CountryRepository extends JpaRepository<Country, UUID> {
    long countByPhoneCodeIsNotNull();
}






