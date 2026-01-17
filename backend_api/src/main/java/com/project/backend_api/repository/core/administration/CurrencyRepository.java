package com.project.backend_api.repository.core.administration;

import com.project.backend_api.model.core.administration.Currency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CurrencyRepository extends JpaRepository<Currency, UUID> {
    Optional<Currency> findByCode(String code);

    java.util.List<Currency> findByActiveTrue();
}
